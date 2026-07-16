# q-app

The **Q-Summit Conference App**: the platform for [Q-Summit](https://q-summit.com), Germany's largest student-organized startup and innovation conference.

[![License: PolyForm NC 1.0.0 plus Q-Summit terms](https://img.shields.io/badge/License-PolyForm%20NC%20%2B%20Q--Summit%20terms-blue.svg)](./LICENSE.md) [![Commercial license available](https://img.shields.io/badge/Commercial%20license-available-brightgreen.svg)](./COMMERCIAL.md)

Three surfaces on one shared backend:

| Surface          | Persona                       | Form                |
| ---------------- | ----------------------------- | ------------------- |
| Attendee app     | Participants                  | Mobile, iOS/Android |
| Partner platform | Sponsors and startup partners | Web                 |
| Organizer tools  | Core team and helpers         | Web, internal       |

## Getting started

```sh
pnpm run setup
```

One command after cloning: it installs the tooling, activates the git hooks, and runs the structural docs check. Day to day, run `pnpm run check` before you finish (validator, markdownlint, cspell, prettier). Then read [`docs/README.md`](./docs/README.md), the map of where every kind of information lives.

## License

Source-available under the [PolyForm Noncommercial License 1.0.0 with Q-Summit terms](./LICENSE.md). Free for non-profits (student conferences, universities, charities, and similar); commercial use needs a license. Who pays, who does not, and how to reach us is in [`COMMERCIAL.md`](./COMMERCIAL.md). Every deployment must keep the "Powered by Q-Summit" attribution ([`NOTICE`](./NOTICE)).

## Contributing

Start with [`CONTRIBUTING.md`](./CONTRIBUTING.md) and the [docs](./docs/). Work moves from a GitHub issue to a sketch to code, and every change lands through a pull request. Your first PR asks you to sign a one-time [CLA](./CLA.md); you keep the copyright to your work. Please follow the [Code of Conduct](./CODE_OF_CONDUCT.md). To report a security problem, see [`SECURITY.md`](./SECURITY.md).

The platform is designed to handle personal data of attendees and partners. If you self-host it, you are the data controller: see [`PRIVACY.md`](./PRIVACY.md) for what that means.
