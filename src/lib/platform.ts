/**
 * Detect platform for notification/add-to-app flows.
 * - iOS: needs "Add to Home Screen" (Safari, Chrome, etc.)
 * - macOS Safari: needs "Add to Dock"
 * - Other: standard browser flow (Chrome, Edge, Android Chrome, etc.)
 */
export type NotificationPlatform = "ios" | "macos-safari" | "other";

export function getNotificationPlatform(): NotificationPlatform {
  if (typeof window === "undefined" || !navigator?.userAgent) return "other";

  const ua = navigator.userAgent;
  const isMac = /Macintosh|Mac Intel|Mac OS X/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (isMac && navigator.maxTouchPoints > 1);

  if (isIOS) return "ios";
  if (isMac && isSafari) return "macos-safari";
  return "other";
}
