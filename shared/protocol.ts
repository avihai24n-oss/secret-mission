/**
 * מבצע סודי — the wire contract between the client (src/) and the room
 * server (server/src/). Both sides import this file; it must stay free of
 * runtime dependencies.
 *
 * The server is authoritative. After every change it sends each player a
 * personalised `state` snapshot (a player never receives the opponent's
 * current mission). `event` messages are transient cues for animation,
 * haptics and toasts — the UI must render correctly from `state` alone
 * (a phone that was locked misses events but gets a fresh state on reconnect).
 */

export type Gender = "m" | "f";

/** Where the date happens. "phone" = the couple is apart, on a call. */
export type DateLocation = "cafe" | "walk" | "home" | "phone";
export type Vibe = "light" | "flirty" | "bold";

export interface Settings {
  location: DateLocation;
  vibe: Vibe;
  /** First to reach this score wins. 0 = no limit (manual end only). */
  target: number;
}

export const DEFAULT_SETTINGS: Settings = {
  location: "cafe",
  vibe: "light",
  target: 400,
};

export const TARGET_OPTIONS = [300, 400, 600, 0] as const;

export const POINTS = {
  /** Accuser guessed right: +STEAL to accuser, -STEAL from target (floor 0). */
  STEAL: 100,
  /** Accuser guessed wrong: bonus to the target, who keeps the mission. */
  WRONG_GUESS_BONUS: 50,
} as const;

export const MAX_GUESS_LENGTH = 200;
export const SKIPS_PER_GAME = 2;
/** After a wrong guess the accuser must wait this long before accusing again. */
export const ACCUSE_COOLDOWN_MS = 45_000;

// ---------------------------------------------------------------- client → server

export type ClientMessage =
  /** First message on every (re)connect. playerId is a stable id kept in localStorage. */
  | {
      type: "hello";
      playerId: string;
      name: string;
      avatar: string;
      gender: Gender;
      /**
       * "join": an empty room answers `roomNotFound` instead of silently opening
       * a new one for a mistyped code. "create": a room already in use by other
       * people answers `roomTaken`, and the client retries with another code.
       * A player the room already knows is always let back in.
       */
      intent?: "create" | "join";
    }
  /** Host only, lobby only. */
  | { type: "settings"; settings: Settings }
  /**
   * Host only, lobby only, while alone: seat a practice bot as the second
   * player so the game can be tried solo. The bot completes missions and
   * accuses on a timer; see RoomView.practicePeek.
   */
  | { type: "addBot" }
  /** Host only, lobby only, needs two players. */
  | { type: "start" }
  /** "הצלחתי!" — I completed my mission (honour system). */
  | { type: "success" }
  /** Swap my mission for another one. Limited to SKIPS_PER_GAME. */
  | { type: "skip" }
  /** "עליתי עליך!" — free-text guess of the opponent's mission, judged by the LLM. */
  | { type: "accuse"; guess: string }
  /**
   * Only when the LLM judge was unavailable (state.judging.needsManualRuling):
   * the accused player rules honestly whether the guess was right.
   */
  | { type: "manualRuling"; correct: boolean }
  /** Either player, while playing. */
  | { type: "endGame" }
  /**
   * "חזרה הביתה". In the lobby or after the game the seat is freed for someone
   * else; mid-game the seat is kept so the player can come back.
   */
  | { type: "leave" }
  /** Either player, after the game ended: back to the lobby with the same players. */
  | { type: "rematch" };

// ---------------------------------------------------------------- server → client

export type ServerMessage =
  | { type: "state"; state: RoomView }
  | { type: "event"; event: GameEvent }
  /** A third device tried to join. The socket is closed right after. */
  | { type: "roomFull" }
  | { type: "error"; code: ErrorCode; message: string };

export type ErrorCode =
  | "notHost"
  | "needTwoPlayers"
  | "wrongPhase"
  | "noSkipsLeft"
  | "cooldown"
  | "judgingInProgress"
  | "badGuess"
  /** Sent right before the socket is closed; the client must not reconnect. */
  | "roomNotFound"
  | "roomTaken"
  | "badRequest";

export type Phase = "lobby" | "playing" | "ended";

export interface PlayerView {
  id: string;
  name: string;
  avatar: string;
  gender: Gender;
  score: number;
  connected: boolean;
  isHost: boolean;
  /** Missions completed this game. */
  completed: number;
  /** The practice bot. */
  isBot?: boolean;
}

export interface MissionView {
  id: string;
  /** Already rendered for this player's gender and the opponent's gender. */
  text: string;
  points: number;
}

export interface JudgingView {
  accuserId: string;
  targetId: string;
  guess: string;
  /** True when the LLM failed and the target must send `manualRuling`. */
  needsManualRuling: boolean;
}

export interface RoomView {
  code: string;
  phase: Phase;
  settings: Settings;
  /** The receiving player's id. */
  you: string;
  /** One or two players, host first. */
  players: PlayerView[];
  /** The receiving player's current secret mission (null outside "playing"). */
  myMission: MissionView | null;
  skipsLeft: number;
  /** Set while an accusation is being judged; both players see it. */
  judging: JudgingView | null;
  /** Epoch ms (server clock) until which the receiving player cannot accuse. 0 = free. */
  accuseCooldownUntil: number;
  /** Chronological. See LogEntry for what is hidden while playing. */
  log: LogEntry[];
  /** Set when phase === "ended". null there means a tie. */
  winnerId: string | null;
  /**
   * Practice games only: the bot's current secret mission. With no real
   * conversation there is nothing to notice, so the player may peek at it to
   * try both a right and a wrong accusation against the judge.
   */
  practicePeek?: string | null;
  /** Server clock at send time, to correct for client clock skew. */
  serverNow: number;
}

export type LogKind =
  /** actor completed a mission. */
  | "success"
  /** actor accused target and was right. */
  | "caught"
  /** actor accused target and was wrong. */
  | "missed"
  /** actor swapped their mission. */
  | "skip";

export interface LogEntry {
  id: string;
  /** Epoch ms. */
  t: number;
  kind: LogKind;
  actorId: string;
  /** The accused player, for "caught" / "missed". */
  targetId?: string;
  /**
   * The mission involved. Hidden (undefined) from a player while it would
   * leak a live secret: "missed" and "skip" entries of the opponent carry no
   * missionText until the game has ended.
   */
  missionText?: string;
  /** The accuser's guess, for "caught" / "missed". */
  guess?: string;
  /** The judge's one-line explanation in Hebrew, for "caught" / "missed". */
  reason?: string;
  /** Score change for the actor. */
  actorDelta: number;
  /** Score change for the target (accusations only). */
  targetDelta?: number;
}

/** Transient cues. Every one of them is also reflected in the next `state`. */
export type GameEvent =
  /** The opponent joined / reconnected / dropped. */
  | { kind: "presence"; playerId: string; connected: boolean }
  /** Game started (or restarted after a rematch). */
  | { kind: "started" }
  /** "התראת מודיעין": the opponent completed a mission under your nose. */
  | { kind: "opponentSuccess"; missionText: string; points: number }
  /** Your own success was registered. */
  | { kind: "mySuccess"; points: number }
  /** An accusation was filed and the judge is thinking. Sent to both. */
  | { kind: "judging"; accuserId: string; guess: string }
  /** The ruling. Sent to both; missionText is present only when correct. */
  | {
      kind: "verdict";
      accuserId: string;
      targetId: string;
      correct: boolean;
      guess: string;
      reason: string;
      missionText?: string;
      accuserDelta: number;
      targetDelta: number;
    }
  | { kind: "gameOver"; winnerId: string | null };

// ---------------------------------------------------------------- shared helpers

/** Player id of the practice bot. */
export const BOT_ID = "practice-bot";

/** PartyServer party name — the Durable Object binding `MissionRoom` in kebab-case. */
export const PARTY_NAME = "mission-room";

/** Room codes are 4 digits, as in the spec. */
export function isValidRoomCode(code: string): boolean {
  return /^\d{4}$/.test(code);
}

export function randomRoomCode(): string {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return String(1000 + (n[0] % 9000));
}
