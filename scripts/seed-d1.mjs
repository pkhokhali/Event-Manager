/**
 * Windows-friendly seed runner for local/remote D1.
 * Usage: node scripts/seed-d1.mjs [--remote]
 */
import { writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const remote = process.argv.includes('--remote');
const seedFile = join(root, '.tmp-seed.sql');

const gen = spawnSync(
  'npx',
  ['tsx', 'packages/db/src/seed-sql.ts'],
  {
    cwd: root,
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, npm_config_loglevel: 'silent' },
  }
);

if (gen.status !== 0) {
  console.error(gen.stderr || gen.stdout);
  process.exit(gen.status || 1);
}

// Drop npm/npx noise; keep SQL only
const sql = (gen.stdout || '')
  .split(/\r?\n/)
  .filter((line) => {
    const t = line.trim();
    if (!t) return true;
    if (t.startsWith('npm ')) return false;
    if (t.startsWith('> ')) return false;
    return true;
  })
  .join('\n')
  .trim();

if (!sql.startsWith('PRAGMA') && !sql.startsWith('BEGIN')) {
  console.error('Seed SQL generation failed; unexpected output:\n', sql.slice(0, 400));
  process.exit(1);
}

writeFileSync(seedFile, sql + '\n');

const run = spawnSync(
  'npx',
  [
    'wrangler',
    'd1',
    'execute',
    'event-manager-db',
    remote ? '--remote' : '--local',
    `--file=${seedFile}`,
  ],
  {
    cwd: join(root, 'workers', 'api'),
    stdio: 'inherit',
    shell: true,
  }
);

try {
  unlinkSync(seedFile);
} catch {
  /* ignore */
}
process.exit(run.status || 0);
