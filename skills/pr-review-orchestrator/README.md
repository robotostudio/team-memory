# pr-review-orchestrator

A Claude Code skill that runs a multi-agent review on a GitHub PR and posts the result as one review with inline, line-anchored comments. Nothing is posted without an explicit yes.

What happens on "review PR #123":

1. Pulls the PR metadata and saves the diff.
2. Finds the linked Linear ticket (branch name, title, body), confirms it with you, and pulls the full ticket via Linear MCP. No MCP? Open the ticket in Linear, hit "Copy as prompt", paste it, and the skill uses that instead.
3. Dispatches 4 to 6 reviewer agents in parallel (code quality, security, database, React, Next.js), each briefed with the project conventions from CLAUDE.md and the ticket digest. Agents whose file globs aren't in the diff are skipped.
4. While they run, it checks out the PR head in a /tmp worktree, starts the dev server, and walks the ticket's acceptance criteria in a headed browser via agent-browser.
5. Consolidates findings into severity buckets plus a coverage map: each ticket requirement marked solved, partial, or missing, with evidence, and any diff change that has no basis in the ticket flagged as out of scope.
6. Shows you the humanized draft and asks before posting a single review with inline comments.

## Install

```bash
npx skills add robotostudio/pr-review-orchestrator
```

## Prerequisites

- `gh` CLI authenticated with access to the repos you review
- Linear MCP connected (optional; the skill falls back to a pasted "Copy as prompt" ticket)
- `agent-browser` for runtime verification (the skill installs it on first use if missing)
- voltagent plugin agents (`voltagent-qa-sec:*`, `voltagent-lang:*`) are preferred; the skill substitutes built-in reviewers when they're missing

## Usage

Say "review PR #123" or paste a PR URL. The skill asks about the Linear ticket, runs the review, and presents the draft. Reply "yes" to post, "edit" to adjust, anything else to stop. It never approves or requests changes on its own; the review is always a comment unless you say otherwise.

## Layout

- `SKILL.md`: the orchestration playbook (8 phases)
- `resources/agent-briefings.md`: prompt templates for each reviewer agent
- `resources/report-template.md`: shapes for the inline comment bodies and the summary
