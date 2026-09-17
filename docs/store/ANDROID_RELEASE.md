# Android release checklist — Mi Guardia

## Before the first production build

- [x] App icon at `assets/icon.png` (1024×1024)
- [x] Adaptive foreground at `assets/adaptive-icon.png` (transparent PNG)
- [x] `app.json` Android package `com.alanmatias.guardias`, `versionCode`, adaptive icon
- [x] `eas.json` with production `app-bundle` profile
- [ ] Publish legal pages (see below)
- [ ] Expo account + EAS project linked (`npx eas-cli init` / `eas build:configure` if needed)
- [ ] Google Play Console app created for `com.alanmatias.guardias`

## Publish Privacy Policy and Terms

Source files in this repo:

- Markdown: `docs/store/privacy-policy.md`, `docs/store/terms-of-service.md`
- HTML to host: `docs/store/legal/privacy.html`, `docs/store/legal/terms.html`

Copy HTML into [ivanalan/ivanalan.github.io](https://github.com/ivanalan/ivanalan.github.io):

```text
public/guardias/privacy.html
public/guardias/terms.html
```

Deploy the site, then confirm:

- https://alanmatias.com/guardias/privacy.html
- https://alanmatias.com/guardias/terms.html

Use the privacy URL in Play Console → App content → Privacy policy.

## Build the Android App Bundle

```bash
# once per machine / project
npm install -g eas-cli   # or use npx eas-cli
npx eas-cli login
npx eas-cli build:configure   # if not already linked

# production AAB for Play Store
npx eas-cli build -p android --profile production
```

Download the `.aab` from the EAS build page when it finishes.

Preview APK for device testing (optional):

```bash
npx eas-cli build -p android --profile preview
```

## Play Console listing

Use copy from [`play-listing.md`](./play-listing.md).

- [ ] Store listing: title, short + full description (**en-US** and **es-MX**)
- [ ] High-res icon 512×512
- [ ] Feature graphic 1024×500
- [ ] Phone screenshots (≥ 2)
- [ ] Privacy policy URL
- [ ] Data safety form (offline-only answers in play-listing.md)
- [ ] Content rating questionnaire
- [ ] Target audience / news apps / COVID declarations as applicable
- [ ] App access (no login) and ads declaration (**No ads**)

## Upload and roll out

**Preferred path:** download the production `.aab` from the EAS build page and upload it yourself in Play Console. Do **not** configure a Google Play service account for `eas submit` unless you explicitly decide to automate uploads later. Agents follow `.agents/skills/android-store-submit`.

- [ ] Create release on **Internal testing** track first
- [ ] Upload AAB; set release name (e.g. `1.0.0 (1)`)
- [ ] Add yourself (and testers) to the internal track; install via Play
- [ ] Smoke-test: create rotation, calendar, day detail, language switch, relaunch persistence
- [ ] Promote to **Closed** / **Open** / **Production** when ready

## Version bumps later

1. Bump `expo.version` in `app.json` (user-facing, e.g. `1.0.1`)
2. Bump `android.versionCode` (integer, must increase every Play upload)
3. Rebuild with EAS production profile

## Notes

- Expo Go does **not** reliably show the final launcher icon or splash — trust preview/production builds.
- Screenshots and feature graphic stay in Play Console; they do not need to live in this repo.
- Contact email on the Play listing should be an address you monitor (also referenced from the privacy/terms pages).
