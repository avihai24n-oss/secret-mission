import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { animate, motion } from "framer-motion";
import type { PlayerView, RoomView } from "../../shared/protocol";
import { useGame } from "../game/store";
import type { VerdictEvent } from "../game/store";
import { g, signed } from "../lib/copy";
import Avatar from "./ui/Avatar";
import DuoButton from "./ui/DuoButton";
import { IconBolt, IconCheck, IconGavel, IconSiren, IconX } from "./ui/icons";

/** Counts from 0 to `value`, for point changes. */
function CountTo({ value, delay = 0.35 }: { value: number; delay?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.9,
      delay,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, delay]);
  return <span className="ltr tabular-nums">{signed(shown)}</span>;
}

function DeltaRow({ player, delta, you }: { player: PlayerView | undefined; delta: number; you: boolean }) {
  if (!player) return null;
  const tone = delta > 0 ? "text-gold" : delta < 0 ? "text-coral-hi" : "text-faint";
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-3.5 py-2.5">
      <Avatar id={player.avatar} size={40} ring={you ? "#8B5CF6" : undefined} />
      <div className="min-w-0 flex-1 text-start">
        <p className="truncate text-[16px] font-black text-mist">{you ? "אני" : player.name}</p>
        <p className="text-[13px] text-faint">
          סה"כ <span className="ltr tabular-nums">{player.score}</span>
        </p>
      </div>
      <span className={`num text-[32px] leading-none ${tone}`}>
        <CountTo value={delta} />
      </span>
    </div>
  );
}

function Shell({
  tone,
  children,
  onClose,
  label,
}: {
  tone: "gold" | "coral" | "violet";
  children: ReactNode;
  onClose: () => void;
  label: string;
}) {
  const glow = {
    gold: "rgba(255,196,77,0.30)",
    coral: "rgba(255,77,106,0.32)",
    violet: "rgba(139,92,246,0.38)",
  }[tone];
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 cursor-pointer overflow-y-auto bg-[#12081C]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[60%]"
        style={{ background: `radial-gradient(80% 70% at 50% 0%, ${glow}, transparent)` }}
      />
      <div className="shell relative items-center text-center">{children}</div>
    </motion.div>
  );
}

function Badge({ tone, children }: { tone: "gold" | "coral" | "violet"; children: ReactNode }) {
  const cls = {
    gold: "bg-gold text-ink-950 shadow-[0_0_0_10px_rgba(255,196,77,0.16),0_0_0_22px_rgba(255,196,77,0.07)]",
    coral: "bg-coral text-white shadow-[0_0_0_10px_rgba(255,77,106,0.18),0_0_0_22px_rgba(255,77,106,0.08)]",
    violet: "bg-violet text-white shadow-[0_0_0_10px_rgba(139,92,246,0.2),0_0_0_22px_rgba(139,92,246,0.09)]",
  }[tone];
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 13, delay: 0.05 }}
      className={`mt-10 flex h-[104px] w-[104px] shrink-0 items-center justify-center rounded-full ${cls}`}
    >
      {children}
    </motion.div>
  );
}

function Quote({ label, text, accent }: { label: string; text: string; accent: string }) {
  return (
    <div className={`w-full rounded-2xl border bg-ink-800/90 px-4 py-3 text-start ${accent}`}>
      <p className="text-[13px] font-bold text-faint">{label}</p>
      <p className="mt-0.5 text-[17px] font-bold leading-snug text-mist">{text}</p>
    </div>
  );
}

// ---------------------------------------------------------------- verdict

export function VerdictOverlay({ room, ev }: { room: RoomView; ev: VerdictEvent }) {
  const dismiss = useGame((s) => s.dismissOverlay);
  const accuser = room.players.find((p) => p.id === ev.accuserId);
  const target = room.players.find((p) => p.id === ev.targetId);
  const iAmAccuser = ev.accuserId === room.you;
  const ag = accuser?.gender ?? "m";
  const tg = target?.gender ?? "m";
  const good = iAmAccuser ? ev.correct : !ev.correct;

  let title: string;
  let sub: string;
  if (iAmAccuser && ev.correct) {
    title = `בול! עלית ${g(tg, "עליו", "עליה")}`;
    sub = `גנבת ${g(tg, "לו", "לה")} נקודות, ו${g(tg, "הוא מקבל", "היא מקבלת")} משימה חדשה.`;
  } else if (iAmAccuser) {
    title = "פספוס...";
    sub = `${target?.name ?? ""} ${g(tg, "מקבל", "מקבלת")} בונוס, והכפתור האדום שלך ננעל לזמן קצר.`;
  } else if (ev.correct) {
    title = "נחשפת!";
    sub = `${accuser?.name ?? ""} ${g(ag, "עלה", "עלתה")} עליך. מקבלים משימה חדשה ומתחילים מחדש.`;
  } else {
    title = "הכיסוי נשמר!";
    sub = `${accuser?.name ?? ""} ${g(ag, "טעה", "טעתה")}. בונוס אצלך, והמשימה שלך ממשיכה כרגיל.`;
  }

  const tone = good ? "gold" : "coral";

  return (
    <Shell tone={tone} onClose={dismiss} label={title}>
      <Badge tone={tone}>
        {good ? <IconCheck size={56} /> : iAmAccuser ? <IconX size={56} /> : <IconSiren size={54} />}
      </Badge>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`display mt-7 text-[68px] ${good ? "text-gold" : "text-coral-hi"}`}
      >
        {title}
      </motion.h1>
      <p className="mt-2 max-w-[21rem] text-[16px] leading-snug text-mute">{sub}</p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="mt-5 flex w-full flex-col gap-2.5"
      >
        <Quote
          label={iAmAccuser ? "הניחוש שלך" : `הניחוש של ${accuser?.name ?? ""}`}
          text={ev.guess}
          accent="border-white/10"
        />
        {ev.reason && (
          <div className="flex w-full items-start gap-2.5 px-1 text-start">
            <IconGavel size={20} className="mt-0.5 shrink-0 text-violet-soft" />
            <p className="text-[15px] leading-snug text-mist">
              <span className="font-bold text-violet-soft">השופט: </span>
              {ev.reason}
            </p>
          </div>
        )}
        {ev.missionText && (
          <Quote
            label={iAmAccuser ? `המשימה ${g(tg, "שלו", "שלה")} הייתה` : "המשימה שנחשפה"}
            text={ev.missionText}
            accent="border-gold/40"
          />
        )}
      </motion.div>

      <div className="mt-4 flex w-full flex-col gap-2">
        <DeltaRow player={accuser} delta={ev.accuserDelta} you={iAmAccuser} />
        <DeltaRow player={target} delta={ev.targetDelta} you={!iAmAccuser} />
      </div>

      <div className="mt-auto w-full pt-6">
        <DuoButton variant={good ? "gold" : "ghost"} size="lg" full onClick={dismiss}>
          חוזרים למבצע
        </DuoButton>
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------- intel alert

export function IntelOverlay({
  room,
  missionText,
  points,
}: {
  room: RoomView;
  missionText: string;
  points: number;
}) {
  const dismiss = useGame((s) => s.dismissOverlay);
  const other = room.players.find((p) => p.id !== room.you);
  const og = other?.gender ?? "m";

  return (
    <Shell tone="violet" onClose={dismiss} label="התראת מודיעין">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, -8, 8, -5, 5, 0] }}
        transition={{ type: "spring", stiffness: 260, damping: 12 }}
        className="mt-10 flex h-[104px] w-[104px] shrink-0 items-center justify-center rounded-full bg-violet text-gold shadow-[0_0_0_10px_rgba(139,92,246,0.2),0_0_0_22px_rgba(139,92,246,0.09)]"
      >
        <IconBolt size={56} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="display mt-7 text-[68px] text-mist"
      >
        התראת מודיעין!
      </motion.h1>
      <p className="mt-2 max-w-[21rem] text-[17px] leading-snug text-mute">
        {other?.name ?? "הצד השני"} {g(og, "השלים", "השלימה")} משימה סודית ממש מתחת לאף שלך.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-5 w-full"
      >
        <Quote label="המשימה הייתה" text={missionText} accent="border-violet/50" />
      </motion.div>

      <div className="mt-4 w-full">
        <DeltaRow player={other} delta={points} you={false} />
      </div>

      <div className="mt-auto w-full pt-6">
        <DuoButton size="lg" full onClick={dismiss}>
          {g(og, "אני אתפוס אותו בפעם הבאה", "אני אתפוס אותה בפעם הבאה")}
        </DuoButton>
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------- my success

/** A short, quiet celebration after `mySuccess`; never blocks the screen. */
export function SuccessBurst() {
  const burst = useGame((s) => s.burst);
  const [shown, setShown] = useState<typeof burst>(null);

  useEffect(() => {
    if (!burst) return;
    setShown(burst);
    const t = window.setTimeout(() => setShown(null), 1700);
    return () => window.clearTimeout(t);
  }, [burst]);

  if (!shown) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center" aria-live="polite">
      <motion.div
        key={shown.key}
        initial={{ scale: 0.3, opacity: 0, y: 30 }}
        animate={{ scale: [0.3, 1.15, 1, 1], opacity: [0, 1, 1, 0], y: [30, 0, 0, -50] }}
        transition={{ duration: 1.6, times: [0, 0.2, 0.75, 1] }}
        className="flex flex-col items-center"
      >
        <span className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full bg-gold text-ink-950 shadow-[0_0_0_14px_rgba(255,196,77,0.2),0_0_0_32px_rgba(255,196,77,0.08),0_30px_80px_-10px_rgba(255,196,77,0.6)]">
          <span className="num text-[58px] leading-none">
            <span className="ltr">+{shown.points}</span>
          </span>
        </span>
        <span className="display mt-5 text-[44px] text-gold">משימה הושלמה</span>
      </motion.div>
    </div>
  );
}
