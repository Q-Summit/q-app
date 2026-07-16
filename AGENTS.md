# AGENTS.md

The platform for [Q-Summit](https://q-summit.com), Germany's largest student-organized startup conference: an attendee app, a partner platform, and organizer tools; three personas (attendee, partner, organizer) on one shared API. `docs/architecture/` is always the current system truth, and packages exist only where an accepted ADR created them (see NEVER), so check there before hunting for app code. Nested `AGENTS.md` guides merge with this one; the closest wins on conflict.

Docs tree: [`docs/AGENTS.md`](docs/AGENTS.md). Process: [`docs/feature-workflow.md`](docs/feature-workflow.md). Homes: [`docs/README.md`](docs/README.md). Humans: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Commands

Node `>=22`, pnpm `>=10` (exact version pinned in `package.json` `packageManager`).

```sh
pnpm run setup      # clone: install, hooks, skills symlink, structural validate
pnpm run check      # must be green before finish
pnpm run check:docs # structure / pairing only
pnpm run format     # Prettier write (md/json/yml)
```

Git hooks (installed by `pnpm run setup`) run `pnpm run check` plus a commit-message dash scan on every commit; the tree must be green to commit at all.

## ALWAYS

- Follow `docs/feature-workflow.md` for how work lands (do not restate it here).
- Same-PR: update every doc, diagram, and index your change invalidates.
- Match nearby patterns. Prefer boring, documented tech.
- English only. No em/en dashes. No spaced hyphen as dash punctuation.
- Spell check flags a real word: add it to `words` in `cspell.config.yaml` (sorted), never an inline disable.
- Mermaid via the **docs-diagrams** skill (`.agents/skills/docs-diagrams/`).
- Agent guide edits (`AGENTS.md`/`CLAUDE.md`) via the **agent-files** skill (`.agents/skills/agent-files/`).
- Pin GitHub Actions to a full commit SHA with a trailing `# vX.Y.Z` comment (why: `.github/workflows/cla.yml`).
- Run `pnpm run check`. Do not assume failures are unrelated.
- Report vulns privately ([`SECURITY.md`](SECURITY.md)).

## PREFER

- Small, reviewable diffs.
- Branch names: `feat/`, `fix/`, `docs/`, `sketch/`, `adr/` ([`CONTRIBUTING.md`](CONTRIBUTING.md)).
- Links over copying docs into new prose.
- Obvious fake sample data (`user@example.com`).
- TypeScript for new code. Attendee mobile is Expo ([ADR-0002](docs/decisions/0002-expo-attendee-mobile.md)). Still candidates (ADR before use): Cloudflare Workers/Pages/R2, shared API host (`docs/architecture/02-constraints.md`).

## NEVER

- Commit secrets, tokens, `.env`, or real attendee/partner PII.
- Depend on parked LinkedIn/CV bulk career-data processing (`docs/architecture/02-constraints.md`).
- Invent GitHub labels (only `scripts/setup-labels.sh`).
- Reformat or restyle legal text (`LICENSE.md`, `COMMERCIAL.md`, `CLA.md`, `NOTICE`); it stays byte-for-byte as drafted (see `.prettierignore`).
- Put shared, cross-tool rules in `CLAUDE.md` (those belong in `AGENTS.md`). Claude-only notes may follow the `@AGENTS.md` import in `CLAUDE.md`.
- Add `apps/`, workspace packages, hosting, database, or auth until an **accepted ADR** covers that choice; then nest `AGENTS.md` + `CLAUDE.md` in the new package and wire its checks into `pnpm run check` in the same PR.
