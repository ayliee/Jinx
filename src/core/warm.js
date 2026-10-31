"use strict";

const { getHome } = require("../scrapers/home");
const { getLatest } = require("../scrapers/latest");
const { getSchedule } = require("../scrapers/schedule");

// Refreshes the hot feeds so new episodes surface within moments of airing.
async function warmHot() {
  const tz = -new Date().getTimezoneOffset() / 60;
  const done = await Promise.allSettled([getHome(), getLatest(1), getSchedule(tz, null)]);
  return done.map((r, i) => ({ feed: ["home", "latest", "schedule"][i], ok: r.status === "fulfilled" }));
}

module.exports = { warmHot };
