/**
 * Demo mode: `?demo=<name>` renders a screen from the mock data below with no
 * socket at all. Used for QA and screenshots. Everything mock lives here.
 */
import type { LogEntry, RoomView } from "../../shared/protocol";
import type { Profile } from "../lib/profile";
import type { GameStore } from "../game/store";

export const DEMO_NAMES = [
  "lobby",
  "lobby-guest",
  "lobby-wait",
  "lobby-phone",
  "lobby-phone-guest",
  "game-phone",
  "game-phone-place",
  "game-practice",
  "game",
  "game-revealed",
  "game-cooldown",
  "game-offline",
  "accuse",
  "judging",
  "judging-target",
  "manual",
  "manual-wait",
  "verdict-win",
  "verdict-lose",
  "verdict-caught",
  "verdict-safe",
  "intel",
  "success",
  "missed",
  "summary",
  "summary-lose",
  "summary-tie",
  "home",
  "profile",
  "connecting",
  "reconnecting",
  "roomfull",
] as const;

const ME = "p-me";
const HER = "p-her";

const profile: Profile = { playerId: ME, name: "דני", avatar: "fedora", gender: "m" };

const T0 = Date.now() - 34 * 60_000;

const fullLog: LogEntry[] = [
  {
    id: "l1",
    t: T0 + 4 * 60_000,
    kind: "success",
    actorId: ME,
    missionText: "תגרום לה לספר לך על הטיול הכי הזוי שהיה לה, בלי לשאול ישירות.",
    actorDelta: 100,
  },
  {
    id: "l2",
    t: T0 + 9 * 60_000,
    kind: "missed",
    actorId: ME,
    targetId: HER,
    guess: "היא צריכה לגרום לי להזמין קינוח",
    reason: "המשימה בכלל לא קשורה לאוכל או להזמנות.",
    missionText: "תשחילי את המילה 'דינוזאור' לשיחה, ותגרמי לו לשתות שלוק מיד אחרי.",
    actorDelta: 0,
    targetDelta: 50,
  },
  {
    id: "l3",
    t: T0 + 13 * 60_000,
    kind: "success",
    actorId: HER,
    missionText: "תשחילי את המילה 'דינוזאור' לשיחה, ותגרמי לו לשתות שלוק מיד אחרי.",
    actorDelta: 100,
  },
  {
    id: "l4",
    t: T0 + 18 * 60_000,
    kind: "skip",
    actorId: HER,
    missionText: "תגרמי לו לשיר שורה משיר של אייל גולן.",
    actorDelta: 0,
  },
  {
    id: "l5",
    t: T0 + 24 * 60_000,
    kind: "caught",
    actorId: HER,
    targetId: ME,
    guess: "הוא מנסה לגרום לי להסכים שפיצה עם אננס זה טעים",
    reason: "בול. זו בדיוק המשימה, גם אם לא באותן מילים.",
    missionText: "תגרום לה להסכים איתך שפיצה עם אננס זה הדבר הכי טעים בעולם.",
    actorDelta: 100,
    targetDelta: -100,
  },
  {
    id: "l6",
    t: T0 + 31 * 60_000,
    kind: "success",
    actorId: ME,
    missionText: "תגרום לה לצחוק עד שהיא מכסה את הפה עם היד.",
    actorDelta: 150,
  },
];

/** What a player sees mid-game: the opponent's "missed" and "skip" missions stay hidden. */
const liveLog: LogEntry[] = fullLog.map((e) =>
  (e.kind === "skip" && e.actorId === HER) || (e.kind === "missed" && e.targetId === HER)
    ? { ...e, missionText: undefined }
    : e
);

function base(over: Partial<RoomView> = {}): RoomView {
  return {
    code: "4827",
    phase: "playing",
    settings: { location: "cafe", vibe: "flirty", target: 400 },
    you: ME,
    players: [
      { id: ME, name: "דני", avatar: "fedora", gender: "m", score: 150, connected: true, isHost: true, completed: 2, place: null },
      { id: HER, name: "מאיה", avatar: "beret", gender: "f", score: 250, connected: true, isHost: false, completed: 1, place: null },
    ],
    myMission: {
      id: "m7",
      text: "תגרום לה להחמיא לך על משהו שאתה לובש, בלי לבקש מחמאה.",
      points: 100,
    },
    skipsLeft: 2,
    judging: null,
    accuseCooldownUntil: 0,
    log: liveLog,
    winnerId: null,
    serverNow: Date.now(),
    ...over,
  };
}

function lobby(over: Partial<RoomView> = {}): RoomView {
  const b = base();
  return base({
    phase: "lobby",
    myMission: null,
    log: [],
    players: b.players.map((p) => ({ ...p, score: 0, completed: 0 })),
    ...over,
  });
}

function ended(over: Partial<RoomView> = {}): RoomView {
  const b = base();
  return base({
    phase: "ended",
    myMission: null,
    log: fullLog,
    winnerId: ME,
    players: [
      { ...b.players[0], score: 400, completed: 3 },
      { ...b.players[1], score: 250, completed: 1 },
    ],
    ...over,
  });
}

const GUESS = "היא צריכה לגרום לי לספר על האקסית שלי";

type Scenario = Partial<
  Pick<
    GameStore,
    | "profile"
    | "roomCode"
    | "room"
    | "overlay"
    | "burst"
    | "missed"
    | "roomFull"
    | "accuseOpen"
    | "missionRevealed"
    | "conn"
    | "editingProfile"
    | "intent"
  >
>;

export function demoScenario(name: string): Scenario | null {
  const inRoom = (room: RoomView, extra: Scenario = {}): Scenario => ({
    profile,
    roomCode: room.code,
    room,
    ...extra,
  });

  switch (name) {
    case "profile":
      return { profile: null };
    case "home":
      return { profile, roomCode: null, room: null };
    case "connecting":
      return { profile, roomCode: "4827", room: null, conn: "connecting" };
    case "roomfull":
      return { profile, roomCode: "4827", room: null, roomFull: true };

    case "lobby":
      return inRoom(lobby());
    case "lobby-wait": {
      const l = lobby();
      return inRoom({ ...l, players: [l.players[0]] });
    }
    case "lobby-guest": {
      const l = lobby();
      return inRoom({
        ...l,
        you: HER,
        settings: { location: "phone", vibe: "bold", target: 0 },
      }, { profile: { playerId: HER, name: "מאיה", avatar: "beret", gender: "f" } });
    }

    // Phone games: each player says where they are.
    case "lobby-phone": {
      const l = lobby({ settings: { location: "phone", vibe: "flirty", target: 400 } });
      return inRoom({ ...l, players: [{ ...l.players[0], place: "home" }, l.players[1]] });
    }
    case "lobby-phone-guest": {
      const l = lobby({ settings: { location: "phone", vibe: "flirty", target: 400 } });
      return inRoom(
        { ...l, you: HER, players: [{ ...l.players[0], place: "driving" }, l.players[1]] },
        { profile: { playerId: HER, name: "מאיה", avatar: "beret", gender: "f" } }
      );
    }
    case "game-phone":
    case "game-phone-place": {
      const b = base({
        settings: { location: "phone", vibe: "flirty", target: 400 },
        myMission: {
          id: "p001",
          text: "תפתח את המקרר, תקריא לה מה יש בפנים, ותגרום לה להרכיב לך מזה סנדוויץ', שכבה אחרי שכבה.",
          points: 100,
        },
      });
      return inRoom(
        { ...b, players: [{ ...b.players[0], place: "home" }, { ...b.players[1], place: "transit" }] },
        { missionRevealed: true }
      );
    }

    case "game-practice": {
      const b = base({ practicePeek: "תגרמי לו לספור בקול עד חמש, לא משנה מה הסיבה." });
      return inRoom({
        ...b,
        players: [b.players[0], { ...b.players[1], id: "practice-bot", name: "הבוט", avatar: "ninja", isBot: true }],
      });
    }

    case "game":
      return inRoom(base());
    case "game-revealed":
      return inRoom(base(), { missionRevealed: true });
    case "game-cooldown":
      return inRoom(base({ accuseCooldownUntil: Date.now() + 31_000, skipsLeft: 0 }));
    case "game-offline": {
      const b = base();
      return inRoom({ ...b, players: [b.players[0], { ...b.players[1], connected: false }] });
    }
    case "reconnecting":
      return inRoom(base(), { conn: "reconnecting" });
    case "accuse":
      return inRoom(base(), { accuseOpen: true });

    case "judging":
      return inRoom(base({ judging: { accuserId: ME, targetId: HER, guess: GUESS, needsManualRuling: false } }));
    case "judging-target":
      return inRoom(
        base({
          judging: {
            accuserId: HER,
            targetId: ME,
            guess: "הוא רוצה שאני אחמיא לו על החולצה",
            needsManualRuling: false,
          },
        })
      );
    case "manual":
      return inRoom(
        base({
          judging: {
            accuserId: HER,
            targetId: ME,
            guess: "הוא רוצה שאני אחמיא לו על החולצה",
            needsManualRuling: true,
          },
        })
      );
    case "manual-wait":
      return inRoom(base({ judging: { accuserId: ME, targetId: HER, guess: GUESS, needsManualRuling: true } }));

    case "verdict-win": {
      const b = base();
      return inRoom(
        { ...b, players: [{ ...b.players[0], score: 250 }, { ...b.players[1], score: 150 }] },
        {
          overlay: {
            kind: "verdict",
            ev: {
              kind: "verdict",
              accuserId: ME,
              targetId: HER,
              correct: true,
              guess: GUESS,
              reason: "הניחוש תופס את לב המשימה: לגרום לך לדבר על האקסית.",
              missionText: "תגרמי לו לספר על האקסית שלו בלי לשאול עליה ישירות.",
              accuserDelta: 100,
              targetDelta: -100,
            },
          },
        }
      );
    }
    case "verdict-lose": {
      const b = base({ accuseCooldownUntil: Date.now() + 45_000 });
      return inRoom(
        { ...b, players: [b.players[0], { ...b.players[1], score: 300 }] },
        {
          overlay: {
            kind: "verdict",
            ev: {
              kind: "verdict",
              accuserId: ME,
              targetId: HER,
              correct: false,
              guess: GUESS,
              reason: "כיוון יפה, אבל המשימה שלה לא קשורה לזוגיות קודמת.",
              accuserDelta: 0,
              targetDelta: 50,
            },
          },
        }
      );
    }
    case "verdict-caught": {
      const b = base();
      return inRoom(
        { ...b, players: [{ ...b.players[0], score: 50 }, { ...b.players[1], score: 350 }] },
        {
          overlay: {
            kind: "verdict",
            ev: {
              kind: "verdict",
              accuserId: HER,
              targetId: ME,
              correct: true,
              guess: "הוא רוצה שאני אחמיא לו על החולצה",
              reason: "קרוב מאוד. מחמאה על לבוש זו בדיוק המשימה.",
              missionText: "תגרום לה להחמיא לך על משהו שאתה לובש, בלי לבקש מחמאה.",
              accuserDelta: 100,
              targetDelta: -100,
            },
          },
        }
      );
    }
    case "verdict-safe": {
      const b = base();
      return inRoom(
        { ...b, players: [{ ...b.players[0], score: 200 }, b.players[1]] },
        {
          overlay: {
            kind: "verdict",
            ev: {
              kind: "verdict",
              accuserId: HER,
              targetId: ME,
              correct: false,
              guess: "הוא מנסה לגרום לי לצחוק",
              reason: "לא זה. המשימה שלו עוסקת במשהו אחר לגמרי.",
              accuserDelta: 0,
              targetDelta: 50,
            },
          },
        }
      );
    }

    case "intel":
      return inRoom(base(), {
        overlay: {
          kind: "intel",
          missionText: "תשחילי את המילה 'דינוזאור' לשיחה, ותגרמי לו לשתות שלוק מיד אחרי.",
          points: 100,
        },
      });
    case "success":
      return inRoom(base(), { burst: { key: 1, points: 100 } });
    case "missed":
      return inRoom(base(), { missed: liveLog.slice(2, 5) });

    case "summary":
      return inRoom(ended());
    case "summary-lose":
      return inRoom(ended({ you: HER }), {
        profile: { playerId: HER, name: "מאיה", avatar: "beret", gender: "f" },
      });
    case "summary-tie": {
      const e = ended({ winnerId: null });
      return inRoom({ ...e, players: e.players.map((p) => ({ ...p, score: 300 })) });
    }
    default:
      return null;
  }
}
