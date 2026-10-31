"use strict";

const { route, ok } = require("../src/core/respond");
const { getSchedule } = require("../src/scrapers/schedule");

module.exports = route(async (req, res) => {
  const tz = Number(req.query.tz ?? -new Date().getTimezoneOffset() / 60);
  ok(res, await getSchedule(tz, req.query.date));
});
