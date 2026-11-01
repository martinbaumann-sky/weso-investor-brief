import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const pitch = fileURLToPath(new URL('..', import.meta.url));
const source = resolve(process.env.WESO_FLOW_SOURCE || join(pitch, '..', '13-weso-flow'));
const exporter = join(source, 'scripts/export-pitch.mjs');
if (!existsSync(exporter)) {
  throw new Error('Clone We-Solve-it-Out-App/weso-flow beside this repository as 13-weso-flow, or set WESO_FLOW_SOURCE to its directory.');
}
const result = spawnSync(process.execPath, [exporter, pitch], { cwd: source, stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
