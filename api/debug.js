"use strict";

const store = globalThis.__jinxCrash || (globalThis.__jinxCrash = { errors: [] });
if (!globalThis.__jinxHooked) {
  globalThis.__jinxHooked = true;
  process.on("uncaughtException", (e) => {
    store.errors.push({ kind: "uncaught", at: new Date().toISOString(), text: String((e && e.stack) || e) });
  });
  process.on("unhandledRejection", (e) => {
    store.errors.push({ kind: "reject", at: new Date().toISOString(), text: String((e && e.stack) || e) });
  });
}

module.exports = async (req, res) => {
  const out = { node: process.version, errors: store.errors.slice(-6), steps: [] };
  try {
    out.env = {
      httpsProxy: process.env.HTTPS_PROXY || process.env.https_proxy || null,
      httpProxy: process.env.HTTP_PROXY || process.env.http_proxy || null,
      noProxy: process.env.NO_PROXY || process.env.no_proxy || null,
    };
    out.steps.push("env");

    const dns = require("dns").promises;
    out.dnsSite = (await dns.lookup("anikototv.to")).address;
    out.steps.push("dns");

    const r1 = await fetch("https://example.com/", { signal: AbortSignal.timeout(10000) });
    out.example = r1.status;
    out.steps.push("example");

    const r2 = await fetch("https://anikototv.to/", {
      headers: { "User-Agent": "Mozilla/5.0", "X-Requested-With": "XMLHttpRequest" },
      signal: AbortSignal.timeout(10000),
    });
    out.site = r2.status;
    out.siteLen = (await r2.text()).length;
    out.steps.push("site");
    out.done = true;
  } catch (e) {
    out.error = String((e && e.stack) || e);
    out.cause = e && e.cause ? String(e.cause.stack || e.cause) : null;
  }
  res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(out, null, 2));
};
