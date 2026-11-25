import type { ReactNode } from "react";

/**
 * Eight hand-drawn spy characters. The id travels over the wire as the
 * player's `avatar`, so unknown ids (an older client) fall back to the first.
 */
export const AVATAR_IDS = [
  "fedora",
  "beret",
  "shades",
  "headset",
  "monocle",
  "ninja",
  "cat",
  "disguise",
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

export const AVATAR_LABEL: Record<AvatarId, string> = {
  fedora: "הבלש",
  beret: "המרגלת",
  shades: "הסוכנת",
  headset: "המפעיל",
  monocle: "הג'נטלמן",
  ninja: "הנינג'ה",
  cat: "החתול",
  disguise: "התחפושת",
};

const INK = "#1A0F2B";

interface Look {
  bg: string;
  coat: string;
  skin: string;
  art: ReactNode;
}

const eyes = (
  <>
    <circle cx="27" cy="31" r="1.9" fill={INK} />
    <circle cx="37" cy="31" r="1.9" fill={INK} />
  </>
);
const smile = <path d="M27.5 37.5c1.5 2 7.5 2 9 0" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />;
const smirk = <path d="M28 38c3 1.5 6 1 8.5-1" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />;
const shades = (
  <>
    <path d="M19 28.5h26" stroke={INK} strokeWidth="2" />
    <rect x="20.5" y="27.5" width="10" height="7" rx="3" fill={INK} />
    <rect x="33.5" y="27.5" width="10" height="7" rx="3" fill={INK} />
    <path d="M22.5 29.5l3-.5M35.5 29.5l3-.5" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round" />
  </>
);

const LOOKS: Record<AvatarId, Look> = {
  fedora: {
    bg: "#3B2759",
    coat: "#C8A26A",
    skin: "#F0C8A0",
    art: (
      <>
        {eyes}
        {smirk}
        <path d="M19.5 22c0-10 4-14 12.5-14s12.5 4 12.5 14z" fill="#4A3320" />
        <rect x="19.5" y="18.5" width="25" height="4" fill="#FF4D6A" />
        <ellipse cx="32" cy="22.5" rx="20" ry="4.2" fill="#5C4129" />
      </>
    ),
  },
  beret: {
    bg: "#5A1F3A",
    coat: "#1F1630",
    skin: "#F4CDB0",
    art: (
      <>
        <path d="M17 30c0-12 6-17 15-17s15 5 15 17v16H41V30H23v16h-6z" fill="#2B1A12" />
        {eyes}
        <path d="M23.5 28.5l4-1.5M40.5 28.5l-4-1.5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M28.5 37.5c1.5 2.2 5.5 2.2 7 0-1.5-.8-5.5-.8-7 0z" fill="#FF4D6A" />
        <path d="M15.5 20c2-9 9-12 17-12 9 0 16 4 16 10 0 4-6 5-16 5-8 0-13-.5-17-3z" fill="#FF4D6A" />
        <path d="M33 8.5l1.5-4" stroke="#FF4D6A" strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  },
  shades: {
    bg: "#27406B",
    coat: "#111827",
    skin: "#C98F68",
    art: (
      <>
        <path d="M16 46V28c0-11 7-16 16-16s16 5 16 16v18h-7V27H23v19z" fill="#F2C14E" />
        <path d="M19 26c3-7 8-10 13-10s10 3 13 10c-4-3-8-4-13-4s-9 1-13 4z" fill="#F2C14E" />
        {shades}
        <path d="M28.5 38c1.5 1.6 5.5 1.6 7 0" fill="none" stroke="#B82444" strokeWidth="2.2" strokeLinecap="round" />
      </>
    ),
  },
  headset: {
    bg: "#1F4D4A",
    coat: "#8B5CF6",
    skin: "#8D5A3B",
    art: (
      <>
        <path d="M19 27c0-9 5-14 13-14s13 5 13 14c-3-4-7-6-13-6s-10 2-13 6z" fill="#1A0F2B" />
        {eyes}
        {smile}
        <path d="M17.5 31a14.5 14.5 0 0 1 29 0" fill="none" stroke="#E7E0F5" strokeWidth="2.6" strokeLinecap="round" />
        <rect x="14.5" y="28" width="6" height="9" rx="3" fill="#E7E0F5" />
        <rect x="43.5" y="28" width="6" height="9" rx="3" fill="#E7E0F5" />
        <path d="M17.5 37c0 5 4 7 9 7" fill="none" stroke="#E7E0F5" strokeWidth="2" strokeLinecap="round" />
        <circle cx="27.5" cy="44" r="2.2" fill="#FF4D6A" />
      </>
    ),
  },
  monocle: {
    bg: "#4A3A1C",
    coat: "#241838",
    skin: "#EBC09A",
    art: (
      <>
        <path d="M19 26c1-8 6-12 13-12s12 4 13 12c-3-3-6-5-13-5s-10 2-13 5z" fill="#D9D3E4" />
        <circle cx="27" cy="31" r="1.9" fill={INK} />
        <circle cx="37.5" cy="31" r="4.8" fill="#fff" fillOpacity="0.18" stroke="#FFC44D" strokeWidth="1.8" />
        <circle cx="37.5" cy="31" r="1.9" fill={INK} />
        <path d="M41.5 34.5c2 4 2 8 0 12" fill="none" stroke="#FFC44D" strokeWidth="1.2" />
        <path d="M22.5 38c3-3 6-2 9.5 0 3.5-2 6.5-3 9.5 0-3 2.5-6.5 2.5-9.5 1-3 1.5-6.5 1.5-9.5-1z" fill="#D9D3E4" />
        <path d="M27 50l5 3.5 5-3.5v6H27z" fill="#FF4D6A" />
      </>
    ),
  },
  ninja: {
    bg: "#4B1D2C",
    coat: "#161021",
    skin: "#E8B48C",
    art: (
      <>
        <circle cx="32" cy="30" r="15.5" fill="#161021" />
        <path d="M19.5 26.5c8-3 17-3 25 0v7.5c-8 3-17 3-25 0z" fill="#E8B48C" />
        <path d="M23 29.5l6 1.5M41 29.5l-6 1.5" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="27" cy="32" r="1.6" fill={INK} />
        <circle cx="37" cy="32" r="1.6" fill={INK} />
        <path d="M16.5 22.5c10-4 21-4 31 0" fill="none" stroke="#FF4D6A" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M47 22l8-4M47.5 23.5l7 3" stroke="#FF4D6A" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  cat: {
    bg: "#2E2A5E",
    coat: "#C8A26A",
    skin: "#4B4458",
    art: (
      <>
        <path d="M19.5 24 17 9l11.5 8zM44.5 24 47 9 35.5 17z" fill="#4B4458" />
        <path d="M21 20l-1.5-6 5 3.5zM43 20l1.5-6-5 3.5z" fill="#FF8FA3" />
        {shades}
        <path d="M30.5 37h3l-1.5 2z" fill="#FF8FA3" />
        <path d="M32 39c-1 2-3 2-4 .5M32 39c1 2 3 2 4 .5" fill="none" stroke="#E7E0F5" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M24 38.5l-9-1.5M24 40.5l-8.5 2M40 38.5l9-1.5M40 40.5l8.5 2" stroke="#E7E0F5" strokeWidth="1.1" strokeLinecap="round" />
      </>
    ),
  },
  disguise: {
    bg: "#234A2E",
    coat: "#3B2759",
    skin: "#F0C8A0",
    art: (
      <>
        <path d="M19 26c0-8 5-13 13-13s13 5 13 13c-4-4-8-5-13-5s-9 1-13 5z" fill="#B5532B" />
        <circle cx="26.5" cy="30.5" r="5" fill="#fff" fillOpacity="0.15" stroke={INK} strokeWidth="2" />
        <circle cx="37.5" cy="30.5" r="5" fill="#fff" fillOpacity="0.15" stroke={INK} strokeWidth="2" />
        <circle cx="26.5" cy="30.5" r="1.6" fill={INK} />
        <circle cx="37.5" cy="30.5" r="1.6" fill={INK} />
        <path d="M29.5 33c0-2 5-2 5 0 0 3.5-1 5.5-2.5 5.5S29.5 36.5 29.5 33z" fill="#F7A8A0" stroke={INK} strokeWidth="1.2" />
        <path d="M22 41c3-3.5 7-3 10-1.5 3-1.5 7-2 10 1.5-3.5 2-7 1.5-10-.2-3 1.7-6.5 2.2-10 .2z" fill="#2B1A12" />
        <path d="M21.5 23.5l8 1M42.5 23.5l-8 1" stroke="#2B1A12" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
};

export function isAvatarId(id: string): id is AvatarId {
  return (AVATAR_IDS as readonly string[]).includes(id);
}

interface AvatarProps {
  id: string;
  size?: number;
  className?: string;
  /** Coloured ring, e.g. to mark "you". */
  ring?: string;
}

export default function Avatar({ id, size = 48, className = "", ring }: AvatarProps) {
  const look = LOOKS[isAvatarId(id) ? id : "fedora"];
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: ring ? `0 0 0 3px ${ring}` : undefined,
      }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
        <rect width="64" height="64" fill={look.bg} />
        <circle cx="32" cy="20" r="26" fill="#fff" fillOpacity="0.06" />
        <path d="M8 66c0-13 10-20 24-20s24 7 24 20z" fill={look.coat} />
        <path d="M26 46l6 8 6-8-6-2z" fill="#fff" fillOpacity="0.16" />
        <circle cx="32" cy="30" r="13.5" fill={look.skin} />
        {look.art}
      </svg>
    </span>
  );
}
