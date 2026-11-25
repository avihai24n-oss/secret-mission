import { useEffect } from "react";
import { motion } from "framer-motion";
import type { MissionView } from "../../shared/protocol";
import { useGame } from "../game/store";
import { IconEyeOff, IconFingerprint } from "./ui/icons";

const AUTO_HIDE_MS = 15_000;

/**
 * The secret mission. Face down by default so a glance across the table
 * reveals nothing; a tap flips it, and it flips back on its own, on a second
 * tap, or as soon as the screen goes to the background.
 */
export default function MissionCard({ mission }: { mission: MissionView }) {
  const revealed = useGame((s) => s.missionRevealed);
  const setRevealed = useGame((s) => s.setMissionRevealed);
  const demo = useGame((s) => s.demo);

  useEffect(() => {
    if (!revealed || demo) return;
    const timer = window.setTimeout(() => setRevealed(false), AUTO_HIDE_MS);
    const onHide = () => {
      if (document.visibilityState !== "visible") setRevealed(false);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [revealed, demo, setRevealed, mission.id]);

  return (
    <motion.div
      key={mission.id}
      initial={{ y: 40, opacity: 0, rotate: 3 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="relative min-h-0 flex-1"
      style={{ perspective: 1200 }}
    >
      <motion.button
        type="button"
        onClick={() => setRevealed(!revealed)}
        aria-pressed={revealed}
        aria-label={revealed ? "הסתרת המשימה" : "הצצה במשימה הסודית"}
        initial={false}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="preserve-3d no-select relative block h-full w-full rounded-[28px] text-start"
      >
        {/* Cover */}
        <span
          className="backface-hidden absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[28px] border border-violet/35 bg-ink-800 px-6 text-center shadow-glow"
          aria-hidden={revealed}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.55]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(139,92,246,0.10) 0 2px, transparent 2px 14px)",
            }}
          />
          <span className="absolute left-4 top-4 rotate-[-7deg] rounded-md border-2 border-coral px-2 font-display text-lg font-bold leading-tight tracking-wider text-coral opacity-90">
            סודי ביותר
          </span>
          <span className="absolute right-4 top-4 rounded-full bg-gold px-3 py-1 text-[15px] font-black text-ink-950">
            <span className="ltr tabular-nums">{mission.points}</span> נק'
          </span>

          <span className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full bg-violet/20 text-violet-soft">
            <span className="absolute inset-0 animate-ping2 rounded-full border-2 border-violet/50" />
            <IconFingerprint size={50} />
          </span>
          <span className="display relative mt-4 text-[46px] text-mist">המשימה הסודית שלך</span>
          <span className="relative mt-2 text-[16px] font-bold text-mute">נגיעה כדי להציץ. רק כשאף אחד לא מסתכל.</span>
        </span>

        {/* Mission face */}
        <span
          className="backface-hidden absolute inset-0 flex flex-col overflow-hidden rounded-[28px] border border-gold/40 bg-[linear-gradient(170deg,#32204E,#22143A)] p-5 shadow-glow"
          style={{ transform: "rotateY(180deg)" }}
          aria-hidden={!revealed}
        >
          <span className="flex items-center justify-between">
            <span className="eyebrow">המשימה שלך</span>
            <span className="rounded-full bg-gold px-3 py-1 text-[15px] font-black text-ink-950">
              <span className="ltr tabular-nums">{mission.points}</span> נק'
            </span>
          </span>
          <span className="dashed-rule mt-3 block" />
          <span className="scroll-y flex min-h-0 flex-1 items-center">
            <span className="block py-3 text-[25px] font-bold leading-[1.32] text-mist">{mission.text}</span>
          </span>
          <span className="flex items-center justify-center gap-2 text-[14px] font-bold text-faint">
            <IconEyeOff size={17} />
            נגיעה להסתרה
          </span>
          {revealed && !demo && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1 origin-right bg-gold/70"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: AUTO_HIDE_MS / 1000, ease: "linear" }}
            />
          )}
        </span>
      </motion.button>
    </motion.div>
  );
}
