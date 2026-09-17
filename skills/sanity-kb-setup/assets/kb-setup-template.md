# Knowledge Base setup: {client}

Generated from {repo} on {date}. Sections 1 to 3 can be created with the Sanity CLI (see the skill's `references/cli.md`) or copied into the Context dashboard. Section 6 is dashboard-only.

- **Organisation:** {org id}
- **Knowledge Base id:** {filled in after creation}

## 1. New knowledge base

- **Title:** {short title. Letters, numbers and spaces only; some tools reject `&`}
- **Purpose:**
  ```
  Answer questions from {who asks} about {client}.
  Lead with: {three or four subjects}.
  Leave out: {what should not be indexed at all. Never list content whose claims need checking}.
  ```

## 2. Sources

### Dataset

- **Project:** {project id}
- **Dataset:** {dataset name}
- **Query:**
  ```groq
  {query}
  ```
- **Documents matched:** {count, or "unknown" and why}
- **Fallback query** if the dashboard rejects `pt::text()` or conditional projections:
  ```groq
  {same filter, raw fields only}
  ```

### Files

| File | Path | Authority for |
|---|---|---|

Files never re-sync. Delete and re-upload on every change.

### Website

- **URL:** {public URL, or "none" and why}

## 3. Build

Build with no instructions, so they can't hide a conflict. A build still misses some conflicts, so read the entries afterwards: `npx sanity context build <kb-id> --watch`, or **Build entries** in the dashboard.

## 4. Expected outline

- {topic} [core | peripheral]

## 5. After the first build

- Compare the real outline with section 4. A missing topic means a missing source or a purpose that doesn't reach it.
- Read the entries. For each disagreement in section 10, note which claim the entry kept and whether the build raised an issue.
- A person picks the winner of each conflict. Resolve those picks, which creates the instructions. Don't write instructions by hand first.
- Correct the losing claims in the source documents, publish, refresh, then rebuild.

## 6. MCP endpoint

- **Title:** {title}
- **Name:** {lowercase-with-hyphens. Cannot be changed later}
- **Instructions:** leave empty
- **Content source:** this Knowledge Base only. Do not add the dataset.
- **URL once created:** `https://api.sanity.io/v1/context/organizations/{org-id}/mcp/{name}`

## 7. Type roles

| Type | Role | Included | Reason |
|---|---|---|---|

## 8. Fields left out

| Type | Field | Reason | Could hide a conflict? |
|---|---|---|---|

## 9. Decisions for a person

- **Homepage:** {included or excluded, and why}
- {other judgement calls}

## 10. Where conflicts are likely

- {facts stated in more than one place, with each location}

## 11. Build results

- **Built:** {lastChangedAt}
- **Open issues:** {count}
- **Outline compared with section 4:** {missing or unexpected topics}

| Fact | Knowledge Base says | Other claim | Entries | Severity |
|---|---|---|---|---|

- **Expected in section 10 but not raised:** {conflicts the build missed, to check on the live page}

## 12. Resolutions

- **Chosen by:** {person} on {date}

| Fact | Winner | Kept or accepted | Source documents corrected |
|---|---|---|---|

- **After rebuild:** {open conflicts, suggestions and gaps left}
