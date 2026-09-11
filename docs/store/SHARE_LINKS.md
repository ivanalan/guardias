# Universal / App Links setup (rotation share)

Share links use `https://alanmatias.com/guardias/r/?d=…` (trailing slash — Astro 301s the no-slash path, which can break Universal Links).

Association files live in the portfolio site (`ivanalan.github.io`):

- `public/.well-known/apple-app-site-association`
- `public/.well-known/assetlinks.json`

Live (after #15): Team ID + Play SHA-256 are set; well-known endpoints return 200.

## Ship checklist

1. Confirm site still serves:
   - `https://alanmatias.com/.well-known/apple-app-site-association`
   - `https://alanmatias.com/.well-known/assetlinks.json`
   - `https://alanmatias.com/guardias/r/` (no redirect)
2. Ship a **new native build** (TestFlight / Play) with current `app.json` `associatedDomains` / `intentFilters`. Expo Go will not open these HTTPS links into the app.
3. On device: share a rotation → open the link from Messages → Add Rotation should prefill.

## Local smoke test without Universal Links

Open a custom-scheme URL on a dev build:

`miguardia://guardias/r/?d=<payload-from-share>`
