#!/usr/bin/env node
/**
 * validate-docs.mjs : structural checks for the docs/ workflow (and a few
 * closely related repo-layout / house-style rules kept in the same CI gate).
 *
 * Validates sketches (docs/sketches/), ADRs (docs/decisions/), the two index
 * tables (docs/feature-workflow.md, docs/architecture/09-architecture-decisions.md),
 * relative-link integrity across docs/**, AGENTS.md/CLAUDE.md pairing, the
 * .agents/skills <-> .claude/skills symlink, and the no-dash house style.
 *
 * Parsing is delegated to libraries so this file only holds project-specific
 * semantic rules:
 *   - gray-matter : YAML frontmatter
 *   - remark (+ frontmatter + gfm) : mdast for headings, links (inline and
 *     reference-style), GFM tables, and list-item bullets
 *
 * Usage: node scripts/validate-docs.mjs [--root <dir>]
 * Exit:  0 when clean, 1 on violations, 2 on bad usage.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { toString as mdToString } from 'mdast-util-to-string';

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

const SKETCH_H2S = [
  'What it is',
  'Persona matrix',
  'How it works',
  'Technical plan',
  'Out of scope',
  'Open questions',
  'Effort guess',
  'Build checklist',
];
const ADR_H2S = ['Context', 'Considered options', 'Decision', 'Consequences'];
// A sketch merged to main IS agreed (the merge is the agreement). This field
// only tracks what git cannot tell you.
const SKETCH_STATUSES = ['planned', 'building', 'shipped', 'parked'];
const SKETCH_FM_REQUIRED = ['number', 'title', 'status', 'idea', 'owners', 'landed-in'];
const SKETCH_FM_LISTS = ['owners', 'landed-in'];
const SKETCH_FM_SCALARS = ['title', 'idea'];
const INDEX_SKETCH_HEADER = ['#', 'Feature', 'Status'];
const INDEX_ADR_HEADER = ['#', 'Decision', 'Status'];

const mdProcessor = unified().use(remarkParse).use(remarkFrontmatter, ['yaml']).use(remarkGfm);

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  let root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--root' && argv[i + 1]) {
      root = path.resolve(argv[++i]);
    } else {
      console.error(`usage: node validate-docs.mjs [--root <dir>]  (got "${argv[i]}")`);
      process.exit(2);
    }
  }
  return { root };
}

// ---------------------------------------------------------------------------
// Filesystem: one recursive walker, thin list helpers on top
// ---------------------------------------------------------------------------

/**
 * Depth-first walk of relDir under root. Calls onFile(rel, dirent) for each
 * regular file. skipDir(name, rel) may exclude directories (and their trees).
 */
function walk(root, relDir, { onFile, skipDir } = {}) {
  const abs = path.join(root, relDir);
  if (!fs.existsSync(abs)) return;
  const entries = fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const rel = relDir === '.' ? entry.name : `${relDir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (skipDir?.(entry.name, rel)) continue;
      walk(root, rel, { onFile, skipDir });
    } else if (entry.isFile()) {
      onFile?.(rel, entry);
    }
  }
}

function listMdFiles(root, relDir) {
  const out = [];
  walk(root, relDir, {
    onFile(rel, entry) {
      if (entry.name.endsWith('.md') && entry.name !== '_template.md') out.push(rel);
    },
  });
  return out;
}

function listAllFiles(root, relDir) {
  const out = [];
  walk(root, relDir, { onFile: (rel) => out.push(rel) });
  return out;
}

function listAgentsFiles(root) {
  const out = [];
  walk(root, '.', {
    skipDir: (name) => name === 'node_modules' || name.startsWith('.'),
    onFile(rel, entry) {
      if (entry.name === 'AGENTS.md') out.push(rel);
    },
  });
  return out;
}

// ---------------------------------------------------------------------------
// Small pure helpers
// ---------------------------------------------------------------------------

function pad4(value) {
  return String(value).trim().padStart(4, '0');
}

function filePrefix(basename) {
  const m = basename.match(/^(\d{4})-/);
  return m ? m[1] : null;
}

function isValidDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

function isExternalTarget(target) {
  return (
    target === '' ||
    target.startsWith('#') ||
    target.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target)
  );
}

function resolveTarget(fromAbs, target) {
  let p = target.split('#')[0];
  try {
    p = decodeURIComponent(p);
  } catch {
    /* keep raw on malformed escapes */
  }
  return p === '' ? null : path.resolve(path.dirname(fromAbs), p);
}

function collect(node, type, out = []) {
  if (node.type === type) out.push(node);
  if (node.children) for (const child of node.children) collect(child, type, out);
  return out;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Parse frontmatter. Returns:
 *   { present: false }
 *   { present: true, error: '...' }
 *   { present: true, map: Map }  (lists are string[]; empty `key:` -> [])
 */
function parseFrontmatter(text) {
  if (!(text.startsWith('---\n') || text === '---')) return { present: false };
  let data;
  try {
    data = matter(text).data;
  } catch (e) {
    return { present: true, error: e.message };
  }
  const map = new Map();
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) map.set(key, value.map((x) => (x == null ? '' : String(x))));
    else if (value == null) map.set(key, []);
    else map.set(key, String(value));
  }
  return { present: true, map };
}

function loadMd(root, rel) {
  const abs = path.join(root, rel);
  const base = path.basename(rel);
  let raw;
  try {
    raw = fs.readFileSync(abs, 'utf8');
  } catch (e) {
    return { rel, abs, base, readError: e.message };
  }
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const fm = parseFrontmatter(text);

  let tree;
  try {
    tree = mdProcessor.parse(text);
  } catch (e) {
    return { rel, abs, base, prefix: filePrefix(base), fm, readError: `markdown parse failed: ${e.message}` };
  }

  const headings = collect(tree, 'heading').map((n) => ({
    level: n.depth,
    text: mdToString(n),
    line: n.position.start.line,
  }));

  const tables = collect(tree, 'table').map((n) => {
    const rows = n.children.map((r) => ({
      cells: r.children.map((c) => mdToString(c).trim()),
      cellNodes: r.children,
      line: r.position.start.line,
    }));
    return {
      header: rows.length ? rows[0].cells : [],
      rows: rows.slice(1),
      startLine: n.position.start.line,
      endLine: n.position.end.line,
    };
  });

  const links = [
    ...collect(tree, 'link').map((n) => ({ target: n.url, line: n.position.start.line })),
    ...collect(tree, 'definition').map((n) => ({ target: n.url, line: n.position.start.line })),
  ];

  return { rel, abs, base, prefix: filePrefix(base), fm, tree, headings, tables, links };
}

function fmOf(rec) {
  return rec.fm?.map ?? null;
}

// ---------------------------------------------------------------------------
// Markdown-structure helpers
// ---------------------------------------------------------------------------

function h2SectionRange(rec, title) {
  const hs = rec.headings;
  const idx = hs.findIndex((h) => h.level === 2 && h.text === title);
  if (idx === -1) return null;
  const next = hs.slice(idx + 1).find((h) => h.level <= 2);
  return { start: hs[idx].line, end: next ? next.line : Infinity };
}

function findTable(rec, header, range) {
  return (
    rec.tables.find(
      (t) =>
        t.header.length === header.length &&
        t.header.every((c, i) => c === header[i]) &&
        (!range || (t.startLine >= range.start && t.startLine < range.end))
    ) ?? null
  );
}

function firstLinkUrl(cellNode) {
  const links = collect(cellNode, 'link');
  return links.length ? links[0].url : null;
}

/** Value of a "- **Label:** ..." list item via mdast, or null if absent. */
function bulletValue(rec, label) {
  if (!rec.tree) return null;
  for (const item of collect(rec.tree, 'listItem')) {
    const strong = collect(item, 'strong').find((s) => {
      const t = mdToString(s).trim();
      return t === label || t === `${label}:`;
    });
    if (!strong) continue;
    const full = mdToString(item).trim();
    return full.replace(new RegExp(`^${label}:\\s*`), '').trim();
  }
  return null;
}

// ---------------------------------------------------------------------------
// Shared checkers (used by multiple RULES entries)
// ---------------------------------------------------------------------------

function checkFilenameFormat(records, err) {
  for (const rec of records) {
    if (!/^\d{4}-.+\.md$/.test(rec.base)) {
      err(rec.rel, `filename "${rec.base}" does not match NNNN-<slug>.md`);
    }
  }
}

function checkH1MatchesFilename(rec, err) {
  const first = rec.headings[0];
  if (!first) return err(rec.rel, 'no heading found; expected an H1 like "# NNNN · <title>"');
  if (first.level !== 1) return err(rec.rel, `first heading (line ${first.line}) is not an H1`);
  const m = /^(\d{4}) · (.+)$/.exec(first.text);
  if (!m) return err(rec.rel, `H1 "${first.text}" is not of the form "NNNN · <title>" (middle dot, single spaces)`);
  if (rec.prefix && m[1] !== rec.prefix) {
    err(rec.rel, `H1 number ${m[1]} does not match filename prefix ${rec.prefix}`);
  }
  const extra = rec.headings.find((h, i) => i > 0 && h.level === 1);
  if (extra) err(rec.rel, `more than one H1 (second on line ${extra.line})`);
}

function checkRequiredH2sInOrder(rec, required, err) {
  const h2s = rec.headings.filter((h) => h.level === 2).map((h) => h.text);
  let allPresent = true;
  for (const title of required) {
    const n = h2s.filter((t) => t === title).length;
    if (n === 0) {
      err(rec.rel, `missing H2 section "## ${title}"`);
      allPresent = false;
    } else if (n > 1) {
      err(rec.rel, `H2 section "## ${title}" appears ${n} times`);
    }
  }
  if (!allPresent) return;
  const positions = required.map((t) => h2s.indexOf(t));
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] < positions[i - 1]) {
      err(rec.rel, `H2 section "## ${required[i]}" appears before "## ${required[i - 1]}" (expected order: ${required.join(' -> ')})`);
      return;
    }
  }
}

function checkNumbersUnique(records, err) {
  const claims = new Map();
  for (const rec of records) {
    const numbers = new Set();
    if (rec.prefix) numbers.add(rec.prefix);
    const fm = fmOf(rec);
    if (fm && typeof fm.get('number') === 'string') numbers.add(pad4(fm.get('number')));
    for (const n of numbers) {
      if (!claims.has(n)) claims.set(n, new Set());
      claims.get(n).add(rec.rel);
    }
  }
  for (const [n, files] of claims) {
    if (files.size < 2) continue;
    const list = [...files].sort();
    for (const f of list) {
      err(f, `number ${n} is also used by ${list.filter((x) => x !== f).join(', ')}`);
    }
  }
}

/** Read a frontmatter key that must be a non-list scalar; report + return null on bad shape. */
function scalarFm(fm, key, rel, err) {
  if (!fm.has(key)) return null;
  const value = fm.get(key);
  if (Array.isArray(value)) {
    err(rel, `frontmatter "${key}" must be a single non-empty value`);
    return null;
  }
  return value;
}

/**
 * Validate an index table. `modes` selects which error classes to emit so the
 * companion completeness / status-match rules can share one walker.
 */
function checkIndexTable(ctx, rec, header, dirRel, expected, err, modes) {
  const wantCompleteness = modes.includes('completeness');
  const wantStatus = modes.includes('status');
  const report = (kind, file, msg) => {
    if (kind === 'completeness' && wantCompleteness) err(file, msg);
    if (kind === 'status' && wantStatus) err(file, msg);
  };

  if (!rec || rec.readError) {
    report('completeness', rec?.rel ?? dirRel, `index file missing or unreadable`);
    return;
  }
  const table = findTable(rec, header);
  if (!table) {
    report('completeness', rec.rel, `no table with header | ${header.join(' | ')} | found`);
    return;
  }

  const seen = new Map();
  for (const row of table.rows) {
    if (row.cells.length !== header.length) {
      report('completeness', rec.rel, `row on line ${row.line} has ${row.cells.length} cells, expected ${header.length}`);
      continue;
    }
    const url = firstLinkUrl(row.cellNodes[0]);
    if (!url) {
      report('completeness', rec.rel, `row on line ${row.line}: "#" cell "${row.cells[0]}" is not a link`);
      continue;
    }
    const abs = resolveTarget(rec.abs, url);
    const targetRel = abs ? path.relative(ctx.root, abs).split(path.sep).join('/') : null;
    if (!targetRel || !expected.has(targetRel)) {
      report('completeness', rec.rel, `row on line ${row.line} links to "${url}", which is not an existing file in ${dirRel}/`);
      continue;
    }
    if (seen.has(targetRel)) {
      report('completeness', rec.rel, `row on line ${row.line} duplicates the entry for ${targetRel} (line ${seen.get(targetRel)})`);
      continue;
    }
    seen.set(targetRel, row.line);
    const want = expected.get(targetRel);
    if (want !== null && row.cells[2] !== want) {
      report('status', rec.rel, `row on line ${row.line}: status "${row.cells[2]}" does not match "${want}" in ${targetRel}`);
    }
  }
  for (const fileRel of expected.keys()) {
    if (!seen.has(fileRel)) report('completeness', rec.rel, `no row for ${fileRel}`);
  }
}

function reportDashOnLine(rel, line, kind, err) {
  if (kind === 'em-en') {
    err(rel, `line ${line} contains an em or en dash: rewrite with a comma, colon, period, or parentheses (house style, see AGENTS.md)`);
  } else {
    err(rel, `line ${line} uses a spaced hyphen as dash punctuation (" - "): rewrite with a comma, colon, period, or parentheses; hyphens joining words ("Same-PR") are fine (house style, see AGENTS.md)`);
  }
}

// ---------------------------------------------------------------------------
// RULES: rule id -> checker. Each checker reports via err(file, message).
// ---------------------------------------------------------------------------

const RULES = {
  'sketch-filename-format'(ctx, err) {
    checkFilenameFormat(ctx.sketches, err);
  },

  'sketch-frontmatter-parseable'(ctx, err) {
    for (const rec of ctx.sketches) {
      if (rec.readError) err(rec.rel, `cannot read file: ${rec.readError}`);
      else if (!rec.fm.present) {
        err(rec.rel, 'file does not start with a "---" frontmatter block on line 1: it does not follow the sketch template (see docs/sketches/_template.md)');
      } else if (rec.fm.error) err(rec.rel, `frontmatter does not parse: ${rec.fm.error}`);
    }
  },

  'sketch-frontmatter-required-keys'(ctx, err) {
    for (const rec of ctx.sketches) {
      const fm = fmOf(rec);
      if (!fm) continue;
      for (const key of SKETCH_FM_REQUIRED) {
        if (!fm.has(key)) err(rec.rel, `frontmatter is missing required key "${key}"`);
      }
      for (const key of fm.keys()) {
        if (!SKETCH_FM_REQUIRED.includes(key)) err(rec.rel, `frontmatter has unexpected key "${key}"`);
      }
      for (const key of SKETCH_FM_LISTS) {
        if (fm.has(key) && !Array.isArray(fm.get(key))) {
          err(rec.rel, `frontmatter "${key}" must be a YAML list, got "${fm.get(key)}"`);
        }
      }
      // Empty `title:` / `idea:` parses as [] (same as an empty list); reject that for scalars.
      for (const key of SKETCH_FM_SCALARS) {
        if (fm.has(key) && Array.isArray(fm.get(key))) {
          err(rec.rel, `frontmatter "${key}" must be a single non-empty value`);
        }
      }
    }
  },

  'sketch-number-matches-filename'(ctx, err) {
    for (const rec of ctx.sketches) {
      const fm = fmOf(rec);
      if (!fm || !rec.prefix) continue;
      const value = scalarFm(fm, 'number', rec.rel, err);
      if (value == null) continue;
      if (pad4(value) !== rec.prefix) {
        err(rec.rel, `frontmatter number "${value}" (= ${pad4(value)}) does not match filename prefix ${rec.prefix}`);
      }
    }
  },

  'sketch-status-allowed-set'(ctx, err) {
    for (const rec of ctx.sketches) {
      const fm = fmOf(rec);
      if (!fm) continue;
      const status = scalarFm(fm, 'status', rec.rel, err);
      if (status == null) continue;
      if (!SKETCH_STATUSES.includes(status)) {
        err(rec.rel, `status "${status}" not in ${SKETCH_STATUSES.join('|')}`);
      }
    }
  },

  'sketch-h1-format'(ctx, err) {
    for (const rec of ctx.sketches) {
      if (rec.readError) continue;
      checkH1MatchesFilename(rec, err);
    }
  },

  'sketch-required-h2-sections-in-order'(ctx, err) {
    for (const rec of ctx.sketches) {
      if (rec.readError || !fmOf(rec)) continue;
      checkRequiredH2sInOrder(rec, SKETCH_H2S, err);
    }
  },

  'sketch-persona-matrix-table'(ctx, err) {
    for (const rec of ctx.sketches) {
      if (rec.readError) continue;
      const range = h2SectionRange(rec, 'Persona matrix');
      if (!range) continue;
      if (!findTable(rec, ['Persona', 'Can do', 'Sees'], range)) {
        err(rec.rel, 'Persona matrix has no table with header | Persona | Can do | Sees |');
      }
    }
  },

  'sketch-shipped-requires-landed-in'(ctx, err) {
    for (const rec of ctx.sketches) {
      const fm = fmOf(rec);
      if (!fm || fm.get('status') !== 'shipped') continue;
      const landed = fm.get('landed-in');
      if (!Array.isArray(landed)) continue;
      if (landed.length === 0) {
        err(rec.rel, 'status is "shipped" but "landed-in" is empty');
        continue;
      }
      const architectureDir = path.join(ctx.root, 'docs', 'architecture') + path.sep;
      for (const entry of landed) {
        const link = /^\[[^\]]*\]\(([^)]+)\)$/.exec(entry);
        const target = link ? link[1] : entry;
        const abs = resolveTarget(rec.abs, target);
        if (!abs || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
          err(rec.rel, `landed-in entry "${entry}" does not resolve to an existing file`);
        } else if (!abs.startsWith(architectureDir)) {
          err(rec.rel, `landed-in entry "${entry}" points outside docs/architecture/`);
        }
      }
    }
  },

  'sketch-numbers-unique'(ctx, err) {
    checkNumbersUnique(ctx.sketches, err);
  },

  'adr-filename-format'(ctx, err) {
    checkFilenameFormat(ctx.adrs, err);
  },

  'adr-h1-matches-filename'(ctx, err) {
    for (const rec of ctx.adrs) {
      if (rec.readError) {
        err(rec.rel, `cannot read file: ${rec.readError}`);
        continue;
      }
      checkH1MatchesFilename(rec, err);
    }
  },

  'adr-status-bullet'(ctx, err) {
    for (const rec of ctx.adrs) {
      if (rec.readError) continue;
      const value = bulletValue(rec, 'Status');
      if (value === null) {
        err(rec.rel, 'missing a "- **Status:** ..." bullet');
      } else if (value !== 'Proposed' && value !== 'Accepted' && !value.startsWith('Superseded by ')) {
        err(rec.rel, `Status "${value}" must be "Proposed", "Accepted", or start with "Superseded by "`);
      }
    }
  },

  'adr-date-bullet'(ctx, err) {
    for (const rec of ctx.adrs) {
      if (rec.readError) continue;
      const value = bulletValue(rec, 'Date');
      if (value === null) {
        err(rec.rel, 'missing a "- **Date:** ..." bullet');
      } else if (!isValidDate(value)) {
        err(rec.rel, `Date "${value}" is not a valid YYYY-MM-DD calendar date`);
      }
    }
  },

  'adr-required-h2-sections'(ctx, err) {
    for (const rec of ctx.adrs) {
      if (rec.readError) continue;
      checkRequiredH2sInOrder(rec, ADR_H2S, err);
    }
  },

  'adr-numbers-unique'(ctx, err) {
    checkNumbersUnique(ctx.adrs, err);
  },

  'sketch-index-completeness'(ctx, err) {
    checkIndexTable(ctx, ctx.workflow, INDEX_SKETCH_HEADER, 'docs/sketches', ctx.sketchStatuses, err, ['completeness']);
  },

  'sketch-index-status-matches-frontmatter'(ctx, err) {
    checkIndexTable(ctx, ctx.workflow, INDEX_SKETCH_HEADER, 'docs/sketches', ctx.sketchStatuses, err, ['status']);
  },

  'adr-index-completeness'(ctx, err) {
    checkIndexTable(ctx, ctx.adrIndex, INDEX_ADR_HEADER, 'docs/decisions', ctx.adrStatuses, err, ['completeness']);
  },

  'adr-index-status-matches'(ctx, err) {
    checkIndexTable(ctx, ctx.adrIndex, INDEX_ADR_HEADER, 'docs/decisions', ctx.adrStatuses, err, ['status']);
  },

  'docs-relative-link-integrity'(ctx, err) {
    for (const rec of ctx.docsMd) {
      if (rec.readError) continue;
      for (const { target, line } of rec.links) {
        if (isExternalTarget(target)) continue;
        const abs = resolveTarget(rec.abs, target);
        if (abs === null) continue;
        if (!fs.existsSync(abs)) {
          err(rec.rel, `link "${target}" (line ${line}) does not resolve to an existing file or directory`);
        }
      }
    }
  },

  // AGENTS.md is the tool-agnostic source of truth; CLAUDE.md must import it
  // with a literal "@AGENTS.md" line (Claude Code import syntax).
  'agents-claude-pairing'(ctx, err) {
    for (const agentsRel of listAgentsFiles(ctx.root)) {
      const claudeRel = agentsRel.replace(/AGENTS\.md$/, 'CLAUDE.md');
      const claudeAbs = path.join(ctx.root, claudeRel);
      if (!fs.existsSync(claudeAbs)) {
        err(agentsRel, `has no sibling ${claudeRel}: create one whose first line is "@AGENTS.md" so Claude Code loads the shared guide`);
        continue;
      }
      const claudeText = fs.readFileSync(claudeAbs, 'utf8').replace(/\r\n/g, '\n');
      if (!claudeText.split('\n').some((l) => l.trim() === '@AGENTS.md')) {
        err(claudeRel, `does not import its sibling AGENTS.md: add a line containing exactly "@AGENTS.md" (outside any code fence)`);
      }
    }
  },

  // Skills live in .agents/skills/; .claude/skills is one directory symlink.
  // Fix-up: pnpm run setup. See docs/feature-workflow.md, "Enforced structure".
  'skills-canonical-in-agents'(ctx, err) {
    const agentsDir = path.join(ctx.root, '.agents', 'skills');
    const claudeLink = path.join(ctx.root, '.claude', 'skills');

    if (fs.existsSync(agentsDir)) {
      for (const entry of fs.readdirSync(agentsDir, { withFileTypes: true })) {
        if (entry.isDirectory() && !fs.existsSync(path.join(agentsDir, entry.name, 'SKILL.md'))) {
          err(`.agents/skills/${entry.name}`, `has no SKILL.md: every skill directory needs one (Agent Skills standard)`);
        }
      }
    }

    let lst = null;
    try {
      lst = fs.lstatSync(claudeLink);
    } catch {
      /* missing */
    }
    if (!lst) {
      if (fs.existsSync(agentsDir)) {
        err('.claude/skills', 'missing: run "pnpm run setup" to create the symlink to ../.agents/skills');
      }
      return;
    }
    if (!lst.isSymbolicLink()) {
      err('.claude/skills', 'must be a single symlink to ../.agents/skills, not a real directory: move any skill folders into .agents/skills/ and run "pnpm run setup"');
      return;
    }
    try {
      const got = fs.realpathSync(claudeLink);
      const want = fs.realpathSync(agentsDir);
      if (got !== want) {
        err('.claude/skills', `symlink resolves to "${got}" instead of .agents/skills: run "pnpm run setup"`);
      }
    } catch {
      err('.claude/skills', 'symlink is broken (target missing): run "pnpm run setup"');
    }
  },

  // House style (AGENTS.md): no em/en dashes; no spaced hyphen as punctuation.
  // MD scanned via mdast text nodes (skips code/frontmatter). Plain-text scan
  // limited to .github/ + scripts/. Dash chars as \u escapes so this file
  // passes its own plain-text scan.
  'no-dash-punctuation'(ctx, err) {
    const DASH = /[\u2013\u2014]/;
    const extraRels = ['README.md', 'CONTRIBUTING.md', 'AGENTS.md', 'CLAUDE.md', 'PRIVACY.md', 'SECURITY.md']
      .filter((rel) => fs.existsSync(path.join(ctx.root, rel)))
      .concat(listMdFiles(ctx.root, '.agents/skills'));
    const records = ctx.docsMd.concat(extraRels.map((rel) => loadMd(ctx.root, rel)));

    for (const rec of records) {
      if (rec.readError || !rec.tree) continue;
      const tableRanges = rec.tables.map((t) => [t.startLine, t.endLine]);
      const inTable = (line) => tableRanges.some(([s, e]) => line >= s && line <= e);
      for (const node of collect(rec.tree, 'text')) {
        const line = node.position?.start?.line ?? 0;
        const val = node.value;
        if (DASH.test(val)) reportDashOnLine(rec.rel, line, 'em-en', err);
        else if (/\S\s+-\s+\S/.test(val) && !inTable(line)) reportDashOnLine(rec.rel, line, 'spaced', err);
      }
    }

    for (const rel of listAllFiles(ctx.root, '.github').concat(listAllFiles(ctx.root, 'scripts'))) {
      const text = fs.readFileSync(path.join(ctx.root, rel), 'utf8').replace(/\r\n/g, '\n');
      text.split('\n').forEach((line, i) => {
        if (DASH.test(line)) reportDashOnLine(rel, i + 1, 'em-en', err);
      });
    }
  },
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const { root } = parseArgs(process.argv);
  if (!fs.existsSync(path.join(root, 'docs'))) {
    console.error(`no docs/ directory under root: ${root}`);
    process.exit(2);
  }

  const docsMd = listMdFiles(root, 'docs').map((rel) => loadMd(root, rel));
  const byRel = new Map(docsMd.map((r) => [r.rel, r]));
  const ctx = {
    root,
    docsMd,
    sketches: docsMd.filter((r) => r.rel.startsWith('docs/sketches/')),
    adrs: docsMd.filter((r) => r.rel.startsWith('docs/decisions/')),
    workflow: byRel.get('docs/feature-workflow.md') ?? null,
    adrIndex: byRel.get('docs/architecture/09-architecture-decisions.md') ?? null,
  };
  ctx.sketchStatuses = new Map(
    ctx.sketches.map((r) => {
      const s = fmOf(r)?.get('status');
      return [r.rel, typeof s === 'string' ? s : null];
    })
  );
  ctx.adrStatuses = new Map(ctx.adrs.map((r) => [r.rel, r.readError ? null : bulletValue(r, 'Status')]));

  const violations = [];
  for (const [id, check] of Object.entries(RULES)) {
    check(ctx, (file, msg) => violations.push({ file, id, msg }));
  }

  violations.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0));
  for (const v of violations) {
    console.log(`${v.file}  [${v.id}] ${v.msg}`);
  }

  const filesWithErrors = new Set(violations.map((v) => v.file)).size;
  if (violations.length > 0) {
    console.log(`\n${violations.length} error(s) in ${filesWithErrors} file(s)`);
    process.exit(1);
  }
  console.log(`docs structure OK, ${docsMd.length} files checked`);
}

main();
