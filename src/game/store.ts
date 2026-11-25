import { create } from "zustand";
import { isValidRoomCode, randomRoomCode } from "../../shared/protocol";
import type {
  ClientMessage,
  GameEvent,
  LogEntry,
  RoomView,
  ServerMessage,
} from "../../shared/protocol";
import { openConnection } from "../net/connection";
import type { Connection, ConnStatus } from "../net/connection";
import { ERROR_TEXT, g } from "../lib/copy";
import { BUZZ, vibrate } from "../lib/haptics";
import {
  getPlayerId,
  loadProfile,
  loadSavedRoom,
  loadSeenLogId,
  saveProfile as persistProfile,
  saveRoom,
  saveSeenLogId,
  setUrlRoom,
} from "../lib/profile";
import type { Profile } from "../lib/profile";
import { DEMO_NAMES, demoScenario } from "../demo/mock";

export type VerdictEvent = Extract<GameEvent, { kind: "verdict" }>;

export type Overlay =
  | { kind: "verdict"; ev: VerdictEvent }
  | { kind: "intel"; missionText: string; points: number };

export interface Toast {
  key: number;
  text: string;
  tone: "info" | "error" | "good";
}

export interface GameStore {
  profile: Profile | null;
  editingProfile: boolean;
  /** The room we are in or connecting to. null = home screen. */
  roomCode: string | null;
  intent: "create" | "join";
  conn: "idle" | ConnStatus;
  /** Latest authoritative snapshot. Everything on screen derives from it. */
  room: RoomView | null;
  /** serverNow - Date.now() at the last snapshot. */
  clockOffset: number;
  overlay: Overlay | null;
  /** Bumped on every `mySuccess` to replay the little celebration. */
  burst: { key: number; points: number } | null;
  toast: Toast | null;
  /** Log entries that landed while the phone was away. */
  missed: LogEntry[] | null;
  roomFull: boolean;
  demo: string | null;
  accuseOpen: boolean;
  missionRevealed: boolean;

  boot: () => void;
  saveProfile: (p: { name: string; avatar: string; gender: Profile["gender"] }) => void;
  editProfile: (on: boolean) => void;
  createRoom: () => void;
  /** Opens a room and seats the practice bot in it. */
  practice: () => void;
  joinRoom: (code: string) => void;
  leave: () => void;
  send: (msg: ClientMessage) => void;
  dismissOverlay: () => void;
  dismissMissed: () => void;
  showToast: (text: string, tone?: Toast["tone"]) => void;
  clearToast: () => void;
  setAccuseOpen: (on: boolean) => void;
  setMissionRevealed: (on: boolean) => void;
}

let connection: Connection | null = null;
let awaitingFirstState = false;
let toastKey = 0;
let booted = false;

export const useGame = create<GameStore>((set, get) => {
  const toast = (text: string, tone: Toast["tone"] = "info") =>
    set({ toast: { key: ++toastKey, text, tone } });

  const nameOf = (id: string): string =>
    get().room?.players.find((p) => p.id === id)?.name ?? "הצד השני";

  /** Set by practice(): ask for the bot as soon as our fresh lobby answers. */
  let wantBot = false;

  const onState = (room: RoomView) => {
    const prev = get().room;
    const patch: Partial<GameStore> = {
      room,
      clockOffset: room.serverNow - Date.now(),
    };

    // A new mission always arrives face down.
    if (room.myMission?.id !== prev?.myMission?.id) patch.missionRevealed = false;
    if (room.judging || room.phase !== "playing") patch.accuseOpen = false;
    if (room.phase === "lobby" && prev && prev.phase !== "lobby") {
      patch.overlay = null;
      patch.missed = null;
    }

    if (wantBot && room.phase === "lobby") {
      if (room.players.length === 1) connection?.send({ type: "addBot" });
      wantBot = false;
    }

    const lastId = room.log.length ? room.log[room.log.length - 1].id : null;
    if (awaitingFirstState) {
      awaitingFirstState = false;
      const seen = loadSeenLogId(room.code);
      const at = seen ? room.log.findIndex((e) => e.id === seen) : -1;
      if (at >= 0 && at < room.log.length - 1 && room.phase === "playing") {
        const fresh = room.log
          .slice(at + 1)
          .filter((e) => !(e.actorId === room.you && (e.kind === "success" || e.kind === "skip")));
        if (fresh.length) patch.missed = fresh;
      }
    }
    saveSeenLogId(room.code, lastId);
    set(patch);
  };

  const onEvent = (ev: GameEvent) => {
    const room = get().room;
    const me = room?.you;
    switch (ev.kind) {
      case "presence":
        if (ev.playerId !== me && ev.connected && room?.phase === "playing") {
          const p = room.players.find((x) => x.id === ev.playerId);
          toast(`${nameOf(ev.playerId)} ${g(p?.gender ?? "m", "חזר", "חזרה")} למשחק`, "good");
        }
        break;
      case "started":
        vibrate(BUZZ.start);
        set({ missionRevealed: false, overlay: null, missed: null });
        break;
      case "opponentSuccess":
        vibrate(BUZZ.intel);
        set({ overlay: { kind: "intel", missionText: ev.missionText, points: ev.points } });
        break;
      case "mySuccess":
        vibrate(BUZZ.success);
        set({ burst: { key: Date.now(), points: ev.points }, missionRevealed: false });
        break;
      case "judging":
        vibrate(BUZZ.judging);
        // An intel alert still on screen must not cover the courtroom.
        set({ accuseOpen: false, overlay: null });
        break;
      case "verdict": {
        const iAmAccuser = ev.accuserId === me;
        const goodForMe = iAmAccuser ? ev.correct : !ev.correct;
        vibrate(goodForMe ? BUZZ.good : BUZZ.bad);
        set({ overlay: { kind: "verdict", ev }, accuseOpen: false });
        break;
      }
      case "gameOver":
        vibrate(BUZZ.start);
        break;
    }
  };

  const onMessage = (msg: ServerMessage) => {
    switch (msg.type) {
      case "state":
        onState(msg.state);
        break;
      case "event":
        onEvent(msg.event);
        break;
      case "roomFull":
        // The server closes the socket; stop PartySocket from retrying forever.
        connection?.close();
        connection = null;
        saveRoom(null);
        setUrlRoom(null);
        set({ roomFull: true, room: null, conn: "idle" });
        break;
      case "error":
        if (msg.code === "roomTaken") {
          // Our random code collided with someone else's room: roll another one.
          enter(randomRoomCode(), "create");
          break;
        }
        if (msg.code === "roomNotFound") {
          connection?.close();
          connection = null;
          saveRoom(null);
          setUrlRoom(null);
          set({ roomCode: null, room: null, conn: "idle" });
        }
        toast(ERROR_TEXT[msg.code] ?? ERROR_TEXT.badRequest, "error");
        break;
    }
  };

  const enter = (code: string, intent: "create" | "join") => {
    if (get().demo) {
      // No sockets in demo mode: opening or joining a room lands in the mock lobby.
      set({ ...demoScenario(intent === "create" ? "lobby-wait" : "lobby-guest") });
      return;
    }
    connection?.close();
    connection = null;
    saveRoom({ code, intent });
    setUrlRoom(code);
    set({
      roomCode: code,
      intent,
      conn: "connecting",
      room: null,
      roomFull: false,
      overlay: null,
      missed: null,
      burst: null,
      accuseOpen: false,
      missionRevealed: false,
    });
    const profile = get().profile;
    if (!profile) return; // the profile screen comes first; saveProfile connects
    connection = openConnection(code, {
      hello: () => {
        const p = get().profile!;
        return {
          type: "hello",
          playerId: p.playerId,
          name: p.name,
          avatar: p.avatar,
          gender: p.gender,
          intent: get().intent,
        };
      },
      onStatus: (status) => {
        if (status === "open") awaitingFirstState = true;
        set({ conn: status });
      },
      onMessage,
    });
  };

  return {
    profile: null,
    editingProfile: false,
    roomCode: null,
    intent: "create",
    conn: "idle",
    room: null,
    clockOffset: 0,
    overlay: null,
    burst: null,
    toast: null,
    missed: null,
    roomFull: false,
    demo: null,
    accuseOpen: false,
    missionRevealed: false,

    boot: () => {
      if (booted) return;
      booted = true;
      const params = new URLSearchParams(window.location.search);

      const demo = params.get("demo");
      if (demo !== null) {
        const scenario = demoScenario(demo) ?? demoScenario(DEMO_NAMES[0])!;
        set({ demo, conn: "open", ...scenario });
        return;
      }

      set({ profile: loadProfile() });
      const fromUrl = params.get("room");
      const saved = loadSavedRoom();
      if (fromUrl && isValidRoomCode(fromUrl)) {
        enter(fromUrl, saved?.code === fromUrl ? saved.intent : "join");
      } else if (saved) {
        enter(saved.code, saved.intent);
      } else if (fromUrl) {
        setUrlRoom(null);
      }
    },

    saveProfile: ({ name, avatar, gender }) => {
      const profile: Profile = { playerId: get().profile?.playerId ?? getPlayerId(), name, avatar, gender };
      if (!get().demo) persistProfile(profile);
      set({ profile, editingProfile: false });
      if (get().demo) return;
      if (connection) connection.rehello();
      else {
        const { roomCode, intent } = get();
        if (roomCode) enter(roomCode, intent);
      }
    },

    editProfile: (on) => set({ editingProfile: on }),

    createRoom: () => enter(randomRoomCode(), "create"),

    practice: () => {
      wantBot = true;
      enter(randomRoomCode(), "create");
    },

    joinRoom: (code) => {
      if (isValidRoomCode(code)) enter(code, "join");
    },

    leave: () => {
      const { roomCode, demo } = get();
      connection?.send({ type: "leave" });
      connection?.close();
      connection = null;
      if (!demo) {
        if (roomCode) saveSeenLogId(roomCode, null);
        saveRoom(null);
        setUrlRoom(null);
      }
      set({
        roomCode: null,
        room: null,
        conn: demo ? "open" : "idle",
        overlay: null,
        missed: null,
        burst: null,
        roomFull: false,
        accuseOpen: false,
        missionRevealed: false,
      });
    },

    send: (msg) => {
      if (get().demo) {
        // Demo mode has no server; settings are echoed so the lobby is tappable.
        const room = get().room;
        if (msg.type === "settings" && room) set({ room: { ...room, settings: msg.settings } });
        return;
      }
      const ok = connection?.send(msg) ?? false;
      if (!ok) toast("אין חיבור כרגע. מנסים להתחבר מחדש", "error");
    },

    dismissOverlay: () => set({ overlay: null }),
    dismissMissed: () => set({ missed: null }),
    showToast: toast,
    clearToast: () => set({ toast: null }),
    setAccuseOpen: (on) => set({ accuseOpen: on }),
    setMissionRevealed: (on) => set({ missionRevealed: on }),
  };
});

// ---------------------------------------------------------------- selectors

export function me(room: RoomView) {
  return room.players.find((p) => p.id === room.you) ?? room.players[0];
}

export function opponent(room: RoomView) {
  return room.players.find((p) => p.id !== room.you) ?? null;
}
