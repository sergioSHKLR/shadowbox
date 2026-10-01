import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ShadowboxApp } from "@/components/shadowbox/app";
import "./styles.css";
import "./case-crests.css";
import "./timeline-scroll.css";
import "./map-stage.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");
createRoot(root).render(
  <StrictMode>
    <ShadowboxApp />
  </StrictMode>,
);
