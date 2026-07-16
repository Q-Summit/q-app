# Mermaid on GitHub: syntax and pitfall reference

Target renderer: GitHub's bundled Mermaid (v11 line; GitHub bumps the version on its own schedule, so only stable syntax belongs in durable docs). Theme follows the reader's GitHub appearance (light or dark). Facts below are verified against the Mermaid v11 docs and issue tracker. Maintained by Lukas Strickler (@LukasStrickler).

---

## 1. GitHub-specific constraints

- **`C4Context` and `C4Container` syntax does not render on GitHub**: the C4 extension isn't in GitHub's bundle ([community discussion](https://github.com/orgs/community/discussions/197898)). House style: plain `flowchart` styled as C4.
- **`architecture-beta` renders but with only 5 built-in icons** (cloud, database, disk, internet, server); Iconify packs aren't registered ([discussion](https://github.com/orgs/community/discussions/146647)). The beta rule applies anyway: don't use it.
- **Beta types (`xychart-beta`, `block-beta`, `architecture-beta`) may break on GitHub's silent version bumps**: never in durable docs.
- **`<br/>` works in flowchart node labels** on GitHub (htmlLabels enabled), but not reliably in sequence diagram text ([#3011](https://github.com/mermaid-js/mermaid/issues/3011)). Other HTML tags: don't.
- **A parse error shows as an error box** in the rendered view, visible in the PR preview. That is why the preview is the gate.
- **Interactivity is sanitized**: `click` handlers and links don't function in GitHub's rendering. Don't rely on them.

## 2. Label rules (universal Mermaid v11)

- Quote any label containing punctuation: `A["Text with (parens)"]`, `B["Cost: $50"]`, `C["User's profile"]`. Parens, colons, `$`, and apostrophes break unquoted ([flowchart syntax](https://mermaid.js.org/syntax/flowchart.html)).
- v11 parses labels as Markdown (breaking change from v10): `_underscores_` italicize. Quote to keep literals: `A["_literal_"]`.
- Raw `<`, `>`, `&` have **no reliable escape**: content from an angle bracket on can vanish or render as entity text ([#7016](https://github.com/mermaid-js/mermaid/issues/7016), [#7015](https://github.com/mermaid-js/mermaid/issues/7015)). Write words instead.
- Backslashes and escaped Markdown (`\*`, `\_`) get mangled: no code snippets, regex, or math in labels.
- Avoid multi-codepoint emoji in labels ([#4465](https://github.com/mermaid-js/mermaid/issues/4465)).
- Never bare lowercase `end` as a node ID (parses as block-end); use `END` or `endNode`. Avoid `class`, `style`, `call`, `graph` as IDs. No numeric-only IDs (`n1`, not `1`).
- Long unbroken tokens overflow horizontally; nodes don't always grow for long labels ([#7354](https://github.com/mermaid-js/mermaid/issues/7354)). Keep labels short.

## 3. Edges (flowchart)

- `A -->|label| B` labeled · `A -.-> B` dotted · `A ==> B` thick · extra dashes (`A ---- B`) stretch a link across more ranks.
- Edge labels get background boxes that can overlap nodes and edges ([#2793](https://github.com/mermaid-js/mermaid/issues/2793)): keep them at 30 characters or fewer, ideally 1 to 3 words.
- `linkStyle 3 stroke:#f66,stroke-width:2px;` styles by edge index; escape commas in style values as `\,`.

## 4. Subgraphs

- `direction` inside a subgraph is **ignored if the subgraph has any external edge** ([#6438](https://github.com/mermaid-js/mermaid/issues/6438)); nested subgraph direction is silently ignored ([#6785](https://github.com/mermaid-js/mermaid/issues/6785)).
- Edges to subgraph IDs work (`sg1 --> sg2`) but layout may mispredict when a subgraph holds only subgraphs ([#5059](https://github.com/mermaid-js/mermaid/issues/5059)).
- Long or multi-line subgraph titles collide with the first node row ([#3806](https://github.com/mermaid-js/mermaid/issues/3806), [#5568](https://github.com/mermaid-js/mermaid/issues/5568)): keep titles to about 4 words.
- Unstyled subgraphs get the theme default fill (pale yellow on light): style explicitly, e.g. `style sgId fill:#f8fafc,stroke:#64748b,color:#1e293b`.

## 5. Sequence diagrams

- First line exactly `sequenceDiagram` (case-sensitive).
- Arrows: `->>` solid sync · `-->>` dotted return · `-x` lost · `-)` fire and forget.
- `participant X as Long Name` (alias required for names with spaces); `actor` for humans. Source order = display order.
- Every `loop`, `alt` (plus `else`), `opt`, `par` (plus `and`), `critical`, `break` needs `end`; `autonumber` can't appear inside blocks.
- Notes: `Note left of A:` / `Note right of B:` / `Note over A,B:`. **No `;` in note or message text** (statement separator, hard parse error). Keep messages single line.
- Note rectangles don't grow for their text: a long note over adjacent participants overflows. Span more participants (`Note over First,Last`) or shorten.
- `box <color> <Name>` groups participants. **No parens in the name**: the color leaks into the title as literal text. Use a middle dot.
- `classDef` and `class` do NOT work in sequence diagrams ([#523](https://github.com/mermaid-js/mermaid/issues/523)): color via `box` and `rect rgb(...)` bands only. Use **translucent rgba** (`box rgba(37,99,235,0.14) Name`) so tints work on both themes.
- `create participant X` / `destroy X` must sit immediately before the first or final message naming X ([#4833](https://github.com/mermaid-js/mermaid/issues/4833)).

## 6. stateDiagram-v2

- Transition labels after `:`, 1 to 3 words; long labels float ambiguously between states.
- A hub state with many inbound transitions becomes a spider web: table for the full matrix, diagram for the happy path.

## 7. Type selection and stability

| Type                   | Use when                              | Avoid when                                | On GitHub                  |
| ---------------------- | ------------------------------------- | ----------------------------------------- | -------------------------- |
| `flowchart`            | components plus flow, C4-style views  | more than ~12 nodes (split)               | stable, the default choice |
| `sequenceDiagram`      | ordered interaction, runtime views    | more than 7 participants or ~20 messages  | stable                     |
| `stateDiagram-v2`      | status lifecycles                     | full transition matrices                  | stable                     |
| `erDiagram`            | entities plus cardinality             | attribute-complete schemas (code is SSOT) | stable                     |
| `gantt`                | dated phases                          | fuzzy roadmaps (bullets win)              | stable                     |
| `pie`                  | one share of a whole, 6 slices max    | comparisons                               | stable                     |
| `timeline` / `mindmap` | milestones / brainstorms              | anything normative                        | stable                     |
| `C4Context` etc.       |                                       |                                           | **does not render**        |
| `*-beta`, `kanban`     |                                       | durable docs                              | unstable, do not use       |

## 8. Theming

- `%%{init: {"theme":"base","themeVariables":{...}}}%%` works but **pins one look for both GitHub themes**: don't, unless deliberately single-look. Only `base` accepts themeVariables; keys and values double quoted.
- Prefer `classDef` classes (pastel `fill:` plus dark pinned `color:`); see the house palette in [SKILL.md](../SKILL.md). `:::name` shorthand applies a class inline; `style nodeId ...` only for one-off exceptions.
- Line-style semantics beat color: `==>` primary path, `-.->` async or external, `-->` everything else. Legible on any theme, colorblind-safe.
- classDef `color:` can theoretically be overridden by `!important` theme CSS in some paths ([Quarto #6209](https://github.com/quarto-dev/quarto-cli/discussions/6209)): one more reason the PR preview in both themes is the gate.

## 9. Size

- `useMaxWidth:true` (default) shrinks but never grows: a diagram that is naturally very wide renders microscopic in GitHub's ~800px column. More than ~12 nodes or unreadably small text → split or restructure.
- Renderer limits: `maxTextSize` 50,000 chars, `maxEdges` 500 ([#5042](https://github.com/mermaid-js/mermaid/issues/5042)). You'll hit readability limits long before these.

**Key docs:** [flowchart](https://mermaid.js.org/syntax/flowchart.html) · [sequence](https://mermaid.js.org/syntax/sequenceDiagram.html) · [state](https://mermaid.js.org/syntax/stateDiagram.html) · [ER](https://mermaid.js.org/syntax/entityRelationshipDiagram.html) · [theming](https://mermaid.js.org/config/theming.html) · [GitHub Mermaid docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams)
