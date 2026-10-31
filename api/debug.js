"use strict";

const store = globalThis.__jinxCrash || (globalThis.__jinxCrash = { errors: [], steps: [] });
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
  const out = { node: process.version, errors: store.errors.slice(-6), steps: [], prevSteps: store.steps.slice(-10) };
  const step = (name) => { out.steps.push(name); store.steps = out.steps.slice(-20); };

  try {
    step("start");
    const { getHome } = require("../src/scrapers/home");
    step("required scraper");
    const data = await getHome();
    step("getHome returned");
    out.homeKeys = Object.keys(data);
    out.homeSize = JSON.stringify(data).length;
    const body = JSON.stringify({ ok: true, data });
    step("stringified " + body.length);
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    });
    step("writeHead done");
    res.end(body);
    step("end called");
    return;
  } catch (e) {
    out.error = String((e && e.stack) || e);
    out.cause = e && e.cause ? String(e.cause.stack || e.cause) : null;
    step("threw");
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify(out, null, 2));
  }
};
