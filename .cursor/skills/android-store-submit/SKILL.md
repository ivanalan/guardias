---
name: android-store-submit
description: >-
  DeGuardia Android Play Store release path. Use when building or releasing
  Android, uploading an AAB, bumping versionCode / expo.version for Play, or
  when the user asks to submit / ship / release Android.
---

# Android store submit — DeGuardia

First-time listing / checklist: `docs/store/ANDROID_RELEASE.md`. This skill is the **repeatable build + handoff** path.

## Hard rules

1. **Manual Play upload only.** The owner downloads the production `.aab` from EAS and uploads it in Google Play Console. Do **not** run `eas submit -p android`, `--auto-submit` for Android, or set up / ask for a Google Play service account JSON for EAS Submit.
2. Do **not** push Play Console credential setup, EAS Android submit profiles, or CI auto-submit for Android unless the user explicitly asks to change this preference.
3. After a production Android build finishes, give them the EAS build page / download link and remind them to upload the AAB in Play Console (usually Internal testing first).
4. Android `versionCode` must increase on every Play upload. Production profile uses `autoIncrement` with remote app version source — do not invent a lower `versionCode`.
5. Bump `expo.version` in `app.json` when shipping a user-facing version change; keep Play release naming consistent with that version.

## Agent workflow

```
Android release handoff:
- [ ] Version / versionCode ready for Play (bump if needed; ask to commit if EAS builds from git)
- [ ] `npx eas-cli build -p android --profile production`
- [ ] Tell user: download AAB from EAS → upload in Play Console (no eas submit)
```

## Do not

- Configure Google Service Account keys for EAS Submit.
- Run `eas submit` / `--auto-submit` for Android.
- Commit Play Console or Google Cloud JSON keys.
