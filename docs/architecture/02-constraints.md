# 2 · Constraints

<!-- arc42 section 2: organizational, technical, and legal constraints. -->

| Constraint | Consequence |
| --- | --- |
| Volunteer team, evenings-and-weekends capacity, yearly turnover | Modern, well-supported stack; docs land in the same PR as the change (not after) |
| Hard annual deadline (conference happens regardless) | Scope bends, date doesn't; features must be shippable in slices |
| Near-zero budget | Free tiers first; any paid service needs an ADR |
| One language across mobile, web, and API/storage | Hiring/onboarding simplicity; concrete vendors via ADR |
| Source-available license (PolyForm NC), CLA | See [`LICENSE.md`](../../LICENSE.md) and [`COMMERCIAL.md`](../../COMMERCIAL.md); public repo discipline |
| Personal data of ~1,500 participants, EU-based | GDPR by default; any feature processing career/contact data needs explicit consent design. Bulk processing of scraped/parsed career data (LinkedIn, CVs) is **parked pending legal review** and must not be a dependency of any sketch |
| English only | Code, docs, issues, commits |
| Stack candidates only until ADR | Attendee mobile runtime is Expo ([ADR-0002](../decisions/0002-expo-attendee-mobile.md)). Still candidates (not decisions): Cloudflare Workers/Pages/R2 for edge/hosting/objects; one shared API host. Each remaining candidate needs an accepted ADR before packages or vendor lock-in. See owed list in [`09-architecture-decisions.md`](09-architecture-decisions.md) |
