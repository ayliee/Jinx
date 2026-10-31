"use strict";

const entries = new Map();

async function fetchAndStore(key, loader) {
  const value = await loader();
  entries.set(key, { value, time: Date.now(), refreshing: false });
  return value;
}

// Serves cached data instantly, refreshes stale entries in the background.
async function cached(key, ttlMs, loader) {
  const hit = entries.get(key);
  const now = Date.now();
  if (hit && now - hit.time < ttlMs) return hit.value;
  if (hit) {
    if (!hit.refreshing) {
      hit.refreshing = true;
      fetchAndStore(key, loader).catch(() => {
        hit.refreshing = false;
      });
    }
    return hit.value;
  }
  return fetchAndStore(key, loader);
}

module.exports = { cached, entries };
