---
name: docs-diagrams
description: "Author Mermaid diagrams for the q-app docs that render correctly on GitHub in light AND dark theme. Use when adding or editing a ```mermaid block anywhere in the repo, when a diagram looks broken or unreadable in a PR, or when picking a diagram type, palette, or caption."
license: MIT
metadata:
  version: "1.1.0"
  author: "Lukas Strickler (@LukasStrickler)"
---

# Docs diagrams

Every ` ```mermaid ` fence in this repo renders client-side on **GitHub** (READMEs, PRs, issues) with GitHub's bundled Mermaid (v11 line, updated by GitHub on its own schedule). Three consequences drive everything here:

1. **GitHub picks the theme, not you.** Readers use light or dark GitHub; every hard-coded color must read on both grounds. Never pin a theme.
2. **GitHub's renderer is a subset.** Mermaid's `C4Context` syntax does **not** render on GitHub, and `architecture-beta` ships with only five icons. That is why the house style is plain flowcharts styled as C4 (see `docs/README.md`, section "Diagram style"). Beta diagram types (`architecture-beta`, `block-beta`, `xychart-beta`) break on GitHub's silent version bumps: never use them in durable docs.
3. **A broken diagram is a broken doc.** GitHub shows an error box instead of the picture. The PR preview is the gate: **never merge a diagram you haven't looked at in the PR's rendered view, in both themes.**

| Situation                        | Go to                                                            |
| -------------------------------- | ---------------------------------------------------------------- |
| About to add or edit a diagram   | Label safety → Styling → Verify                                  |
| Diagram broken or ugly in a PR   | Verify                                                           |
| Which diagram type?              | Choosing the type                                                |
| Exact syntax or pitfall lookup   | [references/mermaid-on-github.md](references/mermaid-on-github.md) |

## When to draw at all

Draw when a _relationship_ is the point: flow, ordering, containment, cardinality. Don't draw when the content is a list (bullets win), an exhaustive mapping (a table wins), or a restatement of adjacent prose (decorative diagrams rot). Each diagram in a doc should answer a different question; if two answer the same one, delete one.

## Choosing the type

| The point is…                                                | Type                             | Watch out                                    |
| ------------------------------------------------------------ | -------------------------------- | -------------------------------------------- |
| components plus who talks to whom (C4 context and container) | `flowchart LR` (stacks: `TB`)    | more than ~12 nodes → split                  |
| ordered interaction or protocol (runtime views, `06-runtime.md`) | `sequenceDiagram`            | more than 7 participants or ~20 messages     |
| status lifecycle (e.g. sketch status)                        | `stateDiagram-v2`                | full matrices → table; draw the happy path   |
| entities plus cardinality (data model, `08-concepts.md`)     | `erDiagram`                      | schema source of truth stays in code or SQL  |
| share of a whole                                              | `pie` (6 slices or fewer)        | comparisons → table                          |

Never `C4Context` (doesn't render on GitHub), never `*-beta` types (unstable across GitHub's version bumps).

## How to make a great diagram

- **One idea per diagram.** Name the question it answers before writing a node. Attendee flow, partner flow, and deployment are three diagrams, not one.
- **5 to 9 elements.** Working memory, not screen space, is the limit. Group with subgraphs, abstract ("LLM providers", not four vendor boxes), or split. Never draw a third party's internals.
- **Verbs on edges.** `-->|publishes|`, `-->|reads|`. A bare arrow is ambiguous. Edge labels 1 to 3 words; long labels get background boxes that collide with neighbors.
- **Line style is semantics:** `==>` the one primary path · `-->` normal calls · `-.->` async, deferred, or external triggers (house convention: external systems attach with `-.->`). Line style survives both themes and colorblindness; color reinforces, never carries alone.
- **Consistent shapes:** `[rect]` service or surface · `[(cylinder)]` datastore · `{diamond}` decision (3 words or fewer; diamonds inflate) · `([stadium])` person or actor.
- **Node text = name plus at most two facts**, `<br/>` separated (GitHub renders `<br/>` in flowchart labels, but NOT in sequence diagram text). A node that needs a paragraph means the paragraph belongs in prose next to the diagram.
- **Short subgraph titles** (about 4 words or fewer); long ones collide with the first node row.
- **Direction:** `LR` for source to sink flow, `TB` for layered stacks; check the render, layout surprises happen around subgraphs.
- **Sentence case everywhere.** ALL CAPS nodes read as shouting.

## Captions: state the takeaway

Put a one-line italic caption under the fence stating what the reader should _conclude_, not what the diagram is. Bad: `*The registration flow.*` Good: `*All three surfaces cross the shared API; none talks to the database directly.*` If the takeaway is hard to write, the diagram has no point; fix that first.

## Label safety (the never list)

Inside any label, message, or note text:

- **No raw `<`, `>`, `&`** (except the `<br/>` tag in flowchart labels). Mermaid has no reliable escape; content after an angle bracket can vanish. Write words: "under 16", "older than 60s", "and".
- **No `;` in sequence diagram notes or messages**: statement separator, hard parse error.
- **No `<br/>` in sequence diagram messages or notes**: unreliable there; keep messages single-line.
- **No parens in sequence `box` names**: the color leaks into the title as text. Use a middle dot or nothing.
- **No bare `end` as a flowchart node ID** (parses as block-end); no numeric-only IDs, prefix them (`n1`).
- **Quote every label containing punctuation**: parens, `:`, `$`, apostrophes break unquoted. Quoting also stops v11 from parsing `_underscores_` as italics.
- **No em or en dashes in labels** (house style, see `AGENTS.md`), **no emoji** (multi-codepoint ones corrupt), no code snippets, regex, or backslashes.

## Styling that survives light AND dark

**The house palette.** Same role → same class in every diagram; include only the classes a diagram uses. Pastel fill plus pinned dark `color:` reads on both GitHub themes:

```text
classDef surface  fill:#dbeafe,stroke:#2563eb,color:#172554;  %% the three client surfaces
classDef api      fill:#ede9fe,stroke:#7c3aed,color:#1e1b4b;  %% shared API / workers
classDef store    fill:#dcfce7,stroke:#16a34a,color:#14532d;  %% databases, object storage
classDef external fill:#fef9c3,stroke:#ca8a04,color:#713f12;  %% ticketing, push, LLM providers
```

Apply with `class APP,PW,ORG surface` or `APP:::surface`.

**Style subgraphs explicitly.** An unstyled subgraph gets the theme default (pale yellow on light) and fights the palette. Very light tint so member nodes stay distinct:

```text
style platform fill:#f8fafc,stroke:#64748b,color:#1e293b
```

**Sequence diagrams:** `classDef` does not work there. Color via `box` only, with **translucent rgba** so the tint works on both grounds; a fixed light fill puts dark theme's near white text on pastel:

```text
box rgba(37,99,235,0.14) Platform
```

**Never pin `%%{init: {"theme": …}}%%`**: a pinned theme stops tracking the reader's light or dark GitHub setting.

## Verify

1. **Compile check (local, optional):** `npx -y @mermaid-js/mermaid-cli -i <file>.mmd -o /tmp/out.svg` on the extracted fence, or paste into [mermaid.live](https://mermaid.live). Catches parse errors before the PR.
2. **The real gate is the PR preview.** Open the file's rendered view on GitHub, in light _and_ dark (GitHub appearance settings or a second browser profile). Check: nothing clipped or colliding, edge labels attached to their edges, palette classes applied, caption true.
3. After any bulk edit of docs, re-check every touched diagram, not just the one you meant to change. A broken diagram is invisible to whoever doesn't scroll past it.

## Pitfalls

- Long edge labels drift and overlap neighbors: shorten rather than reposition.
- Subgraph `direction` is ignored once the subgraph has an external edge: restructure instead of fighting it.
- `useMaxWidth` shrinks but never grows: an intrinsically wide diagram renders microscopic text in GitHub's ~800px content column. If it needs more than ~12 nodes or reads small, split it.
- GitHub updates its Mermaid version without notice: if a previously fine diagram breaks, check the fence against the never-list first, then the [reference](references/mermaid-on-github.md).
