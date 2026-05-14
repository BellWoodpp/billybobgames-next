/* eslint-disable @typescript-eslint/no-require-imports */
const { URL } = require("url");

const { loadDotEnvFiles, ensureDataDir } = require("./lib/outreach");
const {
  GMAIL_SESSION_PATH,
  buildAuthUrl,
  clearSession,
  createAuthSession,
  exchangeAuthorizationCode,
  fetchGmailProfile,
  getAccessToken,
  getRedirectUri,
  loadSession,
  saveSession,
  sendViaGmail,
  validateClientEnv,
  validateRefreshEnv,
  waitForOAuthCode,
} = require("./lib/gmail");

function usage() {
  console.log(`
Usage:
  node scripts/outreach/gmail-oauth.js auth-url
  node scripts/outreach/gmail-oauth.js listen
  node scripts/outreach/gmail-oauth.js exchange-code --code <auth-code>
  node scripts/outreach/gmail-oauth.js test-profile
  node scripts/outreach/gmail-oauth.js send-test --to <email> [--subject "..."] [--body "..."]

Recommended VPS flow:
  1. Set GMAIL_CLIENT_ID, optional GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI
  2. On your local machine create an SSH tunnel:
     ssh -L 8787:127.0.0.1:8787 <user>@<your-vps>
  3. On the VPS run:
     npm run outreach:gmail:listen
  4. Open the printed URL in your local browser
  5. Copy the printed GMAIL_REFRESH_TOKEN into .env.local
  `.trim());
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    const next = rest[index + 1];

    if (arg === "--code") {
      options.code = next;
      index += 1;
      continue;
    }

    if (arg === "--to") {
      options.to = next;
      index += 1;
      continue;
    }

    if (arg === "--subject") {
      options.subject = next;
      index += 1;
      continue;
    }

    if (arg === "--body") {
      options.body = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown arg: ${arg}`);
  }

  return {
    command,
    options,
  };
}

function printSessionInstructions(authUrl) {
  const redirectUri = new URL(getRedirectUri());

  console.log("");
  console.log("Open this URL in your local browser:");
  console.log(authUrl);
  console.log("");
  console.log("If you are on a VPS, make sure this SSH tunnel is open on your local machine:");
  console.log(`ssh -L ${redirectUri.port || 80}:127.0.0.1:${redirectUri.port || 80} <user>@<your-vps>`);
  console.log("");
  console.log(`OAuth session saved to ${GMAIL_SESSION_PATH}`);
}

async function commandAuthUrl() {
  validateClientEnv();
  const session = createAuthSession();
  saveSession(session);
  const authUrl = buildAuthUrl(session);
  printSessionInstructions(authUrl);
}

async function commandListen() {
  validateClientEnv();
  const session = createAuthSession();
  saveSession(session);
  const authUrl = buildAuthUrl(session);
  printSessionInstructions(authUrl);

  const code = await waitForOAuthCode(session);
  const tokens = await exchangeAuthorizationCode({ code, session });
  clearSession();

  console.log("");
  console.log("OAuth exchange complete.");
  console.log(`GMAIL_REFRESH_TOKEN="${tokens.refresh_token || ""}"`);
  console.log(`access_token_expires_in=${tokens.expires_in || ""}`);

  if (tokens.access_token) {
    try {
      const profile = await fetchGmailProfile(tokens.access_token);
      console.log(`gmail_email=${profile.emailAddress || ""}`);
      console.log(`messages_total=${profile.messagesTotal || ""}`);
    } catch (error) {
      console.log(`profile_check_error=${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

async function commandExchangeCode(options) {
  validateClientEnv();
  if (!options.code) {
    throw new Error("Missing --code");
  }

  const session = loadSession();
  const tokens = await exchangeAuthorizationCode({ code: options.code, session });
  clearSession();

  console.log(`GMAIL_REFRESH_TOKEN="${tokens.refresh_token || ""}"`);
  console.log(`access_token_expires_in=${tokens.expires_in || ""}`);
}

async function commandTestProfile() {
  validateRefreshEnv();
  const accessToken = await getAccessToken();
  const profile = await fetchGmailProfile(accessToken);
  console.log(JSON.stringify(profile, null, 2));
}

async function commandSendTest(options) {
  validateRefreshEnv();
  if (!options.to) {
    throw new Error("Missing --to");
  }

  const accessToken = await getAccessToken();
  const subject = options.subject || "BillyBobGames Gmail API test";
  const body =
    options.body ||
    "This is a Gmail API test email from the BillyBobGames outreach helper running on the VPS.";
  const response = await sendViaGmail(accessToken, {
    toEmail: options.to,
    subject,
    body,
  });

  console.log(JSON.stringify(response, null, 2));
}

async function main() {
  loadDotEnvFiles();
  ensureDataDir();

  const { command, options } = parseArgs(process.argv.slice(2));
  if (!command || command === "--help" || command === "-h" || command === "help") {
    usage();
    return;
  }

  if (command === "auth-url") {
    await commandAuthUrl();
    return;
  }

  if (command === "listen") {
    await commandListen();
    return;
  }

  if (command === "exchange-code") {
    await commandExchangeCode(options);
    return;
  }

  if (command === "test-profile") {
    await commandTestProfile();
    return;
  }

  if (command === "send-test") {
    await commandSendTest(options);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
