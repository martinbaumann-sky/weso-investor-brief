import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
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
  assert.match(page, /id="performance"/);
  assert.match(page, /className="performance-grid"/);
  assert.match(page, /setPerformanceProgress/);
  assert.match(css, /\.performance-sticky/);
  assert.match(css, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(page, /data-scroll-reveal/);
  assert.match(page, /is-scroll-visible/);
  assert.match(css, /\[data-scroll-reveal\]\.is-scroll-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(layout, /Weso — The AI Operations Layer/);

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
