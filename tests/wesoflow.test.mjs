import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';
import { GET } from '../app/wesoflow/route.ts';

test('the public Flow entry redirects on the same site and preserves query parameters', () => {
  const response = GET(new Request('https://www.weso.click/wesoflow?source=test'));
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('location'), 'https://www.weso.click/wesoflow/index.html?source=test');
});
test('the checked-in Flow app loads all its resources from /wesoflow without Hub authentication', async () => {
  const html = await readFile(new URL('../public/wesoflow/index.html', import.meta.url), 'utf8');
  const resources = [...html.matchAll(/(?:src|href)="(\/wesoflow\/[^"?]+)"/g)].map((m) => m[1]);
  assert.ok(resources.length >= 3);
  for (const path of resources) await access(new URL(`../public${path}`, import.meta.url));
  const bundlePath = resources.find((r) => r.endsWith('.js'));
  const bundle = await readFile(new URL(`../public${bundlePath}`, import.meta.url), 'utf8');
  assert.match(bundle, /flow_link_/);
  assert.doesNotMatch(bundle, /signInWithPassword|signInWithOAuth|user_roles|service_role/);
  await access(new URL('../public/wesoflow/editor/index.html', import.meta.url));
  await access(new URL('../public/wesoflow/editor/app.js', import.meta.url));
});
