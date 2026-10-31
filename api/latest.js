"use strict";

const { route, ok } = require("../src/core/respond");
const { getLatest } = require("../src/scrapers/latest");

module.exports = route(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  ok(res, { page, episodes: await getLatest(page) }, 60);
});
