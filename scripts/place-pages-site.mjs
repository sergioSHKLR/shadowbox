import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync } from "node:fs";

const from = "dist/pages";
for (const name of ["assets", "photos", "ribbons", "uniforms", "crests", "insignia", "devices", "equipment", "icons", "medals"]) {
  rmSync(name, { recursive: true, force: true });
  if (existsSync(`${from}/${name}`)) cpSync(`${from}/${name}`, name, { recursive: true });
}
for (const name of ["index.html", "404.html", "favicon.svg", "og.jpg", "CNAME", "manifest.webmanifest", "sw.js", "shadowbox-cheat-sheet.pdf"]) {
  if (existsSync(`${from}/${name}`)) cpSync(`${from}/${name}`, name);
  else if (name !== "CNAME" && name !== "index.html" && name !== "404.html" && name !== "manifest.webmanifest" && name !== "sw.js") {
    rmSync(name, { force: true });
  }
}
writeFileSync(".nojekyll", "");
// Unit crest copies under units/ removed (Oct 2026): nothing referenced /units/, and they were never committed.
mkdirSync(".", { recursive: true });
