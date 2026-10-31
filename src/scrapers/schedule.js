"use strict";

const { BASE, getJson, fail } = require("../core/http");
const { cached } = require("../core/cache");
const { text, count } = require("../core/html");

function parseSchedule(html) {
  const week = [...html.matchAll(/class="sc-day[^"]*" data-time="(\d+)" data-label="([^"]+)"/g)].map((m) => ({
    timestamp: Number(m[1]),
    label: m[2],
  }));
  const items = [];
  for (const part of html.split('<div class="sc-grp').slice(1)) {
    const airing = Number(count(/data-airing="(\d+)"/, part));
    const time = text(count(/class="sc-time">([\s\S]*?)<\/span>/, part) || "");
    for (const card of part.split('<a class="sc-card"').slice(1)) {
      const href = card.match(/href="[^"]*\/watch\/([^/?#"]+)(?:\/ep-([^/?#"]+))?/);
      items.push({
        time,
        airing: airing || null,
        aired: part.slice(0, 20).includes("aired"),
        slug: href ? href[1] : null,
        episode: href && href[2] ? href[2] : null,
        type: count(/data-type="([^"]+)"/, card),
        title: text(count(/class="sc-name[^"]*"[^>]*>([^<]*)</, card) || ""),
        titleJp: count(/class="sc-name[^"]*"[^>]*data-jp="([^"]*)"/, card),
        poster: count(/<img[^>]+src="([^"]+)"/, card),
        description: text(count(/class="sc-des">([\s\S]*?)<\/div>/, card) || ""),
        genres: [...card.matchAll(/class="sc-gen">([\s\S]*?)<\/div>/g)].flatMap((m) =>
          [...m[1].matchAll(/<span>([^<]*)</g)].map((g) => text(g[1]))
        ),
      });
    }
  }
  return { week, items };
}

function getSchedule(tz, date) {
  return cached(`schedule:${tz}:${date || ""}`, 120000, () => loadSchedule(tz, date));
}

async function loadSchedule(tz, date) {
  const time = date ? new Date(date).getTime() / 1000 : null;
  if (date && Number.isNaN(time)) fail(`Invalid date "${date}"`, 400);
  const base = await getJson(`${BASE}/ajax/schedule/page?tz=${tz}`, { xhr: true });
  const parsed = parseSchedule(String(base.result));
  if (!time) return parsed;
  const day = await getJson(`${BASE}/ajax/schedule/page/date?tz=${tz}&time=${Math.floor(time)}`, { xhr: true });
  return { week: parsed.week, items: parseSchedule(String(day.result)).items };
}

module.exports = { getSchedule };
