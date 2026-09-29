import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";
import mapStageCss from "../map-stage.css?url";
import { profile } from "@/lib/shadowbox/model";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: profile.pageTitle },
      { name: "description", content: profile.description },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: mapStageCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap",
      },
    ],
  }),
  component: Root,
  errorComponent: AppErrorComponent,
  notFoundComponent: () => (
    <main className="archive">
      <h1>That page is not in the case</h1>
      <p><Link to="/">Return to the shadowbox</Link></p>
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
