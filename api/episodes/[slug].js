"use strict";

const { route, ok, badRequest } = require("../../src/core/respond");
const { getEpisodes } = require("../../src/scrapers/episodes");

module.exports = route(async (req, res) => {
  const slug = String(req.query.slug || "").trim();
  if (!slug) return badRequest(res, "Missing slug");
  ok(res, { slug, ...(await getEpisodes(slug)) }, 120);
});
