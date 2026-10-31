"use strict";

const { Readable } = require("stream");
const { request } = require("../src/core/http");
const { route, badRequest, fail, apiOrigin, CORS } = require("../src/core/respond");
const { sign } = require("../src/core/sign");

function rewritePlaylist(body, playlistUrl, origin) {
  const proxied = (line) => {
    const absolute = new URL(line, playlistUrl).href;
    return `${origin}/api/proxy?u=${encodeURIComponent(absolute)}&s=${sign(absolute)}`;
  };
  return body
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith("#")) {
        return line.replace(/URI="([^"]+)"/g, (_, uri) => `URI="${proxied(uri)}"`);
      }
      return proxied(trimmed);
    })
    .join("\n");
}

module.exports = route(async (req, res) => {
  const target = String(req.query.u || "").trim();
  const signature = String(req.query.s || "").trim();
  if (!target) return badRequest(res, "Missing u");
  if (!signature || signature !== sign(target)) {
    return fail(res, 403, "Invalid or missing signature, use the proxy URLs returned by /api/stream");
  }
  const url = new URL(target);
  if (url.protocol !== "https:") return fail(res, 400, "Only https URLs can be proxied");
  const upstream = await request(url.href, {
    referer: "https://megaplay.buzz/",
    headers: { Accept: "*/*" },
    timeout: 30000,
  });
  const type = upstream.headers.get("content-type") || "";
  const isPlaylist = type.includes("mpegurl") || url.pathname.endsWith(".m3u8");
  if (isPlaylist) {
    const body = rewritePlaylist(await upstream.text(), url.href, apiOrigin(req));
    res.writeHead(200, {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Cache-Control": "public, s-maxage=300",
      ...CORS,
    });
    return res.end(body);
  }
  res.writeHead(200, {
    "Content-Type": type || "application/octet-stream",
    "Cache-Control": "public, s-maxage=3600",
    ...CORS,
  });
  Readable.fromWeb(upstream.body).pipe(res);
});
