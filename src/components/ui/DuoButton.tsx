import type { ButtonHTMLAttributes, ReactNode } from "react";

export type DuoVariant = "violet" | "coral" | "gold" | "ghost" | "quiet";

/**
 * The chunky 3D button from the reference app, in the dark palette. The
 * "depth" is a solid shadow under the button; on press the button drops onto
 * it. Using a shadow instead of a border means nothing reflows on press.
 */
export const duoVariant: Record<DuoVariant, string> = {
  violet:
    "bg-[linear-gradient(180deg,#A583FF,#8B5CF6)] text-white shadow-[0_5px_0_0_#5A32C2,0_18px_30px_-14px_rgba(139,92,246,0.7)]",
  coral:
    "bg-[linear-gradient(180deg,#FF6E86,#FF4D6A)] text-white shadow-[0_5px_0_0_#B82444,0_18px_30px_-14px_rgba(255,77,106,0.7)]",
  gold:
    "bg-[linear-gradient(180deg,#FFD880,#FFC44D)] text-ink-950 shadow-[0_5px_0_0_#C0820F,0_18px_30px_-14px_rgba(255,196,77,0.6)]",
  ghost:
    "bg-ink-700 text-mist shadow-[0_5px_0_0_#120920,inset_0_0_0_1.5px_rgba(201,181,255,0.22)]",
  quiet: "bg-transparent text-mute shadow-none",
};

interface DuoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: DuoVariant;
  size?: "sm" | "md" | "lg";
  full?: boolean;
  children: ReactNode;
}

const sizes = {
  sm: "min-h-[48px] px-4 text-[15px] rounded-2xl",
  md: "min-h-[54px] px-5 text-[17px] rounded-2xl",
  lg: "min-h-[64px] px-6 text-xl rounded-[20px]",
} as const;

export default function DuoButton({
  variant = "violet",
  size = "md",
  full = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}: DuoButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        "no-select relative inline-flex items-center justify-center gap-2 font-black leading-tight transition-[transform,box-shadow,filter,opacity] duration-100",
        sizes[size],
        duoVariant[variant],
        full ? "w-full" : "",
        disabled
          ? "cursor-not-allowed opacity-40 saturate-50"
          : variant === "quiet"
            ? "cursor-pointer active:scale-95"
            : "cursor-pointer active:translate-y-[5px] active:shadow-none",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
