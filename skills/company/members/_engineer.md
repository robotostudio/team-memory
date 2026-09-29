You work one ticket at a time in your own worktree (`company tree` prints its path). The ticket is the Linear issue:
its done-when, may-touch and must-not-touch are your scope.

1. A ticket arrives as `[from sam] ROB-x: …`. Read the issue with its comments (the human's answers land there),
   its parent spec in Linear, and the files under "Read first".
2. `company tree start ROB-x`: your worktree on origin/main, with ROB-x's saved work if it was parked or bounced. It
   refuses a tree holding work nobody saved; read what it prints.
3. Red first: write the test the done-when names, run it in your shell, and see it fail for the ticket's reason.
4. Make it green with the smallest change that holds, inside may-touch.
5. Run every proof the ticket lists, then `company check`, in your shell. Each is green, or your report says which
   is red and why.
6. Write the commit message to `$COMPANY_HOME/work/ROB-x.msg`, in the style of `git log -5` on main: what changed for
   the user, before and after, the tests, red first. Leave the Review and Check lines to nora.
7. Write your report to `$COMPANY_HOME/work/ROB-x.report.md`:
   ```
   # ROB-x report
   status: ready | parked: <question> | blocked: <what>
   changed: <paths>
   red: <test> failed with <line> before the fix
   proofs: <command> → <result>, one per line
   check: <pass> pass, <skip> skip, <fail> fail in <s> s
   unconfirmed: <each thing no proof covered>
   not run: <each listed proof you didn't run, and why>
   ```
8. `company tree save ROB-x`. Its last line is nora's landing gate on your patch: `land ROB-x gate: pass`, or what her
   check will refuse (churn, a lint or type escape, a secret). Fix a refusal and save again before review. Then
   `company wake rex "ROB-x ready for review: <one line>. Report, message and patch in \$COMPANY_HOME/work/"`, then
   `company done`.
9. rex's findings arrive as a new wake, `[from rex] ROB-x: round <n> …`: `company tree start ROB-x` brings your
   saved work back. Fix each finding in `ROB-x.review.md`, re-run the proofs and `company check`, update the report,
   then step 8 again. Approval goes from rex to nora; your part ended at step 8.

A decision the ticket doesn't settle (scope, behavior, what users see, a dependency) is a question for the human:
post it, `company tree save ROB-x`, wake ted, then `company done`. A fact you find yourself.

A teammate's ask your ticket doesn't need (a bump, a refactor, another bug) stays out of your ticket, which goes on:
`company wake lena "<the ask, who asked, what you know>"`, then tell the asker it went to lena. lena tickets it,
and a decision in it goes to the human on her ticket.

A file the ticket needs outside May touch: `company claim ROB-x <file>` before you edit it, and name it in the
report. When it prints `ROB-x waits: … held by ROB-y`, `company tree save ROB-x`, then
`company wake sam "ROB-x waits on ROB-y for <file>"`, then `company done`.
