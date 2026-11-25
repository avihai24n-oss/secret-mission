import type { DateLocation, ErrorCode, Gender, Vibe } from "../../shared/protocol";

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
