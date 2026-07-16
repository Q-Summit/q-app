#!/usr/bin/env bash
# One-time setup of the label scheme from docs/feature-workflow.md.
# Requires: gh CLI authenticated against the repo.
#
# Deliberately minimal: everything else (under discussion, sketched, in build)
# is derivable from GitHub-native state, open/closed issues and linked PRs.
set -euo pipefail

create() { gh label create "$1" --color "$2" --description "$3" --force; }

# Intake
create "idea"                "1d76db" "Created via the Idea template"
create "bug"                 "d73a4a" "Created via the Bug template"

# Personas (fixed set, one per surface)
create "persona: attendee"   "0e8a16" "Touches the attendee app"
create "persona: partner"    "5319e7" "Touches the partner platform"
create "persona: organizer"  "fbca04" "Touches the organizer tools"

# Triage outcomes that GitHub state can't express
create "accepted"            "2ea44f" "Triage said yes; sketch pending or underway"
create "parked"              "9e9e9e" "Deliberately on hold; blocker noted in a comment"

echo "Labels created."
