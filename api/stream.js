"use strict";

const { route, ok, apiOrigin } = require("../src/core/respond");
const { getStream } = require("../src/scrapers/stream");

module.exports = route(async (req, res) => {
  ok(res, await getStream(req.query, apiOrigin(req)));
});
