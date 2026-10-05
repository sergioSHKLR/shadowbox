import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";
import mapStageCss from "../map-stage.css?url";
import caseCrestsCss from "../case-crests.css?url";
import timelineScrollCss from "../timeline-scroll.css?url";
import decorationsCss from "../decorations.css?url";
import commandsCss from "../commands.css?url";
import logbookCss from "../logbook.css?url";
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
      { rel: "stylesheet", href: logbookCss },
      { rel: "stylesheet", href: mapStageCss },
      { rel: "stylesheet", href: printCss },
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
