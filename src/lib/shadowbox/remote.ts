/** Remote webfonts and map tiles. The Grok preview often reports
 *  navigator.onLine while Google and Esri are unreachable, which fills the
 *  console; skip those requests in the local/preview shell. */
export function allowRemoteAssets(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
  if (window.parent !== window) return false;
  const host = window.location.hostname.toLowerCase();
  if (host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com")) return false;
  if (import.meta.env.DEV) return false;
  return true;
}
