---
name: ship-pr
description: Commit all changes, push to remote, create a draft GitHub PR, and sync with Linear (attach PR link, move ticket to In Review). Use when user says "ship", "ship PR", "create draft PR", "push and PR", "open PR", or invokes /ship-pr.
user-invocable: true
---

# Ship PR

Commit all changes, push to remote, create a draft pull request, and sync everything with Linear.

## Context Awareness

Before executing each step, check if the conversation already has the needed information (e.g., ticket details, git status). If it does, skip redundant commands and API calls — but NEVER skip user confirmations or gates defined within a step.

## Step 1: Resolve the Linear Ticket

Linear integration is **mandatory**. The ticket provides context for the PR title, body, and post-PR updates. This step MUST succeed before continuing.

**A. Get the ticket ID.**
- If the user provided an argument (e.g., `/ship-pr TRA-573`), use that ticket ID directly.
- If no argument was provided, check the conversation context for a Linear ticket already discussed or fetched.
  - If found: use the **AskUserQuestion** tool to confirm: `Proceed with <ticket-id>: <title>? (yes / or enter a different ticket ID)`
  - If not found: **STOP** with: `No ticket ID found. Re-run with /ship-pr <ticket-id>`

**B. Fetch the ticket.**
- If the ticket was already fetched in this conversation, use the existing details.
- Otherwise, call the Linear MCP tool to fetch the ticket and retrieve its **title**, **description**, **current status**, and **URL**.
- On success: log `Found <ticket-id>: <title>` and continue immediately. Do NOT ask for confirmation.
- On failure (bad ID, MCP unavailable, auth error, any error): **STOP the skill entirely**. Report the error and tell the user to re-run with a valid ticket ID.

## Step 2: Git Status & Diff

1. Run `git status` and `git diff HEAD` (can be parallel).
2. If the working tree is clean (no changes to commit), **STOP the skill**. Inform the user there is nothing to commit.

## Step 3: Commit

1. Stage all changes (including untracked files). Before staging, check for sensitive files (`.env`, credentials, secrets, API keys). If found, warn the user and exclude them.
2. Commit with a message following `docs/GIT_CONVENTIONS.md` conventions.
3. If changes are logically distinct enough to warrant multiple commits, split them. Otherwise, one commit is fine.

## Step 4: Push

1. Derive `{owner}/{repo}` from `git remote get-url origin`.
2. Run `gh api repos/{owner}/{repo} --jq '{push: .permissions.push, private: .private}'`.
   - If error or `push: false`: report which account is active (`gh api user --jq '.login'`) and that it lacks push access. **STOP**.
3. If the repo is **public** and `push: true`: confirm with the user via **AskUserQuestion**: "Active account is `{username}` — push to `{owner}/{repo}`?" **STOP** if the user declines.
4. Push branch to remote with `git push -u origin HEAD`.
5. If push fails (auth error, rejected, protected branch), report the error and **STOP**.

## Step 5: Create Draft PR

1. Run `gh pr create --draft`.
2. **PR title:** `<ticket-id>: <prefix>: <short description>`
   - Prefix: `feat`, `fix`, `style`, `refactor`, `chore`, `docs`
   - Example: `TRA-573: feat: add \`HeroSection\` component`
3. **PR body** (use HEREDOC):
```
## Problem / Intent
[from Linear ticket description]

## Approach
[high-level solution concept from the diff]

---
Ticket: [<ticket-id>](<ticket URL retrieved in Step 1>)
```
4. Wrap code/component names in backticks in both title and body.
5. Do NOT include: file change summaries, test plan checklists, "Generated with Claude Code" footers, or any sections beyond what's defined above.
6. If `gh pr create` fails (e.g., PR already exists for this branch, auth error, no upstream), report the error and **STOP**.

## Step 6: Update Linear Ticket

After the PR is created (can be parallel):
1. Attach the PR URL to the Linear ticket as a link. Use the exact PR title as the link title.
2. Move the ticket status to **"In Review"**.
3. If either Linear update fails, warn the user but do NOT roll back the PR.