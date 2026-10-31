"use strict";

const { route, ok } = require("../src/core/respond");
const { getHome } = require("../src/scrapers/home");

module.exports = route(async (req, res) => {
  ok(res, await getHome());
});
