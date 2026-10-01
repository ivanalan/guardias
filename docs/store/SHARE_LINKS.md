# Rotation share links

Share links use `https://alanmatias.com/guardias/r/?d=…` (trailing slash — Astro 301s the no-slash path).

Recipients always land on the website options page. The app is **not** opened automatically via Universal / App Links.

The **Interdía App** button on that page tries the custom scheme first (`miguardia://guardias/r/?d=…`). If the app is not installed, it falls back to the App Store.

Association files on the portfolio site (`ivanalan.github.io`) no longer claim `/guardias/r` (empty AASA details / empty `assetlinks.json`). Keep the files so `/.well-known/*` still returns 200.

## Ship checklist

1. Deploy the portfolio site so `https://alanmatias.com/guardias/r/` has the updated open-in-app button and well-known files no longer claim the path.
2. Ship a **new native build** (TestFlight / Play) without `associatedDomains` / HTTPS `intentFilters` so installed apps stop claiming the HTTPS share URL.
3. On device: open a share link from Messages → website loads → tap **Interdía App** → Add Rotation prefills (or App Store if not installed).

## Local smoke test (custom scheme)

Open on a dev / production build:

`miguardia://guardias/r/?d=<payload-from-share>`
