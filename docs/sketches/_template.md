---
number: NNNN
title: <Feature name>
status: planned # planned | building | shipped | parked (merged to main = agreed; this field only tracks build progress)
idea: "#<issue number>"
owners: [<github handle>]
landed-in: [] # filled at ship: links into docs/architecture/
---

# NNNN · <Feature name>

<!-- One page. If it doesn't fit, it's probably two features.
     While the PR is open, this is a draft; merging means "this is what we'd
     build". After shipping, this file FREEZES; current truth lives in
     docs/architecture/. Delete the comments before opening the PR. -->

## What it is

<!-- One or two paragraphs. What exists when this ships that doesn't today? -->

## Persona matrix

<!-- Who can do what, who sees what. This is the STARTING POINT for authorization
     and reviews check code against it, but the authoritative access rules
     (per-record ownership, field-level visibility, consent gating) live in
     docs/architecture/08-concepts.md, not in this three-row table.
     Use "n/a" for personas the feature doesn't touch. -->

| Persona   | Can do | Sees |
| --------- | ------ | ---- |
| Attendee  |        |      |
| Partner   |        |      |
| Organizer |        |      |

## How it works

<!-- The user-visible flows, in words. A small Mermaid diagram if words don't cut it. -->

## Technical plan

<!-- How this runs on the architecture we HAVE. Concrete but rough.
     The five bullets below are prompts to answer, checked in review (CI does not
     gate on them). Answer each honestly; "None" is a fine answer where it fits.
     Do not leave a bullet as empty box-ticking. -->

- **Runs on:** <!-- which surface(s) and service(s), e.g. shared API, attendee app -->
- **Data model changes:** <!-- new/changed entities and fields, ownership, retention -->
- **API surface:** <!-- new/changed endpoints, who may call them (ties back to the matrix) -->
- **Reuses:** <!-- existing components, pipelines, ADRs this builds on -->
- **Forces new decisions:** <!-- capabilities no ADR covers yet → each becomes an ADR PR.
     "None" is a valid (and pleasant) answer. -->

## Out of scope

<!-- Explicit no-gos for the first version. -->

## Open questions

<!-- Things the PR review should resolve, or that block building. -->

## Effort guess

<!-- S / M / L, plus one line on what could make it bigger than it looks. -->

## Build checklist

<!-- Filled when status flips to `building`; checked off by implementation PRs. -->

- [ ] …
