"use strict";

const { route, ok, badRequest } = require("../../src/core/respond");
const { getAnime } = require("../../src/scrapers/anime");

module.exports = route(async (req, res) => {
  const slug = String(req.query.slug || "").trim();
  if (!slug) return badRequest(res, "Missing slug");
  ok(res, await getAnime(slug));
});
