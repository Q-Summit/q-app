# Architecture (arc42)

Always-current truth for how the system works right now, one file per chapter of [arc42](https://arc42.org/overview), the standard 12-chapter architecture template. Empty chapters are stubs that fill from shipped features and accepted ADRs. Docs-wide rules: [`../AGENTS.md`](../AGENTS.md).

## Chapter map

| Chapter | Holds | Filled by |
| --- | --- | --- |
| 01 introduction and goals | Requirements, quality goals, stakeholders | Edits only when the framing itself changes |
| 02 constraints | Organizational, technical, and legal constraints | Edits only when the framing itself changes |
| 03 context and scope | System context, external interfaces, scope | Edits only when the framing itself changes |
| 04 solution strategy | Goal-to-approach mapping | ADRs that change strategy |
| 05 building blocks | Durable structure (C4 container/component) | Shipping PRs ([workflow](../feature-workflow.md), stage 5) |
| 06 runtime | Durable behavior (sequence/flow diagrams) | Shipping PRs |
| 07 deployment | Infrastructure and release topology | Deployment ADRs |
| 08 concepts | Data model, authorization, crosscutting rules | Shipping PRs |
| 09 decisions | ADR index plus owed-decisions list | Same PR as each ADR (CI-checked) |
| 10 qualities | Stimulus-response scenarios | Sketches that introduce a new quality |
| 11 risks and debt | Risk register, named shortcuts | PRs that take or pay off a shortcut |
| 12 glossary | One-line terms | The first doc that relies on a term |

## ALWAYS

- H1 is `# N · <title>`, matching the `NN-` filename prefix; chapter numbers stay stable.
- A stub is its header plus one line naming what fills it; update that line when the blocker changes.

## NEVER

- Pad a stub with invented content, speculative structure, or placeholder diagrams; empty is information.
- Reason about the docs setup inside chapter files (meta blockquotes, authoring notes); that guidance lives here.
- Renumber, merge, or delete chapters.
