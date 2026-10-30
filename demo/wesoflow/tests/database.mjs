import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
export async function createDatabase() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated;
    create table public.hub_secret (message text);
    insert into public.hub_secret values ('private hub data');
    alter table public.hub_secret enable row level security;
    revoke all on public.hub_secret from public, anon, authenticated;`);
  await db.exec(await readFile(new URL('../supabase/migrations/20261030155939_public_flow_links.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../supabase/migrations/20261030161317_flow_link_conflict_status.sql', import.meta.url), 'utf8'));
  return db;
}
export async function rpc(db, name, args) {
  const allowed = { create: ['p_token', 'p_document'], open: ['p_token'], save: ['p_token', 'p_revision', 'p_document'], delete: ['p_token', 'p_revision'] };
  if (!allowed[name]) throw new Error('Unknown RPC');
  await db.exec('begin; set local role anon;');
  try {
    const fields = allowed[name];
    const result = await db.query(`select public.flow_link_${name}(${fields.map((_, i) => `$${i+1}`).join(',')}) as result`, fields.map((f) => typeof args[f] === 'object' ? JSON.stringify(args[f]) : args[f]));
    await db.exec('commit'); return result.rows[0].result;
  } catch (error) { await db.exec('rollback'); throw error; }
}
export function emptyGraph() {
  return { graph: {}, nodeDefaults: {}, edgeDefaults: {}, nodes: [], edges: [], clusters: [{ id: 'cluster_test', label: 'Prueba', x: 0, y: 0, attrs: {} }] };
}
export function document() { return { name: 'Test project', schemes: [{ id: 'scheme-test', name: 'Test flow', graph: emptyGraph() }], versions: [] }; }
