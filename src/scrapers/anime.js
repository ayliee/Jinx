"use strict";

const { BASE, getText, getJson, fail } = require("../core/http");
const { cached } = require("../core/cache");
const { text, count } = require("../core/html");
const { parseCards } = require("./cards");

function pairList(chunk) {
  return [...chunk.matchAll(/<a[^>]+href="[^"]*\/(genre|studio|producer|status)\/([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(
    (m) => ({ slug: m[2], name: text(m[3]) })
  );
}

function parseDetails(html) {
  const metaBlock = (label) => {
    const m = html.match(new RegExp(`<div>\\s*${label}:\\s*<span>([\\s\\S]*?)</span>\\s*</div>`, "i"));
    return m ? m[1] : "";
  };
  const nameTag = html.match(/<h1[^>]*class="title[^"]*"[^>]*>/) || [];
  return {
    id: count(/const mangaId = (\d+)/, html) || count(/id="watch-main"[^>]*data-id="(\d+)"/, html),
    title: text(count(/<h1[^>]*class="title[^"]*"[^>]*>([^<]*)</, html) || ""),
    titleJp: count(/data-jp="([^"]*)"/, nameTag[0] || ""),
    otherNames: text(count(/class="names[^"]*">([\s\S]*?)<\/div>/, html) || "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean),
    poster: count(/property="og:image" content="([^"]+)"/, html),
    banner: count(/id="player"[^>]*background-image:\s*url\('([^']+)'\)/, html),
    rating: text(count(/<i class="rating">([^<]*)</, html) || ""),
    quality: text(count(/<i class="quality">([^<]*)</, html) || ""),
    hasSub: /fa-closed-captioning/.test(html),
    hasDub: /fa-microphone/.test(html),
    synopsis: text(count(/class="synopsis[^"]*">[\s\S]*?<div class="content">([\s\S]*?)<\/div>/, html) || ""),
    type: text(metaBlock("Type")),
    premiered: text(metaBlock("Premiered")),
    aired: text(metaBlock("Aired")),
    status: text(metaBlock("Status")),
    genres: pairList(metaBlock("Genres")),
    score: text(metaBlock("MAL")) || null,
    duration: text(metaBlock("Duration")),
    episodeCount: text(metaBlock("Episodes")),
    studios: pairList(metaBlock("Studios")),
    producers: pairList(metaBlock("Producers")),
    ratingScore: count(/id="w-rating"[^>]*data-score="([\d.]+)"/, html),
    reviews: count(/itemprop="reviewCount"[^>]*>(\d+)/, html),
  };
}

function parseRelated(html) {
  const items = [];
  for (const chunk of html.split('<div class="item flexserieslist"').slice(1)) {
    const anchor = chunk.match(/<a[^>]+class="name[^"]*"[^>]+href="[^"]*\/watch\/([^/?#"]+)/);
    items.push({
      id: count(/data-id="(\d+)"/, chunk),
      slug: anchor ? anchor[1] : null,
      title: text(count(/class="name[^"]*"[^>]*>([^<]*)</, chunk) || ""),
      poster: count(/<img[^>]+src="([^"]+)"/, chunk),
      relation: count(/class="relation serieslabelitem"\s+id="([^"]+)"/, chunk),
    });
  }
  return items;
}

async function loadAnime(slug) {
  const html = await getText(`${BASE}/watch/${slug}`);
  const details = parseDetails(html);
  if (!details.id) fail(`Could not resolve anime id for "${slug}"`, 404);
  const [seasons, related, reactions] = await Promise.all([
    getJson(`${BASE}/api/seasons/${details.id}`, { xhr: true }).then((r) =>
      typeof r.result === "string" ? parseCards(r.result) : []
    ),
    getJson(`${BASE}/api/watch-order/${details.id}`, { xhr: true }).then((r) =>
      typeof r.result === "string" ? parseRelated(r.result) : []
    ),
    getJson(`${BASE}/ajax/reactions/list?type=anime&id=${details.id}`, { xhr: true }).then((r) =>
      (r.items || []).map((it) => ({ key: it.key, emoji: it.emoji, label: it.label, count: it.count }))
    ),
  ]);
  return { ...details, slug, seasons, related, reactions };
}

function getAnime(slug) {
  return cached(`anime:${slug}`, 600000, () => loadAnime(slug));
}

module.exports = { getAnime };
