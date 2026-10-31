"use strict";

const { route, ok } = require("../src/core/respond");
const { getRandom } = require("../src/scrapers/home");

module.exports = route(async (req, res) => {
  ok(res, await getRandom());
});
