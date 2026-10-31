"use strict";

const { BASE, getJson } = require("../core/http");
const { cached } = require("../core/cache");
const { text, count, section } = require("../core/html");

function getServers(ids) {
  return cached(`servers:${ids}`, 300000, () => loadServers(ids));
}

async function loadServers(ids) {
  const json = await getJson(`${BASE}/ajax/server/list?servers=${encodeURIComponent(ids)}`, {
    xhr: true,
  });
  const html = String(json.result);
  const groups = [];
  for (const part of html.split('<div class="type"').slice(1)) {
    const type = count(/data-type="([^"]+)"/, part);
    const servers = [...part.matchAll(/<li\s[^>]*data-ep-id="[^"]*"[^>]*>[\s\S]*?<\/li>/g)].map((m) => {
      const tag = m[0];
      return {
        name: text(tag.slice(tag.indexOf(">") + 1, tag.lastIndexOf("</li>"))),
        epId: count(/data-ep-id="([^"]*)"/, tag),
        cmid: count(/data-cmid="([^"]*)"/, tag),
        svId: count(/data-sv-id="([^"]*)"/, tag),
        linkId: count(/data-link-id="([^"]*)"/, tag),
      };
    });
    if (type && servers.length) groups.push({ type, servers });
  }
  return { groups, tip: text(section(html, 'class="tip"', 'class="servers"')) };
}

module.exports = { getServers };
