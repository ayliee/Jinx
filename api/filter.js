"use strict";

const { route, ok, badRequest } = require("../src/core/respond");
const { browseList } = require("../src/scrapers/browse");

const SORTS = [
  "default",
  "latest-updated",
  "latest-added",
  "score",
  "name-az",
  "release-date",
  "most-viewed",
  "number_of_episodes",
];

function pushList(query, key, name, params) {
  if (!query[key]) return;
  for (const value of String(query[key]).split(",").map((v) => v.trim()).filter(Boolean)) {
    params.push([`${name}[]`, value]);
  }
}

module.exports = route(async (req, res) => {
  const query = req.query;
  const params = [];
  if (query.keyword) params.push(["keyword", query.keyword]);
  pushList(query, "genre", "genre", params);
  pushList(query, "type", "term_type", params);
  pushList(query, "season", "season", params);
  pushList(query, "year", "year", params);
  pushList(query, "status", "status", params);
  pushList(query, "language", "language", params);
  pushList(query, "rating", "rating", params);
  pushList(query, "source", "source", params);
  if (query.ep_min) params.push(["ep_min", query.ep_min]);
  if (query.ep_max) params.push(["ep_max", query.ep_max]);
  if (query.sort) {
    if (!SORTS.includes(query.sort)) return badRequest(res, `sort must be one of: ${SORTS.join(", ")}`);
    params.push(["sort", query.sort]);
  }
  if (query.page) params.push(["page", query.page]);
  ok(res, await browseList("filter", params), 120);
});
