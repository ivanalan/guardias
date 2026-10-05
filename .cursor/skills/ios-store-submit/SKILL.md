---
name: ios-store-submit
description: >-
  DeGuardia iOS App Store version gate, EAS production build, and eas submit.
  Use when building or uploading an iOS IPA, submitting to App Store Connect or
  TestFlight, bumping expo.version, handling ITMS-90186 / ITMS-90062, or when
  the user asks to submit / ship / release iOS.
---

# iOS store submit — DeGuardia

Follow this skill for **every** iOS production build or App Store Connect upload. Do not skip the version gate because a build already finished.

First-time Apple setup (Developer Program, listing, screenshots) lives in `docs/store/IOS_RELEASE.md`. This skill is the **repeatable update + upload** path.

## Hard rules

1. **Never** `eas submit` (or `--auto-submit`) until the version gate **PASSes** for that IPA’s `appVersion`.
2. **Never** upload a binary whose marketing version (`expo.version` → `CFBundleShortVersionString`) is **less than or equal to** the last Apple-**approved** version. That is ITMS-90186 (closed train) + ITMS-90062.
3. **Never** `eas submit --latest` without reading that build’s `appVersion` first. Submit with `--id <eas-build-uuid>`.
4. A finished EAS build is **not** automatically submittable. 1.0.4 build 7 was valid as an IPA and still rejected because 1.0.4 was already approved.
5. iOS **build number** is remote (`eas.json` `appVersionSource: "remote"` + production `autoIncrement`). Do not hand-edit it. Do not treat a higher build number as a substitute for bumping `expo.version`.
6. `eas submit` only **uploads**. App Review is a manual click in App Store Connect.

## Version model

| Field | Source | Apple name |
|---|---|---|
| Marketing version | `app.json` → `expo.version` | `CFBundleShortVersionString` / version **train** |
| Build | EAS remote counter | `CFBundleVersion` |

One train = one marketing version. After Apple **approves** that version, the train is **closed**. Extra builds on the same train are allowed only while Connect still shows that version as open (e.g. Prepare for Submission / rejected, not yet approved). When in doubt, bump.

Record of last approved version: `docs/store/ios-release-state.json` → `lastApprovedMarketingVersion`.

If the user pastes ITMS-90186 / ITMS-90062, or Connect shows Ready for Sale / Pending Developer Release for version `X.Y.Z`:

1. Set `lastApprovedMarketingVersion` to `X.Y.Z` in `docs/store/ios-release-state.json`.
2. Run `bump-patch` (below).
3. Build a **new** IPA. Do **not** re-upload the rejected IPA.

## Gate (required, every time)

Copy and track:

```
iOS submit gate:
- [ ] State file matches Connect (last approved version)
- [ ] `node scripts/ios-version-gate.mjs check` PASSes
- [ ] If it failed: bump-patch, then check again
- [ ] Bump is on the git commit EAS will build (ask to commit/push if needed)
- [ ] Production iOS build finished
- [ ] `check --ipa <EAS appVersion>` PASSes
- [ ] `eas submit -p ios --id <uuid>`
- [ ] After Apple approves: update ios-release-state.json
```

### 1. Confirm last approved version

Read `docs/store/ios-release-state.json`. If it may be stale, ask the user for the latest **approved** iOS version in App Store Connect (not “latest EAS build”). Prefer the higher of (file, user, Apple email).

### 2. Run the gate locally

```bash
node scripts/ios-version-gate.mjs check
```

If FAIL:

```bash
node scripts/ios-version-gate.mjs bump-patch
node scripts/ios-version-gate.mjs check
```

Default bump is **patch**. Use minor/major only if the user asks. `expo.version` is shared with Android; keep one marketing version unless the user says otherwise.

Do **not** bump if check already PASSes (avoid burning versions).

EAS builds from git. If `app.json` changed, the bump must be on the git ref you build. Ask to commit before `eas build` unless the user already asked to commit/release.

### 3. Build (only after local check PASSes)

```bash
npx eas-cli build -p ios --profile production --non-interactive --no-wait
```

Do **not** pass `--auto-submit`.

### 4. Gate the IPA, then upload

```bash
npx eas-cli build:view <uuid> --non-interactive --json
```

Use the build’s `appVersion`. Then:

```bash
node scripts/ios-version-gate.mjs check --ipa <appVersion>
```

Only if PASS:

```bash
npx eas-cli submit -p ios --id <uuid>
```

If `--ipa` FAILs: do not submit. Bump, rebuild, submit the new uuid.

### 5. After upload

Tell the user: wait for TestFlight processing, then in Connect create/select version **matching `expo.version`**, attach that build, Submit for Review.

When that version is **approved**, update `lastApprovedMarketingVersion` and `updatedAt` in `docs/store/ios-release-state.json`.

## Known Apple errors (do not retry the same IPA)

| Code | Meaning | Action |
|---|---|---|
| ITMS-90186 | Train closed for new builds | That marketing version is done. Bump `expo.version`, new IPA. |
| ITMS-90062 | `CFBundleShortVersionString` ≤ last approved | Same: bump marketing version, new IPA. |

## Do not

- Submit an IPA built **before** the version bump.
- Reuse a closed train because “we only changed the build number.”
- Invent `ios.buildNumber` in `app.json` to work around a closed train.
- Commit App Store Connect `.p8` keys or Apple passwords.
