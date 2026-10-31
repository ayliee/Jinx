"use strict";

const { route, ok, badRequest } = require("../../../src/core/respond");
const { browseList } = require("../../../src/scrapers/browse");

const CATEGORIES = ["genre", "studio", "producer", "status"];

module.exports = route(async (req, res) => {
  const category = String(req.query.category || "").toLowerCase();
  const value = String(req.query.value || "").trim();
  if (!CATEGORIES.includes(category)) return badRequest(res, `category must be one of: ${CATEGORIES.join(", ")}`);
  if (!value) return badRequest(res, "Missing value");
  ok(res, await browseList(`${category}/${encodeURIComponent(value)}`, [["page", req.query.page]]), 120);
});
