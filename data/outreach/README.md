This directory is the local workspace for the outreach MVP.

Generated files here are intentionally gitignored:
- `raw-resources.csv`
- `prospects.csv`
- `messages.csv`
- `link-checks.csv`
- `suppressions.csv`

Recommended workflow:
1. `npm run outreach:prepare`
2. Review `data/outreach/prospects.csv`
3. Fill `contact_name`, `contact_email`, `reason_why_fit`, `personalization`
4. Change prospect `status` to `approved`
5. `npm run outreach:draft`
6. Review `data/outreach/messages.csv`
7. Change message `status` to `approved`
8. `npm run outreach:send-approved -- --dry-run`
9. `npm run outreach:send-approved`
