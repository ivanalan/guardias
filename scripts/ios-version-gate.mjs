#!/usr/bin/env node
/**
 * iOS App Store version gate for Guardias.
 * Usage:
 *   node scripts/ios-version-gate.mjs check
 *   node scripts/ios-version-gate.mjs check --ipa 1.0.4
 *   node scripts/ios-version-gate.mjs bump-patch
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appJsonPath = path.join(root, "app.json");
const statePath = path.join(root, "docs/store/ios-release-state.json");

function parseSemver(value, label) {
  const match = String(value).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    fail(`${label} is not X.Y.Z: ${value}`);
  }
  return match.slice(1, 4).map(Number);
}

function cmp(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function loadVersions() {
  const app = readJson(appJsonPath);
  const state = readJson(statePath);
  const local = app.expo.version;
  const approved = state.lastApprovedMarketingVersion;
  if (!local) fail("app.json expo.version is missing");
  if (!approved) fail("docs/store/ios-release-state.json lastApprovedMarketingVersion is missing");
  return { app, state, local, approved };
}

function isSafe(candidate, approved) {
  return cmp(parseSemver(candidate, "candidate"), parseSemver(approved, "lastApproved")) > 0;
}

const args = process.argv.slice(2);
const cmd = args[0];

if (cmd === "check") {
  const ipaFlag = args.indexOf("--ipa");
  const ipa = ipaFlag >= 0 ? args[ipaFlag + 1] : null;
  const { local, approved } = loadVersions();
  console.log(`local expo.version: ${local}`);
  console.log(`lastApprovedMarketingVersion: ${approved}`);
  if (!isSafe(local, approved)) {
    fail(
      `app.json version ${local} is not higher than approved ${approved}. Run: node scripts/ios-version-gate.mjs bump-patch`
    );
  }
  if (ipa) {
    console.log(`IPA / EAS appVersion: ${ipa}`);
    if (!isSafe(ipa, approved)) {
      fail(
        `IPA version ${ipa} is not higher than approved ${approved}. Do not eas submit this binary. Bump, rebuild, submit the new IPA.`
      );
    }
    if (ipa !== local) {
      fail(
        `IPA version ${ipa} does not match app.json ${local}. Submit only an IPA built from the bumped commit.`
      );
    }
  }
  console.log("PASS: version gate");
  process.exit(0);
}

if (cmd === "bump-patch") {
  const { app, local, approved } = loadVersions();
  let next = local;
  do {
    const [maj, min, pat] = parseSemver(next, "version");
    next = `${maj}.${min}.${pat + 1}`;
  } while (!isSafe(next, approved));
  app.expo.version = next;
  writeJson(appJsonPath, app);
  console.log(`bumped expo.version ${local} -> ${next} (must exceed approved ${approved})`);
  process.exit(0);
}

fail("Usage: node scripts/ios-version-gate.mjs check [--ipa X.Y.Z] | bump-patch");
