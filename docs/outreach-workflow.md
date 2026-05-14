# Outreach Workflow

This repo now includes a safe outreach MVP for link-building research and manual email outreach.

## Safety rules

- Do not auto-post on profile pages, comment forms, forums, or user-generated link fields.
- The imported workbook is treated as **research input**, not as an auto-submit queue.
- Only send emails after a human reviews the prospect and explicitly changes `status` to `approved`.
- Only send messages after a human reviews the generated draft and changes message `status` to `approved`.
- Keep a local suppression list in `data/outreach/suppressions.csv` for `stop`, `unsubscribe`, `bounce`, and `not interested`.

## Default workbook

The importer defaults to:

- `/home/ubuntu/文档/backlinks-resources-2026-03-01(1).xlsx`

Override it with:

- `OUTREACH_RESOURCE_XLSX=/path/to/file.xlsx`

## Commands

- `npm run outreach:import:resources`
  - Reads the xlsx workbook and writes `data/outreach/raw-resources.csv`
- `npm run outreach:score`
  - Scores and dedupes rows into `data/outreach/prospects.csv`
- `npm run outreach:draft`
  - Builds `data/outreach/messages.csv` for prospects whose `status=approved`
- `npm run outreach:send-approved -- --dry-run`
  - Prints which approved messages would be sent
- `npm run outreach:send-approved`
  - Sends approved messages with Gmail API
- `npm run outreach:verify-links`
  - Verifies prospects marked `won`, `link_live`, or `link_verified`

## Prospect statuses

- `research_only`
  - Imported as background intelligence only; do not auto-submit
- `needs_manual_review`
  - A human should decide whether this can be converted into real outreach
- `approved`
  - Human-reviewed prospect with real contact info and a real reason to reach out
- `won`
  - Link is expected live and can be checked by the verifier

## Opportunity types

- `manual_outreach_candidate`
  - Used for risky imported sources that should never be auto-submitted, but might inspire a legitimate editor outreach if you find a real contact
- `research_only`
  - Imported as background intelligence only

## Message statuses

- `needs_review`
  - Draft exists but still needs a human pass
- `approved`
  - Ready to send
- `sent`
  - Sent successfully through Gmail API
- `failed`
  - Sending failed; check the `error` column
- `skipped`
  - Suppressed or blocked by workflow guardrails

## Manual review checklist

Before changing any prospect to `approved`, fill these columns in `data/outreach/prospects.csv`:

- `contact_name`
- `contact_email`
- `contact_role`
- `reason_why_fit`
- `personalization`
- `status=approved`

Recommended questions:

- Is this a real editor/site-owner contact, not a form field for user-generated links?
- Is the page topically relevant to the target game or homepage?
- Does the message help the reader, not just try to create a link?

## Gmail API setup

Add these values to `.env.local` on your VPS:

- `OUTREACH_FROM_NAME`
- `OUTREACH_FROM_EMAIL`
- `OUTREACH_REPLY_TO_EMAIL`
- `OUTREACH_SENDER_ROLE`
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`

For the full refresh-token bootstrap flow, see:

- `docs/outreach-gmail-oauth.md`

Recommended rate limits:

- `OUTREACH_DAILY_LIMIT=20`
- `OUTREACH_DOMAIN_DAILY_LIMIT=1`
- `OUTREACH_SEND_DELAY_MS=3000`

## Suggested VPS cron

Example:

```bash
0 10 * * 1-5 cd /home/ubuntu/ai-space/billybobgames/billybobgames-next && npm run outreach:draft >/tmp/outreach-draft.log 2>&1
15 10 * * 1-5 cd /home/ubuntu/ai-space/billybobgames/billybobgames-next && npm run outreach:send-approved >/tmp/outreach-send.log 2>&1
0 9 * * 1 cd /home/ubuntu/ai-space/billybobgames/billybobgames-next && npm run outreach:verify-links >/tmp/outreach-verify.log 2>&1
```

## Current workbook note

The provided workbook mostly contains `profile` and `blog_comment` rows. The scorer therefore imports them with risk flags such as:

- `ugc_profile`
- `ugc_comment`
- `do_not_auto_submit`
- `url_field_only`

That is intentional: the workflow prevents accidental spammy automation and forces manual review before any outreach email is created.
