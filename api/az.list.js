"use strict";

const { route, ok, badRequest } = require("../src/core/respond");
const { browseList } = require("../src/scrapers/browse");

const LETTERS = /^[A-Za-z]$|^0-9$|^other$/;

module.exports = route(async (req, res) => {
  const letter = String(req.query.letter || "").trim();
  if (!LETTERS.test(letter)) return badRequest(res, "letter must be A to Z, 0-9, or other");
  const path = `az-list/${letter.toLowerCase() === "other" ? "other" : letter.toUpperCase()}`;
  ok(res, await browseList(path, [["page", req.query.page]]), 120);
});
