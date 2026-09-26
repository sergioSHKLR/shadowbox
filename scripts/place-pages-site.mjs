import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

const from = "dist/pages";
for (const name of ["assets", "photos", "ribbons", "uniforms", "crests", "insignia", "devices", "equipment", "icons"]) {
  rmSync(name, { recursive: true, force: true });
  cpSync(`${from}/${name}`, name, { recursive: true });
}
for (const name of ["index.html", "404.html", "favicon.svg", "og.jpg", "CNAME", "manifest.webmanifest", "sw.js"]) {
  cpSync(`${from}/${name}`, name);
}
writeFileSync(".nojekyll", "");
mkdirSync(".", { recursive: true });
