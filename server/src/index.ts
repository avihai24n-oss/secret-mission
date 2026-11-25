import { Server, routePartykitRequest, type Connection, type WSMessage } from "partyserver";
import {
  ACCUSE_COOLDOWN_MS,
  DEFAULT_SETTINGS,
  MAX_GUESS_LENGTH,
  POINTS,
  SKIPS_PER_GAME,
  TARGET_OPTIONS,
  type ClientMessage,
  type ErrorCode,
  type GameEvent,
  type Gender,
  type LogEntry,
  type Phase,
  type RoomView,
  type ServerMessage,
  type Settings,
} from "../../shared/protocol";
import { judgeGuess } from "./judge";
import { renderMission, type Mission } from "./mission-types";
import { ALL_MISSIONS } from "./mission-bank";

type Env = {
  MissionRoom: DurableObjectNamespace;
  AI: Ai;
};

interface PlayerState {
  id: string;
  name: string;
  avatar: string;
  gender: Gender;
  score: number;
  completed: number;
  missionId: string | null;
  skipsLeft: number;
  cooldownUntil: number;
}

interface JudgingState {
  /** Guards against a stale ruling landing after the room moved on. */
  token: string;
  accuserId: string;
  targetId: string;
  guess: string;
  needsManualRuling: boolean;
}

/** Log entries are stored complete; secrets are stripped per recipient in viewFor(). */
interface RoomState {
  phase: Phase;
  settings: Settings;
  hostId: string | null;
  players: PlayerState[];
  usedMissionIds: string[];
  judging: JudgingState | null;
  log: LogEntry[];
  winnerId: string | null;
  lastActivity: number;
}

const STORAGE_KEY = "room";
/** A room nobody touched for this long is wiped, so 4-digit codes can be reused. */
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;
/** A finished or never-started room with nobody connected is taken over after this long. */
const IDLE_TAKEOVER_MS = 10 * 60 * 1000;
const WRONG_GUESS_REASON = "לא קרוב מספיק למשימה האמיתית.";

const MISSION_BY_ID = new Map<string, Mission>(ALL_MISSIONS.map((m) => [m.id, m]));

function freshRoom(): RoomState {
  return {
    phase: "lobby",
    settings: { ...DEFAULT_SETTINGS },
    hostId: null,
    players: [],
    usedMissionIds: [],
    judging: null,
    log: [],
    winnerId: null,
    lastActivity: Date.now(),
  };
}

function cleanText(value: unknown, max: number, fallback: string): string {
  const s = String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
  return s || fallback;
}

function sanitizeSettings(input: unknown): Settings | null {
  const s = (input ?? {}) as Record<string, unknown>;
  const location = String(s.location);
  const vibe = String(s.vibe);
  const target = Number(s.target);
  if (!["cafe", "walk", "home", "phone"].includes(location)) return null;
  if (!["light", "flirty", "bold"].includes(vibe)) return null;
  if (!(TARGET_OPTIONS as readonly number[]).includes(target)) return null;
  return { location, vibe, target } as Settings;
}

export class MissionRoom extends Server<Env> {
  static options = { hibernate: true };

  private room: RoomState = freshRoom();

  async onStart(): Promise<void> {
    const stored = await this.ctx.storage.get<RoomState>(STORAGE_KEY);
    if (stored && Date.now() - stored.lastActivity < ROOM_TTL_MS) {
      this.room = stored;
      // A ruling that was in flight when the object was evicted can never land.
      if (this.room.judging && !this.room.judging.needsManualRuling) {
        this.room.judging.needsManualRuling = true;
      }
    }
  }

  async onAlarm(): Promise<void> {
    if (Date.now() - this.room.lastActivity >= ROOM_TTL_MS) {
      await this.ctx.storage.deleteAll();
      this.room = freshRoom();
    } else {
      await this.ctx.storage.setAlarm(this.room.lastActivity + ROOM_TTL_MS);
    }
  }

  // ------------------------------------------------------------ connections

  private playerIdOf(conn: Connection): string | null {
    const state = conn.state as { playerId?: string } | null;
    return state?.playerId ?? null;
  }

  private connectedIds(except?: Connection): Set<string> {
    const ids = new Set<string>();
    for (const c of this.getConnections()) {
      if (except && c.id === except.id) continue;
      const id = this.playerIdOf(c);
      if (id) ids.add(id);
    }
    return ids;
  }

  private player(id: string | null): PlayerState | undefined {
    return this.room.players.find((p) => p.id === id);
  }

  private opponentOf(id: string): PlayerState | undefined {
    return this.room.players.find((p) => p.id !== id);
  }

  async onMessage(conn: Connection, raw: WSMessage): Promise<void> {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(String(raw)) as ClientMessage;
    } catch {
      return;
    }
    if (!msg || typeof msg !== "object") return;

    if (msg.type === "hello") {
      await this.onHello(conn, msg);
      return;
    }

    const me = this.player(this.playerIdOf(conn));
    if (!me) {
      this.sendError(conn, "badRequest", "צריך להתחבר לחדר קודם.");
      return;
    }

    switch (msg.type) {
      case "settings":
        return this.onSettings(conn, me, msg.settings);
      case "start":
        return this.onStartGame(conn, me);
      case "success":
        return this.onSuccess(conn, me);
      case "skip":
        return this.onSkip(conn, me);
      case "accuse":
        return this.onAccuse(conn, me, msg.guess);
      case "manualRuling":
        return this.onManualRuling(conn, me, msg.correct);
      case "endGame":
        if (this.room.phase !== "playing") return this.sendError(conn, "wrongPhase", "אין משחק פעיל.");
        this.endGame();
        return this.commit();
      case "rematch":
        return this.onRematch(conn);
      case "leave":
        return this.onLeave(conn, me);
      default:
        return this.sendError(conn, "badRequest", "הודעה לא מוכרת.");
    }
  }

  private async onHello(
    conn: Connection,
    msg: Extract<ClientMessage, { type: "hello" }>
  ): Promise<void> {
    const playerId = cleanText(msg.playerId, 64, "");
    if (playerId.length < 8) {
      this.sendError(conn, "badRequest", "מזהה שחקן חסר.");
      return;
    }
    const name = cleanText(msg.name, 20, "סוכן");
    const avatar = cleanText(msg.avatar, 32, "agent");
    const gender: Gender = msg.gender === "f" ? "f" : "m";

    let me = this.player(playerId);
    if (!me) {
      const live = this.connectedIds(conn);
      const nobodyHome = this.room.players.every((p) => !live.has(p.id));
      const idleFor = Date.now() - this.room.lastActivity;
      const abandoned =
        nobodyHome &&
        (this.room.phase === "playing" ? idleFor > ROOM_TTL_MS / 2 : idleFor > IDLE_TAKEOVER_MS);
      if (this.room.players.length === 0 || abandoned) {
        if (msg.intent === "join") {
          this.sendError(conn, "roomNotFound", "אין חדר פעיל עם הקוד הזה.");
          conn.close(4004, "room not found");
          return;
        }
        this.room = freshRoom();
      } else if (msg.intent === "create") {
        this.sendError(conn, "roomTaken", "הקוד הזה תפוס.");
        conn.close(4002, "room taken");
        return;
      } else if (this.room.players.length >= 2) {
        // In the lobby a seat held by someone who left can be taken over.
        const ghost =
          this.room.phase === "lobby"
            ? this.room.players.find((p) => !live.has(p.id) && p.id !== this.room.hostId) ??
              this.room.players.find((p) => !live.has(p.id))
            : undefined;
        if (!ghost) {
          this.send(conn, { type: "roomFull" });
          conn.close(4000, "room full");
          return;
        }
        this.room.players = this.room.players.filter((p) => p.id !== ghost.id);
        if (this.room.hostId === ghost.id) this.room.hostId = this.room.players[0]?.id ?? null;
      }
      me = {
        id: playerId,
        name,
        avatar,
        gender,
        score: 0,
        completed: 0,
        missionId: null,
        skipsLeft: SKIPS_PER_GAME,
        cooldownUntil: 0,
      };
      this.room.players.push(me);
      if (!this.room.hostId) this.room.hostId = playerId;
    } else {
      me.name = name;
      me.avatar = avatar;
      // Gender is fixed while a game runs: live missions were phrased with it.
      if (this.room.phase !== "playing") me.gender = gender;
    }

    // One live socket per player: a newer tab replaces the older one.
    for (const other of this.getConnections()) {
      if (other.id !== conn.id && this.playerIdOf(other) === playerId) {
        other.setState(null);
        other.close(4001, "replaced by a newer connection");
      }
    }
    conn.setState({ playerId });

    this.sendEventTo(this.opponentOf(playerId)?.id, {
      kind: "presence",
      playerId,
      connected: true,
    });
    await this.commit();
  }

  async onClose(conn: Connection): Promise<void> {
    const playerId = this.playerIdOf(conn);
    if (!playerId || !this.player(playerId)) return;
    if (this.connectedIds(conn).has(playerId)) return; // still here on another socket
    this.sendEventTo(this.opponentOf(playerId)?.id, {
      kind: "presence",
      playerId,
      connected: false,
    });
    this.broadcastState(conn);
  }

  async onError(conn: Connection): Promise<void> {
    await this.onClose(conn);
  }

  // ------------------------------------------------------------ lobby

  private async onSettings(conn: Connection, me: PlayerState, raw: unknown): Promise<void> {
    if (this.room.phase !== "lobby") return this.sendError(conn, "wrongPhase", "אי אפשר לשנות הגדרות באמצע משחק.");
    if (me.id !== this.room.hostId) return this.sendError(conn, "notHost", "רק מי שפתח את החדר קובע את ההגדרות.");
    const settings = sanitizeSettings(raw);
    if (!settings) return this.sendError(conn, "badRequest", "הגדרות לא תקינות.");
    this.room.settings = settings;
    await this.commit();
  }

  private async onStartGame(conn: Connection, me: PlayerState): Promise<void> {
    if (this.room.phase !== "lobby") return this.sendError(conn, "wrongPhase", "המשחק כבר התחיל.");
    if (me.id !== this.room.hostId) return this.sendError(conn, "notHost", "רק מי שפתח את החדר מתחיל את המבצע.");
    const live = this.connectedIds();
    if (this.room.players.length !== 2 || !this.room.players.every((p) => live.has(p.id))) {
      return this.sendError(conn, "needTwoPlayers", "צריך שני שחקנים מחוברים כדי להתחיל.");
    }
    this.room.phase = "playing";
    this.room.log = [];
    this.room.usedMissionIds = [];
    this.room.judging = null;
    this.room.winnerId = null;
    for (const p of this.room.players) {
      p.score = 0;
      p.completed = 0;
      p.skipsLeft = SKIPS_PER_GAME;
      p.cooldownUntil = 0;
      p.missionId = null;
    }
    for (const p of this.room.players) this.dealMission(p);
    this.broadcastEvent({ kind: "started" });
    await this.commit();
  }

  private async onRematch(conn: Connection): Promise<void> {
    if (this.room.phase !== "ended") return this.sendError(conn, "wrongPhase", "המשחק עוד לא נגמר.");
    this.room.phase = "lobby";
    this.room.judging = null;
    this.room.winnerId = null;
    this.room.log = [];
    for (const p of this.room.players) {
      p.score = 0;
      p.completed = 0;
      p.missionId = null;
      p.cooldownUntil = 0;
      p.skipsLeft = SKIPS_PER_GAME;
    }
    await this.commit();
  }

  private async onLeave(conn: Connection, me: PlayerState): Promise<void> {
    conn.setState(null);
    if (this.room.phase !== "playing") {
      this.room.players = this.room.players.filter((p) => p.id !== me.id);
      if (this.room.hostId === me.id) this.room.hostId = this.room.players[0]?.id ?? null;
    } else {
      this.sendEventTo(this.opponentOf(me.id)?.id, {
        kind: "presence",
        playerId: me.id,
        connected: false,
      });
    }
    await this.commit();
    conn.close(1000, "left");
  }

  // ------------------------------------------------------------ missions

  private dealMission(p: PlayerState): void {
    const { location, vibe } = this.room.settings;
    const pool = ALL_MISSIONS.filter((m) => m.locations.includes(location) && m.vibes.includes(vibe));
    const taken = new Set(this.room.players.map((x) => x.missionId).filter(Boolean) as string[]);
    let options = pool.filter((m) => !this.room.usedMissionIds.includes(m.id) && !taken.has(m.id));
    if (options.length === 0) {
      // The couple went through the whole deck: reshuffle it.
      this.room.usedMissionIds = [];
      options = pool.filter((m) => !taken.has(m.id));
    }
    const pick = options[Math.floor(Math.random() * options.length)] ?? ALL_MISSIONS[0];
    p.missionId = pick.id;
    this.room.usedMissionIds.push(pick.id);
  }

  /** The player's current mission, phrased for them. */
  private missionText(p: PlayerState): string {
    const mission = p.missionId ? MISSION_BY_ID.get(p.missionId) : undefined;
    if (!mission) return "";
    const opponent = this.opponentOf(p.id);
    return renderMission(mission.text, p.gender, opponent?.gender ?? (p.gender === "m" ? "f" : "m"));
  }

  private missionPoints(p: PlayerState): number {
    return (p.missionId ? MISSION_BY_ID.get(p.missionId)?.points : undefined) ?? 100;
  }

  private addLog(entry: Omit<LogEntry, "id" | "t">): void {
    this.room.log.push({ id: crypto.randomUUID().slice(0, 8), t: Date.now(), ...entry });
    if (this.room.log.length > 200) this.room.log.shift();
  }

  private guardPlaying(conn: Connection): boolean {
    if (this.room.phase !== "playing") {
      this.sendError(conn, "wrongPhase", "אין משחק פעיל.");
      return false;
    }
    if (this.room.judging) {
      this.sendError(conn, "judgingInProgress", "רגע, השופט באמצע הכרעה.");
      return false;
    }
    return true;
  }

  private async onSuccess(conn: Connection, me: PlayerState): Promise<void> {
    if (!this.guardPlaying(conn)) return;
    const text = this.missionText(me);
    const points = this.missionPoints(me);
    me.score += points;
    me.completed += 1;
    this.addLog({ kind: "success", actorId: me.id, missionText: text, actorDelta: points });
    this.sendEventTo(me.id, { kind: "mySuccess", points });
    this.sendEventTo(this.opponentOf(me.id)?.id, { kind: "opponentSuccess", missionText: text, points });
    this.dealMission(me);
    this.checkTarget();
    await this.commit();
  }

  private async onSkip(conn: Connection, me: PlayerState): Promise<void> {
    if (!this.guardPlaying(conn)) return;
    if (me.skipsLeft <= 0) return this.sendError(conn, "noSkipsLeft", "נגמרו לך ההחלפות למשחק הזה.");
    me.skipsLeft -= 1;
    this.addLog({ kind: "skip", actorId: me.id, missionText: this.missionText(me), actorDelta: 0 });
    this.dealMission(me);
    await this.commit();
  }

  // ------------------------------------------------------------ accusations

  private async onAccuse(conn: Connection, me: PlayerState, rawGuess: unknown): Promise<void> {
    if (!this.guardPlaying(conn)) return;
    const target = this.opponentOf(me.id);
    if (!target) return this.sendError(conn, "needTwoPlayers", "אין על מי לעלות.");
    if (me.cooldownUntil > Date.now()) {
      return this.sendError(conn, "cooldown", "צריך לחכות קצת אחרי ניחוש שגוי.");
    }
    const guess = cleanText(rawGuess, MAX_GUESS_LENGTH, "");
    if (guess.length < 2) return this.sendError(conn, "badGuess", "צריך לכתוב ניחוש.");

    const token = crypto.randomUUID();
    this.room.judging = {
      token,
      accuserId: me.id,
      targetId: target.id,
      guess,
      needsManualRuling: false,
    };
    this.broadcastEvent({ kind: "judging", accuserId: me.id, guess });
    await this.commit();

    const mission = this.missionText(target);
    let verdict = null;
    try {
      verdict = await judgeGuess(this.env.AI, mission, guess);
    } catch (err) {
      console.warn("judge crashed", String(err));
    }

    // The room may have moved on while the model was thinking.
    if (this.room.judging?.token !== token) return;
    if (!verdict) {
      this.room.judging.needsManualRuling = true;
      await this.commit();
      return;
    }
    // The free models judge well but write clumsy Hebrew, so the wording shown
    // to the players is ours; the model only decides.
    this.applyVerdict(
      verdict.correct,
      verdict.correct ? "הניחוש תפס את הכיוון של המשימה." : WRONG_GUESS_REASON
    );
    await this.commit();
  }

  private async onManualRuling(conn: Connection, me: PlayerState, correct: unknown): Promise<void> {
    const judging = this.room.judging;
    if (this.room.phase !== "playing" || !judging?.needsManualRuling) {
      return this.sendError(conn, "wrongPhase", "אין כרגע הכרעה שמחכה לך.");
    }
    if (me.id !== judging.targetId) {
      return this.sendError(conn, "badRequest", "רק מי שעלו עליו מכריע.");
    }
    this.applyVerdict(correct === true, correct === true ? "הודאה באשמה. כל הכבוד על היושר!" : "הצד השני קבע שזה לא זה.");
    await this.commit();
  }

  private applyVerdict(correct: boolean, judgeReason: string): void {
    const judging = this.room.judging;
    if (!judging) return;
    const accuser = this.player(judging.accuserId);
    const target = this.player(judging.targetId);
    this.room.judging = null;
    if (!accuser || !target) return;

    const missionText = this.missionText(target);
    const now = Date.now();

    if (correct) {
      const stolen = Math.min(POINTS.STEAL, target.score);
      accuser.score += POINTS.STEAL;
      target.score -= stolen;
      const reason = judgeReason || "קלעת בול.";
      this.addLog({
        kind: "caught",
        actorId: accuser.id,
        targetId: target.id,
        missionText,
        guess: judging.guess,
        reason,
        actorDelta: POINTS.STEAL,
        targetDelta: -stolen,
      });
      this.broadcastEvent({
        kind: "verdict",
        accuserId: accuser.id,
        targetId: target.id,
        correct: true,
        guess: judging.guess,
        reason,
        missionText,
        accuserDelta: POINTS.STEAL,
        targetDelta: -stolen,
      });
      this.dealMission(target);
    } else {
      target.score += POINTS.WRONG_GUESS_BONUS;
      accuser.cooldownUntil = now + ACCUSE_COOLDOWN_MS;
      // The judge's own words may hint at the live mission, so nobody gets them now;
      // the stored log keeps them for the end-of-game summary.
      this.addLog({
        kind: "missed",
        actorId: accuser.id,
        targetId: target.id,
        missionText,
        guess: judging.guess,
        reason: judgeReason || WRONG_GUESS_REASON,
        actorDelta: 0,
        targetDelta: POINTS.WRONG_GUESS_BONUS,
      });
      this.broadcastEvent({
        kind: "verdict",
        accuserId: accuser.id,
        targetId: target.id,
        correct: false,
        guess: judging.guess,
        reason: WRONG_GUESS_REASON,
        accuserDelta: 0,
        targetDelta: POINTS.WRONG_GUESS_BONUS,
      });
    }
    this.checkTarget();
  }

  // ------------------------------------------------------------ ending

  private checkTarget(): void {
    const target = this.room.settings.target;
    if (this.room.phase !== "playing" || target <= 0) return;
    if (this.room.players.some((p) => p.score >= target)) this.endGame();
  }

  private endGame(): void {
    const [a, b] = this.room.players;
    this.room.phase = "ended";
    this.room.judging = null;
    this.room.winnerId = !a ? null : !b ? a.id : a.score === b.score ? null : a.score > b.score ? a.id : b.id;
    this.broadcastEvent({ kind: "gameOver", winnerId: this.room.winnerId });
  }

  // ------------------------------------------------------------ output

  private viewFor(playerId: string, live: Set<string>): RoomView {
    const room = this.room;
    const me = this.player(playerId);
    const ended = room.phase === "ended";
    const players = [...room.players].sort(
      (a, b) => Number(b.id === room.hostId) - Number(a.id === room.hostId)
    );
    return {
      code: this.name,
      phase: room.phase,
      settings: room.settings,
      you: playerId,
      players: players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        gender: p.gender,
        score: p.score,
        connected: live.has(p.id),
        isHost: p.id === room.hostId,
        completed: p.completed,
      })),
      myMission:
        room.phase === "playing" && me?.missionId
          ? { id: me.missionId, text: this.missionText(me), points: this.missionPoints(me) }
          : null,
      skipsLeft: me?.skipsLeft ?? 0,
      judging: room.judging
        ? {
            accuserId: room.judging.accuserId,
            targetId: room.judging.targetId,
            guess: room.judging.guess,
            needsManualRuling: room.judging.needsManualRuling,
          }
        : null,
      accuseCooldownUntil: me?.cooldownUntil ?? 0,
      log: room.log.map((entry) => {
        if (ended) return entry;
        // While playing: a failed accusation must not reveal the mission that is
        // still live, and a swapped mission stays the swapper's own business.
        if (entry.kind === "missed") {
          return entry.targetId === playerId
            ? { ...entry, reason: WRONG_GUESS_REASON }
            : { ...entry, missionText: undefined, reason: WRONG_GUESS_REASON };
        }
        if (entry.kind === "skip" && entry.actorId !== playerId) {
          return { ...entry, missionText: undefined };
        }
        return entry;
      }),
      winnerId: ended ? room.winnerId : null,
      serverNow: Date.now(),
    };
  }

  private send(conn: Connection, msg: ServerMessage): void {
    try {
      conn.send(JSON.stringify(msg));
    } catch {
      /* socket already gone */
    }
  }

  private sendError(conn: Connection, code: ErrorCode, message: string): void {
    this.send(conn, { type: "error", code, message });
  }

  private sendEventTo(playerId: string | undefined, event: GameEvent): void {
    if (!playerId) return;
    for (const c of this.getConnections()) {
      if (this.playerIdOf(c) === playerId) this.send(c, { type: "event", event });
    }
  }

  private broadcastEvent(event: GameEvent): void {
    for (const c of this.getConnections()) {
      if (this.playerIdOf(c)) this.send(c, { type: "event", event });
    }
  }

  private broadcastState(except?: Connection): void {
    const live = this.connectedIds(except);
    for (const c of this.getConnections()) {
      if (except && c.id === except.id) continue;
      const id = this.playerIdOf(c);
      if (id) this.send(c, { type: "state", state: this.viewFor(id, live) });
    }
  }

  /** Persist and push a fresh snapshot to everyone. */
  private async commit(): Promise<void> {
    this.room.lastActivity = Date.now();
    await this.ctx.storage.put(STORAGE_KEY, this.room);
    await this.ctx.storage.setAlarm(this.room.lastActivity + ROOM_TTL_MS);
    this.broadcastState();
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const routed = await routePartykitRequest(request, env as unknown as Record<string, unknown>);
    return routed ?? new Response("מבצע סודי: שרת המשחק פעיל", { status: 200 });
  },
};
