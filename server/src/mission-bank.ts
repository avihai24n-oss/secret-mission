import type { Place, Settings } from "../../shared/protocol";
import { missionFitsPlaces, type Mission } from "./mission-types";
import { MISSIONS } from "./missions";
import { PLACE_MISSIONS } from "./missions-places";
import { WEB_MISSIONS } from "./missions-web";

/** The whole deck: the base bank, the web-researched additions and the phone "where are you" bank. */
export const ALL_MISSIONS: Mission[] = [...MISSIONS, ...WEB_MISSIONS, ...PLACE_MISSIONS];

/**
 * Every mission that may be dealt to a player at `self` whose opponent is at
 * `other`, under the room's settings. Places only count in phone games. If no
 * mission fits the two places, the place-free phone missions of that vibe are
 * used instead: those are safe anywhere by construction.
 */
export function dealPool(settings: Settings, self: Place | null, other: Place | null): Mission[] {
  const base = ALL_MISSIONS.filter(
    (m) => m.locations.includes(settings.location) && m.vibes.includes(settings.vibe)
  );
  if (settings.location !== "phone") return base;
  const fitting = base.filter((m) => missionFitsPlaces(m, self, other));
  return fitting.length > 0 ? fitting : base.filter((m) => !m.selfPlaces && !m.otherPlaces);
}
