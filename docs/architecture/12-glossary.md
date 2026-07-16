# 12 · Glossary

<!-- arc42 section 12: shared vocabulary. -->

The terms the docs, issues, and sketches assume you know. Personas come first because everything else is framed around them. Domain terms land here when the first features that need them ship.

## Personas

| Term | Meaning |
| --- | --- |
| **Attendee** | A conference participant. Uses the mobile app (attendees only). One of the three personas. |
| **Partner** | A sponsor or startup partner. Uses the partner web platform (partners only; not open public). One of the three personas. |
| **Organizer** | Core team and helpers. Use the organizer tools (internal only). One of the three personas. |
| **Persona** | One of the three user groups above. Every idea, sketch, and review is framed in terms of what each persona can do and see. |
| **Surface** | One of the three product front-ends, one per persona: attendee app, partner platform, organizer tools. None is an open public site; access is persona-gated. All share one backend. |

## Process and docs

| Term | Meaning |
| --- | --- |
| **Persona matrix** | The table in a sketch listing, per persona, what they can do and what they see. Starting point for authorization; the authoritative rules live in [`08-concepts.md`](08-concepts.md), not the matrix. |
| **Sketch** | A one-page feature decision in [`../sketches/`](../sketches/): what we build and how it runs on the architecture we have. Frozen once shipped. |
| **ADR** | Architecture Decision Record in [`../decisions/`](../decisions/): a system-wide decision chosen among alternatives. Append-only. |
| **arc42** | The standard architecture doc template ([arc42.org](https://arc42.org/overview)) structuring `architecture/`. Always describes the system as it works right now. |
| **C4** | A way to describe software at four zoom levels (context, container, component, code). Our diagrams are plain flowcharts styled at the context/container level. |
| **Parked capability** | A capability deliberately on hold (currently: scraping or bulk-parsing career data such as LinkedIn or CVs, pending legal review). Must not be a dependency of any sketch. |

## Platform

| Term | Meaning |
| --- | --- |
| **Expo** | The decided runtime for the attendee mobile app (iOS/Android). See [ADR-0002](../decisions/0002-expo-attendee-mobile.md). Package layout still waits on the monorepo ADR. |
| **Shared API** | The single backend all three surfaces talk to. Hosting choice is an owed ADR. |
