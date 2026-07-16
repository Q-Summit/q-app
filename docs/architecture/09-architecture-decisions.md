# 9 · Architecture decisions

<!-- arc42 section 9: index over ../decisions/. -->

| # | Decision | Status |
| --- | --- | --- |
| [0001](../decisions/0001-github-only-idea-workflow.md) | GitHub-only idea workflow, docs as code | Accepted |

## Decisions we already know we owe

Implied by the context view and constraints; each becomes an ADR PR when the work that needs it starts:

- Identity and roles across the three surfaces (one auth system?)
- Database choice
- Push notification infrastructure
- Monorepo layout and tooling
- Ticketing system integration
- Object storage / CDN for uploaded assets
- Deployment topology and release process (fills [`07-deployment.md`](07-deployment.md))
- Mobile runtime (Expo is a candidate among alternatives; not decided)
- Hosting and edge runtime (Cloudflare Workers/Pages/R2 are candidates among alternatives; not decided)
- Shared API host / framework (fills topology in context; pairs with deployment ADR)
