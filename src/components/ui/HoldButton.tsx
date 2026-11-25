import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { vibrate } from "../../lib/haptics";

interface HoldButtonProps {
  onConfirm: () => void;
  /** How long the press must last. */
  holdMs?: number;
  disabled?: boolean;
  children: ReactNode;
  hint: string;
  className?: string;
}

/**
 * Press-and-hold to confirm, so a tap inside a pocket never scores. A gold
 * fill sweeps across while holding. Works with touch, mouse and the keyboard
 * (hold Space or Enter).
 */
export default function HoldButton({
  onConfirm,
  holdMs = 700,
  disabled,
  children,
  hint,
  className = "",
}: HoldButtonProps) {
  const [progress, setProgress] = useState(0);
  const [nudge, setNudge] = useState(false);
  const raf = useRef(0);
  const startedAt = useRef(0);
  const done = useRef(false);

  const stop = (completed: boolean) => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    if (!completed) {
      // A short tap: teach the gesture instead of doing nothing.
      if (startedAt.current && performance.now() - startedAt.current < 250) {
        setNudge(true);
        window.setTimeout(() => setNudge(false), 1600);
      }
      setProgress(0);
    }
    startedAt.current = 0;
  };

  const start = () => {
    if (disabled || raf.current) return;
    done.current = false;
    startedAt.current = performance.now();
    vibrate(10);
    const tick = () => {
      const p = Math.min(1, (performance.now() - startedAt.current) / holdMs);
      setProgress(p);
      if (p >= 1) {
        done.current = true;
        raf.current = 0;
        startedAt.current = 0;
        onConfirm();
        window.setTimeout(() => setProgress(0), 250);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`${typeof children === "string" ? children : ""} ${hint}`.trim()}
      onPointerDown={(e) => {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // capture is a nicety; holding still works without it
        }
        start();
      }}
      onPointerUp={() => stop(done.current)}
      onPointerCancel={() => stop(done.current)}
      onPointerLeave={() => stop(done.current)}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") stop(done.current);
      }}
      onBlur={() => stop(done.current)}
      style={{ touchAction: "none" }}
      className={[
        "no-select relative flex min-h-[76px] w-full flex-col items-center justify-center overflow-hidden rounded-[22px] px-4 font-black text-white transition-[transform,box-shadow,opacity] duration-100",
        "bg-[linear-gradient(180deg,#A583FF,#8B5CF6)] shadow-[0_6px_0_0_#5A32C2,0_20px_34px_-14px_rgba(139,92,246,0.75)]",
        disabled ? "cursor-not-allowed opacity-40 saturate-50" : "cursor-pointer",
        progress > 0 ? "translate-y-[6px] shadow-none" : "",
        className,
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 right-0 bg-[linear-gradient(180deg,#FFD880,#FFC44D)]"
        style={{ width: `${progress * 100}%` }}
      />
      <span
        className={`relative flex items-center gap-2 text-[22px] leading-tight ${progress > 0.5 ? "text-ink-950" : ""}`}
      >
        {children}
      </span>
      <span
        className={`relative text-[13px] font-bold ${
          progress > 0.5 ? "text-ink-950/80" : nudge ? "text-gold-hi" : "text-white/75"
        }`}
      >
        {nudge ? "לא לשחרר! לוחצים ומחזיקים" : hint}
      </span>
    </button>
  );
}
