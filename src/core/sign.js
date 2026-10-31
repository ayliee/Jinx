"use strict";

const crypto = require("crypto");

const PROXY_SECRET = process.env.PROXY_SECRET || "jinx-proxy";

function sign(value) {
  return crypto.createHmac("sha256", PROXY_SECRET).update(String(value)).digest("base64url");
}

module.exports = { sign };
