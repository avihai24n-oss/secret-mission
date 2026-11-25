interface CountdownRingProps {
  /** Fraction of the time remaining, 0..1. */
  fraction: number;
  seconds: number;
  size?: number;
  color?: string;
}

export default function CountdownRing({ fraction, seconds, size = 40, color = "#FFC44D" }: CountdownRingProps) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const f = Math.max(0, Math.min(1, fraction));
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - f)}
          style={{ transition: "stroke-dashoffset 0.25s linear" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[13px] font-black tabular-nums"
        style={{ color }}
      >
        {seconds}
      </span>
    </span>
  );
}
