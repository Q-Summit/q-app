# Privacy and data responsibility

This is a developer-facing note, not a privacy policy for any specific event. It explains how the codebase treats personal data and what you take on if you run it.

## Personal data

The platform is designed to handle personal data of attendees and partners (names, contact details, registrations, and similar). Q-Summit's conference deployment is EU-based (on the order of 1,500 participants), so GDPR shapes the architecture by default. See [`docs/architecture/02-constraints.md`](./docs/architecture/02-constraints.md).

## If you self-host, you are the controller

The [license](./LICENSE.md) lets non-profits self-host at no cost. If you deploy this software for your event, then under GDPR **you** (the operating entity) are the data controller for the personal data you collect. That responsibility does not transfer to Q-Summit e.V., and it is not covered by the software license. You are responsible for, at minimum:

- a lawful basis for each kind of processing, and consent flows where consent is the basis;
- a privacy notice for your participants;
- data-subject rights (access, deletion, export) and retention limits;
- a data-processing agreement with each sub-processor you use (hosting, email, push, analytics).

## What the code aims to give you

The architecture is meant to make compliance possible, not automatic: persona-scoped access (see [`docs/architecture/08-concepts.md`](./docs/architecture/08-concepts.md)), consent-aware design for any feature that touches contact or career data, and no bulk processing of scraped or parsed career data (LinkedIn profiles, CV parsing), which is parked pending legal review and must not be a dependency of any feature.

## Reporting a data or security problem

For anything sensitive (exposed data, an access issue, a vulnerability), follow [`SECURITY.md`](./SECURITY.md). For questions about commercial use and data, email [app@q-summit.com](mailto:app@q-summit.com).
