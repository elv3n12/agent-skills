#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

function usage(message) {
  if (message) console.error(message);
  console.error(`Usage:
  node validate_sprite_sheet.mjs --sheet SHEET.png --frame-width N --frame-height N
    [--columns N] [--rows N] [--motion-start N] [--motion-frames N]
    [--alpha-threshold N] [--max-top-range N] [--max-bottom-range N]
    [--max-seam-top-delta N] [--strict-padding]

The script resolves sharp from the current project, validates every grid cell,
and reports per-row alpha-bound stability and motion-frame uniqueness.`);
  process.exit(message ? 1 : 0);
}

const rawArgs = process.argv.slice(2);
if (rawArgs.includes('--help') || rawArgs.includes('-h')) usage();

const values = new Map();
const flags = new Set();
for (let index = 0; index < rawArgs.length; index += 1) {
  const key = rawArgs[index];
  if (!key.startsWith('--')) usage(`Unexpected argument: ${key}`);
  if (key === '--strict-padding') {
    flags.add(key);
    continue;
  }
  const value = rawArgs[index + 1];
  if (value === undefined || value.startsWith('--')) usage(`Missing value for ${key}`);
  values.set(key, value);
  index += 1;
}

const number = (key, { required = false, fallback } = {}) => {
  const raw = values.get(key);
  if (raw === undefined) {
    if (required) usage(`Missing required option: ${key}`);
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) usage(`${key} must be a non-negative integer`);
  return parsed;
};

const sheet = values.get('--sheet');
if (!sheet) usage('Missing required option: --sheet');
const frameWidth = number('--frame-width', { required: true });
const frameHeight = number('--frame-height', { required: true });
if (frameWidth === 0 || frameHeight === 0) usage('Frame dimensions must be greater than zero');
const alphaThreshold = number('--alpha-threshold', { fallback: 16 });
if (alphaThreshold > 255) usage('--alpha-threshold must be at most 255');

let sharp;
try {
  const requireFromProject = createRequire(resolve(process.cwd(), 'package.json'));
  sharp = requireFromProject('sharp');
} catch {
  console.error('Could not resolve `sharp` from the current project. Install it there or run this validator from a project that already uses Sharp.');
  process.exit(2);
}

const source = sharp(resolve(sheet));
const metadata = await source.metadata();
if (!metadata.width || !metadata.height) throw new Error(`Could not read dimensions for ${sheet}`);

const columns = number('--columns', { fallback: metadata.width / frameWidth });
const rows = number('--rows', { fallback: metadata.height / frameHeight });
if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns <= 0 || rows <= 0) {
  usage('Sheet dimensions must divide evenly into the frame dimensions, or pass --columns and --rows');
}

const expectedWidth = columns * frameWidth;
const expectedHeight = rows * frameHeight;
const errors = [];
const warnings = [];
if (metadata.width !== expectedWidth || metadata.height !== expectedHeight) {
  errors.push(`sheet is ${metadata.width}x${metadata.height}; expected ${expectedWidth}x${expectedHeight}`);
}

const motionStart = number('--motion-start', { fallback: 0 });
const motionFrames = number('--motion-frames', { fallback: columns - motionStart });
if (motionStart + motionFrames > columns) errors.push('motion range extends beyond the row');

const maxTopRange = number('--max-top-range');
const maxBottomRange = number('--max-bottom-range');
const maxSeamTopDelta = number('--max-seam-top-delta');
const rowReports = [];

for (let row = 0; row < rows; row += 1) {
  const cells = [];
  for (let column = 0; column < columns; column += 1) {
    const { data } = await source
      .clone()
      .extract({ left: column * frameWidth, top: row * frameHeight, width: frameWidth, height: frameHeight })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let left = frameWidth;
    let right = -1;
    let top = frameHeight;
    let bottom = -1;
    let visible = 0;
    for (let y = 0; y < frameHeight; y += 1) {
      for (let x = 0; x < frameWidth; x += 1) {
        if (data[(y * frameWidth + x) * 4 + 3] < alphaThreshold) continue;
        visible += 1;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }

    if (visible === 0) errors.push(`row ${row}, column ${column} is empty`);
    const touchesEdge = visible > 0 && (left === 0 || top === 0 || right === frameWidth - 1 || bottom === frameHeight - 1);
    if (touchesEdge) {
      const message = `row ${row}, column ${column} touches a cell edge`;
      (flags.has('--strict-padding') ? errors : warnings).push(message);
    }
    cells.push({ column, visible, left, right, top, bottom, hash: createHash('sha256').update(data).digest('hex') });
  }

  const motion = cells.slice(motionStart, motionStart + motionFrames);
  if (new Set(motion.map((cell) => cell.hash)).size !== motion.length) {
    errors.push(`row ${row} contains duplicate motion frames`);
  }
  const visibleMotion = motion.filter((cell) => cell.visible > 0);
  const tops = visibleMotion.map((cell) => cell.top);
  const bottoms = visibleMotion.map((cell) => cell.bottom);
  const topRange = tops.length ? Math.max(...tops) - Math.min(...tops) : null;
  const bottomRange = bottoms.length ? Math.max(...bottoms) - Math.min(...bottoms) : null;
  const seamTopDelta = tops.length > 1 ? Math.abs(tops.at(-1) - tops[0]) : null;
  if (maxTopRange !== undefined && topRange > maxTopRange) errors.push(`row ${row} top range ${topRange} exceeds ${maxTopRange}`);
  if (maxBottomRange !== undefined && bottomRange > maxBottomRange) errors.push(`row ${row} bottom range ${bottomRange} exceeds ${maxBottomRange}`);
  if (maxSeamTopDelta !== undefined && seamTopDelta > maxSeamTopDelta) errors.push(`row ${row} seam top delta ${seamTopDelta} exceeds ${maxSeamTopDelta}`);
  rowReports.push({ row, motionFrames: motion.length, distinctMotionFrames: new Set(motion.map((cell) => cell.hash)).size, topRange, bottomRange, seamTopDelta });
}

console.log(JSON.stringify({
  sheet: resolve(sheet),
  dimensions: { width: metadata.width, height: metadata.height },
  grid: { columns, rows, frameWidth, frameHeight },
  motion: { start: motionStart, frames: motionFrames },
  rows: rowReports,
  warnings,
  errors,
}, null, 2));

if (errors.length) process.exit(1);
