---
name: agent-files
description: "Create or update AGENTS.md, sibling CLAUDE.md, and skill SKILL.md files so coding agents get lean, durable guidance. Use when adding or editing AGENTS.md or CLAUDE.md, writing a skill or its frontmatter description, nesting agent guides for a new package, aligning agent files with SOTA practice, or when the user asks what belongs in AGENTS.md, when to nest, or how to update agent guides or skills."
license: MIT
metadata:
  version: "1.1.0"
  author: "Lukas Strickler (@LukasStrickler)"
---

# Agent files

`AGENTS.md` is a **README for agents**: executable guidance, not a human onboarding essay. Standard: [agents.md](https://agents.md/). Shared, tool-agnostic rules live in `AGENTS.md`. Sibling `CLAUDE.md` must import it for Claude Code.

| Situation | Go to |
| --- | --- |
| Writing or rewriting a guide | What belongs → Structure → Checklist |
| New package / new loop | When to nest |
| After agents fail the same way | Scar updates |
| Pairing / CI | CLAUDE.md + Verify |
| Writing or fixing a skill | Skill files (SKILL.md) |

Deep patterns and citations: [references/sota-patterns.md](references/sota-patterns.md).

## What belongs

**Put in AGENTS.md**

- Copy-pasteable **commands** (flags, cwd, filters) for setup and verification.
- **Boundaries**: Always / Prefer / Never (or Do / Don't) that are falsifiable.
- **Scar maps**: mistakes agents actually make here (named paths, forbidden edits).
- **Diffs from defaults**: house rules CI or review will catch, or that waste a turn if missed.
- **Architecture / trust edges** agents otherwise "fix" wrongly (e.g. surfaces never talk to the DB).
- **One-line pointers** to canonical human docs (`CONTRIBUTING.md`, `docs/feature-workflow.md`).

**Keep out**

- Product pitch, long "why we exist", tutorials (→ README / CONTRIBUTING).
- Restating process docs agents can open (link instead).
- Generic advice ("write clean code").
- Unstable people-names without a durable owner doc.
- Rules CI already fully enforces with no pre-CI cost (prefer encoding hazards agents hit *before* CI).

Agents need **guidance and approaches**, not every detail. Prefer a sharp Never over a paragraph of reasoning.

## CLAUDE.md

Required sibling of every `AGENTS.md`. Must contain a line that is exactly `@AGENTS.md` (Claude Code import). CI checks for that line.

The `@AGENTS.md` line must sit outside any code fence or code span: Claude Code's import parser skips those, while `check:docs` matches the line anywhere, so a fence-only occurrence passes CI yet never imports. Imports resolve relative to the importing file and recurse at most four hops.

**Belongs in CLAUDE.md:** Claude Code-specific behavior only (how Claude should use tools, Claude-only workflows, model-specific tips). Keep it short.

**Belongs in AGENTS.md:** anything every coding agent should follow (commands, Always/Prefer/Never, scars, ADR gates).

**Anti-pattern:** dumping shared rules into `CLAUDE.md` so other agents never see them, or leaving CLAUDE empty of the `@AGENTS.md` import.

## Skill files (SKILL.md)

Skills live in `.agents/skills/<name>/SKILL.md` (`.claude/skills` is a symlink; `pnpm run setup` repairs it). Only `name` and `description` are loaded until a skill triggers, so the description is the activation contract:

- `description`: third person, states WHAT the skill does AND WHEN to use it, with concrete trigger keywords (max 1024 chars). A vague description means the skill never activates.
- `name`: lowercase letters, numbers, hyphens (max 64 chars).
- Body under 500 lines; push depth into `references/` files one level deep from SKILL.md.
- Pick one default per decision (plus an escape hatch), not an option menu. No time-sensitive facts.

## When to nest

Create `path/AGENTS.md` + `path/CLAUDE.md` when **any** of:

1. The directory has its **own build/test/lint loop** (package.json, pyproject, Gradle module, …).
2. **Stack or trust model diverges** (e.g. docs toolchain, CI workflows, providers with different security rules).
3. Agents keep applying **wrong training-data assumptions** unique to that subtree.
4. An **accepted ADR** adds a package and says where it lives.

**Do not nest** for `.github/` or `scripts/` until they own a distinct loop or threat model; root pointers are enough. Do not nest folders with fewer than 3 source files and no build config.

**Precedence:** files merge rather than replace in the big runtimes (Codex concatenates every `AGENTS.md` from Git root to cwd; Claude Code loads all `CLAUDE.md` files root to leaf); the closest file wins on conflict ([agents.md](https://agents.md/) FAQ). Write leaves as local overrides that never assume they hide the root; keep **safety Nevers on the root** so nearest-only loaders still see them.

## Structure (root)

Keep lean. Targets: **~40-120 lines** typical; grow after scars, not before, and stay under the ~200-line adherence ceiling. Prefer nested overrides over a mega-root (Codex default combine budget: 32 KiB, `project_doc_max_bytes`).

Recommended order:

1. Overview, 2-3 sentences: what the repo is, where current truth lives, merge/closest-wins note. Then links to process/homes.
2. **Commands** (first for lookup).
3. **ALWAYS** / **PREFER** / **NEVER** (fail-loud bullets).
4. Optional: when-to-add-packages / verify note (one short section).

Use imperative bullets. Name paths and commands. No em/en dashes (repo house style).

## Structure (docs/ or package nested)

**~25-60 lines.** Only local mechanics and local Nevers. Point up to root. Do not restate the whole workflow.

For `docs/` in this repo: templates, indexes, ship migrate targets (`05`/`06`/`08`), arc42 chapter rules (nested in `architecture/AGENTS.md`), persona matrix vs `08-concepts`, privacy-in-examples.

For a future package: that package's setup/test/lint commands; stack quirks; "expand root `pnpm run check` in the same PR."

## When to update (same PR)

| Trigger | Action |
| --- | --- |
| New or changed check/lint/test command | Update Commands |
| Same agent mistake twice | Add Never / Prefer scar |
| New package after ADR | Add nested AGENTS + CLAUDE; wire checks |
| Security / parked-capability / trust change | Update root Never |
| Docs toolchain or ship rules change | Update `docs/AGENTS.md` |
| Skill or AGENTS pairing rules change | Update this skill |
| A check now fully enforces a written rule, or a bullet went stale | Prune it (keep only hazards agents hit before CI) |

Never wholesale regenerate AGENTS.md with an LLM over a hand-tuned file; edit surgically.

## How to write or rewrite

1. Inventory real commands from `package.json` / CI / Makefiles.
2. List hazards: secrets, PII, generated files, ADR gates, parked capabilities, label inventiveness.
3. Draft Always / Prefer / Never; delete any bullet that is not actionable or falsifiable.
4. Link process docs; delete duplicated narrative.
5. Decide nest vs root using "When to nest".
6. Ensure sibling `CLAUDE.md` has `@AGENTS.md`; add Claude-only notes after that if needed, never shared rules.
7. Verify (below).

## Verify

```sh
pnpm run check:docs   # AGENTS↔CLAUDE pairing, skills symlink, dashes in AGENTS
pnpm run check        # full gate before finish
```

Confirm every `AGENTS.md` has a sibling `CLAUDE.md` with a line that is exactly `@AGENTS.md`. Shared rules must live in `AGENTS.md`, not only in CLAUDE.

## Anti-patterns

- Mega-root essays or full CONTRIBUTING copies.
- Nesting that only repeats root.
- Vague Never ("don't mess up").
- Commands without how to run them.
- Dumping shared rules into `CLAUDE.md` (other agents will not see them).
- Point-in-time narration ("docs-first today / no apps yet") instead of durable gates ("no package until ADR X").
- Nested openers that lecture about "additive roots" or telling agents to "maintain this with the skill".
