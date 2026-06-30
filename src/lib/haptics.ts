/**
 * Lightweight haptic feedback for touch interactions.
 * Silently no-ops where the Vibration API is unavailable (iOS Safari, desktop).
 */
type HapticPattern = "tap" | "success" | "remove"

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  success: [12, 40, 12],
  remove: 18,
}

export function haptic(pattern: HapticPattern = "tap"): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return
  }
  try {
    navigator.vibrate(PATTERNS[pattern])
  } catch {
    // Vibration can throw if the document is not focused — ignore.
  }
}
