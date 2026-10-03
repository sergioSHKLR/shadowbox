import { allowRemoteAssets } from "@/lib/shadowbox/remote";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap";

/** Load Google Fonts only when the published site can reach the network. */
export function loadRemoteFonts() {
  if (typeof document === "undefined") return;
  const inject = () => {
    if (!allowRemoteAssets()) return;
    if (document.getElementById("shadowbox-fonts")) return;
    const sheet = document.createElement("link");
    sheet.id = "shadowbox-fonts";
    sheet.rel = "stylesheet";
    sheet.href = FONTS;
    document.head.appendChild(sheet);
  };
  inject();
  window.addEventListener("online", inject);
}
