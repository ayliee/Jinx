"use strict";

const { route, fail } = require("../src/core/respond");
const { loadDoc } = require("../src/core/doc");

module.exports = route(async (req, res) => {
  const html = loadDoc("player.html");
  if (!html) fail(res, 404, "Player page not found");
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, s-maxage=600",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(html);
});
