"use strict";

const { text, attr, count } = require("../core/html");

function chunksOf(html) {
  const out = [];
  const re = /<(?:div|a) class="item[^"]*"/g;
  let match;
  const starts = [];
  while ((match = re.exec(html))) starts.push(match.index);
  for (let i = 0; i < starts.length; i++) {
    out.push(html.slice(starts[i], starts[i + 1] ?? html.length));
  }
  return out;
}

function episodeCounts(chunk) {
  const episodes = {};
  for (const m of chunk.matchAll(/ep-status (sub|dub|total)"><span>\s*([\d.,+]+)/g)) {
    episodes[m[1]] = m[2];
  }
  return Object.keys(episodes).length ? episodes : null;
}

function parseCards(html) {
  const cards = [];
  for (const chunk of chunksOf(html)) {
    const anchor = chunk.match(/<a[^>]+href="[^"]*\/watch\/([^/?#"]+)(?:\/ep-([^/?#"]+))?[^"]*"/);
    const nameTag = chunk.match(/<a[^>]*class="name[^"]*"[^>]*>|<div[^>]*class="name[^"]*"[^>]*>/);
    const title = nameTag ? text(chunk.slice(nameTag.index, chunk.indexOf("</", nameTag.index))) : text(attr(chunk.match(/<img[^>]+>/)?.[0] || "", "alt") || "");
    const card = {
      id: count(/data-tip="(\d+)"/, chunk),
      slug: anchor ? anchor[1] : null,
      episode: anchor && anchor[2] ? anchor[2] : null,
      title: title || null,
      titleJp: nameTag ? attr(nameTag[0], "data-jp") : null,
      poster: count(/<img[^>]+src="([^"]+)"/, chunk),
      episodes: episodeCounts(chunk),
      type: text(count(/class="right">([^<]*)</, chunk) || "") || count(/<span class="dot">([A-Za-z_ ]+)<\/span>/, chunk),
      score: count(/fa-star"><\/i>\s*([\d.]+)/, chunk) || count(/class="m-item rated"><span>([\d.]+)/, chunk),
      rating: count(/class="dot rating">([^<]*)</, chunk),
      rank: count(/class="rk">([^<]*)</, chunk),
    };
    const genres = [...chunk.matchAll(/href="[^"]*\/genre\/([^"]+)"[^>]*>([^<]*)</g)].map((m) => ({
      slug: m[1],
      name: text(m[2]),
    }));
    if (genres.length) card.genres = genres;
    if (card.slug || card.title) cards.push(card);
  }
  return cards;
}

function parsePagination(html) {
  const pages = [...html.matchAll(/title="Page (\d+)"/g)].map((m) => Number(m[1]));
  const current = Number(count(/class="page-item active"><a class="page-link">(\d+)/, html) || 1);
  const totalPages = pages.length ? Math.max(...pages, current) : current;
  return { page: current, totalPages, hasPrev: current > 1, hasNext: current < totalPages };
}

module.exports = { parseCards, parsePagination };
