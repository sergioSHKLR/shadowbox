import { createFileRoute } from "@tanstack/react-router";
import { ShadowboxApp } from "@/components/shadowbox/app";

export const Route = createFileRoute("/")({
  component: ShadowboxApp,
});
