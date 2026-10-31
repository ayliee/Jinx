"use strict";

const { BASE, getJson } = require("../core/http");
const { parseCards } = require("./cards");

async function searchAnime(keyword) {
  const json = await getJson(`${BASE}/ajax/anime/search?keyword=${encodeURIComponent(keyword)}`, {
    xhr: true,
  });
  return parseCards(json.result.html || "");
}

module.exports = { searchAnime };
