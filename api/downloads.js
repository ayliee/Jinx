"use strict";

const { route, ok, badRequest } = require("../src/core/respond");
const { getDownloads } = require("../src/scrapers/downloads");

module.exports = route(async (req, res) => {
  const { mal, episode, timestamp } = req.query;
  if (!mal || !episode || !timestamp) {
    return badRequest(res, "Missing mal, episode, or timestamp (all come from the episodes endpoint)");
  }
  ok(res, await getDownloads(mal, episode, timestamp));
});
