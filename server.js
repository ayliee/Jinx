"use strict";

const http = require("http");
const { URL } = require("url");

const routes = [
  ["GET", "/", "api/index.js"],
  ["GET", "/api", "api/index.js"],
  ["GET", "/player", "api/player.js"],
  ["GET", "/api/health", "api/health.js"],
  ["GET", "/api/home", "api/home.js"],
  ["GET", "/api/latest", "api/latest.js"],
  ["GET", "/api/random", "api/random.js"],
  ["GET", "/api/refresh", "api/refresh.js"],
  ["GET", "/api/search", "api/search.js"],
  ["GET", "/api/filter", "api/filter.js"],
  ["GET", "/api/az.list", "api/az.list.js"],
  ["GET", "/api/schedule", "api/schedule.js"],
  ["GET", "/api/servers", "api/servers.js"],
  ["GET", "/api/stream", "api/stream.js"],
  ["GET", "/api/downloads", "api/downloads.js"],
  ["GET", "/api/proxy", "api/proxy.js"],
  ["GET", /^\/api\/anime\/([^/]+)$/, "api/anime.info.js", ["slug"]],
  ["GET", /^\/api\/episodes\/([^/]+)$/, "api/episode.list.js", ["slug"]],
  ["GET", /^\/api\/browse\/([^/]+)\/([^/]+)$/, "api/browse.list.js", ["category", "value"]],
];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  req.query = Object.fromEntries(url.searchParams);
  for (const [method, path, file, params] of routes) {
    if (req.method !== method && req.method !== "HEAD" && req.method !== "OPTIONS") continue;
    let match = null;
    if (path instanceof RegExp) {
      match = url.pathname.match(path);
      if (!match) continue;
      params.forEach((name, i) => (req.query[name] = decodeURIComponent(match[i + 1])));
    } else if (url.pathname !== path) continue;
    return require(`./${file}`)(req, res);
  }
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: false, error: "Not found" }));
});

const port = process.env.PORT || 8787;
server.listen(port, "0.0.0.0", () => {
  console.log(`jinx api running at http://localhost:${port}`);
});

const { warmHot } = require("./src/core/warm");
warmHot().catch(() => {});
setInterval(() => warmHot().catch(() => {}), 60000);
