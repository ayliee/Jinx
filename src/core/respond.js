"use strict";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function apiOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${req.headers.host || "localhost"}`;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    ...CORS,
    ...headers,
  });
  res.end(JSON.stringify(body));
}

function ok(res, data) {
  send(res, 200, { ok: true, data });
}

function fail(res, status, message) {
  send(res, status, { ok: false, error: message });
}

function badRequest(res, message) {
  fail(res, 400, message);
}

function route(handler) {
  return async function wrapped(req, res) {
    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS);
      return res.end();
    }
    try {
      await handler(req, res);
    } catch (error) {
      const status = Number.isInteger(error.status) ? error.status : 500;
      fail(res, status, error.message || "Request failed");
    }
  };
}

module.exports = { CORS, apiOrigin, send, ok, fail, badRequest, route };
