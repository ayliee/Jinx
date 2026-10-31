"use strict";

const { BASE, getText } = require("../core/http");
const { cached } = require("../core/cache");
const { parseCards, parsePagination } = require("./cards");

function browseList(path, entries = []) {
  const query = new URLSearchParams();
  for (const [key, value] of entries) {
    if (value !== undefined && value !== null && value !== "") query.append(key, value);
  }
  const qs = query.toString();
  return cached(`browse:${path}?${qs}`, 120000, async () => {
    const html = await getText(`${BASE}/${path}${qs ? `?${qs}` : ""}`);
    return { items: parseCards(html), pagination: parsePagination(html) };
  });
}

module.exports = { browseList };
