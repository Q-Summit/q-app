# 0002 · Expo for the attendee mobile app

- **Status:** Accepted
- **Date:** 2026-07-16
- **Sketch/issue:** None (owed decision from [`09-architecture-decisions.md`](../architecture/09-architecture-decisions.md))

## Context

The attendee surface is a mobile app for iOS and Android. Constraints push us toward one language across mobile, web, and API, a modern well-supported stack for a volunteer team with yearly turnover, and free tiers first. Expo has been listed as a directional candidate only; sketches that need a real mobile package cannot start until this is decided.

## Considered options

1. **Expo (managed workflow, TypeScript)**: React Native with Expo's tooling for builds, OTA updates, and store submission. Strongest pro: one TypeScript skill set shared with future web and API work, and Expo removes most native-build ceremony for a student team. Strongest con: when we need a native module Expo does not support, we take on config-plugin or prebuild complexity.
2. **Bare React Native (no Expo)**: Full control of native projects. Strongest pro: no Expo layer between us and the native toolchain. Strongest con: Xcode, Android Studio, and release plumbing fall on volunteers every year; onboarding cost is high for the value we get at this stage.
3. **Flutter**: One codebase, strong UI kit. Strongest pro: polished mobile DX and performance. Strongest con: Dart splits the stack from TypeScript web and API work and fights the "one language" constraint.

## Decision

Option 1: Expo with TypeScript for the attendee app (iOS and Android).

It matches the one-language constraint, keeps store builds and updates approachable for a volunteer team, and is the candidate the architecture docs already pointed at. We stay on the managed workflow until a concrete feature forces a documented exception (config plugin or bare workflow), which would be a follow-up ADR if it changes the default.

## Consequences

- Attendee mobile work may target Expo; adding an `apps/` (or equivalent) package still waits on the **monorepo layout** ADR.
- Partner and organizer surfaces stay web; this ADR does not choose a web framework.
- Push notifications, auth, and offline strategy remain separate owed ADRs; Expo is the runtime, not those choices.
- Revisit if: Expo blocks a required native capability we cannot solve with a config plugin, or the team standardizes on a different mobile stack for reasons that outweigh the one-language rule.
