import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ShadowboxApp } from "@/components/shadowbox/app";
import "./styles.css";
import "./case-crests.css";
import "./timeline-scroll.css";
import "./decorations.css";
import "./commands.css";
import "./map-stage.css";
import "./logbook.css";
import "./print.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");
createRoot(root).render(
  <StrictMode>
    <ShadowboxApp />
  </StrictMode>,
);

// A returning visitor first gets the precached (previous) build; when the new service worker from a fresh deploy
// takes control (skipWaiting + clientsClaim), reload once so the new build shows without a manual hard refresh.
if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
}
