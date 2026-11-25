/**
 * Vibration cues. iOS Safari has no navigator.vibrate, so every call is
 * guarded and simply does nothing there. There is deliberately no sound:
 * a blip would give away a secret tap on "הצלחתי".
 */
export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch {
    // ignore
  }
}

export const BUZZ = {
  tap: 12,
  success: [30, 40, 60],
  intel: [90, 70, 90, 70, 220],
  judging: [60, 50, 60],
  good: [40, 40, 40, 40, 160],
  bad: [200, 80, 200],
  start: [50, 60, 120],
} as const satisfies Record<string, number | number[]>;
