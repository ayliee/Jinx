# Jinx API

A pure Node.js anime scraping API for anikototv.to built for streaming integrations. No npm dependencies, no build step, deployable on Vercel with one click.

## Features

* Home page rails: spotlight, latest episodes, trending, new releases, top charts
* Search and advanced filtering with pagination
* Full anime metadata: titles, synopsis, genres, studios, scores, seasons, related series
* Episode lists with sub/dub flags
* Streaming server resolution down to HLS master playlists with quality variants
* Multi language subtitles and skip intro/outro timestamps
* Weekly airing schedule and direct download links
* Built in media proxy that rewrites m3u8 playlists for in browser playback

## Run locally

```bash
npm start
# http://localhost:8787
```

Open `http://localhost:8787/` for the documentation page.

## Deploy on Vercel

1. Push this folder to a Git repository.
2. Import the repo at [vercel.com/new](https://vercel.com/new), keep defaults, deploy.
3. The deployment URL serves the docs at `/` and the API under `/api`.

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/home` | Home page rails and charts |
| `GET /api/random` | Random anime |
| `GET /api/search?q=` | Title search |
| `GET /api/filter` | Advanced browse with filters and sorting |
| `GET /api/az-list?letter=` | A to Z listing |
| `GET /api/browse/:category/:value` | Genre, studio, producer, status listing |
| `GET /api/schedule` | Weekly airing schedule |
| `GET /api/anime/:slug` | Full anime metadata |
| `GET /api/episodes/:slug` | Episode list |
| `GET /api/servers?ids=` | Servers of one episode |
| `GET /api/stream` | Playable HLS stream, subtitles, skip times |
| `GET /api/downloads?mal=&episode=&timestamp=` | Download links |
| `GET /api/proxy?u=` | CDN media proxy with playlist rewriting |
| `GET /api/health` | Health check |

Full parameter tables, response samples and an integration guide live on the docs page.

## Project layout

```
api/            Vercel entrypoints, one thin handler per route
src/core/       HTTP client, HTML helpers, response helpers
src/scrapers/   Parsers and request chains per feature
docs/index.html Documentation page with sidebar
server.js       Local runner that mirrors the Vercel routes
```

## Configuration

Optional environment variable:

* `PROXY_SECRET` sets the HMAC secret used to sign `/api/proxy` links. Set the same value on your deployment for a private signature.

## Notes

* Node.js 18 or newer is required (global fetch).
* All endpoints are GET, CORS open, cache friendly.
* Educational project. Content belongs to its respective owners.
