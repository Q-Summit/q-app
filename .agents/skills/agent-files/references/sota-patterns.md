# SOTA AGENTS.md patterns (reference)

Citations for the **agent-files** skill. Prefer the skill body for day-to-day work; open this when debating length, nesting, structure, or skill descriptions. Repo line counts below were verified by fetching each file in July 2026.

## Canonical

- [agents.md](https://agents.md/): open format, plain Markdown, no required schema; stewarded by the Agentic AI Foundation (Linux Foundation); 60k+ repos, read by 30+ tools (GitHub Copilot only with the `chat.useAgentsMdFile` opt-in). Recommended themes: overview, build/test, style, testing, security.
- [Codex AGENTS guide](https://developers.openai.com/codex/guides/agents-md): concatenates every `AGENTS.md` from Git root down to cwd, so closer files win by appearing later, not by hiding the root; default combined budget 32 KiB (`project_doc_max_bytes`); `AGENTS.override.md` beats `AGENTS.md` at each level. When hitting the cap: nest, do not grow the root.
- [Claude Code memory](https://code.claude.com/docs/en/memory): loads all `CLAUDE.md` files root to leaf (ancestors in full at launch, subdirectories on demand); `@path` imports resolve relative to the importing file, recurse at most four hops, and are skipped inside code spans and fences; target under 200 lines per file.

## Lean

- [astral-sh/uv](https://github.com/astral-sh/uv/blob/main/AGENTS.md) (20 lines): ALWAYS / NEVER / PREFER / AVOID; points at CONTRIBUTING for tooling.
- [temporalio/sdk-java](https://github.com/temporalio/sdk-java/blob/master/AGENTS.md) (59 lines): layout, exact gradlew commands with flags, review checklist; depth in CONTRIBUTING.
- [kubernetes/kubernetes](https://github.com/kubernetes/kubernetes/blob/master/AGENTS.md) (45 lines): generated files via `make update`, never direct edits; staging is the source of truth for `k8s.io` packages.
- Minimal entry points: microsoft/vscode (11 lines), sveltejs/svelte (13), ghostty (35) just redirect to existing contributor docs.

## Boundaries-first

- [calcom/cal.com](https://github.com/calcom/cal.com/blob/main/AGENTS.md) (244 lines): Do / Don't plus Always / Ask / Never; explicit PR size limits (under 500 code lines, under 10 files); import-path scars; `agents/rules/*` index for depth.
- [halo-dev/halo](https://github.com/halo-dev/halo/blob/main/AGENTS.md) (199 lines): Always / Ask / Never template usage.

## Commands + architecture

- [apache/airflow](https://github.com/apache/airflow/blob/main/AGENTS.md) (519 lines, plus `providers/AGENTS.md` at 108): incident-derived rules ("bulk DELETE/UPDATE batched with LIMIT"); nests only where process genuinely diverges (providers release independently).
- [vercel/next.js](https://github.com/vercel/next.js/blob/canary/AGENTS.md) (512 lines): commands-first monorepo root; nested `.github/AGENTS.md` (78 lines) and a 7-line `packages/next/AGENTS.md` that only corrects training-data assumptions ("This is NOT the Next.js you know").
- [openai/codex](https://github.com/openai/codex/blob/main/AGENTS.md) (322 lines): deep scar maps (sandbox env vars, module size limits, "resist adding code to codex-core"); justified length for agent-product hazards.
- [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk/blob/main/AGENTS.md) (247 lines): "use pnpm, never npm or yarn" stated early and repeated; 7-line CLAUDE.md redirect.

## Nested docs / deep leaves

- `docs/AGENTS.md` when docs own a toolchain: zed (407 lines), prefect (116), sqlfluff (532).
- Prefer many short nested files over one mega-root when stacks diverge; OpenAI's internal monorepo runs roughly 88 nested files.

## Budgets and evidence

- Practitioner consensus for a root file: ~100-200 lines; recall degrades past ~300; split past ~500; shallow structure (one H1, 6-7 H2 sections) is the empirical norm.
- LLM-generated agent files measured harmful: worse task success in 5 of 8 settings and 20-23% higher cost, mostly from restating repo-inferable content; human-curated non-inferable files gained ~4% ([arxiv 2511.12884](https://arxiv.org/abs/2511.12884)). Hence: edit surgically, never regenerate.
- Security guidance appears in only ~14.5% of surveyed context files, and agents write functional but vulnerable code without it (same study). Hard security Nevers are the least-covered, highest-cost content.

## Skills

- [Anthropic skill authoring](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices): only `name` and `description` pre-load, so the description must state WHAT plus WHEN with concrete trigger keywords; body under 500 lines; references one level deep; pick a default per decision instead of listing options; no time-sensitive facts.

## Principles distilled

1. Commands-first, copy-pasteable.
2. Encode diffs from defaults, not style textbooks; include only what agents cannot infer from the repo.
3. Hard Never for security and irreversible mistakes (see Budgets and evidence: the least-covered, highest-cost gap).
4. Always / Prefer / Never beats vague vibe rules; style-level negatives are better enforced by tooling or review than by steering text.
5. Architecture as agent constraints (trust edges).
6. Scar maps beat abstract principles; grow reactively (add after a repeated mistake, prune when tooling takes over a rule).
7. Nest for tool/security/stack divergence; keep root universal safety.
8. Files merge root to leaf in the big runtimes; proximity wins on conflict only. Never write a leaf assuming it hides the root.
9. Link for depth; keep the executable core thin.
10. Same-PR updates when workflow or scars change.
11. Prefer scoped verification; ask before huge matrices.
12. One shared source of truth (`AGENTS.md`); `CLAUDE.md` imports it (relative paths, four-hop max) and may add Claude-only notes.
