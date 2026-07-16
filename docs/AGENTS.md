# Docs

Work under `docs/`. Process: [`feature-workflow.md`](feature-workflow.md). Homes: [`README.md`](README.md). arc42 chapter rules: [`architecture/AGENTS.md`](architecture/AGENTS.md).

## ALWAYS

- Copy `sketches/_template.md` / `decisions/_template.md`; keep the required H2s in template order; delete the template comments before the PR.
- Sketches: exact template frontmatter keys (CI rejects extras) and the persona matrix table. ADRs: the Status and Date bullets.
- Same PR: sketch index in `feature-workflow.md`; ADR index in `architecture/09-architecture-decisions.md`.
- Ship: `architecture/05` structure, `06` behavior, `08` data/crosscutting; fill `landed-in:`; `status: shipped`; freeze the sketch.
- Mark architecture claims as current, or as direction / TBD / owed ADR.
- Mermaid via **docs-diagrams**; caption states the takeaway.
- `pnpm run check` runs from the repo root, not from `docs/`.

## PREFER

- Technical-plan `"None"` when honest.
- Glossary row only when a term is first used.
- When a sketch introduces a new quality, add a one-line stimulus/response scenario to `architecture/10-quality-requirements.md`; keep the list short.

## NEVER

- Edit accepted ADRs (supersede) or shipped sketches.
- Freestyle sketch/ADR sections.
- Fill empty arc42 sections for completeness.
- Invent packages, vendors, flows, or schemas past accepted ADRs.
- Real PII in examples. No LinkedIn/CV bulk-processing sketch dependencies.
- Restate `feature-workflow.md` here.

## Sketch statuses

`planned` | `building` | `shipped` | `parked`

Merge = agreed. Sketch `parked` ≠ issue `parked`. Matrix = scoping/review; access rules live in `architecture/08-concepts.md`.
