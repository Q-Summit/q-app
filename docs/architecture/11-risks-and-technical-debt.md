# 11 · Risks and technical debt

<!-- arc42 section 11: known risks and consciously taken shortcuts. -->

## Risks

| # | Risk | Mitigation |
| --- | --- | --- |
| R1 | Yearly team turnover drains knowledge | Docs as code and the same-PR rule; Q4 in [section 10](10-quality-requirements.md) |
| R2 | Peak load during the two event days breaks core flows | Q1 in [section 10](10-quality-requirements.md); resilience rules accumulate in [section 8](08-concepts.md) |
| R3 | Mishandling participant data (GDPR) | Q5 and Q6 in [section 10](10-quality-requirements.md); parked capabilities in [section 2](02-constraints.md) |

## Technical debt

- [Section 7](07-deployment.md) is a stub until the deployment ADRs land; Q1 (reliability) depends on it.
- Every entry in the owed-decisions list in [section 9](09-architecture-decisions.md) is debt until its ADR is accepted.

Add an entry when a PR knowingly takes a shortcut; remove it in the PR that pays it off.
