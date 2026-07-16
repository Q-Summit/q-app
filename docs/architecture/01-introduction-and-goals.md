# 1 · Introduction and goals

<!-- arc42 section 1: what the system is, its goals, its stakeholders. -->

## What this is

The Q-Summit conference platform: three persona-split surfaces on one shared backend, for Germany's largest student-organized startup conference (~1,500 attendees, 30+ speakers, 50+ partners, annual, Mannheim).

| Surface | Persona | Form |
| --- | --- | --- |
| Attendee app | Conference participants (app is mandatory) | Mobile, iOS/Android; attendees only |
| Partner platform | Sponsor/startup partners | Web; partners only (not open public) |
| Organizer tools | Core team, helpers | Web; internal only |

## Top goals

1. **Reliable during the event.** Two days a year, everything must work.
2. **Clear for attendees.** Schedule, sessions, and key actions work in the app alone.
3. **Self-serve for partners.** Presence and participant contact happen on the platform, not via organizers.
4. **Maintainable across turnover.** A new team can take over from the repo alone; docs are part of the product (see [ADR-0001](../decisions/0001-github-only-idea-workflow.md)).
5. **Portfolio-grade.** Code and docs are public work samples for the people who build them.

[Section 10](10-quality-requirements.md) turns goals 1 to 4 into reviewable scenarios and adds privacy and authorization as standing review qualities. Portfolio is enforced by the docs-as-code workflow, not a runtime scenario.

## Stakeholders

| Who | Stake |
| --- | --- |
| Participants | Smooth conference experience; their data handled with care |
| Partners | Visibility, event management, contact with participants |
| Core team / divisions | Their processes (program, helpers, logistics) supported; they propose ideas via GitHub Issues |
| IT team | Buildable scope, learning, portfolio |
| Q-Summit e.V. | Continuity, reputation, licensing |
