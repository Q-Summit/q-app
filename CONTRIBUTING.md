# Contributing to the Q-Summit Conference App

Thank you for contributing. This project is built by students and volunteers, and every contribution helps. The docs in this repo are part of the product: they are how the project survives yearly team turnover, so treat them with the same care as code.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold it. Report unacceptable behavior to <app@q-summit.com>.

## How work happens here

Everything starts as a **GitHub Issue** and, once accepted, **everything lives in code**. The full lifecycle is specified in [`docs/feature-workflow.md`](./docs/feature-workflow.md). The short version:

```text
💡 Idea (GitHub Issue, "Idea" template)  →  discussed & triaged
        │ accepted
        ▼
📝 Sketch (PR adding docs/sketches/NNNN-*.md)  →  PR review = refinement
        │ merged = "this is what we'd build"
        ▼
⚖️ Decisions (ADR PRs in docs/decisions/, only when the sketch forces system-wide alternatives)
        ▼
🔨 Build (implementation PRs; docs & diagrams updated in the same PR)
        ▼
✅ Shipped (durable facts move into docs/architecture/; the sketch freezes as history)
```

Sketches are **feature** decisions; ADRs are **architecture** decisions (which database, which auth, where it runs, chosen among alternatives). Features drive architecture: a sketch's technical plan runs on the architecture we have, and where it can't, it forces an ADR.

## Ground rules

1. **Same-PR rule.** A change that invalidates a doc or diagram updates it in the same PR. Reviewers reject stale-doc PRs like they'd reject failing tests.
2. **One home per question.** What we planned & why → the sketch (frozen once shipped). Why the system is built this way → the ADR. How the system works _right now_ → [`docs/architecture/`](./docs/architecture/) (arc42, always current truth). Never document the same fact twice.
3. **ADRs are append-only.** Never edit an accepted ADR; write a new one that supersedes it.
4. **Persona labels on issues.** Triage adds `persona: attendee` / `persona: partner` / `persona: organizer` on issues so each surface's backlog stays separable. Sketch files carry the persona matrix; sketch PRs do not need persona labels.
5. **English only.** Code, docs, issues, commit messages.
6. **Docs structure is CI-checked.** Run `node scripts/validate-docs.mjs` from the repo root; it validates sketches, ADRs, the index tables, and links; see "Enforced structure" in [`docs/feature-workflow.md`](./docs/feature-workflow.md).

## How to contribute

1. Create a branch for your change (external contributors: fork first): `feat/…`, `fix/…`, `docs/…`, `sketch/…`, `adr/…`. `main` is protected: nobody pushes to it directly; every change lands via PR with one approving review and passing checks. Review ownership is defined in [`.github/CODEOWNERS`](./.github/CODEOWNERS), which is authoritative: the target model is team-wide review for sketches and code with a maintainer gate on `docs/decisions/`, `docs/architecture/`, and `.github/`, and until the org teams exist a single maintainer owns everything.
2. Make your change, keeping it focused and reasonably small.
3. Follow the existing code style and conventions in the repository.
4. **Open a pull request** describing what you changed and why; fill in the docs-impact checklist in the template.
5. Sign the CLA when the bot asks (see below).
6. A maintainer will review; we may suggest changes before merging. Reviews check against the sketch's persona matrix where one exists.

A change is **done** when it works, is tested, and its docs are current.

## Development setup

Day-to-day contributor tooling checks docs structure and style (`pnpm run check`). Application packages are added only behind accepted ADRs (see [`AGENTS.md`](./AGENTS.md)). You need Node 22.18+ and [pnpm](https://pnpm.io/installation) 10+ (easiest: `corepack enable pnpm`, which picks up the exact version pinned in `package.json`). Once, after cloning:

```text
pnpm run setup
```

That installs the doc tooling (docs validator, markdownlint, cspell, prettier), points git at `.githooks/` so `pnpm run check` runs on every commit, creates/repairs the `.claude/skills → .agents/skills` symlink, and runs the **structural** docs check (`validate-docs`). It is not the full suite. Day to day and in CI, `pnpm run check` is the gate (validator + markdownlint + cspell + prettier). Windows: enable real symlink support (`git config core.symlinks true` plus Developer Mode) before cloning, then `pnpm run setup`. If a GUI Git client fails the hook with `pnpm: not found`, enable Corepack (`corepack enable`), use Node 22.18+ from `.nvmrc`, and ensure that Node's bin is on PATH.

Coding agents follow [`AGENTS.md`](./AGENTS.md) ([agents.md](https://agents.md/) standard).

Then, day to day:

- `pnpm run check` runs everything the PR gate runs: the docs validator, markdownlint, the spell check, and prettier's format check.
- `pnpm run format` reformats markdown, JSON, and YAML to the house style.

If the spell check flags a real word (a name, a product, a term of art), add it to the `words` list in `cspell.config.yaml` (keep it sorted) instead of rewording around it.

Prose is **not** hard-wrapped by width: paragraphs are one logical line and wrapping is your editor's job. Run `pnpm run format` before committing. If anything is unclear, open an issue and ask; that counts as a contribution too.

## Reporting bugs & suggesting features

Open an issue using the **Bug** or **Idea** template. For ideas, describe the problem you are trying to solve in addition to any solution you have in mind. The Idea template walks you through it, including which personas (attendee, partner, organizer) the idea touches.

## Contributor License Agreement (one-time)

Before your first contribution can be merged, sign our [Contributor License Agreement (CLA)](./CLA.md). You keep the copyright to your work; you grant Q-Summit e.V. the rights it needs to keep the app free for non-profits and to offer commercial licenses, which is what funds the project.

**Everyone signs, including the Q-Summit team.** Maintainers, core IT team members, and Q-Summit e.V. members sign the same CLA the same way; the required CLA check blocks unsigned pull requests. Details, including the exact rationale, live in [`CLA.md`](./CLA.md).

**How to sign:** open a pull request. The CLA Assistant bot will comment asking you to sign. Reply on the PR with:

```text
I have read the CLA Document and I hereby sign the CLA
```

Signing is a one-time step and covers all your future contributions.

## Getting credit for your work

This is a public project by design. Attribution lives in the git history and the CLA signature ledger (`cla/signatures.json`); you are welcome to point future employers here.

## Questions

Open an issue, or for anything licensing-related email [app@q-summit.com](mailto:app@q-summit.com).
