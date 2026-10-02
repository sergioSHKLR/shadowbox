import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";
import mapStageCss from "../map-stage.css?url";
import caseCrestsCss from "../case-crests.css?url";
import timelineScrollCss from "../timeline-scroll.css?url";
import decorationsCss from "../decorations.css?url";
import commandsCss from "../commands.css?url";
import printCss from "../print.css?url";
import { profile } from "@/lib/shadowbox/model";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: profile.pageTitle },
      { name: "description", content: profile.description },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: `${import.meta.env.BASE_URL || "/"}favicon.svg` },
      { rel: "apple-touch-icon", href: `${import.meta.env.BASE_URL || "/"}icons/apple-touch-icon.png` },
      { rel: "apple-touch-icon", href: `${import.meta.env.BASE_URL || "/"}icons/apple-touch-icon-dark.png`, media: "(prefers-color-scheme: dark)" },
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: caseCrestsCss },
      { rel: "stylesheet", href: timelineScrollCss },
      { rel: "stylesheet", href: decorationsCss },
      { rel: "stylesheet", href: commandsCss },
      { rel: "stylesheet", href: mapStageCss },
      { rel: "stylesheet", href: printCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap",
      },
    ],
  }),
  component: Root,
  errorComponent: AppErrorComponent,
  notFoundComponent: () => (
    <main className="archive">
      <h1>That page is not in the record</h1>
      <p><Link to="/">Return to the timeline</Link></p>
    </main>
  ),
});

function Root() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <PreviewHostBridge />
        <Scripts />
      </body>
    </html>
  );
}
