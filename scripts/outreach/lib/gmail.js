/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { URL, URLSearchParams } = require("url");

const { DATA_DIR } = require("./outreach");

const GMAIL_SESSION_PATH = path.join(DATA_DIR, "gmail-oauth-session.json");
const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const GMAIL_PROFILE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/profile";
const DEFAULT_GMAIL_SCOPES = "https://www.googleapis.com/auth/gmail.send";
const DEFAULT_REDIRECT_URI = "http://127.0.0.1:8787/oauth2callback";

function encodeBase64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function randomVerifier(bytes = 32) {
  return encodeBase64Url(crypto.randomBytes(bytes));
}

function sha256Base64Url(input) {
  return crypto.createHash("sha256").update(input).digest("base64url");
}

function getGmailScopes() {
  return String(process.env.GMAIL_SCOPES || DEFAULT_GMAIL_SCOPES)
    .split(/\s+/)
    .map((scope) => scope.trim())
    .filter(Boolean)
    .join(" ");
}

function getRedirectUri() {
  return process.env.GMAIL_REDIRECT_URI || DEFAULT_REDIRECT_URI;
}

function validateClientEnv() {
  const missing = ["GMAIL_CLIENT_ID"].filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

function validateRefreshEnv() {
  const missing = ["GMAIL_CLIENT_ID", "GMAIL_REFRESH_TOKEN"].filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}

function createAuthSession() {
  validateClientEnv();

  const codeVerifier = randomVerifier(64);
  const session = {
    state: randomVerifier(24),
    codeVerifier,
    codeChallenge: sha256Base64Url(codeVerifier),
    redirectUri: getRedirectUri(),
    scopes: getGmailScopes(),
    createdAt: new Date().toISOString(),
  };

  return session;
}

function buildAuthUrl(session) {
  const params = new URLSearchParams({
    client_id: process.env.GMAIL_CLIENT_ID,
    redirect_uri: session.redirectUri,
    response_type: "code",
    scope: session.scopes,
    state: session.state,
    code_challenge: session.codeChallenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
  });

  if (process.env.GMAIL_LOGIN_HINT) {
    params.set("login_hint", process.env.GMAIL_LOGIN_HINT);
  }

  return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}

function saveSession(session) {
  fs.writeFileSync(GMAIL_SESSION_PATH, JSON.stringify(session, null, 2), "utf8");
}

function loadSession() {
  if (!fs.existsSync(GMAIL_SESSION_PATH)) {
    throw new Error(`OAuth session not found: ${GMAIL_SESSION_PATH}`);
  }

  return JSON.parse(fs.readFileSync(GMAIL_SESSION_PATH, "utf8"));
}

function clearSession() {
  if (fs.existsSync(GMAIL_SESSION_PATH)) {
    fs.unlinkSync(GMAIL_SESSION_PATH);
  }
}

async function exchangeAuthorizationCode({ code, session }) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GMAIL_CLIENT_ID,
    code_verifier: session.codeVerifier,
    redirect_uri: session.redirectUri,
    grant_type: "authorization_code",
  });

  if (process.env.GMAIL_CLIENT_SECRET) {
    body.set("client_secret", process.env.GMAIL_CLIENT_SECRET);
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange authorization code: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function getAccessToken() {
  validateRefreshEnv();

  const body = new URLSearchParams({
    client_id: process.env.GMAIL_CLIENT_ID,
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });

  if (process.env.GMAIL_CLIENT_SECRET) {
    body.set("client_secret", process.env.GMAIL_CLIENT_SECRET);
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh Gmail token: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  return payload.access_token;
}

function toBase64UrlMessage(input) {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function buildRawEmail({ toEmail, subject, body, replyTo }) {
  const fromName = process.env.OUTREACH_FROM_NAME || "BillyBobGames";
  const fromEmail = process.env.OUTREACH_FROM_EMAIL;
  const resolvedReplyTo = replyTo || process.env.OUTREACH_REPLY_TO_EMAIL || fromEmail;

  if (!fromEmail) {
    throw new Error("Missing OUTREACH_FROM_EMAIL");
  }

  return [
    `From: ${fromName} <${fromEmail}>`,
    `To: ${toEmail}`,
    `Reply-To: ${resolvedReplyTo}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
    "",
  ].join("\r\n");
}

async function sendViaGmail(accessToken, { toEmail, subject, body, replyTo }) {
  const raw = buildRawEmail({ toEmail, subject, body, replyTo });
  const response = await fetch(GMAIL_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: toBase64UrlMessage(raw),
    }),
  });

  if (!response.ok) {
    throw new Error(`Gmail send failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function fetchGmailProfile(accessToken) {
  const response = await fetch(GMAIL_PROFILE_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Gmail profile: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function parseListenTarget() {
  const redirectUrl = new URL(getRedirectUri());

  if (!["127.0.0.1", "localhost"].includes(redirectUrl.hostname)) {
    throw new Error(
      `GMAIL_REDIRECT_URI must use localhost/127.0.0.1 for the helper listener. Received ${redirectUrl.toString()}`,
    );
  }

  return {
    hostname: redirectUrl.hostname,
    port: Number(redirectUrl.port || (redirectUrl.protocol === "https:" ? 443 : 80)),
    pathname: redirectUrl.pathname,
  };
}

function waitForOAuthCode(session, timeoutMs = 10 * 60 * 1000) {
  const target = parseListenTarget();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      server.close();
      reject(new Error("Timed out waiting for OAuth callback"));
    }, timeoutMs);

    const server = http.createServer((request, response) => {
      try {
        const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);
        if (requestUrl.pathname !== target.pathname) {
          response.statusCode = 404;
          response.end("Not found");
          return;
        }

        const error = requestUrl.searchParams.get("error");
        const state = requestUrl.searchParams.get("state");
        const code = requestUrl.searchParams.get("code");

        if (error) {
          response.statusCode = 400;
          response.end(`OAuth error: ${error}`);
          clearTimeout(timer);
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }

        if (!state || state !== session.state) {
          response.statusCode = 400;
          response.end("Invalid state");
          clearTimeout(timer);
          server.close();
          reject(new Error("OAuth state mismatch"));
          return;
        }

        if (!code) {
          response.statusCode = 400;
          response.end("Missing authorization code");
          clearTimeout(timer);
          server.close();
          reject(new Error("OAuth callback missing authorization code"));
          return;
        }

        response.statusCode = 200;
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(
          "<h1>Authorization received</h1><p>You can return to the terminal. This tab may be closed.</p>",
        );

        clearTimeout(timer);
        server.close();
        resolve(code);
      } catch (error) {
        clearTimeout(timer);
        server.close();
        reject(error);
      }
    });

    server.listen(target.port, target.hostname, () => {
      console.log(`Listening for OAuth callback on ${getRedirectUri()}`);
    });
  });
}

module.exports = {
  GMAIL_SESSION_PATH,
  buildAuthUrl,
  buildRawEmail,
  clearSession,
  createAuthSession,
  exchangeAuthorizationCode,
  fetchGmailProfile,
  getAccessToken,
  getGmailScopes,
  getRedirectUri,
  loadSession,
  parseListenTarget,
  saveSession,
  sendViaGmail,
  validateClientEnv,
  validateRefreshEnv,
  waitForOAuthCode,
};
