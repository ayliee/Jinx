"use strict";

const { BASE, getText, getJson } = require("../core/http");
const { cached } = require("../core/cache");
const { text, section, count } = require("../core/html");
const { parseCards } = require("./cards");
const { getLatest, getTrending } = require("./latest");

function parseSpotlight(html) {
  const region = section(html, 'id="hotest"', "</aside>");
  const items = [];
  for (const slide of region.split('<div class="swiper-slide">').slice(1)) {
    const anchor = slide.match(/<a href="[^"]*\/watch\/([^/?#"]+)/);
    items.push({
      rank: count(/class="ak-sub">([^<]*)</, slide),
      slug: anchor ? anchor[1] : null,
      title: text(count(/class="ak-title[^"]*"[^>]*>([^<]*)</, slide) || ""),
      titleJp: count(/class="ak-title[^"]*"[^>]*data-jp="([^"]*)"/, slide),
      poster: count(/<img src="([^"]+)"/, slide),
      description: text(count(/class="ak-desc">([^<]*)</, slide) || ""),
      details: [...slide.matchAll(/class="it"><i[^>]*><\/i>([^<]*)</g)].map((m) => text(m[1])),
    });
  }
  return items;
}

function parseTopTables(html) {
  const region = section(html, 'class="top-tables', 'id="top-anime"');
  const tables = {};
  for (const part of region.split('<section class="top-table"').slice(1)) {
    const name = count(/data-name="([^"]+)"/, part);
    if (name) tables[name] = parseCards(part);
  }
  return tables;
}

function parseTopAnime(html) {
  const region = section(html, 'id="top-anime"', "</aside>");
  const top = {};
  for (const part of region.split('<div class="tab-content"').slice(1)) {
    const name = count(/data-name="([^"]+)"/, part);
    if (name) top[name] = parseCards(part);
  }
  return top;
}

async function loadHome() {
  const html = await getText(`${BASE}/home`);
  const [trending, latest] = await Promise.all([getTrending(1), getLatest(1)]);
  const tables = parseTopTables(html);
  return {
    spotlight: parseSpotlight(html),
    latestEpisodes: latest,
    trending,
    newRelease: tables["new-release"] || [],
    newAdded: tables["new-added"] || [],
    completed: tables["completed"] || [],
    topAnime: parseTopAnime(html),
  };
}

function getHome() {
  return cached("home", 60000, loadHome);
}

async function getRandom() {
  const json = await getJson(`${BASE}/ajax/home/widget/random?page=1`, { xhr: true });
  return parseCards(json.result)[0] || null;
}

module.exports = { getHome, getRandom };
