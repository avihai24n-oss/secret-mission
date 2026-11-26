import type { DateLocation, ErrorCode, Gender, Place, Vibe } from "../../shared/protocol";

/** Picks the masculine or feminine wording. */
export function g<T>(gender: Gender, m: T, f: T): T {
  return gender === "f" ? f : m;
}

export const LOCATION_LABEL: Record<DateLocation, string> = {
  cafe: "בית קפה / בר",
  walk: "הליכה / פארק",
  home: "בבית",
  phone: "בטלפון מרחוק",
};

/** Phone games: where each player is. Short enough for a chip. */
export const PLACE_LABEL: Record<Place, string> = {
  home: "בבית",
  bed: "במיטה",
  outside: "בחוץ, בהליכה",
  driving: "בנהיגה",
  transit: "בתחבורה ציבורית",
  work: "בעבודה",
  public: "במקום ציבורי",
};

/** The same, for the four-in-a-row buttons of the lobby. */
export const PLACE_SHORT: Record<Place, string> = {
  ...PLACE_LABEL,
  outside: "בחוץ",
  transit: "תחבורה ציבורית",
  public: "מקום ציבורי",
};

/** What the choice means for the missions, shown under the picker. */
export const PLACE_HINT: Record<Place, string> = {
  home: "סלון, מטבח, מרפסת. יש ידיים פנויות ואפשר להרעיש.",
  bed: "מתחת לשמיכה. משימות רגועות, בלי לקום.",
  outside: "ברחוב, בפארק, בדרך למשהו.",
  driving: "רק משימות של דיבור. העיניים על הכביש והידיים על ההגה.",
  transit: "אוטובוס, רכבת, מונית. הכול בשקט, בלי לשיר לנוסעים.",
  work: "רק דברים שאפשר לעשות בלחש, בלי להביך מול כולם.",
  public: "קפה, קניון, סופר. יש אנשים מסביב.",
};

export const VIBE_LABEL: Record<Vibe, string> = {
  light: "קליל ומצחיק",
  flirty: "פלרטטני",
  bold: "אומץ!",
};

export function targetLabel(target: number): string {
  return target === 0 ? "בלי הגבלה" : String(target);
}

export const ERROR_TEXT: Record<ErrorCode, string> = {
  notHost: "רק מי שפתח את החדר יכול לעשות את זה",
  needTwoPlayers: "צריך שני סוכנים כדי להתחיל",
  wrongPhase: "זה לא זמין כרגע",
  noSkipsLeft: "נגמרו ההחלפות למשחק הזה",
  cooldown: "עוד רגע. הכפתור האדום עדיין נעול",
  judgingInProgress: "השופט באמצע הכרעה, שנייה",
  badGuess: "הניחוש קצר או ארוך מדי",
  badRequest: "משהו השתבש. שווה לנסות שוב",
  roomNotFound: "לא מצאנו חדר פעיל עם הקוד הזה. שווה לבדוק את הספרות",
  roomTaken: "הקוד הזה תפוס, פותחים חדר אחר",
};

export function signed(n: number): string {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "0";
}
