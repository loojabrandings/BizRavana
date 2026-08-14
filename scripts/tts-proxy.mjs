#!/usr/bin/env node
/**
 * Tiny local proxy for the Google Cloud TTS test box in briefing-test.html.
 *
 * Google Cloud Text-to-Speech has no browser SDK, and shipping an API key in
 * a page is bad practice, so this dev-only script forwards the test page's
 * requests to the Text-to-Speech REST API. Zero dependencies (Node 18+).
 *
 *   node scripts/tts-proxy.mjs                   # → http://localhost:8787
 *   TTS_PROXY_PORT=9000 node scripts/tts-proxy.mjs
 *   node scripts/tts-proxy.mjs --port 9000
 *
 * The briefing-test.html page hardcodes localhost:8787, so keep the default.
 * Note: the generic PORT env var is deliberately NOT used — many shells set
 * it for other servers and it would silently move the proxy off 8787.
 *
 * The key is supplied by the browser with each request (stored in localStorage
 * like the Azure test key) — never hardcode it here.
 */
import http from "node:http";

const argPort = (() => {
  const i = process.argv.indexOf("--port");
  return i !== -1 ? Number(process.argv[i + 1]) : NaN;
})();
const PORT = Number(process.env.TTS_PROXY_PORT) || argPort || 8787;
const API = "https://texttospeech.googleapis.com/v1";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json", ...CORS });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function apiKey(body) {
  return typeof body === "object" &&
    body !== null &&
    typeof body.key === "string" &&
    body.key.length >= 20
    ? body.key
    : null;
}

async function callGoogle(path, init) {
  const res = await fetch(API + path, init);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { ok: true, name: "tts-proxy", port: PORT });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed (try POST /synthesize or POST /voices)." });
    return;
  }

  const body = await readJson(req);
  if (body === null) {
    sendJson(res, 400, { error: "Invalid JSON body." });
    return;
  }

  const key = apiKey(body);
  if (!key) {
    sendJson(res, 400, { error: "Missing or invalid Google API key." });
    return;
  }
  const headers = { "Content-Type": "application/json", "x-goog-api-key": key };

  if (url.pathname === "/synthesize") {
    const { text, voice, languageCode = "si-LK", audioEncoding = "MP3" } = body;
    if (typeof text !== "string" || !text.trim()) {
      sendJson(res, 400, { error: "Missing text to synthesize." });
      return;
    }
    const r = await callGoogle("/text:synthesize", {
      method: "POST",
      headers,
      body: JSON.stringify({
        input: { text },
        voice: { languageCode, name: voice || undefined },
        audioConfig: { audioEncoding },
      }),
    });
    if (r.status >= 400) {
      sendJson(res, r.status, r.data);
      return;
    }
    sendJson(res, 200, { audioContent: r.data.audioContent, contentType: "audio/mpeg" });
    return;
  }

  if (url.pathname === "/voices") {
    const { languageCode = "si-LK" } = body;
    const qs = new URLSearchParams({ languageCode, key });
    const r = await callGoogle("/voices?" + qs.toString(), { method: "GET", headers });
    sendJson(res, r.status, r.data);
    return;
  }

  sendJson(res, 404, { error: "Not found. Use POST /synthesize, POST /voices, or GET /health." });
});

server.listen(PORT, () => {
  console.log(`TTS proxy listening on http://localhost:${PORT}`);
  console.log(`Forwarding to ${API} (Google Cloud Text-to-Speech)`);
  console.log("Keys are never stored by the proxy — they travel with each request.");
});
