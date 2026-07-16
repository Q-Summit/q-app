#!/usr/bin/env node
/**
 * Post-process CLA Assistant PR comments.
 *
 * Upstream CLA Assistant (a) skips creating a comment when everyone is already
 * signed, but (b) rewrites any prior bot comment into an "all signed"
 * celebration, and (c) only @-mentions unsigned committers when there are 2+.
 *
 * Policy: silence on success; on failure, @-ping each missing GitHub user and
 * list unlinked git authors (no @, names in backticks). Best-effort only: never
 * fail the workflow after CLA itself has already decided (see cla.yml).
 *
 * Required env: GITHUB_TOKEN, CLA_OUTCOME, PR_NUMBER, GITHUB_REPOSITORY
 * Optional env: PATH_TO_DOCUMENT, SIGN_PHRASE, COMMENT_MARKER
 */
const token = process.env.GITHUB_TOKEN;
const outcome = process.env.CLA_OUTCOME;
const pr = process.env.PR_NUMBER;
const repo = process.env.GITHUB_REPOSITORY;
const doc =
  process.env.PATH_TO_DOCUMENT ??
  "https://github.com/Q-Summit/q-app/blob/main/CLA.md";
const phrase =
  process.env.SIGN_PHRASE ??
  "I have read the CLA Document and I hereby sign the CLA";
// Must match pullRequestCommentContent.commentMarker for workflow "CLA Assistant" / job "cla".
const marker =
  process.env.COMMENT_MARKER ?? "<!-- cla-lite-bot:cla:CLA Assistant:cla -->";

if (!token || !outcome || !pr || !repo) {
  console.error(
    "Missing required env: GITHUB_TOKEN, CLA_OUTCOME, PR_NUMBER, GITHUB_REPOSITORY",
  );
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "q-app-cla-comment-policy",
};

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      ...headers,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function apiPaginate(path) {
  const items = [];
  let url = `https://api.github.com${path}${path.includes("?") ? "&" : "?"}per_page=100`;
  while (url) {
    const res = await fetch(url, { headers });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`GET ${url} -> ${res.status}: ${text}`);
    }
    const page = text ? JSON.parse(text) : [];
    items.push(...page);
    const link = res.headers.get("link") ?? "";
    const next = [...link.matchAll(/<([^>]+)>;\s*rel="next"/g)].map((m) => m[1]);
    url = next[0] ?? null;
  }
  return items;
}

function isOurs(body) {
  return (
    typeof body === "string" &&
    (body.includes(marker) || body.includes("Self-Hosted CLA Assistant bot"))
  );
}

/** Neutralize markdown in contributor-controlled git author names. */
function escapeUserText(s) {
  return "`" + String(s ?? "").replace(/`/g, "") + "`";
}

function commentBody(unsignedLogins, unresolvedNames) {
  const lines = [];
  if (unsignedLogins.length > 0) {
    lines.push(
      `${unsignedLogins.map((l) => `@${l}`).join(" ")}: please sign the CLA before this can merge.`,
      "",
    );
  }
  lines.push(
    "Before we can merge, every human committer must sign our",
    `[Contributor License Agreement (CLA)](${doc}).`,
    "You keep the copyright; signing lets Q-Summit keep the app free for",
    "non-profits while offering commercial licenses. One-time step.",
    "",
  );
  if (unresolvedNames.length > 0) {
    const seem = unresolvedNames.length > 1 ? "seem" : "seems";
    const names = unresolvedNames.map(escapeUserText).join(", ");
    lines.push(
      `**${names}** ${seem} not to be a GitHub user.`,
      "You need a GitHub account to sign the CLA. If you already have one, [add the email used for these commits to your account](https://docs.github.com/en/account-and-profile/how-tos/email-settings/adding-an-email-address-to-your-github-account).",
      "",
    );
  }
  lines.push(
    "**Reply with exactly:**",
    "- - -",
    phrase,
    "- - -",
    "<sub>You can retrigger this bot by commenting **recheck** in this Pull Request.</sub>",
    "<sub>Posted by the **Self-Hosted CLA Assistant bot**.</sub>",
    marker,
  );
  return lines.join("\n");
}

async function deleteOurs(ours) {
  for (const c of ours) {
    await api(`/repos/${repo}/issues/comments/${c.id}`, { method: "DELETE" });
  }
}

async function upsertComment(ours, body) {
  if (ours.length > 0) {
    const [primary, ...dupes] = ours;
    await api(`/repos/${repo}/issues/comments/${primary.id}`, {
      method: "PATCH",
      body: { body },
    });
    for (const c of dupes) {
      await api(`/repos/${repo}/issues/comments/${c.id}`, { method: "DELETE" });
    }
    return "updated";
  }
  await api(`/repos/${repo}/issues/${pr}/comments`, {
    method: "POST",
    body: { body },
  });
  return "created";
}

try {
  const comments = await apiPaginate(`/repos/${repo}/issues/${pr}/comments`);
  const ours = comments.filter((c) => isOurs(c.body));

  if (outcome === "success") {
    try {
      await deleteOurs(ours);
      console.log(`removed ${ours.length} all-signed CLA comment(s)`);
    } catch (err) {
      // Best-effort: a green CLA must not be overturned by comment cleanup.
      console.error("failed to delete all-signed CLA comment(s):", err);
    }
    process.exit(0);
  }

  const commits = await apiPaginate(`/repos/${repo}/pulls/${pr}/commits`);
  const logins = [];
  const seenLogins = new Set();
  const unresolvedNames = [];
  const seenNames = new Set();

  for (const commit of commits) {
    const login = commit.author?.login;
    if (login) {
      if (login.endsWith("[bot]") || seenLogins.has(login)) continue;
      seenLogins.add(login);
      logins.push(login);
      continue;
    }
    // No linked GitHub user: keep the raw git author name (upstream CLA does the same).
    const name = commit.commit?.author?.name?.trim();
    if (!name || seenNames.has(name)) continue;
    seenNames.add(name);
    unresolvedNames.push(name);
  }

  const sigMeta = await api(
    `/repos/${repo}/contents/cla/signatures.json?ref=main`,
  );
  const sig = JSON.parse(
    Buffer.from(sigMeta.content, "base64").toString("utf8"),
  );
  const signedIds = new Set(sig.signedContributors?.map((e) => e.id) ?? []);
  const signedNames = new Set(
    (sig.signedContributors ?? []).map((e) => e.name).filter(Boolean),
  );

  const unsignedLogins = [];
  for (const login of logins) {
    const user = await api(`/users/${encodeURIComponent(login)}`);
    if (signedIds.has(user.id) || signedNames.has(login)) continue;
    unsignedLogins.push(login);
  }

  if (unsignedLogins.length === 0 && unresolvedNames.length === 0) {
    console.log(
      "CLA failed without resolvable unsigned humans; leaving comments",
    );
    process.exit(0);
  }

  const body = commentBody(unsignedLogins, unresolvedNames);
  try {
    const action = await upsertComment(ours, body);
    const who = [
      ...unsignedLogins,
      ...unresolvedNames.map((n) => `(unlinked: ${n})`),
    ].join(", ");
    console.log(`${action} CLA ping for: ${who}`);
  } catch (err) {
    // Best-effort: CLA must pass already fails the job when signatures are missing.
    console.error("failed to write CLA ping comment:", err);
  }
  process.exit(0);
} catch (err) {
  // Never fail the job for comment policy; signing status is owned by CLA Assistant.
  console.error(err);
  process.exit(0);
}
