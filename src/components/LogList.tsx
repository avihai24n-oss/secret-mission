import type { LogEntry, PlayerView } from "../../shared/protocol";
import { g, signed } from "../lib/copy";
import Avatar from "./ui/Avatar";
import { IconCheck, IconSiren, IconSwap, IconX } from "./ui/icons";

interface LogListProps {
  log: LogEntry[];
  players: PlayerView[];
  you: string;
  /** Newest first (during the game) or oldest first (the final timeline). */
  order?: "newest" | "oldest";
}

const KIND_STYLE = {
  success: { icon: IconCheck, color: "text-gold", ring: "bg-gold/15" },
  caught: { icon: IconSiren, color: "text-coral-hi", ring: "bg-coral/15" },
  missed: { icon: IconX, color: "text-mute", ring: "bg-white/10" },
  skip: { icon: IconSwap, color: "text-violet-soft", ring: "bg-violet/15" },
} as const;

function clock(t: number): string {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** One line describing what happened, phrased by the actor's gender. */
export function logHeadline(e: LogEntry, players: PlayerView[], you: string): string {
  const actor = players.find((p) => p.id === e.actorId);
  const target = players.find((p) => p.id === e.targetId);
  const a = actor?.name ?? "מישהו";
  const ag = actor?.gender ?? "m";
  const mine = e.actorId === you;
  switch (e.kind) {
    case "success":
      return mine ? "השלמת משימה" : `${a} ${g(ag, "השלים", "השלימה")} משימה`;
    case "caught":
      return mine
        ? `עלית על ${target?.name ?? "הצד השני"}`
        : `${a} ${g(ag, "עלה", "עלתה")} ${e.targetId === you ? "עליך" : `על ${target?.name ?? ""}`}`;
    case "missed":
      return mine ? "ניחשת וטעית" : `${a} ${g(ag, "ניחש וטעה", "ניחשה וטעתה")}`;
    case "skip":
      return mine ? "החלפת משימה" : `${a} ${g(ag, "החליף", "החליפה")} משימה`;
  }
}

export default function LogList({ log, players, you, order = "newest" }: LogListProps) {
  if (log.length === 0) {
    return <p className="py-6 text-center text-[15px] text-faint">עוד לא קרה כלום. המבצע רק התחיל.</p>;
  }
  const items = order === "newest" ? [...log].reverse() : log;

  return (
    <ol className="relative flex flex-col gap-3">
      {items.map((e) => {
        const style = KIND_STYLE[e.kind];
        const Icon = style.icon;
        const actor = players.find((p) => p.id === e.actorId);
        const target = players.find((p) => p.id === e.targetId);
        return (
          <li key={e.id} className="rounded-2xl border border-white/[0.07] bg-ink-900/70 p-3.5">
            <div className="flex items-center gap-2.5">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.ring} ${style.color}`}>
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-mist">{logHeadline(e, players, you)}</p>
                <p className="ltr text-start text-xs tabular-nums text-faint" dir="ltr" style={{ textAlign: "right" }}>
                  {clock(e.t)}
                </p>
              </div>
              {actor && <Avatar id={actor.avatar} size={30} />}
            </div>

            {e.guess && (
              <p className="mt-2.5 rounded-xl bg-white/[0.05] px-3 py-2 text-[14px] leading-snug text-mist">
                <span className="font-bold text-faint">הניחוש: </span>
                {e.guess}
              </p>
            )}
            {e.reason && (
              <p className="mt-1.5 px-1 text-[13px] leading-snug text-mute">
                <span className="font-bold text-violet-soft">השופט: </span>
                {e.reason}
              </p>
            )}
            {e.missionText && (
              <p className="mt-2 border-s-2 border-violet/60 ps-3 text-[14px] leading-snug text-mute">
                <span className="font-bold text-faint">המשימה: </span>
                {e.missionText}
              </p>
            )}

            {(e.actorDelta !== 0 || (e.targetDelta ?? 0) !== 0) && (
              <div className="mt-2.5 flex flex-wrap gap-2 text-[13px] font-black">
                {e.actorDelta !== 0 && actor && <Delta name={actor.name} delta={e.actorDelta} />}
                {e.targetDelta !== undefined && e.targetDelta !== 0 && target && (
                  <Delta name={target.name} delta={e.targetDelta} />
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Delta({ name, delta }: { name: string; delta: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
        delta > 0 ? "bg-gold/15 text-gold" : "bg-coral/15 text-coral-hi"
      }`}
    >
      {name}
      <span className="ltr tabular-nums">{signed(delta)}</span>
    </span>
  );
}
