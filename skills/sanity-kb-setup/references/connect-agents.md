# Stage 6. Connect coding agents

If the user only says "connect an agent", ask which kind they mean.

| Kind | Do |
|---|---|
| A coding agent, such as Claude Code, Cursor or Codex, reading the Knowledge Base while they work | This file |
| An agent inside their application, such as a support chatbot | Steps 1 to 3 so the endpoint works, then Sanity's guide at `https://www.sanity.io/docs/ai/sanity-context`. It needs an LLM provider and application code, which this skill doesn't build |

## The two values every agent needs

```
URL:    https://api.sanity.io/v1/context/organizations/<org-id>/mcp/<endpoint-name>
Header: Authorization: Bearer <organisation token with Context Viewer>
```

In Knowledge Base mode the endpoint serves two tools, `initial_context` and `knowledge_base_read`. Agents call `initial_context` first, as the server's own instructions say. The dashboard's ready-made setup prompt lists four, `initial_context`, `schema_explorer`, `groq_query` and `array_field_reader`, which are the GROQ mode tools. Trust what the endpoint returns in step 3, not that list.

## 1. The user creates the endpoint

The CLI can't. Walk the user through it.

1. Open `sanity.io/@<org-id>/context`.
2. Next to **MCP endpoints**, press **New**.
3. Name it with lowercase letters, numbers and hyphens, up to 64 characters. Sanity rejects `by-name` and any name made of `mcp` plus eight characters. The name goes in the URL and can't change later.
4. Pick this Knowledge Base as the **only** source. With a dataset source attached too, the endpoint runs in GROQ mode and ignores the Knowledge Base.
5. Leave the instructions empty.

## 2. The user creates the token

You can't create it and must never see it. Give the user these steps.

1. Open `sanity.io/manage`, choose the **organisation**, not a project, then **API**, then **Tokens**.
2. Add a token with **Context Viewer** permission only. A project token fails with a 403 and `contextGrantRequired`, however broad its permissions.
3. Create one token per tool, named after it, such as `kb-cursor`. A leaked token then breaks one tool.
4. Store it in an environment variable, never in a committed file.
   - Windows: `setx SANITY_ORGANIZATION_TOKEN "<token>"`, then fully restart the agent app.
   - macOS and Linux: add `export SANITY_ORGANIZATION_TOKEN="<token>"` to the shell profile, then restart the terminal.

A Context Viewer token reads every endpoint in the organisation, and hosted tools such as v0, Lovable and Replit store it on their servers. For client work, use the client's own organisation.

## 3. Confirm the endpoint serves this Knowledge Base

A working connection may still be the wrong Knowledge Base. In testing, an inherited `SANITY_CONTEXT_MCP_URL` pointed at another project's endpoint, and every check passed against the wrong content. Always write the URL out in full. Don't read it from an environment variable someone set earlier.

If the endpoint is already connected to you as MCP tools, call `initial_context` yourself. Otherwise use this one-off diagnostic request, tested on 2026-09-17.

```bash
curl -s -X POST "https://api.sanity.io/v1/context/organizations/<org-id>/mcp/<endpoint-name>" \
  -H "Authorization: Bearer $SANITY_ORGANIZATION_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"initial_context","arguments":{}}}'
```

Done when all four hold. `blocked.md` covers the HTTP errors.

1. The text contains ``Knowledge base id: `<kb-id>` `` with the id from `kb-setup.md`. A different id, or several, means the endpoint has the wrong sources for this setup. Sanity allows several Knowledge Bases on one endpoint, but then every question has to name the right one, so this skill uses one.
2. The response has no `"isError": true`. MCP reports a failed tool inside a successful response, so an HTTP 200 proves nothing.
3. With the body `{"jsonrpc":"2.0","id":1,"method":"tools/list"}`, the endpoint lists two tools. Four means GROQ mode, so go back to step 1.4.
4. `knowledge_base_read` with `{"knowledgeBase":"<kb-id>","paths":["<entry-path>"]}` returns a body that matches what stage 3 read.

## 4. Configure the agent

Claude Code, Cursor and Codex were checked against their docs on 2026-09-16, and the hosted tools on 2026-09-17. MCP settings change often, so the tool's own docs win where they differ.

### Claude Code

`.mcp.json` in the project. Claude Code keeps a project server inactive until the user trusts the workspace and approves that server, which it asks for when they next run `claude` there.

```json
{
  "mcpServers": {
    "<kb-name>": {
      "type": "http",
      "url": "https://api.sanity.io/v1/context/organizations/<org-id>/mcp/<endpoint-name>",
      "headers": { "Authorization": "Bearer ${SANITY_ORGANIZATION_TOKEN}" }
    }
  }
}
```

### Cursor

`.cursor/mcp.json` in the project, or `~/.cursor/mcp.json` for all projects.

```json
{
  "mcpServers": {
    "<kb-name>": {
      "url": "https://api.sanity.io/v1/context/organizations/<org-id>/mcp/<endpoint-name>",
      "headers": { "Authorization": "Bearer ${env:SANITY_ORGANIZATION_TOKEN}" }
    }
  }
}
```

Cursor's syntax is `${env:NAME}`, not `${NAME}`. A reported bug makes remote servers send the literal `${env:...}` string. On a 401, the user puts the token in the user-level `~/.cursor/mcp.json`, never in a project file that gets committed. Third-party pricing guides say MCP needs Cursor Pro or higher.

### Codex

`~/.codex/config.toml`, or `.codex/config.toml` in the repo. Codex reads the repo file only in a project the user has trusted.

```toml
[mcp_servers.<kb-name>]
url = "https://api.sanity.io/v1/context/organizations/<org-id>/mcp/<endpoint-name>"
bearer_token_env_var = "SANITY_ORGANIZATION_TOKEN"
```

### Hosted tools and any other agent

Every tool needs the same two values. Enter the endpoint URL as a direct remote server. Where the tool offers a choice of authentication, pick the bearer token option instead of OAuth, because Sanity Context has no OAuth flow. If the tool only offers custom headers, add one named `Authorization` with the value `Bearer <token>`. The token must travel in that header, never in a query string or a differently named header. The user pastes the token themselves.

| Tool | Steps |
|---|---|
| v0 | Open **Settings**, then **Integrations**, then **MCP server**, or open the **+** menu in the prompt form and choose **MCPs**. Add a custom server with the URL, choose **Bearer Token** and paste the token. v0 warns that remote MCP can raise the cost per message |
| Lovable | Open **Connectors**, press **+**, choose **MCP server**. Keep the **Direct** connection type and enter the URL. Choose **Bearer token or API key** instead of OAuth and paste the token |
| Replit | In the **Integrations** pane, add a custom MCP server with the URL, and add a custom header named `Authorization` with the value `Bearer <token>` |
| Any other agent | It needs support for a remote HTTP MCP server with a custom header. Give it the URL and the `Authorization` header, following the tool's own MCP docs |

## 5. Test inside the agent

Ask two or three questions whose answers you know from the content. A good answer calls `initial_context`, then `knowledge_base_read`, and cites sources. An answer with no tool calls came from the model's own knowledge.

Include a question that names something only this project has, such as a product name. A right answer confirms the agent reads this Knowledge Base.

To check a specific claim, ask "Is this text accurate: '<claim>'?". A Knowledge Base that is only Built or Reviewed gives unreliable verdicts. In testing it accepted a wrong promotion and doubted a correct cut-off time until the conflicts were resolved and the content fixed.

## Known limits of the answers

- A citation inside an entry can point at the wrong source document, so build no Studio field links from them.
- A build can add a claim no source makes. Stage 3 looks for those.
