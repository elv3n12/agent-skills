#!/usr/bin/env node
// Read-only QA. Resolve Sharp from the application, not from the skills repository.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

function options(argv) {
  const result = { repo: process.cwd(), names: null };
  for (let i = 0; i < argv.length; i++) {
    const option = argv[i];
    if (option === '--help') {
      console.log('Usage: node validate_buildings.mjs [--repo application-path] [--names name1,name2]');
      process.exit(0);
    }
    if (!['--repo', '--names'].includes(option) || !argv[i + 1] || argv[i + 1].startsWith('--')) {
      throw new Error(`Unknown or incomplete option: ${option}`);
    }
    const value = argv[++i];
    if (option === '--repo') result.repo = path.resolve(value);
    else result.names = new Set(value.split(',').filter(Boolean));
  }
  if (result.names) assert(result.names.size > 0, 'Names must not be empty');
  return result;
}

const limits = { cottage: [224, 256, 112, 128], hall: [256, 288, 128, 144], tower: [192, 328, 96, 164] };
const biomes = new Set(['meadow', 'forest', 'snow', 'highlands', 'wasteland', 'alien', 'hell', 'seaside', 'desert', 'swamp', 'jungle', 'urban']);
const close = (a, b) => Math.abs(a - b) <= 0.000051;
async function validate() {
  const { repo, names } = options(process.argv.slice(2));
  const require = createRequire(path.join(repo, 'package.json'));
  const sharp = require('sharp');
  const json = async file => JSON.parse(await readFile(path.join(repo, file), 'utf8'));
  const definitions = await json('scripts/terrain/biome-buildings.json');
  const frames = await json('src/game/iso/biomeBuildingFrames.json');
  const others = (await Promise.all(['artFrames', 'artistBuildingFrames', 'musicBuildingFrames'].map(name => json(`src/game/iso/${name}.json`)))).flat();
  const unique = new Set();
  for (const f of [...others, ...frames]) {
    assert(!unique.has(f.name), `Duplicate registered name: ${f.name}`);
    unique.add(f.name);
  }
  assert.equal(new Set(definitions.map(d => d.name)).size, definitions.length, 'Duplicate definition');
  assert.equal(frames.length, definitions.length, 'Definition/frame count differs; repack');
  const selected = definitions.filter(d => !names || names.has(d.name));
  if (names) for (const name of names) assert(selected.some(d => d.name === name), `Unknown requested name: ${name}`);
  assert(selected.length > 0, 'No buildings to inspect');
  for (const entry of selected) {
    const label = entry.name;
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(label), `${label}: invalid name`);
    assert(biomes.has(entry.biome) && label.startsWith(`${entry.biome}-`), `${label}: biome/name mismatch`);
    assert(limits[entry.form], `${label}: unsupported building form`);
    const scale = entry.scale ?? 1;
    assert(Number.isFinite(scale) && scale > 0 && scale <= 1, `${label}: scale outside (0,1]`);
    assert(entry.source && !path.isAbsolute(entry.source) && !entry.source.split(/[\\/]/).includes('..'), `${label}: source must be repo-relative`);
    const original = await sharp(path.join(repo, entry.source)).metadata();
    assert(original.hasAlpha, `${label}: source lacks alpha`);
    for (const coordinate of ['x', 'y']) assert(Number.isFinite(entry.doorway?.[coordinate]) && entry.doorway[coordinate] > 0 && entry.doorway[coordinate] < 1, `${label}: invalid source doorway`);
    const frame = frames.find(f => f.name === label);
    assert(frame, `${label}: missing packed frame`);
    assert.equal(frame.biome, entry.biome, `${label}: frame biome`);
    assert.equal(frame.form, entry.form, `${label}: frame form`);
    assert.equal(frame.kind, 'building', `${label}: frame kind`);
    const png = await sharp(path.join(repo, `public/atlas/isometric/${label}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const webp = await sharp(path.join(repo, `public/atlas/isometric/${label}.webp`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(png.info.width, frame.width, `${label}: width`);
    assert.equal(png.info.height, frame.height, `${label}: height`);
    assert.equal(webp.info.width, frame.width, `${label}: WebP width`);
    assert.equal(webp.info.height, frame.height, `${label}: WebP height`);
    assert.equal(png.data.length, webp.data.length, `${label}: buffer length`);
    const [maxW, maxH, worldW, worldH] = limits[entry.form];
    assert(frame.width > 4 && frame.height > 4 && frame.width <= maxW && frame.height <= maxH, `${label}: size exceeds ${entry.form} limits`);
    assert.equal(frame.drawnW, frame.width - 4, `${label}: drawn width`);
    assert.equal(frame.drawnH, frame.height - 4, `${label}: drawn height`);
    assert(Number.isFinite(frame.fit) && close(frame.fit, Math.min(worldW / frame.drawnW, worldH / frame.drawnH) * scale), `${label}: fit does not match packing scale`);
    assert(Number.isFinite(frame.anchorX) && frame.anchorX >= .1 && frame.anchorX <= .9 && Number.isFinite(frame.anchorY) && frame.anchorY >= .55 && frame.anchorY <= 1, `${label}: anchor outside lower silhouette`);
    let painted = 0;
    for (let y = 0; y < frame.height; y++) for (let x = 0; x < frame.width; x++) {
      const k = (y * frame.width + x) * 4, alpha = png.data[k + 3];
      assert.equal(alpha, webp.data[k + 3], `${label}: lossy alpha at ${x},${y}`);
      if (alpha > 0) {
        painted++;
        for (let c = 0; c < 3; c++) assert.equal(png.data[k + c], webp.data[k + c], `${label}: lossy visible RGB at ${x},${y}`);
      }
      if (x < 2 || y < 2 || x >= frame.width - 2 || y >= frame.height - 2) assert.equal(alpha, 0, `${label}: nontransparent padding at ${x},${y}`);
    }
    assert(painted > 0, `${label}: empty sprite`);
    console.log(`PASS ${label}: ${frame.width}x${frame.height}, fit ${frame.fit}, anchor ${frame.anchorX},${frame.anchorY}`);
  }
  console.log(`Validated ${selected.length} additional building(s). Visual alignment, registry consumers and effective World selection still require separate review.`);
}
validate().catch(error => { console.error(`FAIL: ${error.message}`); process.exitCode = 1; });
