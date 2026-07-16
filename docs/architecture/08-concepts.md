# 8 · Crosscutting concepts

<!-- arc42 section 8: rules that hold across features. -->

## Domain and data model

The canonical entity model. Empty until the first feature ships; grown entity-by-entity by shipping PRs and kept whole here (sketches only describe their _changes_ to it).

## Authorization

Rule: every API capability maps to exactly one persona matrix row. Aggregate rules accumulate here as features ship (for example, partners read only resources they own).

The persona matrix in a sketch is the scoping and review tool: the right shape for "who can do what" at the feature level. It is **not** the authoritative access-control spec. Finer rules (per-record ownership, field-level visibility, consent-gated fields) belong here as explicit rules, not implied by a three-row table. When a sketch's matrix cannot express an access rule, that rule is written here.

## Offline and caching

Empty until a feature needs durable offline or caching rules.

## Notifications

Empty until a feature introduces notifications.
