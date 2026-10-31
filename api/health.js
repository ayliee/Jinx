"use strict";

const { route, ok } = require("../src/core/respond");

module.exports = route(async (req, res) => {
  ok(res, {
    service: "jinx",
    version: "1.0.0",
    source: "anikototv.to",
    time: new Date().toISOString(),
  });
});
