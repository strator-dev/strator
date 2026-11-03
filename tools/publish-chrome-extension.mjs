// Uploads a packaged extension to the Chrome Web Store and submits it for review (Chrome Web Store API v2).
//
//   node tools/publish-chrome-extension.mjs path/to/strator-devtools-chrome.zip
//
// Environment:
//   CWS_SERVICE_ACCOUNT_KEY  JSON key of a Google Cloud service account that is linked to the publisher in the
//                            Chrome Web Store Developer Dashboard (Account → Service accounts), with the
//                            Chrome Web Store API enabled in its project.
//   CWS_PUBLISHER_ID         Publisher ID, shown in the Developer Dashboard (Account).
//   CWS_EXTENSION_ID         ID of the existing store item. The API cannot create items: the first version is
//                            uploaded by hand in the Developer Dashboard.
//   CWS_PUBLISH              Set to "false" to only upload the package and leave it as a draft.
//
// The access token comes straight from the service account key (a signed JWT exchanged at Google's token
// endpoint), so no extra IAM roles or third-party actions are needed.
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const API = "https://chromewebstore.googleapis.com";
const SCOPE = "https://www.googleapis.com/auth/chromewebstore";

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

const zipPath = process.argv[2];
if (!zipPath) fail("usage: node tools/publish-chrome-extension.mjs <extension.zip>");

const missing = ["CWS_SERVICE_ACCOUNT_KEY", "CWS_PUBLISHER_ID", "CWS_EXTENSION_ID"].filter(name => !process.env[name]);
if (missing.length > 0) {
  fail(`Missing ${missing.join(", ")}. See the comment at the top of tools/publish-chrome-extension.mjs.`);
}

const item = `publishers/${process.env.CWS_PUBLISHER_ID}/items/${process.env.CWS_EXTENSION_ID}`;

async function accessToken() {
  let key;
  try {
    key = JSON.parse(process.env.CWS_SERVICE_ACCOUNT_KEY);
  } catch {
    fail("CWS_SERVICE_ACCOUNT_KEY is not valid JSON; paste the whole service account key file.");
  }
  const tokenUri = key.token_uri ?? "https://oauth2.googleapis.com/token";
  const now = Math.floor(Date.now() / 1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: key.client_email,
    scope: SCOPE,
    aud: tokenUri,
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url");
  const response = await fetch(tokenUri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    fail(`Getting an access token failed (${response.status}): ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

async function call(token, method, url, { body, contentType } = {}) {
  const response = await fetch(url, {
    method,
    headers: { authorization: `Bearer ${token}`, ...(contentType ? { "content-type": contentType } : {}) },
    ...(body === undefined ? {} : { body }),
  });
  const text = await response.text();
  if (!response.ok) fail(`${method} ${url} failed (${response.status}): ${text}`);
  return text ? JSON.parse(text) : {};
}

const token = await accessToken();

console.log(`Uploading ${zipPath} to ${item}`);
const upload = await call(token, "POST", `${API}/upload/v2/${item}:upload`, {
  body: readFileSync(zipPath),
  contentType: "application/zip",
});
let state = upload.uploadState;

// Large packages are processed asynchronously; wait for the result before publishing.
for (let attempt = 0; state === "IN_PROGRESS" && attempt < 60; attempt++) {
  await new Promise(resolve => setTimeout(resolve, 5000));
  state = (await call(token, "GET", `${API}/v2/${item}:fetchStatus`)).lastAsyncUploadState;
}
if (state !== "SUCCEEDED") fail(`Upload did not succeed (uploadState: ${state}): ${JSON.stringify(upload)}`);
console.log(`Uploaded version ${upload.crxVersion ?? "(unknown)"}`);

if (process.env.CWS_PUBLISH === "false") {
  console.log("CWS_PUBLISH=false: left as a draft in the Developer Dashboard.");
  process.exit(0);
}

// DEFAULT_PUBLISH: goes live automatically once it passes review.
const published = await call(token, "POST", `${API}/v2/${item}:publish`, {
  body: JSON.stringify({ publishType: "DEFAULT_PUBLISH" }),
  contentType: "application/json",
});
console.log(`Submitted for review: ${published.state}`);
if (published.warningInfo) console.log(`Warnings: ${JSON.stringify(published.warningInfo)}`);
if (published.state === "REJECTED" || published.state === "CANCELLED") fail(`Publish ended as ${published.state}`);
