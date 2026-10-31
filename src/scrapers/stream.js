"use strict";

const crypto = require("crypto");
const { BASE, getText, getJson, fail } = require("../core/http");
const { count } = require("../core/html");
const { sign } = require("../core/sign");
const { getEpisodes } = require("./episodes");
const { getServers } = require("./servers");

const MEGAPLAY = "https://megaplay.buzz/";
const FALLBACK_KEY = "i?LMTAx0Q6,:}50U";
const FALLBACK_IV = "W0;27ToaUpl_P%'c";

let cipherKeys = null;

function padded(value, size) {
  return Buffer.concat([Buffer.from(value, "utf8"), Buffer.alloc(size)]).slice(0, size);
}

function decryptSource(enc, key, iv) {
  const raw = Buffer.from(enc.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", padded(key, 32), padded(iv, 16));
  const out = Buffer.concat([decipher.update(raw), decipher.final()]).toString("utf8");
  return JSON.parse(out);
}

async function loadCipherKeys(embedHtml) {
  if (cipherKeys) return cipherKeys;
  const script = embedHtml.match(/src="(https:\/\/megaplay\.buzz\/lib\/app\.main\.js\?v=[^"]+)"/);
  if (script) {
    try {
      const js = await getText(script[1], { referer: MEGAPLAY });
      cipherKeys = {
        key: count(/DOMAINS_ENC_KEY="([^"]+)"/, js) || FALLBACK_KEY,
        iv: count(/DOMAINS_ENC_IV="([^"]+)"/, js) || FALLBACK_IV,
      };
      return cipherKeys;
    } catch {
      // fall through to the bundled keys
    }
  }
  cipherKeys = { key: FALLBACK_KEY, iv: FALLBACK_IV };
  return cipherKeys;
}

function parseMaster(masterText, masterUrl) {
  const lines = masterText.split(/\r?\n/);
  const sources = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("#EXT-X-STREAM-INF:")) continue;
    const info = lines[i];
    const url = (lines[i + 1] || "").trim();
    if (!url || url.startsWith("#")) continue;
    sources.push({
      quality: count(/NAME="([^"]*)"/, info) || count(/RESOLUTION=([\dxX]+)/, info),
      resolution: count(/RESOLUTION=([\dxX]+)/, info),
      bandwidth: Number(count(/BANDWIDTH=(\d+)/, info)),
      file: new URL(url, masterUrl).href,
    });
    i++;
  }
  return sources;
}

async function resolveFromLinkId(linkId, origin) {
  const res = await getJson(`${BASE}/ajax/server?get=${encodeURIComponent(linkId)}`, { xhr: true });
  const embed = res.result && res.result.url;
  if (!embed) fail("Could not resolve this server link", 404);
  const embedUrl = new URL(embed);
  const embedHtml = await getText(embed, { referer: `${embedUrl.origin}/` });
  const playerId = count(/id="megaplay-player"[^>]*data-id="(\d+)"/, embedHtml);
  if (!playerId) fail("Could not find the player id on the embed page", 502);
  const keys = await loadCipherKeys(embedHtml);
  const cdn = embedUrl.searchParams.get("s");
  const sourcesUrl = `${embedUrl.origin}/stream/getSourcesNew?id=${playerId}${cdn ? `&s=${cdn}` : ""}`;
  const payload = await getJson(sourcesUrl, { referer: embed });
  const masterFile = decryptSource(payload.enc, keys.key, keys.iv).file;
  const masterText = await getText(masterFile, { referer: MEGAPLAY });
  const variants = parseMaster(masterText, masterFile);
  const proxyOf = (file) => `${origin}/api/proxy?u=${encodeURIComponent(file)}&s=${sign(file)}`;
  return {
    embed,
    player: { id: playerId, cdn: cdn || null, label: payload.server || null },
    thumbnail: payload.image || null,
    skip: {
      intro: payload.intro || res.result.skip_data?.intro || null,
      outro: payload.outro || res.result.skip_data?.outro || null,
    },
    master: { file: masterFile, proxy: proxyOf(masterFile) },
    sources: variants.map((v) => ({ ...v, proxy: proxyOf(v.file) })),
    subtitles: (payload.tracks || []).map((t) => ({
      label: t.label,
      kind: t.kind,
      default: Boolean(t.default),
      file: t.file,
      proxy: proxyOf(t.file),
    })),
  };
}

async function pickServer({ ids, server, type }) {
  const { groups } = await getServers(ids);
  const wanted = type ? groups.filter((g) => g.type === String(type).toLowerCase()) : groups;
  const pool = wanted.length ? wanted : groups;
  for (const group of pool) {
    for (const entry of group.servers) {
      if (!server || entry.svId === String(server) || entry.name.toLowerCase() === String(server).toLowerCase()) {
        return { entry, type: group.type };
      }
    }
  }
  fail("No matching server found for this episode", 404);
}

async function getStream(query, origin) {
  if (query.link) return resolveFromLinkId(query.link, origin);
  let ids = query.ids;
  let picked = null;
  if (!ids) {
    if (!query.slug || !query.episode) fail("Provide link, ids, or slug plus episode", 400);
    const { episodes } = await getEpisodes(query.slug);
    const ep = episodes.find((e) => e.number === String(query.episode) || e.slug === String(query.episode));
    if (!ep) fail(`Episode "${query.episode}" not found`, 404);
    ids = ep.ids;
    picked = ep;
  }
  const { entry, type } = await pickServer({ ids, server: query.server, type: query.type });
  const stream = await resolveFromLinkId(entry.linkId, origin);
  return {
    episode: picked ? { number: picked.number, sub: picked.sub, dub: picked.dub } : null,
    server: { name: entry.name, svId: entry.svId, type },
    ...stream,
  };
}

module.exports = { getStream };
