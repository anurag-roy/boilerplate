import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const cwdOxlint = join(process.cwd(), 'node_modules/oxlint/bin/oxlint');
const oxlintBin = existsSync(cwdOxlint)
  ? cwdOxlint
  : join(dirname(require.resolve('oxlint/package.json')), 'bin/oxlint');

const [major, minor] = process.versions.node.split('.').map(Number);
const env = { ...process.env };
const needsTypeStripFlag = (major === 22 && minor < 18) || (major === 23 && minor < 6);

if (needsTypeStripFlag) {
  const flags = '--experimental-strip-types --disable-warning=ExperimentalWarning';
  env.NODE_OPTIONS = [env.NODE_OPTIONS, flags].filter(Boolean).join(' ');
}

const child = spawn(process.execPath, [oxlintBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
