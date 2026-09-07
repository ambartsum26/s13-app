import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const tests = readdirSync('tests')
  .filter(name => name.endsWith('.test.cjs'))
  .sort();

if (!tests.length) {
  console.error('No regression tests found.');
  process.exit(1);
}

for (const test of tests) {
  const path = `tests/${test}`;
  console.log(`==> ${path}`);
  const result = spawnSync(process.execPath, [path], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`PASS: ${tests.length} regression test files completed.`);
