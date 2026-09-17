#!/usr/bin/env node
/**
 * List the issues on a Sanity Context Knowledge Base.
 *
 *   node kb-issues.mjs <knowledge-base-id> [--status open|accepted|rejected] [--json]
 *
 * Run it from a Sanity project folder. It borrows the Sanity CLI installed in
 * that project and the CLI's login, so run `npx sanity login` first. Read-only.
 *
 * Issues are not in Sanity's public docs. They are `sanity.context.issue`
 * documents that `@sanity/client` reads through `client.context.issues`.
 */
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const API_VERSION = 'v2026-08-25'

const args = process.argv.slice(2)
const flag = (name) => {
  const index = args.indexOf(name)
  return index === -1 ? undefined : args[index + 1]
}
const knowledgeBaseId = args.find((arg, index) => !arg.startsWith('--') && !args[index - 1]?.startsWith('--status'))
const status = flag('--status')
const asJson = args.includes('--json')

if (!knowledgeBaseId) {
  console.error('Usage: node kb-issues.mjs <knowledge-base-id> [--status open|accepted|rejected] [--json]')
  console.error('Find the id with: npx sanity context list')
  process.exit(1)
}

async function loadCliCore() {
  const fromProject = createRequire(join(process.cwd(), 'package.json'))
  for (const entry of ['@sanity/cli/package.json', 'sanity/package.json']) {
    try {
      const fromCli = createRequire(fromProject.resolve(entry))
      return await import(pathToFileURL(fromCli.resolve('@sanity/cli-core')).href)
    } catch {
      // try the next entry
    }
  }
  console.error('Could not find the Sanity CLI in this folder. Run this from a project with `sanity` installed.')
  process.exit(1)
}

const { getGlobalCliClient } = await loadCliCore()

// After a network call, set process.exitCode and let Node finish. On Windows,
// process.exit() can crash Node while sockets close, and it can cut off piped output.
const knowledgeBase = await readKnowledgeBase()
if (knowledgeBase) await listIssues(knowledgeBase)

async function readKnowledgeBase() {
  try {
    const client = await getGlobalCliClient({ apiVersion: API_VERSION, requireUser: true })
    return await client.context.knowledgeBases.get(knowledgeBaseId)
  } catch (error) {
    console.error(`Could not read knowledge base "${knowledgeBaseId}": ${error.message}`)
    console.error('Check the id with `npx sanity context list`, and that `npx sanity login` is done.')
    process.exitCode = 1
    return null
  }
}

async function listIssues(knowledgeBase) {
  const client = await getGlobalCliClient({
    apiVersion: API_VERSION,
    requireUser: true,
    resource: { id: knowledgeBase.publicId, type: 'knowledge-base' },
    context: { organizationId: knowledgeBase.organizationId },
  })

  const issues = await client.context.issues.list(status ? { status } : undefined)

  if (asJson) {
    console.log(JSON.stringify({ knowledgeBase: summary(knowledgeBase), issues }, null, 2))
    return
  }

  console.log(`${knowledgeBase.title} (${knowledgeBase.publicId})`)
  console.log(`State: ${knowledgeBase.state}. Last built: ${knowledgeBase.lastChangedAt ?? 'never'}.`)
  console.log(`Showing ${issues.length} ${status ?? 'issues of any status'}.`)
  // Only compare like with like: the counter covers open issues, so count those in the list.
  if (!status || status === 'open') {
    const open = issues.filter((issue) => issue.status === 'open').length
    console.log(`${open} open in this list, which is the count to trust. Sanity's openIssueCount reads ${knowledgeBase.openIssueCount} and is often wrong.`)
  }
  console.log('')

  issues.forEach((issue, index) => {
    const content = issue.content ?? {}
    console.log(`${index + 1}. [${content.severity ?? 'unknown'}] ${content.kind ?? 'issue'}, ${issue.status}`)
    if (content.claimKey) console.log(`   Fact:      ${content.claimKey}`)
    if (content.currentClaim) console.log(`   KB says:   ${content.currentClaim}`)
    if (content.alternativeClaim) console.log(`   Other:     ${content.alternativeClaim}`)
    if (content.involvedScopes?.length) console.log(`   Entries:   ${content.involvedScopes.join(', ')}`)
    else if (content.scopePath) console.log(`   Entry:     ${content.scopePath}`)
    if (content.issue) console.log(`   Detail:    ${content.issue}`)
    if (content.suggestedFix) console.log(`   Next step: ${content.suggestedFix}`)
    console.log(`   Id:        ${issue._id}\n`)
  })
}

function summary(kb) {
  return {
    id: kb.publicId,
    title: kb.title,
    organizationId: kb.organizationId,
    state: kb.state,
    lastChangedAt: kb.lastChangedAt,
    openIssueCount: kb.openIssueCount,
    instructionCount: kb.instructionCount,
  }
}
