# Agent Instructions (2.billybobgames)

## Default project workflow

- When the user says **开工**: load and summarize `WORKLOG.md` in this repo (current goal, status, next steps), then ask what to do next in this repo.
- When the user says **收工**:
  - Update `WORKLOG.md` with a concise summary of what changed and an actionable TODO list for next time. Do not write secrets.
  - Then push to GitHub by running: `git add .` → `git commit -m "new change"` → `git push` (skip commit/push if there is nothing to commit).

## Creem workflow (explicit only)

- Only load or write Creem chat history under `/home/lcl/Pyment/Creem/` when the user explicitly says **Creem开工** or **Creem收工** (or otherwise explicitly asks to work on Creem).
