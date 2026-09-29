---
name: company
description: Use when the human asks to boot, restart or check on software-factory's company, the named Claude sessions (ted, anite, sam, maya, lena, jon, rebecca, rex, nora, omar, quinn, iris) that build it in herdr tabs.
disable-model-invocation: true
---

# The company

Named Claude Code sessions, one herdr tab each, that build software-factory. A member's job, rules and skills are
built into its prompt from `members/` and `rules.md` when it starts; this file only boots the company.

Below, `company` is `bash <this skill's directory>/scripts/company`; `company help` lists every command.

## Boot

1. `test "${HERDR_ENV:-}" = 1`. The company lives in herdr tabs: outside herdr, stop and tell the human.
2. Ask the human with AskUserQuestion how many members may work at once. Options: 8 (recommended), 6, 10, 12. Only
   a working member spends tokens: an idle one, finished or waiting on a reply, stays open for free and never holds a
   slot. A wake past the cap starts when a working member finishes.
3. `company boot --cap <N>`. It starts ted, anite, sam and otto and prints the board. A member that "did not reach its
   prompt" is stopped at a dialog: read its tab and tell the human what it shows.
4. maya, the Plant owner:
   - A Plant session already running in its own tab is adopted, with its own yes: message it
     what's coming and wait for its ok. Then `company adopt maya <its claude pane> <its shell pane>`,
     `herdr agent prompt maya "/rename maya"`, and
     `herdr agent prompt maya "You are maya from now on: read <COMPANY_HOME>/prompts/maya.md and follow it."`
   - Otherwise: `company start maya`.
5. Tell the human, in two lines: ted (product and every decision) and anite (asks and status) are on Remote Control
   under their names; `company board` shows who is awake, on what, and what waits.

Every other member starts when a teammate first wakes it, and stays open after: `company done` clears its context
and leaves it idle for the next wake.

## Later

- The board: `company board`. The watch tab shows handoffs as they land on the left and `company dash --live` on the
  right: who needs the human, each ticket with who's on it, the team, who's down, what's held.
- A new cap: `company boot --cap <N>` again. It starts nobody who is already awake.
- Hold every landing: write the reason to `$COMPANY_HOME/hold`; `land.sh push` refuses until it's gone.
- Sounds: `$COMPANY_HOME/sounds/` (from sounds.sh) play on this Mac at boot, when a member needs the human, when the
  human answered, when a ticket lands, and when a member is down.
- An adopted maya holds her role in her context only. When the human agrees, restart her from her prompt:
  `company stop maya`, then `company start maya`.
