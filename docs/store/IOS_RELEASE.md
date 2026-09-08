# iOS release guide — Guardias (first-time)

This guide walks you from “I have an Expo app” to “Guardias is live on the App Store.” It explains **what** each step is, **why** it exists, and **where to click**.

**Updates after the first live version:** do not skip to `eas submit --latest`. Use the version-train procedure in [Version trains and later uploads](#version-trains-and-later-uploads). Agents must follow `.agents/skills/ios-store-submit/SKILL.md`.

If you already shipped Android: Apple’s **App Store Connect** is the closest equivalent to **Google Play Console**. You also need a paid **Apple Developer Program** membership (like Play’s one-time developer fee, but Apple bills yearly).

---

## Big picture: three systems


| System                              | What it is                                            | Why you need it                                                            |
| ----------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| **Apple Developer Program**         | Paid membership tied to your Apple ID                 | Legal right to sign apps and distribute on the App Store                   |
| **App Store Connect**               | Web console for listings, TestFlight, review, pricing | Where the store page lives and where Apple reviews your app                |
| **EAS (Expo Application Services)** | Cloud builds + upload for Expo projects               | Builds a signed IPA and can upload it to Connect without Xcode on your Mac |


**Flow (first release):**

1. Enroll in Apple Developer Program
2. Create the app record in App Store Connect
3. Host Privacy Policy / Terms URLs
4. Let EAS create signing credentials and build a production IPA
5. Upload → Apple processes the build → it appears in **TestFlight**
6. Fill listing + privacy questionnaires in Connect
7. Smoke-test on a real device via TestFlight
8. Attach the build to a version and **Submit for Review**
9. After approval, release (manual or automatic)

> **Important:** `eas submit` (or `--auto-submit`) only **uploads** the binary. **Submitting for App Review** is always a manual click in App Store Connect.

---

## Guardias identifiers (do not change lightly)

These are already set in the repo. Treat them as permanent for this app identity:


| Field               | Value                     | Where                                                                        |
| ------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| App name            | Mi Guardia                | `app.json` → `expo.name` / iOS `CFBundleDisplayName`                         |
| Bundle ID           | `com.alanmatias.guardias` | `app.json` → `expo.ios.bundleIdentifier`                                     |
| User-facing version | e.g. `1.0.1`              | `app.json` → `expo.version`                                                  |
| iOS build number    | auto-managed remotely     | `eas.json` → `appVersionSource: "remote"` + production `autoIncrement: true` |
| EAS project         | linked                    | `app.json` → `extra.eas.projectId`, owner `10alanm`                          |
| Encryption flag     | no non-exempt encryption  | `app.json` → `ios.infoPlist.ITSAppUsesNonExemptEncryption: false`            |


**Bundle ID** is Apple’s package name. Once an app exists with that ID under your team, renaming it means creating a *new* app. Match Play’s package (`com.alanmatias.guardias`) on purpose.

**Version vs build number:**

- **Version** (`1.0.1`) — what users see on the store (“What’s New”).
- **Build number** (integer) — Apple’s upload counter. Every new binary uploaded for the same version (or any version) must have a **higher** build number. EAS production profile increments this for you.

---

## What’s already done in this repo

You do **not** need to redo these for the first iOS release:

- [x] App icon at `assets/icon.png` (1024×1024)
- [x] Splash configured in `app.json` (`expo-splash-screen`)
- [x] iOS `bundleIdentifier` `com.alanmatias.guardias`
- [x] Production EAS profile with remote build numbers
- [x] EAS project linked (`extra.eas.projectId`, owner `10alanm`)
- [x] Export compliance hint in Info.plist (`ITSAppUsesNonExemptEncryption: false`)

Still required on the Apple / web side (this guide):

- [ ] Apple Developer Program enrollment
- [ ] App Store Connect app created for `com.alanmatias.guardias`
- [ ] Legal pages published and reachable over HTTPS
- [ ] First production build + upload
- [ ] Store listing, privacy, screenshots, age rating
- [ ] TestFlight smoke test
- [ ] Submit for Review → release

---

## 1. Enroll in the Apple Developer Program

### What this is

A yearly paid membership with Apple. Without it you cannot distribute on the App Store, create App Store Connect apps for distribution, or generate the certificates EAS needs for a store build.

### Why

Google charges a one-time Play Console fee. Apple charges **USD $99/year** (Individual) for the Developer Program. Individual is enough for Guardias as a personal app.

### Steps

1. Open [developer.apple.com/programs](https://developer.apple.com/programs/).
2. Click **Enroll** / **Start Your Enrollment**.
3. Sign in with the **Apple ID** you want as the developer account owner (use one you control long-term).
4. Choose **Individual** (unless you have a company D-U-N-S and want an Organization account).
5. Complete identity verification (Apple may ask for government ID / phone verification).
6. Pay the annual fee and wait for approval email.

Enrollment can be near-instant or take a day or two. You are ready when:

- [developer.apple.com/account](https://developer.apple.com/account) shows an active membership, **and**
- [appstoreconnect.apple.com](https://appstoreconnect.apple.com) lets you open **Apps** (not just a “complete enrollment” wall).

### Optional: Agreements

In App Store Connect → **Business** (or **Agreements, Tax, and Banking**):

1. Accept the **Paid Applications Agreement** even if Guardias is free (Apple still requires banking/tax setup for the account in many regions).
2. Complete **Tax** and **Banking** forms if prompted. Incomplete agreements often block “Ready for Sale” later even when review passes.

---

## 2. Create the app in App Store Connect

### What this is

An **app record**: empty store listing + container for builds, TestFlight, and review. Creating it does **not** publish anything.

### Why

EAS can build an IPA without this, but **upload/submit** needs a matching App Store Connect app with the same bundle ID.

### Steps

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → sign in.
2. Click **Apps**.
3. Click the **+** button → **New App**.
4. Fill the dialog:
  - **Platforms:** iOS  
  - **Name:** `Mi Guardia` (this is the App Store display name; must be unique on the store)  
  - **Primary Language:** English (U.S.) or Spanish — pick your default; you will add the other localization later  
  - **Bundle ID:** select `com.alanmatias.guardias`  
    - If it is missing from the dropdown: go to [developer.apple.com/account/resources/identifiers/list](https://developer.apple.com/account/resources/identifiers/list) → **+** → **App IDs** → **App** → register `com.alanmatias.guardias`, then return and refresh Connect.  
    - Or skip manual registration: the first EAS iOS build can register the App ID when you allow EAS to manage credentials — then create the Connect app afterward.
  - **SKU:** any private code, e.g. `guardias-ios` (users never see this)  
  - **User Access:** Full Access (unless you use roles)
5. Click **Create**.

You should land on the app’s page with left-nav sections like **Distribution**, **TestFlight**, **App Store**, etc. (UI labels shift slightly over time; look for version / listing / TestFlight).

---

## 3. Publish Privacy Policy and Terms

### What this is

Public HTTPS pages Apple (and users) can open. App Store Connect requires a **Privacy Policy URL**. A support URL is also expected.

### Why

Guardias is offline-first and does not collect accounts, but Apple still wants a policy describing what you do/don’t collect. Same documents as Play.

### Source files in this repo

- Markdown: `docs/store/privacy-policy.md`, `docs/store/terms-of-service.md`
- HTML to host: `docs/store/legal/privacy.html`, `docs/store/legal/terms.html`

### Steps

1. Copy the HTML into [ivanalan/ivanalan.github.io](https://github.com/ivanalan/ivanalan.github.io):
  ```text
   public/guardias/privacy.html
   public/guardias/terms.html
  ```
2. Deploy that site (however you normally publish alanmatias.com).
3. Confirm in a browser (incognito):
  - [https://alanmatias.com/guardias/privacy.html](https://alanmatias.com/guardias/privacy.html)  
  - [https://alanmatias.com/guardias/terms.html](https://alanmatias.com/guardias/terms.html)

Use:

- **Privacy Policy URL** → privacy page  
- **Support URL** → terms page or a contact page (terms is fine)

Contact email on those pages should be an address you monitor.

---

## 4. Signing credentials (certificates & profiles)

### What this is

Apple requires every App Store binary to be cryptographically signed with certificates belonging to your Developer team, plus a **provisioning profile** that ties the cert to the app’s bundle ID and distribution type.


| Artifact                     | Role                                                                  |
| ---------------------------- | --------------------------------------------------------------------- |
| **Distribution certificate** | Proves “this binary was built by this Apple team”                     |
| **Provisioning profile**     | Allows that cert to ship **this** bundle ID to App Store / TestFlight |
| **IPA**                      | iOS installable package (like Android’s AAB/APK, but for Apple)       |


### Why you usually don’t click around Apple’s certificate UI

On first iOS build, **EAS can create and store** the distribution certificate and App Store provisioning profile for you. That is the recommended path for Expo Go–based projects.

### Steps (when EAS prompts)

1. Run the production build (next section).
2. When the CLI asks whether to let EAS manage credentials, choose **yes** / **Generate new**.
3. Sign in with your Apple ID when prompted (or later use an API key — see “API key” under Submit).
4. If Apple asks for 2FA, enter the code from a trusted device.

You can inspect credentials later with:

```bash
npx eas-cli credentials -p ios
```

Avoid manually revoking certificates in the Apple Developer portal unless you know you need to rotate them — that can break EAS until you regenerate.

---

## 5. Build the production IPA with EAS

### What this is

A cloud Mac builds your Expo project into a **signed App Store IPA**. Expo Go is **not** the store binary; TestFlight / production builds are.

### Why

Local Xcode archives work, but EAS matches this repo’s workflow and already owns remote build numbers.

### Steps

From the Guardias repo root:

```bash
# once per machine if you prefer a global CLI
npm install -g eas-cli   # or always use npx eas-cli

npx eas-cli login
# use the Expo account that owns project 10alanm / guardias

npx eas-cli build -p ios --profile production
```

What happens:

1. EAS uploads the project (or uses git).
2. On first iOS build, credential setup runs (previous section).
3. Cloud build compiles native iOS + JS bundle.
4. You get a build page URL; wait until status is **finished**.
5. Artifact is an IPA suitable for App Store / TestFlight (not for random sideloading without profiles).

Optional — build and upload in one step:

```bash
npx eas-cli build -p ios --profile production --auto-submit
```

`--auto-submit` uses the `submit.production` profile in `eas.json` when configured; you still must complete listing + review in Connect.

---

## 6. Upload the build to App Store Connect

### What this is

Sending the IPA to Apple for **processing**. After processing (~10–15+ minutes), the build shows under **TestFlight** and can be selected for a store version.

### Steps (if you did not use `--auto-submit`)

```bash
npx eas-cli submit -p ios --latest
```

CLI will ask you to authenticate. Options:

1. **Apple ID + app-specific password / interactive login** — fine for first time.
2. **App Store Connect API key** (better for CI / fewer 2FA prompts):
  - App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API**  
  - **Generate** a key with **App Manager** (or Admin) access  
  - Download the `.p8` once; note **Issuer ID** and **Key ID**  
  - Store them for EAS (`eas secret` / submit profile) — do not commit the `.p8` to git

### Where to look in Connect

1. Open your **Guardias** app.
2. Open **TestFlight**.
3. Under iOS builds, wait until processing finishes (email: “The following build has completed processing”).
4. If Apple asks for **Export Compliance** on the build, answer consistently with the app: Guardias sets `ITSAppUsesNonExemptEncryption` to `false` — typically you only use standard HTTPS / OS encryption, so “no non-exempt encryption” applies. Confirm with your lawyer if unsure; for this offline calendar app the project intent is “standard / exempt.”

---

## 7. Fill the App Store listing

### What this is

The public product page: name, description, screenshots, category, URLs. Copy lives in `[play-listing.md](./play-listing.md)` — reuse product text; Connect field limits may truncate.

### Why

Without required metadata (especially privacy URL, screenshots, age rating), you cannot submit for review.

### Steps (Distribution / App Store tab)

Create or open the **1.0.0** (or current) iOS version if Connect shows “Prepare for Submission.”

#### App Information (app-level, left sidebar)

1. **Name** — Mi Guardia
2. **Subtitle** (optional, ~30 chars) — short value prop from play-listing short description
3. **Category** — prefer **Productivity**. Avoid **Medical** unless you are comfortable with medical-app scrutiny; Guardias is a schedule tracker, not a clinical device.
4. **Privacy Policy URL** — `https://alanmatias.com/guardias/privacy.html`
5. **License Agreement** — Apple’s standard EULA is fine unless you need custom terms

#### Version page — localization

Add **English** and **Spanish** localizations (Connect: language selector / localized metadata):


| Field         | Source                                                                           |
| ------------- | -------------------------------------------------------------------------------- |
| Description   | Full description from `play-listing.md`                                          |
| Keywords      | Comma-separated; no spaces after commas preferred; stay under limit (~100 chars) |
| What’s New    | First release: “Initial release.” Later: real changelog                          |
| Support URL   | Terms or contact URL                                                             |
| Marketing URL | Optional                                                                         |


#### Screenshots

Apple requires device-class screenshots (exact sizes change; Connect shows required slots with red errors until filled).

Minimum practical set:

1. Capture from a large modern iPhone simulator or device (e.g. 6.7" class) running a **TestFlight or production** build — Expo Go may not match final icon/chrome.
2. Upload to the required iPhone display slots Connect lists.
3. Add more sizes only if Connect blocks submission without them.

Caption ideas (same as Play):

1. Set up your A-D rotation in minutes
2. See shifts and free weekends on the calendar
3. Check day details for past and future guardias
4. Track upcoming shifts from the home screen
5. Use the app in English or Spanish

Screenshots live in Connect only; they do not need to be in this git repo.

#### Age Rating

1. Open **Age Rating** / questionnaire.
2. Answer honestly. Guardias has no user-generated content feed, no gambling, no mature themes — ratings should stay in the low / 4+ style range if answers match that.
3. Save.

#### Pricing and Availability

1. **Price** — Free (or your choice).
2. **Availability** — countries you care about (Mexico + others as needed).
3. Save.

#### App Privacy (“nutrition labels”)

1. Open **App Privacy**.
2. Click **Get Started** / **Edit**.
3. Declare data collection consistent with the offline app and Play Data safety answers in `play-listing.md`: **no data collected** / data not linked to identity / not used for tracking — only if that remains true.
4. If you truly collect nothing (no analytics SDK, no account, local-only storage), say you do not collect data.
5. Publish the privacy answers.

Do not claim “no data collected” if you later add analytics or crash reporting without updating this section.

#### App icon

Connect uses the 1024×1024 icon from the binary / listing. Source of truth in repo: `assets/icon.png`.

---

## 8. TestFlight (internal test before review)

### What this is

Apple’s beta channel. After processing, you (and invited testers) install via the **TestFlight** app. Closest Play analogue: **Internal testing** track.

### Why

Catch signing, splash/icon, and real-device issues Expo Go hides. Apple reviewers will run a similar build.

### Steps

1. App Store Connect → **TestFlight** → select the processed build.
2. For **Internal Testing**:
  - Create a group if needed (e.g. “Internal”).  
  - Add yourself (App Store Connect users on the team appear as internal testers).  
  - Enable the build for that group.
3. On your iPhone: install **TestFlight** from the App Store → accept the invite / open the app → install **Guardias**.
4. Smoke-test:
  - Create a rotation  
  - Calendar + legend  
  - Day detail  
  - Language switch (Settings)  
  - Kill app and relaunch — data still there (AsyncStorage)

External TestFlight (email invite outside your Connect users) needs a brief Beta App Review the first time — optional for a solo first release if internal testing is enough.

---

## 9. Submit for App Review

### What this is

Human/automated review against App Store Guidelines. Passing review is what makes “Release” possible.

### Steps

1. App Store Connect → your app → the **iOS version** preparing for submission.
2. **Build** section → **Select a build** → choose the TestFlight-processed build.
3. Complete any missing required fields (Connect highlights them).
4. **App Review Information**:
  - Contact name, phone, email you monitor  
  - **Sign-in required?** No — Guardias has no login  
  - **Notes:** e.g. `No login required. Create a rotation on first launch to use the calendar. Offline-only; no account.`
5. **Version Release** — choose:
  - **Manually release** this version (recommended first time), or  
  - **Automatically release** after approval
6. Click **Add for Review** / **Submit for Review** (button label varies).
7. Confirm.

### What to expect

- First review often **24–48+ hours** (can be longer).  
- Metadata-only rejections (wording, screenshots, privacy URL) can usually be fixed in Connect **without** a new binary.  
- Binary bugs require a new EAS build (higher build number) and re-upload.

Common rejection themes for apps like this: incomplete privacy policy URL, broken support URL, screenshots that don’t show the app, or category/medical claims that overstate clinical use — stick to schedule/productivity language.

---

## 10. Release after approval

1. Status becomes **Pending Developer Release** (if you chose manual) or goes straight toward **Ready for Sale** (if automatic).
2. For manual: open the version → **Release This Version**.
3. Store listing can take minutes to hours to appear in all regions / search.
4. Install from the App Store on a clean device and re-run the smoke test.

---

## Version trains and later uploads

You do **not** need a new App Store Connect app or new bundle ID for updates.

A **version train** is the marketing version (`expo.version` → `CFBundleShortVersionString`). Apple allows more builds on an **open** train (Prepare for Submission, or a rejection you are replacing). Once that version is **approved**, the train is **closed**. Another IPA with the same `1.0.x` is rejected:

- **ITMS-90186** — Invalid Pre-Release Train (train closed)
- **ITMS-90062** — `CFBundleShortVersionString` must be higher than the last approved version

Raising only the iOS **build number** does not help. EAS already auto-increments that remotely.

**Source of truth for last approved version:** `docs/store/ios-release-state.json` → `lastApprovedMarketingVersion`. After Apple approves a version, set that field to the approved `X.Y.Z` before the next upload.

### Every later iOS upload (same order every time)

1. Confirm `lastApprovedMarketingVersion` matches App Store Connect.
2. Gate the repo version:
   ```bash
   node scripts/ios-version-gate.mjs check
   ```
   If it fails:
   ```bash
   node scripts/ios-version-gate.mjs bump-patch
   node scripts/ios-version-gate.mjs check
   ```
   Default bump is patch (`1.0.4` → `1.0.5`). Commit `app.json` on the git ref EAS will build.
3. Build **without** auto-submit:
   ```bash
   npx eas-cli build -p ios --profile production
   ```
4. Gate the IPA (`appVersion` from the EAS build page or `eas build:view`), then upload **that** uuid:
   ```bash
   node scripts/ios-version-gate.mjs check --ipa 1.0.5
   npx eas-cli submit -p ios --id <eas-build-uuid>
   ```
   Do not `eas submit --latest` unless you have just confirmed that build’s `appVersion` passes the gate.
5. In Connect: create/select the **new** version (matching `expo.version`), paste What’s New, attach the build, Submit for Review.
6. After approval: update `lastApprovedMarketingVersion`.

Agents: `.agents/skills/ios-store-submit/SKILL.md`.

---

## Quick reference checklist

Use this once you understand the sections above:

- [ ] Developer Program active + agreements / tax / banking started  
- [ ] App record created for `com.alanmatias.guardias`  
- [ ] Privacy + terms live on HTTPS  
- [ ] Version gate passed (`ios-version-gate.mjs check` / `check --ipa`)  
- [ ] `eas build -p ios --profile production` succeeded  
- [ ] Build processed in TestFlight  
- [ ] Listing: description, keywords, screenshots, category, URLs (EN + ES)  
- [ ] Age Rating + App Privacy + Pricing saved  
- [ ] Internal TestFlight smoke test passed  
- [ ] Build attached + Submit for Review  
- [ ] Release after approval  

---

## Notes and pitfalls

- **Expo Go ≠ store build.** Final icon, splash, and native modules behavior belong to TestFlight/production.  
- **EAS Submit ≠ App Review.** Upload only; you still click Submit for Review.
- **Closed train.** If 1.0.x is already approved, bump `expo.version` and ship a new IPA. Do not re-upload the old marketing version (ITMS-90186 / ITMS-90062).
- **Finished EAS build ≠ submittable.** Run `node scripts/ios-version-gate.mjs check --ipa <appVersion>` before `eas submit`.
- **Do not commit** App Store Connect API `.p8` keys or Apple passwords.  
- Keep **contact email** consistent across Connect, privacy, and terms.  
- If Connect cannot find your bundle ID, register the App ID under Certificates, Identifiers & Profiles, or complete one EAS credentials session first.  
- Changing bundle ID after release creates a different app; users would not get updates.

