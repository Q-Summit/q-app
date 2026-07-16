# 0001 · GitHub-only idea workflow, docs as code

- **Status:** Accepted
- **Date:** 2026-07-14
- **Sketch/issue:** None

## Context

The platform is built by student volunteers with yearly turnover; the docs are both institutional memory and each contributor's portfolio. Ideas were being collected in Notion, disconnected from where the work happens. We researched requirements/architecture documentation standards (ISO 29148, Volere, PRDs, Shape Up, RFCs, ADRs, arc42, C4, ISO 42010, Diátaxis) to pick a system.

## Considered options

1. **Notion for ideas + docs, repo for code**: where people already are, but splits truth across two systems, drifts from the code, and isn't visible in the portfolio.
2. **Heavyweight standards adoption (full SRS/PRD pipeline + formal RFC stage)**: maximally "enterprise" on paper, but the overhead doesn't fit volunteer capacity and adds pages, not information, at this team size.
3. **GitHub-only, docs as code**: ideas as GitHub Issues (template-guided); once accepted, everything lives in the repo: sketches (`docs/sketches/`), decisions as MADR-style ADRs (`docs/decisions/`), architecture as trimmed arc42 with Mermaid C4 diagrams (`docs/architecture/`), refined through normal PR review.

## Decision

Option 3. Lifecycle: Idea issue → sketch PR → ADR PRs (only when the sketch forces system-wide alternatives) → implementation PRs with the same-PR docs rule. Specified in [`docs/feature-workflow.md`](../feature-workflow.md). Selective borrowings: ISO 29148's quality bar for requirements, Shape Up's appetite thinking inside sketches, Microsoft's "ADR-PR as the debate" pattern. Mermaid is the diagram notation because it is the only one GitHub renders natively in READMEs and PRs.

## Consequences

- One system of record; an idea's whole history is traceable from issue to code.
- Contributors need basic Git/PR literacy even for docs: acceptable, since that's the skill the project exists to build.
- Notion is no longer an intake channel for platform ideas.
- Revisit if: idea volume outgrows issue triage, or diagrams outgrow Mermaid (planned upgrade path: LikeC4).
