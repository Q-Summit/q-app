#!/usr/bin/env node
// One-command onboarding: run via `pnpm run setup` after cloning.
// Idempotent, safe to re-run any time.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let failed = false;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const bad = (msg) => {
  console.error(`  ✗ ${msg}`);
  failed = true;
};

// 1. Git hooks (pre-commit runs `pnpm run check`; CI re-runs it on the PR).
try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { cwd: root });
  ok('git hooks active (core.hooksPath = .githooks)');
} catch (e) {
  bad(`could not set git hooks path: ${e.message}`);
}

// 2. Skills symlink: .claude/skills -> ../.agents/skills (one directory-level
//    link; every skill in .agents/skills/ is automatically visible to Claude
//    Code; see docs/feature-workflow.md, "Enforced structure").
const claudeDir = path.join(root, '.claude');
const link = path.join(claudeDir, 'skills');
const target = '../.agents/skills';
fs.mkdirSync(claudeDir, { recursive: true });
let lst = null;
try {
  lst = fs.lstatSync(link);
} catch {}
if (lst?.isSymbolicLink()) {
  try {
    if (fs.realpathSync(link) === fs.realpathSync(path.join(root, '.agents', 'skills'))) {
      ok('.claude/skills → ../.agents/skills (already linked)');
    } else {
      fs.unlinkSync(link);
      lst = null;
    }
  } catch {
    fs.unlinkSync(link); // broken link, recreate below
    lst = null;
  }
} else if (lst?.isDirectory()) {
  const entries = fs.readdirSync(link);
  if (entries.length === 0) {
    fs.rmdirSync(link);
    lst = null;
  } else {
    bad(
      `.claude/skills is a real directory with content (${entries.join(', ')}). ` +
        `Move those folders into .agents/skills/ yourself, then re-run pnpm run setup.`
    );
  }
} else if (lst) {
  bad(`.claude/skills exists but is neither a symlink nor a directory: remove it and re-run.`);
}
if (!lst && !failed) {
  try {
    fs.symlinkSync(target, link, 'dir');
    ok('.claude/skills → ../.agents/skills (created)');
  } catch (e) {
    bad(
      `could not create the skills symlink: ${e.message}` +
        (process.platform === 'win32'
          ? '; on Windows, enable Developer Mode and `git config core.symlinks true`, then re-run.'
          : '')
    );
  }
}

// 3. Validate everything.
try {
  execFileSync(process.execPath, [path.join(root, 'scripts', 'validate-docs.mjs')], {
    cwd: root,
    stdio: 'inherit',
  });
} catch {
  failed = true;
}

if (failed) {
  console.error('\nsetup finished with problems; see above.');
  process.exit(1);
}
console.log('\nsetup complete. Useful commands: pnpm run check · pnpm run format');
