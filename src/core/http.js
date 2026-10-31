"use strict";

const BASE = "https://anikototv.to";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function fail(message, status) {
  throw new HttpError(message, status);
}

async function request(url, options = {}) {
  const { referer = BASE, xhr = false, headers = {}, timeout = 20000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: referer,
        ...(xhr ? { "X-Requested-With": "XMLHttpRequest" } : {}),
        ...headers,
      },
    });
    if (!res.ok) fail(`Upstream responded with ${res.status} for ${url}`, res.status);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function getText(url, options) {
  return (await request(url, options)).text();
}

async function getJson(url, options) {
  return (await request(url, options)).json();
}

module.exports = { BASE, UA, HttpError, fail, request, getText, getJson };
