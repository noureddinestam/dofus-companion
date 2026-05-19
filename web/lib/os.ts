export type DetectedOs = "windows" | "mac" | "linux" | "mobile" | "unknown";

export function detectOs(userAgent: string | null | undefined): DetectedOs {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (
    ua.includes("android") ||
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("ipod") ||
    (ua.includes("mobile") && !ua.includes("windows"))
  ) {
    return "mobile";
  }
  if (ua.includes("windows")) return "windows";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "mac";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "unknown";
}
