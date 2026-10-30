import { createServer } from 'node:http';
import { createDatabase, rpc } from './database.mjs';
const db = await createDatabase();
let chain = Promise.resolve();
const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type,apikey');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.url === '/health') { res.end('ready'); return; }
  const match = req.url.match(/^\/rest\/v1\/rpc\/flow_link_(create|open|save|delete)$/);
  if (!match || req.method !== 'POST') { res.writeHead(404); res.end('{}'); return; }
  let body = ''; for await (const chunk of req) body += chunk;
  const job = chain.catch(() => {}).then(() => rpc(db, match[1], JSON.parse(body)));
  chain = job;
  try { const data = await job; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); }
  catch (error) { res.writeHead(['40001', 'PT409'].includes(error.code) ? 409 : 400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ code: error.code, message: error.message })); }
});
server.listen(4399, '127.0.0.1', () => process.stdout.write('Flow test database ready\n'));
