import type { DateLocation, Gender, Vibe } from "../../shared/protocol";

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
}

export function renderMission(text: string, self: Gender, opponent: Gender): string {
  const pick = (g: Gender) => (_: string, m: string, f: string) => (g === "m" ? m : f);
  return text
    .replace(/\[([^\[\]|]*)\|([^\[\]|]*)\]/g, pick(self))
    .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, pick(opponent));
}
