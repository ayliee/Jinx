# Jinx

Scraping API for [anikototv.to](https://anikototv.to). Anime metadata, episode lists, schedules, search, multi server stream resolution with signed CDN proxying and a hosted docs page at the root. Pure JS, no dependencies.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository=https://github.com/ayliee/Jinx)

1. Push this repo to GitHub and import it on Vercel (build settings on auto).
2. Set env `PROXY_SECRET` to a long random string (fallback `jinx.proxy`).
3. Open the site root: the docs page loads, `/player` opens the watch page.

Local: `npm start` then browse `http://localhost:8787`.

## Endpoints

| Route | Returns |
| --- | --- |
| `GET /api/home` | Spotlight, latest episodes, trending, new releases, top charts |
| `GET /api/latest` | Freshest episode feed, `?page=` paginated |
| `GET /api/random` | One random anime |
| `GET /api/search?q=` | Title search |
| `GET /api/filter` | Full catalog filter with genre, season, status, sort |
| `GET /api/az.list?letter=A` | A to Z listing |
| `GET /api/schedule` | Weekly release schedule, `?tz=` and `?date=` |
| `GET /api/anime/:slug` | Full metadata, seasons, related, reactions |
| `GET /api/episodes/:slug` | Episode list with sub/dub flags and MAL ids |
| `GET /api/servers?ids=` | Per episode server groups |
| `GET /api/stream` | Resolved HLS, sources, subtitles, skip markers |
| `GET /api/downloads?mal=&episode=&timestamp=` | Direct download links |
| `GET /api/proxy?u=&s=` | Signed HLS proxy with m3u8 rewriting |
| `GET /api/refresh` | Warms the hot feeds (auto called by cron) |
| `GET /api/health` | Liveness probe |
| `GET /player` | Custom watch page (hls.js powered) |

Every response is `{ ok: true, data }` or `{ ok: false, error }`.

## Auto updates

Freshness layer keeps feeds current the moment the source publishes:

* Short TTL caches with stale while revalidate per endpoint (30s search, 60s home/latest, 2m episodes/schedule, 5m servers, 10m metadata, streams never cached).
* `node local.js` warms home, latest and schedule every 60 seconds.
* On Vercel the `vercel.json` cron hits `/api/refresh` daily (Hobby plans only allow daily crons). The short TTL caches above revalidate on demand, so freshness never depends on the cron.

## Custom player

`/player?slug=...&ep=...` is a complete watch page styled after the source site: custom controls, skip intro/outro, auto play / auto skip / auto next, quality, speed, subtitle menu, SUB/DUB episode grid, server chips, resume position, watched marks and keyboard shortcuts. `?api=` points the page at any Jinx host.

## Proxy secret

`/api/proxy` only serves URLs signed by the API. Keep `PROXY_SECRET` identical across serverless instances so signatures stay valid. Rotate it to invalidate old media links. HLS playback is limited to the 1080p/720p/480p ladder; 4K renditions require a harder to break challenge token and are out of scope.

## Source

[github.com/ayliee/Jinx](https://github.com/ayliee/Jinx)
