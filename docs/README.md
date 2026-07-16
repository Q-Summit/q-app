# Docs

**Personas** are our three user groups, one per surface: **attendee** (mobile app, attendees only), **partner** (partner web, partners only, not open public), **organizer** (web tools, internal only). Every idea, sketch, and review is framed in terms of what each persona can do and see.

One home per question:

| Question | Home |
| --- | --- |
| How does work move from idea to code? | [`feature-workflow.md`](feature-workflow.md): the single source for process rules |
| What did we plan to build, and why? | [`sketches/`](sketches/): one page per feature; frozen once shipped |
| Why is the system built this way? | [`decisions/`](decisions/): ADRs, architecture decisions, append-only |
| How does the system work **right now**? | [`architecture/`](architecture/): arc42; always current truth |

Sketches are feature decisions; ADRs are architecture decisions. Features drive architecture: a sketch's technical plan runs on the architecture we have, and where it can't, it forces an ADR. Once a feature ships, its durable facts move into `architecture/` and the sketch freezes as history, like a merged RFC.

The rules that keep all this true (same-PR rule, append-only ADRs, review ownership) are defined once in [`feature-workflow.md`](feature-workflow.md) and summarized in [`CONTRIBUTING.md`](../CONTRIBUTING.md).

## Diagram style

Diagrams are Mermaid, in-page, C4-flavored (Context/Container level): plain flowcharts with subgraphs, because GitHub renders those natively in READMEs and PRs. One diagram per view; small enough to review in a diff.

## Parked topics

Two different "parked" meanings:

- **Parked ideas** live as GitHub issues with the `parked` label (and optionally as a sketch with `status: parked` if one already merged). They do not get feature pages written ahead of the hold lifting.
- **Parked capabilities** are standing constraints in [`architecture/02-constraints.md`](architecture/02-constraints.md). Notably: scraping or bulk-processing personal career data (LinkedIn profiles, CV parsing), pending legal review. Sketches must not depend on parked capabilities.
