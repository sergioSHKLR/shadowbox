import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync } from "node:fs";

const from = "dist/pages";
for (const name of ["assets", "photos", "ribbons", "uniforms", "crests", "insignia", "devices", "equipment", "icons", "medals", "units"]) {
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
mkdirSync("units", { recursive: true });
for (const [src, dest] of [
  ["rtc.png", "rtc.png"],
  ["ntc.png", "ntc.png"],
  ["ncts.png", "ncts.png"],
  ["as-40.png", "as-40.png"],
  ["eodmu5.png", "eodmu5.png"],
  ["eodmu11.png", "eodmu11.png"],
  ["troy.png", "troy.png"],
  ["52nd-eod.png", "52nd-eod.png"],
  ["16th-en.png", "16th-en.png"],
  ["3rd-sfg.png", "3rd-sfg.png"],
  ["75th-rgr.svg", "75th-rgr.svg"],
  ["sercc.png", "sercc.png"],
  ["11th-ada.png", "11th-ada.png"],
  ["jcse-3rd-sqd.png", "jcse-3rd-sqd.png"],
  ["cjsotf-a.png", "cjsotf-a.png"],
  ["nhjax.png", "nhjax.png"],
  ["lsd-46.png", "lsd-46.png"],
  ["lhd-2.png", "lhd-2.png"],
]) {
  if (existsSync(`incoming/${src}`)) cpSync(`incoming/${src}`, `units/${dest}`);
}
mkdirSync(".", { recursive: true });
