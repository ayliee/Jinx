"use strict";

const { getJson } = require("../core/http");
const { cached } = require("../core/cache");

const MAPPER = "https://mapper.nekostream.site/api/mal";

function getDownloads(malId, episode, timestamp) {
  return cached(`dl:${malId}:${episode}:${timestamp}`, 600000, () => loadDownloads(malId, episode, timestamp));
}

async function loadDownloads(malId, episode, timestamp) {
  const json = await getJson(`${MAPPER}/${malId}/${episode}/${timestamp}`);
  const downloads = [];
  for (const [source, byType] of Object.entries(json)) {
    if (!byType || typeof byType !== "object") continue;
    for (const [type, payload] of Object.entries(byType)) {
      if (!payload || !payload.download) continue;
      for (const [quality, url] of Object.entries(payload.download)) {
        downloads.push({ source, type, quality, url });
      }
    }
  }
  return downloads;
}

module.exports = { getDownloads };
