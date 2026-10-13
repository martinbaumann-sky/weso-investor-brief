// Renders the lucide-react icons used on the site to static SVG strings for the PDF.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as L from "lucide-react";
import fs from "node:fs";
const names = ["Brush","Utensils","Snowflake","PaintRoller","Waves","House","Bath","CookingPot","Laptop","Smile","KeyRound","Scale","Wallet","Heart","Repeat","Hospital","Ambulance","Car","Package","Plane","Brain","GraduationCap","Truck","ConciergeBell","PawPrint","Stethoscope","BadgePercent","Wrench","Droplet","Sprout","PanelsTopLeft","Zap","ArrowRight","Check"];
const out = {};
for (const n of names) {
  if (!L[n]) throw new Error("missing " + n);
  out[n] = renderToStaticMarkup(createElement(L[n], { size: 24, color: "#f20b8f", strokeWidth: 1.6 }));
}
fs.writeFileSync(new URL("./icons.json", import.meta.url), JSON.stringify(out));
console.log(Object.keys(out).length);
