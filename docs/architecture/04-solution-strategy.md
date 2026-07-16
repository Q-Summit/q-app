# 4 · Solution strategy

<!-- arc42 section 4: the few approaches that shape the whole system. -->

How the goals in [section 1](01-introduction-and-goals.md) and the constraints in [section 2](02-constraints.md) translate into the decisions everything else follows:

| Approach | Driven by |
| --- | --- |
| One shared API, three persona-split surfaces; authorization lives in the API, never in a client | Three personas on one data model ([section 3](03-context-and-scope.md)); attendee and partner experience (Q2, Q3 in [section 10](10-quality-requirements.md)) |
| Modern, well-supported stack; one language across all surfaces | Volunteer turnover; onboarding from the repo alone (Q4 in [section 10](10-quality-requirements.md)) |
| Free tiers first; every paid or vendor-specific choice lands as an ADR first | Near-zero budget; reviewable decisions ([section 9](09-architecture-decisions.md)) |
| Features ship in slices; scope bends, the date does not | Hard annual deadline |
| Docs as code: sketches, ADRs, and the same-PR rule (docs first-class, never catch-up) | Maintainability across turnover (Q4); portfolio goal |

Each row is strategy, not implementation: the concrete stack fills the later chapters as ADRs are accepted.
