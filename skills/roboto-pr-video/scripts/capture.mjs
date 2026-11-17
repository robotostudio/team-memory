#!/usr/bin/env node
// Capture a real screen for the video (the source gate: the UI a PR changed is shown real).
//
//   node scripts/capture.mjs --url <URL> --out <file.png> [options]
//
//   --width 1440 --height 900   viewport in CSS px (default 1440×900)
//   --scale 2                   device scale (default 2, so text stays sharp when shown large)
//   --theme dark|light          prefers-color-scheme (default light)
//   --wait 2500                 ms to wait after load and after each action (default 2500)
//   --scroll <target>           scroll so the target sits 40px from the top before the shot
//   --click <target>            click a target (repeatable, in order): opens a menu, picks a filter, etc.
//   --hover <target>            hover a target before the shot
//   --element <target>          shoot just this element
//   --clip x,y,w,h              shoot just this viewport region (CSS px)
//   --full                      full page
//   --vercel-bypass <secret>    open a protected Vercel deployment (the project's "Protection Bypass for Automation"
//                               secret; or set VERCEL_AUTOMATION_BYPASS_SECRET)
//   --header "Name: value"      extra request header (repeatable)
//   --boxes <t1|t2|…>           print each target's box relative to the shot, in CSS px of the shot,
//                               so RobotoMark can be placed on a screenshot (multiply by the shot's display scale)
//
// A <target> is a CSS selector (starts with . # [ or contains a space or >) or else exact visible text.
// Prints the saved path and the boxes as JSON. Needs `bash scripts/setup.sh` once.
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const require = createRequire(join(homedir(), '.cache/roboto-pr-video/package.json'))
const { chromium } = require('playwright-core')

const args = process.argv.slice(2)
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def }
const all = (name) => args.flatMap((a, i) => (a === '--' + name ? [args[i + 1]] : []))
const url = opt('url'), out = opt('out')
if (!url || !out) { console.error('usage: capture.mjs --url <URL> --out <file.png> [options]'); process.exit(1) }
const width = +opt('width', 1440), height = +opt('height', 900), scale = +opt('scale', 2), wait = +opt('wait', 2500)

const isCss = (t) => /^[.#[]/.test(t) || /[ >]/.test(t) && !/^[A-Z]/.test(t)
// visible text matches whole and case-insensitively (labels are often uppercased by CSS)
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const find = (p, t) => (isCss(t) ? p.locator(t) : p.getByText(new RegExp('^\\s*' + esc(t) + '\\s*$', 'i'))).filter({ visible: true }).first()
const must = async (p, t) => { const el = find(p, t); if (!(await el.count())) { console.error(`target not found: ${t}`); process.exit(2) } return el }

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
})
const headers = Object.fromEntries(all('header').map((h) => [h.slice(0, h.indexOf(':')).trim(), h.slice(h.indexOf(':') + 1).trim()]))
const bypass = opt('vercel-bypass', process.env.VERCEL_AUTOMATION_BYPASS_SECRET)
if (bypass) Object.assign(headers, { 'x-vercel-protection-bypass': bypass, 'x-vercel-set-bypass-cookie': 'true' })
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale, colorScheme: opt('theme', 'light'), extraHTTPHeaders: headers })
const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => { console.error('load:', e.message); return null })
if (res && [401, 403].includes(res.status())) { console.error(`HTTP ${res.status()}: ${url} is behind a login (Vercel protection). Use the PR's own screenshots, or pass --vercel-bypass <secret>.`); process.exit(3) }
if (res && res.status() >= 400) console.error(`warning: HTTP ${res.status()} for ${url}`)
await page.waitForTimeout(wait)

for (const t of all('click')) {
  const el = await must(page, t)
  await el.scrollIntoViewIfNeeded().catch(() => {})
  await el.click({ timeout: 8000 }).catch(async () => { await el.evaluate((n) => n.click()) })
  await page.waitForTimeout(wait)
}
const scroll = opt('scroll')
if (scroll) {
  const y = await (await must(page, scroll)).evaluate((n) => n.getBoundingClientRect().top + scrollY)
  await page.evaluate((y) => scrollTo(0, Math.max(0, y - 40)), y)
  await page.waitForTimeout(wait)
}
const hover = opt('hover')
if (hover) { await find(page, hover).hover().catch(() => {}); await page.waitForTimeout(600) } else await page.mouse.move(2, 2)

let origin = { x: 0, y: 0 }
const shot = { path: resolve(out), animations: 'disabled' }
const element = opt('element'), clip = opt('clip')
if (element) {
  const el = await must(page, element); await el.screenshot(shot)
  const b = await el.boundingBox(); origin = { x: b.x, y: b.y }
} else if (clip) {
  const [x, y, w, h] = clip.split(',').map(Number); origin = { x, y }
  await page.screenshot({ ...shot, clip: { x, y, width: w, height: h } })
} else {
  await page.screenshot({ ...shot, fullPage: args.includes('--full') })
  if (args.includes('--full')) origin = { x: 0, y: -(await page.evaluate(() => scrollY)) }
}

const boxes = {}
for (const t of (opt('boxes', '') || '').split('|').filter(Boolean)) {
  const b = await find(page, t).boundingBox().catch(() => null)
  boxes[t] = b && { x: Math.round(b.x - origin.x), y: Math.round(b.y - origin.y), w: Math.round(b.width), h: Math.round(b.height) }
}
console.log(JSON.stringify({ saved: resolve(out), url: page.url(), cssSize: { width, height }, scale, boxes }, null, 2))
await browser.close()
