"use strict";

const { route, ok } = require("../src/core/respond");
const { warmHot } = require("../src/core/warm");

module.exports = route(async (req, res) => {
  ok(res, { warmed: await warmHot(), time: new Date().toISOString() }, 0);
});
