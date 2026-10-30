import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase, rpc, document } from './database.mjs';
import { FlowLibrary } from '../src/library.js';
const token = 'a'.repeat(64), other = 'b'.repeat(64);
test('Public links isolate data from Hub, enforce revisions, validate graphs and revoke deleted links', async () => {
  const db = await createDatabase();
  try {
    const initial = await rpc(db, 'create', { p_token: token, p_document: document() });
    assert.equal(initial.revision, 1);
    assert.equal((await rpc(db, 'open', { p_token: token })).id, initial.id);
    await assert.rejects(rpc(db, 'open', { p_token: other }), /not found/);
    for (const table of ['flow_private.projects', 'public.hub_secret']) {
      await db.exec('begin; set local role anon;');
      await assert.rejects(db.query(`select * from ${table}`), /permission denied/);
      await db.exec('rollback');
    }
    const changed = document(); changed.name = 'Changed';
    const saved = await rpc(db, 'save', { p_token: token, p_revision: 1, p_document: changed });
    assert.equal(saved.revision, 2);
    await assert.rejects(rpc(db, 'save', { p_token: token, p_revision: 1, p_document: document() }), /Project changed/);
    await assert.rejects(rpc(db, 'delete', { p_token: token, p_revision: 1 }), /Project changed/);
    await assert.rejects(rpc(db, 'create', { p_token: 'invalid', p_document: document() }), /Invalid link/);
    await assert.rejects(rpc(db, 'save', { p_token: token, p_revision: 2, p_document: { ...changed, schemes: [] } }), /limit/);
    const broken = document(); broken.schemes[0].graph.nodes = [{}];
    await assert.rejects(rpc(db, 'save', { p_token: token, p_revision: 2, p_document: broken }), /Invalid graph element/);
    assert.equal((await rpc(db, 'open', { p_token: token })).document.name, 'Changed');
    const raw = await db.query('select encode(token_hash, \'hex\') as hash from flow_private.projects');
    assert.notEqual(raw.rows[0].hash, token);
    await rpc(db, 'delete', { p_token: token, p_revision: 2 });
    await assert.rejects(rpc(db, 'open', { p_token: token }), /not found/);
    assert.equal((await db.query('select * from public.hub_secret')).rows[0].message, 'private hub data');
  } finally { await db.close(); }
});
test('Public client never sends Hub credentials, retains local state after a failed save', async () => {
  let sent;
  const storage = { getItem: () => '[]', setItem() {} };
  const library = new FlowLibrary('https://example.com', 'public-key', { storage, request: async (url, options) => {
    sent = { url, ...options };
    return new Response(JSON.stringify({ code: '40001' }), { status: 409 });
  } });
  library.projects.set('p', { id: 'p', token, revision: 1, document: document() });
  await assert.rejects(library.change('p', (d) => { d.name = 'Unsaved'; }), /Otra persona/);
  assert.equal(library.projects.get('p').document.name, 'Test project');
  assert.equal(sent.credentials, 'omit'); assert.equal(sent.headers.Authorization, undefined);
  assert.equal(sent.headers.apikey, 'public-key');
});
