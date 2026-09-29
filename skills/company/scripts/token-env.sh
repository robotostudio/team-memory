# Sourced by `company start` in a member's own pane only: its Claude then runs on the token pool (the second account's
# setup-token, CLAUDE_OAUTH_TOKEN in the repo's .env). Reads only that one line and prints nothing.
CLAUDE_CODE_OAUTH_TOKEN=$(sed -n 's/^CLAUDE_OAUTH_TOKEN=//p' "$HOME/roboto/software-factory/.env")
export CLAUDE_CODE_OAUTH_TOKEN
