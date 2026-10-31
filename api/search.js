"use strict";

const { route, ok, badRequest } = require("../src/core/respond");
const { searchAnime } = require("../src/scrapers/search");

module.exports = route(async (req, res) => {
  const q = (req.query.q || req.query.keyword || "").trim();
  if (!q) return badRequest(res, "Missing query parameter q");
  ok(res, { query: q, results: await searchAnime(q) });
});
