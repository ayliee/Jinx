"use strict";

const { BASE, getText } = require("../core/http");
const { parseCards, parsePagination } = require("./cards");

async function browseList(path, entries = []) {
  const query = new URLSearchParams();
  for (const [key, value] of entries) {
    if (value !== undefined && value !== null && value !== "") query.append(key, value);
  }
  const qs = query.toString();
  const html = await getText(`${BASE}/${path}${qs ? `?${qs}` : ""}`);
  return { items: parseCards(html), pagination: parsePagination(html) };
}

module.exports = { browseList };
