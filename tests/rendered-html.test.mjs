import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Weso investor brief and KPI proof", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /The AI operations layer/);
  assert.match(html, /Operational performance, in numbers\./);
  assert.match(html, /Voice AI \+ automation/);
  assert.match(html, /First-contact resolution/);
  assert.match(html, /Human handoff/);
  assert.match(html, /★★★★★/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("serves the compact homepage and the complete pitch at /pitch", async () => {
  const [homeResponse, pitchResponse] = await Promise.all([render(), render("/pitch")]);
  assert.equal(homeResponse.status, 200);
  assert.equal(pitchResponse.status, 200);

  const [home, pitch] = await Promise.all([homeResponse.text(), pitchResponse.text()]);
  assert.doesNotMatch(home, /Projected opportunity/);
  assert.doesNotMatch(home, /07 · The opportunity/);
  assert.match(home, /04 · Changing the economics/);
  assert.match(home, /05 · Compounding advantage/);
  assert.match(home, /Technology \+ AI is our core/);
  assert.match(home, /The insurer designs the product/);

  assert.match(pitch, /04 · Projected opportunity/);
  assert.match(pitch, /07 · The opportunity/);
  assert.match(pitch, /05 · Changing the economics/);
  assert.match(pitch, /06 · Compounding advantage/);
  assert.doesNotMatch(pitch, /Technology \+ AI is our core/);
});

test("keeps KPI content bilingual and the lower chapters interactive", async () => {
  const [content, page, layout, css] = await Promise.all([
    readFile(new URL("../app/content.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(content, /Operational performance, in numbers\./);
  assert.match(content, /Desempeño operativo, en números\./);
  assert.match(content, /title: "Autonomous coordination", value: "95%"/);
  assert.match(content, /title: "Coordinación autónoma", value: "95%"/);
  assert.match(content, /From operating volume to Weso revenue\./);
  assert.match(content, /Del volumen operativo a los ingresos de Weso\./);
  assert.match(content, /\["USD 217\.1M", "Weso revenue"/);
  assert.match(content, /\["USD 217,1M", "Ingresos de Weso"/);
  assert.match(page, /id="performance"/);
  assert.match(page, /className="performance-grid"/);
  assert.match(page, /setPerformanceProgress/);
  assert.match(css, /\.performance-sticky/);
  assert.match(css, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(page, /data-scroll-reveal/);
  assert.match(page, /is-scroll-visible/);
  assert.match(page, /className="market-funnel-stages"/);
  assert.match(css, /\[data-scroll-reveal\]\.is-scroll-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(layout, /Weso — The AI Operations Layer/);

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
