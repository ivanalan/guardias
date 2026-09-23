#!/usr/bin/env node
/**
 * Keep local android/ App Widget provider XML in sync with app.json.
 *
 * Why this exists:
 * - `react-native-android-widget` bakes size into
 *   android/app/src/main/res/xml/widgetprovider_*.xml during `expo prebuild`.
 * - `/android` is gitignored but sticky on disk. `expo run:android` does NOT
 *   re-run the config plugin, so app.json size changes look like they "didn't
 *   take" after a rebuild.
 *
 * Usage:
 *   node scripts/sync-android-widget-providers.mjs        # write if drifted
 *   node scripts/sync-android-widget-providers.mjs check  # exit 1 if drifted
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP_JSON = path.join(ROOT, 'app.json');
const ANDROID_XML_DIR = path.join(
  ROOT,
  'android/app/src/main/res/xml',
);
const ANDROID_DRAWABLE_DIR = path.join(
  ROOT,
  'android/app/src/main/res/drawable',
);

const checkOnly = process.argv.includes('check');

function loadWidgets() {
  const app = JSON.parse(readFileSync(APP_JSON, 'utf8'));
  const plugins = app?.expo?.plugins ?? [];
  for (const entry of plugins) {
    if (!Array.isArray(entry)) continue;
    const [name, opts] = entry;
    if (name !== 'react-native-android-widget') continue;
    return opts?.widgets ?? [];
  }
  return [];
}

function attr(name, value) {
  return `    android:${name}="${value}"`;
}

function providerXml(widget) {
  const lines = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"',
    attr('minWidth', widget.minWidth),
    attr('minHeight', widget.minHeight),
  ];
  if (widget.targetCellWidth != null) {
    lines.push(attr('targetCellWidth', String(widget.targetCellWidth)));
  }
  if (widget.targetCellHeight != null) {
    lines.push(attr('targetCellHeight', String(widget.targetCellHeight)));
  }
  if (widget.maxResizeWidth) {
    lines.push(attr('maxResizeWidth', widget.maxResizeWidth));
  }
  if (widget.maxResizeHeight) {
    lines.push(attr('maxResizeHeight', widget.maxResizeHeight));
  }
  lines.push('');
  lines.push(attr('resizeMode', widget.resizeMode ?? 'none'));
  lines.push('');
  if (widget.description) {
    lines.push(
      attr(
        'description',
        `@string/widget_${widget.name.toLowerCase()}_description`,
      ),
    );
    lines.push('');
  }
  lines.push(attr('initialLayout', '@layout/rn_widget'));
  if (widget.previewImage) {
    lines.push(
      attr('previewImage', `@drawable/${widget.name.toLowerCase()}_preview`),
    );
  }
  lines.push('');
  const period =
    widget.updatePeriodMillis != null
      ? Math.max(30 * 60 * 1000, widget.updatePeriodMillis)
      : 0;
  lines.push(attr('updatePeriodMillis', String(period)));
  lines.push(attr('widgetCategory', 'home_screen') + '>');
  lines.push('</appwidget-provider>');
  lines.push('');
  return lines.join('\n');
}

function extractTargets(xml) {
  const width = xml.match(/android:targetCellWidth="(\d+)"/)?.[1] ?? null;
  const height = xml.match(/android:targetCellHeight="(\d+)"/)?.[1] ?? null;
  const minW = xml.match(/android:minWidth="([^"]+)"/)?.[1] ?? null;
  const minH = xml.match(/android:minHeight="([^"]+)"/)?.[1] ?? null;
  return { width, height, minW, minH };
}

function main() {
  if (!existsSync(ANDROID_XML_DIR)) {
    console.log(
      '[widget-providers] No local android/ tree — nothing to sync (EAS prebuild will apply app.json).',
    );
    process.exit(0);
  }

  const widgets = loadWidgets();
  if (widgets.length === 0) {
    console.error('[widget-providers] No react-native-android-widget widgets in app.json');
    process.exit(1);
  }

  let drifted = false;
  for (const widget of widgets) {
    const xmlName = `widgetprovider_${widget.name.toLowerCase()}.xml`;
    const xmlPath = path.join(ANDROID_XML_DIR, xmlName);
    const next = providerXml(widget);
    const prev = existsSync(xmlPath) ? readFileSync(xmlPath, 'utf8') : '';
    const prevT = extractTargets(prev);
    const nextT = extractTargets(next);
    const sizeChanged =
      prevT.width !== nextT.width ||
      prevT.height !== nextT.height ||
      prevT.minW !== nextT.minW ||
      prevT.minH !== nextT.minH;

    if (prev === next && !sizeChanged) {
      console.log(`[widget-providers] OK ${widget.name} ${nextT.width}×${nextT.height}`);
      continue;
    }

    drifted = true;
    const summary = `${widget.name}: ${prevT.width ?? '?'}×${prevT.height ?? '?'} → ${nextT.width}×${nextT.height} (${nextT.minW}×${nextT.minH})`;

    if (checkOnly) {
      console.error(`[widget-providers] DRIFT ${summary}`);
      continue;
    }

    writeFileSync(xmlPath, next);
    console.log(`[widget-providers] Synced ${summary}`);

    if (widget.previewImage) {
      mkdirSync(ANDROID_DRAWABLE_DIR, { recursive: true });
      const src = path.resolve(ROOT, widget.previewImage);
      const ext = path.extname(src);
      const dest = path.join(
        ANDROID_DRAWABLE_DIR,
        `${widget.name.toLowerCase()}_preview${ext}`,
      );
      if (existsSync(src)) {
        copyFileSync(src, dest);
      }
    }
  }

  if (checkOnly && drifted) {
    console.error(
      '\n[widget-providers] Local android/ widget XML does not match app.json.\n' +
        '  Fix: node scripts/sync-android-widget-providers.mjs\n' +
        '  Then rebuild (expo run:android). Picker size comes from XML, not JS.',
    );
    process.exit(1);
  }
}

main();
