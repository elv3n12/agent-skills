# BeatGrove building runtime

Verified against the October 2026 Soundmap `preprod` implementation. Read current files before editing; values and paths can evolve.

## Files and contracts

| Purpose | Repository path |
| --- | --- |
| Reproducible source PNGs and prompts | `docs/art/biome-buildings/sources/`, `docs/art/biome-buildings/manifest.json` |
| Additional building definitions | `scripts/terrain/biome-buildings.json` |
| Pack only additional buildings | `scripts/terrain/pack-biome-buildings.mjs` |
| Shared isolation, limits and full pack | `scripts/terrain/pack-isometric.mjs` |
| Generated additional frame metadata | `src/game/iso/biomeBuildingFrames.json` |
| Runtime WebP + review PNG | `public/atlas/isometric/<name>.webp` / `.png` |
| Shared asset registry and selection | `src/game/iso/art.ts` |
| Admin choices and validation | `src/domain/buildingCatalog.ts` |
| Current admin preview | `src/admin/currentArtistBuilding.ts` |
| World rendering / Village placement | `src/game/scenes/WorldScene.ts`, `src/game/scenes/world/IsoDecor.ts`, `src/game/scenes/world/villageMove.ts` |

Add a definition, not an independent hand-edited generated frame:

```json
{
  "name": "swamp-rotting-shack",
  "biome": "swamp",
  "form": "cottage",
  "scale": 0.72,
  "source": "docs/art/biome-buildings/sources/swamp-rotting-shack.png",
  "doorway": { "x": 0.32, "y": 0.84 }
}
```

`doorway.x/y` are normalized **original-image** coordinates. Values above are an example for this image, not a reusable anchor for every building. Measure each actual threshold/approach point and inspect its marker after packing. `scale` is optional (default 1); 0.72 is the current humble-house multiplier.

## Packing and scale

| Form | Maximum packed pixels | World fitting bounds before scale |
| --- | --- | --- |
| cottage | 224 × 256 | 112 × 128 |
| hall | 256 × 288 | 128 × 144 |
| tower | 192 × 328 | 96 × 164 |

The packer isolates the strongest connected silhouette using the existing alpha-aware `isolateSubject`, resizes inside limits minus four pixels with Lanczos3, and adds **two fully transparent pixels on each side**. It preserves PNG for review and writes lossless WebP for runtime. Detached low-alpha residue is handled by isolation; a broad attached glow may need image-generation cleanup.

Metadata fields: `name`, `biome`, `form`, `kind: "building"`, `width`, `height`, `anchorX`, `anchorY`, `drawnW`, `drawnH`, `fit`. `drawnW/H = packed width/height - 4`.

```text
anchorX = [2 + (sourceDoorX * sourceWidth - cropLeft) / cropWidth * drawnW] / packedWidth
anchorY = [2 + (sourceDoorY * sourceHeight - cropTop) / cropHeight * drawnH] / packedHeight
fit = min(worldWidth / drawnW, worldHeight / drawnH) * scale
```

The implementation rounds anchors/fit to four decimals. Anchor guard: x between 0.1 and 0.9, y between 0.55 and 1. Passing it does not prove correct doorway alignment. Shared `ISO_BUILDING_SCALE` is currently 0.8 and applies on top of `fit`; do not shrink twice. Humble-house fit 0.72 makes it 28% smaller in each dimension than the corresponding cottage bounds.

World uses doorway anchoring. My Village separately centers the visible base on the selected lot diamond. Preserve those distinct placement helpers; do not globally replace doorway anchors with bottom-centre origins.

Run the focused pack from the app repository:

```sh
node scripts/terrain/pack-biome-buildings.mjs
```

The full `npm run art:pack` pipeline already calls this packer. Avoid repacking unrelated art unless necessary.

## Effective selection and precedence

`ISOMETRIC_ART_FRAMES` includes additional biome frames; the admin catalogue includes them too. Existing World/Quest preload loops consume the shared registry. Verify current consumers if the project has changed.

Selection priority currently is:

1. Valid manual `buildingFrame` override.
2. Dedicated custom artist art.
3. Eligible music venue.
4. Additional buildings for this biome, on a stable 30% artist-ID roll.
5. Existing biome/tier cottage, hall or tower.

The additional pool is built from `biomeBuildingFrames.json`. Stable hashes use `biome-building-variation:<artistId>` for the percentage roll and `biome-building-choice:<artistId>` for uniform pool selection. Adding a design changes some choices within that pool; it does not persist database assignments. Retain manual/custom precedence and existing probabilities unless instructed otherwise. Do not use `Math.random()` per render or select from a global pool across biomes.

## Meaningful validation

Run the bundled validator against the application, then lint/typecheck according to `AGENTS.md`. It checks names, source/metadata correspondence, dimensions, two-pixel alpha padding, visible lossless pixels, anchors and fitting bounds. Fully transparent RGB may differ between PNG/WebP and is ignored appropriately.

For automatic integration, import `isometricBuildingArt` using the repository's existing TypeScript/alias loader (currently `node --import ./scripts/register-test-alias.mjs --experimental-strip-types <script>`). Exercise many ordinary artists in each biome with no override/custom/music precedence, across tiers. Count each frame; assert every new design is selected, repeated selections are stable, and frame biome equals requested biome. Also verify manual selection of each new asset and a known custom artist's preserved art. Do not hardcode the catalogue count into a permanent test.

A synthetic census proves selection logic only. Inspect sprites at actual `fit * ISO_BUILDING_SCALE`, verify doorway approach, depth/occlusion and My Village diamond alignment in the running game when available. Do not call a contact sheet live World validation. Additional artwork alone does not introduce personal data; update privacy only if the feature introduces new data processing.
