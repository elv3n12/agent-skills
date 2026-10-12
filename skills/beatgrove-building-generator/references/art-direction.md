# Painted building art direction

## Visual constants

- Smooth, richly detailed hand-painted miniature game art: dimensional wood, stone, metal and thatch, soft painterly edges with fine structural outlines. No pixel art, flat vector, low-poly or photographic architecture.
- Orthographic 2:1 dimetric/isometric front/right view; ground edges approximately ±26.565°, upright walls. The primary entrance faces screen lower-left.
- Broad warm upper-left light; right facade gently darker; restrained amber windows. No detached cast shadow, glow cloud or baked landscape.
- One complete isolated building on true transparent alpha. Roof, chimney, stairs, foliage and base must be visible with margin. Request about 12% padding; inspect the result instead of trusting the prompt.
- Restrained contact base within the footprint; no giant pedestal, terrain tile, adjoining street or neighboring buildings. Avoid labels, watermarks and logos. Graffiti can be abstract colored tags without readable names or slogans.
- Different architecture per biome, with the same painting quality. “Poor” changes materials, silhouette and maintenance, not rendering quality.

## Architecture vocabulary

| Biome | Detailed/larger architecture | Humble/smaller architecture |
| --- | --- | --- |
| Forest | Oak treehouse, timber rooms, shingles, canopy | Single-room woodcutter hut, rough timber, patched shingles, moss |
| Snow | Alpine chalet, stone base, timber balcony, snowy slate | One-room mountain hut, simple snowy roof, rusty stovepipe |
| Highlands | Grey stone lodge, stepped gables, small turret | Crofter cottage, rubble stone, worn slate, heather |
| Wasteland | Weathered salvage workshop, scrap roofing | Damaged shanty, rust-orange corrugated sheets, holes, grey boards, exposed brick |
| Alien | Lilac organic observatory, teal glass/copper dome | Small lilac hut, patched purple/teal metal, modest circular window, tiny crystal |
| Seaside | Pale clapboard boathouse, blue-green roof, nautical details | Salt-worn fisher hut, peeling blue boards, rope/buoy at doorway |
| Swamp | Decaying bayou house, stilts, porch, sagging green roof | Rotting shack, short stilts, damaged boards, rusty roof, mold and hanging moss |
| Jungle | Bamboo/timber stilt lodge, layered palm thatch | One-room woven bamboo hut, simple frayed thatch, short posts |
| Urban | Haussmann: cream limestone, blue-grey zinc mansard, iron balconies, cornices | One-storey worker cottage, cracked plaster/red brick, plain tiled roof, soot and sparse tags |
| Desert | Derive from current approved biome art | Crumbling adobe, sun-baked ochre, exposed earthen bricks, sandy threshold, rusty roof patch |

Meadow and Hell are also valid project biomes. Inspect their current approved references before inventing variants rather than guessing an unrelated style.

The decayed Haussmann variant preserves the elegant building's architecture and camera while adding soot, rain streaks, damaged roof slates, exposed brick, rusty balconies, boarded windows, dead plants and layered ground-floor graffiti. Retain both versions unless replacement is requested.

Humble houses: one room, one storey, compact footprint, simple roof, plain doorway, few windows and inexpensive worn materials. Avoid grand balconies, mansards, turrets, ornamental trim and multi-wing silhouettes. Swamp/Wasteland should read as damaged and rusty; Desert should read as eroded and sandy. Keep the building habitable unless the user requests a ruin.

## Prompt scaffold

```text
Use case: stylized-concept.
Asset: ONE standalone BeatGrove building sprite.
Input image 1: STYLE AND CAMERA REFERENCE ONLY; invent a different architecture.
Art: richly detailed smooth hand-painted miniature game architecture, fine
structural outlines and dimensional materials, soft painterly edges.
Camera: orthographic 2:1 isometric front/right, upright walls, ground edges
at approximately ±26.565 degrees, primary entrance facing lower-left.
Light: warm upper-left, right facade gently darker, restrained amber windows.
Subject: <specific biome architecture, materials, size and condition>.
Framing: complete roof and base, centered with transparent margin; genuine alpha.
Avoid: background scene, grid/checkerboard, glow/halo, detached shadow, giant
pedestal, neighboring buildings, labels, watermark, logos, clipped silhouette.
Legibility: preserve identity and entrance at about 100px and intended game scale.
```

## Portable visual references

These are runtime review examples from approved October 2026 artwork, not source masters. Inspect them as images before generation; use the current application's originals where available.

- [Forest humble hut](images/forest-woodcutter-hut.webp)
- [Urban elegant Haussmann](images/urban-haussmann-building.webp)
- [Urban decayed Haussmann](images/urban-decayed-haussmann-building.webp)
- [Swamp rotting shack](images/swamp-rotting-shack.webp)
- [Wasteland rust shack](images/wasteland-rust-shack.webp)
- [Desert sandy hut](images/desert-sand-worn-hut.webp)

Project sources and exact generation prompts live in `docs/art/biome-buildings/` and its `sources/` directory. Standard biome styles live in `public/atlas/isometric/<biome>-cottage.webp`, `-hall.webp`, and `-tower.webp`.
