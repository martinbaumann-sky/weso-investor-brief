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

test("keeps KPI content bilingual and the starter preview removed", async () => {
  const [content, page, layout] = await Promise.all([
    readFile(new URL("../app/content.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(content, /Operational performance, in numbers\./);
  assert.match(content, /Desempeño operativo, en números\./);
  assert.match(content, /\["95%", "Autonomous coordination"/);
  assert.match(content, /\["95%", "Coordinación autónoma"/);
  assert.match(page, /id="kpis"/);
  assert.match(page, /className="kpi-grid"/);
  assert.match(layout, /Weso — The AI Operations Layer/);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
