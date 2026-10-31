"use strict";

const fs = require("fs");
const path = require("path");
const { route, fail } = require("../src/core/respond");

function loadDocs() {
  const candidates = [
    path.join(process.cwd(), "docs", "index.html"),
    path.join(__dirname, "..", "docs", "index.html"),
  ];
  for (const file of candidates) {
    if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  }
  return null;
}

module.exports = route(async (req, res) => {
  const html = loadDocs();
  if (!html) fail(res, 404, "Docs page not found");
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, s-maxage=600",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(html);
});
