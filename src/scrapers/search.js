"use strict";

const { BASE, getJson } = require("../core/http");
const { cached } = require("../core/cache");
const { parseCards } = require("./cards");

function searchAnime(keyword) {
  return cached(`search:${keyword}`, 30000, async () => {
    const json = await getJson(`${BASE}/ajax/anime/search?keyword=${encodeURIComponent(keyword)}`, {
      xhr: true,
    });
    return parseCards(json.result.html || "");
  });
}

module.exports = { searchAnime };
