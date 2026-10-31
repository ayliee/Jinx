"use strict";

const fs = require("fs");
const path = require("path");

function loadDoc(file) {
  const candidates = [
    path.join(process.cwd(), "docs", file),
    path.join(__dirname, "..", "..", "docs", file),
  ];
  for (const target of candidates) {
    if (fs.existsSync(target)) return fs.readFileSync(target, "utf8");
  }
  return null;
}

module.exports = { loadDoc };
