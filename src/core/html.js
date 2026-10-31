"use strict";

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decodeEntities(value) {
  return String(value).replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code) => {
    if (code[0] === "#") {
      const hex = code[1] === "x" || code[1] === "X";
      const point = parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isNaN(point) ? match : String.fromCodePoint(point);
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

function text(html) {
  return decodeEntities(String(html).replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function attr(tag, name) {
  const match = String(tag).match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return match ? decodeEntities(match[2] ?? match[3]) : null;
}

function section(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start === -1) return "";
  const end = endMarker ? html.indexOf(endMarker, start) : -1;
  return end === -1 ? html.slice(start) : html.slice(start, end);
}

function count(pattern, source, group = 1) {
  const match = String(source).match(pattern);
  return match ? match[group] : null;
}

module.exports = { decodeEntities, text, attr, section, count };
