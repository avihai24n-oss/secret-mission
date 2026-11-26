import type { DateLocation, Gender, Place, Vibe } from "../../shared/protocol";

/**
 * One entry of the mission bank.
 *
 * `text` is a Hebrew template with two kinds of gender slots:
 *   [זכר|נקבה]  — chosen by the gender of the player who RECEIVES the mission
 *   {זכר|נקבה}  — chosen by the gender of the OPPONENT (the date)
 *
 * Example: "[תגרום|תגרמי] {לו|לה} לספר על הטיול הכי הזוי {שלו|שלה}"
 *   man playing against a woman  → "תגרום לה לספר על הטיול הכי הזוי שלה"
 *   woman playing against a man  → "תגרמי לו לספר על הטיול הכי הזוי שלו"
 */
export interface Mission {
  /** Stable unique id, e.g. "cafe-light-014". */
  id: string;
  text: string;
  /** Every location this mission can be played in. */
  locations: DateLocation[];
  /** Every vibe this mission fits. */
  vibes: Vibe[];
  /** 100 by default; 150 for clearly harder / bolder missions. */
  points: number;
  /**
   * Phone games only. Where the player HOLDING the mission must be for it to
   * be dealt. Omitted = anywhere, which also promises that the holder's part is
   * purely verbal and can be done quietly (safe behind the wheel, at work, on a
   * bus). A holder who has not chosen a place never gets a constrained mission.
   */
  selfPlaces?: Place[];
  /**
   * Phone games only. Where the OPPONENT must be. Omitted = anywhere, with the
   * same promise about the opponent's part. An opponent who has not chosen a
   * place never makes a mission that depends on them eligible.
   */
  otherPlaces?: Place[];
}

// Place groups used by the banks. A mission lists every place it works in.

/** Hands, eyes and the phone screen are free: everyone except a driver. */
export const HANDS_OK: Place[] = ["home", "bed", "outside", "transit", "work", "public"];
/** Singing, silly voices and anything else loud or showy: not at work, not on a bus. */
export const LOUD_OK: Place[] = ["home", "bed", "outside", "driving", "public"];
/** Loud and needs hands or moving around. */
export const LOUD_HANDS_OK: Place[] = ["home", "bed", "outside", "public"];
/** At home, on the sofa or in bed. */
export const AT_HOME: Place[] = ["home", "bed"];

/** Whether a mission may be dealt to a holder at `self` playing against someone at `other`. */
export function missionFitsPlaces(m: Mission, self: Place | null, other: Place | null): boolean {
  if (m.selfPlaces && (!self || !m.selfPlaces.includes(self))) return false;
  if (m.otherPlaces && (!other || !m.otherPlaces.includes(other))) return false;
  return true;
}

export function renderMission(text: string, self: Gender, opponent: Gender): string {
  const pick = (g: Gender) => (_: string, m: string, f: string) => (g === "m" ? m : f);
  return text
    .replace(/\[([^\[\]|]*)\|([^\[\]|]*)\]/g, pick(self))
    .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, pick(opponent));
}
