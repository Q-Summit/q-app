# 3 · Context and scope

<!-- arc42 section 3: C4 Context level, Mermaid (renders on GitHub). -->

## System context

```mermaid
flowchart LR
  A([Attendee]) --> APP["Attendee app<br/>Expo · iOS/Android<br/>attendees only"]
  P([Partner]) --> PW["Partner platform<br/>web<br/>partners only"]
  O([Organizer / helper]) --> ORG["Organizer tools<br/>web<br/>internal only"]

  subgraph platform["Q-Summit Platform"]
    APP --> API["Shared API<br/>(ADR owed)"]
    PW --> API
    ORG --> API
    API --> DB[("Database<br/>(ADR owed)")]
    API --> OBJ[("Object storage<br/>(ADR owed)")]
  end

  TIX["Ticketing system<br/>(external, TBD)"] -.->|"integration TBD"| API
  PUSH["Push delivery<br/>(vendor TBD)"] -.-> APP

  classDef surface fill:#dbeafe,stroke:#2563eb,color:#172554
  classDef api fill:#ede9fe,stroke:#7c3aed,color:#1e1b4b
  classDef store fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef external fill:#fef9c3,stroke:#ca8a04,color:#713f12
  class APP,PW,ORG surface
  class API api
  class DB,OBJ store
  class TIX,PUSH external
  style platform fill:#f8fafc,stroke:#64748b,color:#1e293b
```

_All three surfaces cross the shared API. The attendee app runtime is Expo ([ADR-0002](../decisions/0002-expo-attendee-mobile.md)). Database, object storage, ticketing, and push are not decided deployments; each needs an ADR before first use. Dotted edges are external integration points, not part of the platform._

## Scope notes

- **One shared API, three consumers.** No surface talks to the database directly; persona-based authorization lives in the API.
- **External systems** (ticketing, push delivery) and undecided internals (database, auth, object storage layout) each require an ADR before first use; see [section 9](09-architecture-decisions.md).
- **Out of scope for now:** post-conference and year-round features; anything depending on parked capabilities (see [section 2](02-constraints.md)).

<!-- Container-level view (C4 L2) gets added here when the first
     implementation ADRs land (database, auth, monorepo layout). -->
