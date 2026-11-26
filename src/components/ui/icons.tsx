import type { ReactNode } from "react";

/**
 * Hand-drawn line icon set (no emojis anywhere in the UI). 24px grid,
 * round caps, drawn with currentColor so they follow the text colour.
 */
export interface IconProps {
  size?: number;
  className?: string;
}

function Svg({ size = 24, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className ?? ""}`}
    >
      {children}
    </svg>
  );
}

const f = "currentColor";

export const IconShare = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 15V3.5" />
    <path d="M7.5 7.5 12 3l4.5 4.5" />
    <path d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12" />
  </Svg>
);

export const IconCopy = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8.5" y="8.5" width="12" height="12" rx="3" />
    <path d="M15.5 5.5v-.5a2 2 0 0 0-2-2H5.5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2H6" />
  </Svg>
);

export const IconWhatsApp = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 20.5l1.3-4.3A8.5 8.5 0 1 1 8 19.4z" />
    <path d="M9 8.5c-.3 2.8 2.6 6.2 5.7 6.3l1.3-1.5-1.8-1-1 .7c-.9-.4-1.7-1.2-2.1-2.1l.7-1-1-1.8z" fill={f} stroke="none" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 12.5 9.5 17.5 19.5 6.5" strokeWidth={2.8} />
  </Svg>
);

export const IconX = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" strokeWidth={2.6} />
  </Svg>
);

/** Points "back" in RTL (towards the right edge). */
export const IconBack = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h16" />
    <path d="M14 6l6 6-6 6" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Svg>
);

export const IconPencil = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20l1-4.5L16.5 4a2.1 2.1 0 0 1 3 0l.5.5a2.1 2.1 0 0 1 0 3L8.5 19z" />
    <path d="M14.5 6l3.5 3.5" />
  </Svg>
);

export const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" fill={f} stroke="none" />
  </Svg>
);

export const IconEyeOff = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 13c2.2 2.6 5.3 4 9 4s6.8-1.4 9-4" />
    <path d="M12 17v3M6.5 15.5 5 18M17.5 15.5 19 18" />
  </Svg>
);

export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="3" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </Svg>
);

export const IconSwap = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8.5h13.5" />
    <path d="M14 5l3.5 3.5L14 12" />
    <path d="M20 15.5H6.5" />
    <path d="M10 12l-3.5 3.5L10 19" />
  </Svg>
);

export const IconFlag = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 21V4" />
    <path d="M6 5c4-2 6 2 12 0v8.5c-6 2-8-2-12 0" />
  </Svg>
);

export const IconScroll = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 3.5h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z" />
    <path d="M9 8.5h6M9 12h6M9 15.5h3.5" />
  </Svg>
);

export const IconSiren = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 17v-4.5a5.5 5.5 0 0 1 11 0V17" />
    <path d="M4 20.5h16M5 17h14v3.5H5z" />
    <path d="M12 2.5v1.5M4.5 5.5l1 1M19.5 5.5l-1 1" />
  </Svg>
);

export const IconBolt = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13.5 2.5 5 13.5h6l-1 8L19 10.5h-6z" />
  </Svg>
);

export const IconCrown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 18.5 2.5 7.5l5.5 4L12 4.5l4 7 5.5-4-1.5 11z" />
  </Svg>
);

export const IconGavel = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 4.5l6.5 6.5M10 7.5l6.5 6.5M11.5 6l5 5M12.5 12.5 4 21" />
    <path d="M13 20.5h8" />
  </Svg>
);

export const IconFingerprint = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 9.5A8 8 0 0 1 19 9.5" />
    <path d="M4.5 14c0-3 .5-4 1.5-5.5M19.5 12.5c.2 2.5 0 4.5-.7 6.5" />
    <path d="M8 19.5c.8-2 1-3.5 1-6a3 3 0 0 1 6 0c0 3-.3 5.2-1.2 7.5" />
    <path d="M12 13.5c0 3-.3 5-1.3 7.5" />
  </Svg>
);

export const IconHeart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20.5C5.5 16 3 12.5 3 9a4.7 4.7 0 0 1 9-2 4.7 4.7 0 0 1 9 2c0 3.5-2.5 7-9 11.5z" />
  </Svg>
);

export const IconSmile = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 13.5c1 2 2.3 3 4 3s3-1 4-3" />
    <path d="M8.5 9.5h.01M15.5 9.5h.01" strokeWidth={3} />
  </Svg>
);

export const IconGlass = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 4.5h15L12 13z" />
    <path d="M12 13v7.5M8 20.5h8" />
    <path d="M15 2.5l-2.5 5" />
  </Svg>
);

export const IconTree = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21.5v-7" />
    <path d="M12 3a5 5 0 0 0-4.5 7A3.8 3.8 0 0 0 9 16.5h6a3.8 3.8 0 0 0 1.5-6.5A5 5 0 0 0 12 3z" />
  </Svg>
);

export const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 11.5 12 4l8.5 7.5" />
    <path d="M6 10v10h12V10" />
    <path d="M10 20v-5.5h4V20" />
  </Svg>
);

export const IconPhone = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 4.5h3.5l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5V19a2 2 0 0 1-2 2C10 21 3 14 3 6.5a2 2 0 0 1 2-2z" />
  </Svg>
);

export const IconBed = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 19.5V6" />
    <path d="M3 16.5h18v3" />
    <path d="M3 12.5h14.5a3.5 3.5 0 0 1 3.5 3.5v.5" />
    <path d="M6 12.5V11a1.8 1.8 0 0 1 1.8-1.8h2.4A1.8 1.8 0 0 1 12 11v1.5" />
  </Svg>
);

/** A steering wheel: "I am driving". */
export const IconWheel = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.2" />
    <path d="M3.3 10.5c3-1.4 5.5-1.2 6.9.3M20.7 10.5c-3-1.4-5.5-1.2-6.9.3M12 14.2V21" />
  </Svg>
);

export const IconBus = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="3.5" width="15" height="14.5" rx="3" />
    <path d="M4.5 11.5h15" />
    <path d="M7.5 18v2.5M16.5 18v2.5" />
    <path d="M8 14.8h.01M16 14.8h.01" strokeWidth={3} />
  </Svg>
);

export const IconBriefcase = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="7.5" width="18" height="12.5" rx="3" />
    <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
    <path d="M3 12.5c5.5 2.3 12.5 2.3 18 0" />
  </Svg>
);

/** A shop front: cafe, mall, supermarket. */
export const IconShop = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 10.5V20h15v-9.5" />
    <path d="M3 8l1.8-4.5h14.4L21 8a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
    <path d="M10 20v-5h4v5" />
  </Svg>
);

/** A map pin: "where I am". */
export const IconPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21.5c-4.5-4.8-6.5-8.2-6.5-11.3a6.5 6.5 0 0 1 13 0c0 3.1-2 6.5-6.5 11.3z" />
    <circle cx="12" cy="10" r="2.3" />
  </Svg>
);

export const IconTarget = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill={f} />
  </Svg>
);

export const IconInfinity = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 12c-1.5-2.5-3-4-5-4a4 4 0 0 0 0 8c2 0 3.5-1.5 5-4zm0 0c1.5 2.5 3 4 5 4a4 4 0 0 0 0-8c-2 0-3.5 1.5-5 4z" />
  </Svg>
);

export const IconUsers = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="8.5" cy="8.5" r="3.5" />
    <path d="M2.5 20c0-3.5 2.5-6 6-6s6 2.5 6 6" />
    <path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6M17.5 14.5c2.4.7 4 2.7 4 5.5" />
  </Svg>
);

export const IconWifiOff = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9c2-1.8 4.3-2.9 7-3.3M21 9a13 13 0 0 0-5-2.9M6.5 13a8 8 0 0 1 4-1.9M17.5 13a8 8 0 0 0-2-1.3" />
    <path d="M12 18h.01" strokeWidth={3.2} />
    <path d="M4 3l16 18" />
  </Svg>
);

/** The game's mark: a heart with a keyhole. */
export function LogoMark({ size = 96, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B79BFF" />
          <stop offset="0.55" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#5A32C2" />
        </linearGradient>
      </defs>
      <path
        d="M48 84C24 68 10 53 10 36.5A19.5 19.5 0 0 1 48 28a19.5 19.5 0 0 1 38 8.5C86 53 72 68 48 84z"
        fill="url(#lm-g)"
      />
      <path
        d="M22 34c1-7 6-11 12-11"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.45"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="48" cy="42" r="8.5" fill="#150B22" />
      <path d="M43.5 45h9l3.5 19h-16z" fill="#150B22" />
    </svg>
  );
}
