import { motion } from "framer-motion";

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  tone?: "violet" | "coral";
}

export default function ProgressBar({ value, tone = "violet" }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        className={`h-full rounded-full ${
          tone === "violet"
            ? "bg-[linear-gradient(90deg,#8B5CF6,#C9B5FF)]"
            : "bg-[linear-gradient(90deg,#FF4D6A,#FF9DAE)]"
        }`}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
      />
    </div>
  );
}
