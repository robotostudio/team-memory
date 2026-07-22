---
name: prep
description: Bootstrap work on a Linear ticket — fetch ticket, create branch, mark in-progress, explore codebase, and plan implementation. Use when user says "prep", "start ticket", "begin work", "pick up ticket", or provides a Linear ticket ID to start working on.
user-invocable: true
---

# Prep

Bootstrap a Linear ticket for development: fetch ticket, create branch, mark in-progress, explore codebase, and produce an implementation plan. **No code changes are made.**

## Step 1: Resolve the Linear Ticket

**A. Get the ticket ID.**
- The ticket ID is a **required argument**. The user must provide it when invoking the skill (e.g., `/prep TRA-573`).
- If no argument was provided, respond with a friendly message and **STOP** — do not continue:
  > No ticket ID provided. Run `/prep` with your Linear ticket ID — e.g., `/prep TRA-573` — and I'll handle the rest.

**B. Fetch the ticket.**
- Call Linear MCP to fetch the ticket by its ID. Retrieve its **title**, **description**, **status**, **priority**, and **git branch name**.
- On success: log `Found <ticket-id>: <title>` and continue.
- On failure (bad ID, MCP unavailable, auth error): report the specific error and **STOP**. Tell the user to re-run with a valid ticket ID (e.g., `/prep TRA-573`). Do not prompt or retry.

## Step 2: Create Git Branch

**A. Ask for base branch.**
- Use the **AskUserQuestion** tool to ask:
  > Base branch? Options:
  > 1. `main` (press Enter)
  > 2. Current branch (`<show current branch name here>`)
  > 3. Type a specific branch name
- Option 1 (Enter/main): use `origin/main`.
- Option 2 (current): use `origin/<current-branch>`. If current branch has no remote tracking, use the local branch as base.
- Option 3 (custom): use `origin/<provided-name>`. Verify it exists with `git rev-parse --verify origin/<branch>`. If not found, try the local ref. If neither exists, report the error and ask again.

**B. Create and checkout the branch.**
1. Run `git fetch origin` to ensure the latest refs.
2. Use the **git branch name from the Linear ticket** (retrieved in Step 1) as the branch name. Do NOT generate your own branch name.
3. Run `git checkout -b <branch-name> <base-ref>`.
4. Log: `Created branch: <branch-name> from <base>`

## Step 3: Mark Ticket In Progress

- Update the ticket status to **"In Progress"** via Linear MCP.
- Log: `<ticket-id> moved to In Progress`

## Step 4: Explore & Understand

Now dig into the ticket and codebase. **Do NOT write any code or edit any files.**

1. **Parse the ticket** — extract what needs to change, the expected outcome, and any acceptance criteria or constraints from the description.
2. **Explore the codebase** — use the Explore agent or Grep/Glob/Read tools to find:
   - Relevant files, components, schemas, queries, or utilities
   - Existing patterns that relate to the work
   - Dependencies or upstream/downstream impacts
3. **Identify key files** — list the files that will likely need changes and why.

## Step 5: Draft Implementation Plan

Present a structured plan to the user:

```
## Implementation Plan — <ticket-id>: <title>

### Understanding
[1-2 sentence summary of what the ticket asks for]

### Approach
[High-level strategy for the implementation]

### Steps
1. [Concrete step with file paths]
2. [Next step...]
...

### Files to Modify
- `path/to/file.tsx` — reason
- `path/to/other.ts` — reason

### Files to Create (if any)
- `path/to/new-file.tsx` — purpose

### Risks / Open Questions
- [Anything unclear or worth flagging]
```

After presenting, ask: **"Want me to proceed with this plan, adjust anything, or stop here?"**

**CRITICAL:** Do NOT write code, create files, or make any changes. This skill is planning-only.
