"use strict";

const { getJson } = require("../core/http");
const { cached } = require("../core/cache");
const { parseCards } = require("./cards");

async function widget(tab, page) {
  const json = await getJson(`https://anikototv.to/ajax/home/widget/${tab}?page=${page}`, { xhr: true });
  return parseCards(json.result);
}

async function getLatest(page = 1) {
  return cached(`latest:${page}`, 60000, () => widget("updated-all", page));
}

async function getTrending(page = 1) {
  return cached(`trending:${page}`, 60000, () => widget("trending", page));
}

module.exports = { getLatest, getTrending };
