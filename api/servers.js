"use strict";

const { route, ok, badRequest } = require("../src/core/respond");
const { getServers } = require("../src/scrapers/servers");

module.exports = route(async (req, res) => {
  const ids = String(req.query.ids || "").trim();
  if (!ids) return badRequest(res, "Missing ids (episode data-ids value)");
  ok(res, await getServers(ids));
});
