import type { Gender } from "../../shared/protocol";

export interface Profile {
  playerId: string;
  name: string;
  avatar: string;
  gender: Gender;
}

const PROFILE_KEY = "secret-mission-profile-v1";
const ID_KEY = "secret-mission-player-id";
const ROOM_KEY = "secret-mission-room";

export const MAX_NAME_LENGTH = 14;

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Older WebViews (and non-secure contexts) lack randomUUID.
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
}

/** The id survives profile edits, so a rename mid-game keeps the same seat. */
export function getPlayerId(): string {
  try {
    const existing = localStorage.getItem(ID_KEY);
    if (existing) return existing;
    const id = newId();
    localStorage.setItem(ID_KEY, id);
    return id;
  } catch {
    return newId();
  }
}

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Profile>;
    if (!p.name || typeof p.name !== "string") return null;
    return {
      playerId: getPlayerId(),
      name: p.name.slice(0, MAX_NAME_LENGTH),
      avatar: typeof p.avatar === "string" ? p.avatar : "fedora",
      gender: p.gender === "f" ? "f" : "m",
    };
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    // storage unavailable: the profile lives for this session only
  }
}

export interface SavedRoom {
  code: string;
  intent: "create" | "join";
}

export function loadSavedRoom(): SavedRoom | null {
  try {
    const raw = localStorage.getItem(ROOM_KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as Partial<SavedRoom>;
    if (typeof r.code !== "string" || !/^\d{4}$/.test(r.code)) return null;
    return { code: r.code, intent: r.intent === "create" ? "create" : "join" };
  } catch {
    return null;
  }
}

export function saveRoom(room: SavedRoom | null): void {
  try {
    if (room) localStorage.setItem(ROOM_KEY, JSON.stringify(room));
    else localStorage.removeItem(ROOM_KEY);
  } catch {
    // ignore
  }
}

/** Keeps `?room=1234` in the address bar so a refresh or a shared URL lands in the room. */
export function setUrlRoom(code: string | null): void {
  try {
    const url = new URL(window.location.href);
    if (code) url.searchParams.set("room", code);
    else url.searchParams.delete("room");
    window.history.replaceState(null, "", url.toString());
  } catch {
    // ignore
  }
}

export function inviteLink(code: string): string {
  const url = new URL(import.meta.env.BASE_URL, window.location.origin);
  url.searchParams.set("room", code);
  return url.toString();
}

/** Last log entry this device has shown, per room, to build the "מה פספסת" toast. */
export function loadSeenLogId(code: string): string | null {
  try {
    return sessionStorage.getItem(`secret-mission-seen:${code}`);
  } catch {
    return null;
  }
}

export function saveSeenLogId(code: string, id: string | null): void {
  try {
    if (id) sessionStorage.setItem(`secret-mission-seen:${code}`, id);
    else sessionStorage.removeItem(`secret-mission-seen:${code}`);
  } catch {
    // ignore
  }
}
