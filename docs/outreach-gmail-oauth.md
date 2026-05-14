# Gmail OAuth Setup for VPS

This repo includes a helper flow to obtain and verify a Gmail API refresh token without running a browser on the VPS.

## Recommended approach

Use a Google OAuth **Desktop app** client with a loopback redirect and an SSH tunnel from your local machine to the VPS.

Why this setup:

- It avoids storing SMTP passwords on the VPS.
- It keeps sending on Gmail API instead of raw SMTP.
- It works even when the browser lives on your own computer, not on the VPS.

## 1. Google Cloud setup

- Enable the Gmail API for your Google Cloud project.
- Configure the OAuth consent screen.
- If the app is still in **Testing**, add the Gmail account you will use as a test user.
- Create an OAuth client of type **Desktop app**.

Add these values to `.env.local` on the VPS:

```bash
OUTREACH_FROM_NAME="BillyBobGames"
OUTREACH_FROM_EMAIL="your-gmail@gmail.com"
OUTREACH_REPLY_TO_EMAIL="your-gmail@gmail.com"
OUTREACH_SENDER_ROLE="BillyBobGames"

GMAIL_CLIENT_ID="..."
GMAIL_CLIENT_SECRET="..."
GMAIL_REDIRECT_URI="http://127.0.0.1:8787/oauth2callback"
GMAIL_SCOPES="https://www.googleapis.com/auth/gmail.send"
```

`GMAIL_CLIENT_SECRET` may be empty for some desktop-app flows, but keep it if Google gives you one.

## 2. Open the SSH tunnel from your local machine

Run this on **your local computer**, not on the VPS:

```bash
ssh -L 8787:127.0.0.1:8787 <user>@<your-vps>
```

Keep this SSH session open while authorizing.

This forwards your local `127.0.0.1:8787` browser callback to the helper running on the VPS.

## 3. Start the OAuth listener on the VPS

On the VPS, from this repo:

```bash
npm run outreach:gmail:listen
```

The command will:

- print a Google authorization URL
- start a temporary listener on `127.0.0.1:8787`
- wait for the browser callback
- exchange the code for tokens
- print `GMAIL_REFRESH_TOKEN="..."`

## 4. Complete consent in your browser

- Copy the printed authorization URL into your **local browser**
- Sign in to the Gmail account you want to use
- Approve the requested Gmail send scope
- Wait for the browser to land on the local callback page

If everything works, the VPS terminal prints a refresh token and basic Gmail profile info.

## 5. Save the refresh token

Copy the printed token into `.env.local` on the VPS:

```bash
GMAIL_REFRESH_TOKEN="..."
```

## 6. Verify the token

Check that the VPS can refresh the token and read the Gmail profile:

```bash
npm run outreach:gmail:test-profile
```

## 7. Send a test email

Send a real test email before enabling outreach cron jobs:

```bash
npm run outreach:gmail:send-test -- --to your-other-email@example.com
```

## Optional helper commands

- Print a fresh auth URL without starting the listener:

```bash
npm run outreach:gmail:auth-url
```

- Exchange a code manually if you used `auth-url` first:

```bash
npm run outreach:gmail:exchange-code -- --code "PASTE_CODE_HERE"
```

## Production reminder

The send pipeline still keeps the manual safety gates:

- prospects must be `status=approved`
- message drafts must be `status=approved`
- `npm run outreach:send-approved -- --dry-run` should be checked before any live send
