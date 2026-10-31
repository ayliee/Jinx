"use strict";

const { BASE, getText, getJson, fail } = require("../core/http");
const { cached } = require("../core/cache");
const { count } = require("../core/html");

function animeIdFromPage(html) {
  return count(/const mangaId = (\d+)/, html) || count(/id="watch-main"[^>]*data-id="(\d+)"/, html);
}

async function loadEpisodes(slug) {
  const pageUrl = `${BASE}/watch/${slug}`;
  const html = await getText(pageUrl);
  const animeId = animeIdFromPage(html);
  if (!animeId) fail(`Could not resolve anime id for "${slug}"`, 404);
  const json = await getJson(`${BASE}/ajax/episode/list/${animeId}`, { xhr: true, referer: pageUrl });
  const episodes = [...String(json.result).matchAll(/<a\s[^>]*data-num="[^"]*"[^>]*>/g)].map((m) => {
    const tag = m[0];
    return {
      id: count(/data-id="(\d+)"/, tag),
      number: count(/data-num="([^"]*)"/, tag),
      slug: count(/data-slug="([^"]*)"/, tag),
      malId: count(/data-mal="(\d+)"/, tag),
      timestamp: Number(count(/data-timestamp="(\d+)"/, tag)),
      sub: count(/data-sub="(\d+)"/, tag) === "1",
      dub: count(/data-dub="(\d+)"/, tag) === "1",
      ids: count(/data-ids="([^"]*)"/, tag),
    };
  });
  return { animeId, episodes };
}

function getEpisodes(slug) {
  return cached(`episodes:${slug}`, 120000, () => loadEpisodes(slug));
}

module.exports = { getEpisodes, animeIdFromPage };
