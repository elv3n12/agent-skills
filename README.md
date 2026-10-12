# Agent Skills

Reusable skills for coding agents.

## Sprite Animation Generator

`sprite-animation-generator` helps agents generate, repair, and validate 2D raster sprite-sheet animations. It focuses on directional walk cycles, articulated limb assembly, stable ground contact, occlusion, runtime packing, and visual QA at game scale.

Install it with the Agent Skills CLI:

```sh
npx skills add https://github.com/elv3n12/agent-skills --skill sprite-animation-generator
```

The skill includes:

- a reusable workflow for building a canonical walk cycle before propagating it;
- gait, joint geometry, layering, mirroring, and stable-origin guidance;
- a QA reference for structural and visual inspection;
- a generic sprite-sheet validator for projects that use Sharp;

The validator resolves `sharp` from the project where it runs:

```sh
node path/to/sprite-animation-generator/scripts/validate_sprite_sheet.mjs \
  --sheet path/to/sheet.png \
  --frame-width 128 --frame-height 128 \
  --columns 16 --rows 4 \
  --motion-start 4 --motion-frames 12
```

## BeatGrove Building Generator

`beatgrove-building-generator` creates and integrates detailed painted isometric buildings for BeatGrove biomes and artists. It includes visual references, prompt guidance, humble and decayed architecture, source-relative doorway anchors, runtime packing and stable biome assignment requirements.

```sh
npx skills add https://github.com/elv3n12/agent-skills --skill beatgrove-building-generator
```

The read-only validator uses Sharp from your BeatGrove/Soundmap checkout:

```sh
node path/to/beatgrove-building-generator/scripts/validate_buildings.mjs --repo /path/to/soundmap
```

## BeatGrove Building Studio plugin

A skills-only ChatGPT plugin packages the building workflow and visual references. The contributor mode generates an artist-inspired building, preserves its source master, and uses available file-processing tools to export a compact transparent PNG and lossless WebP. It does not require a hosted server or BeatGrove repository access.

Build the private plugin archive from the canonical skill files:

```sh
python scripts/package-beatgrove-plugin.py --output /path/to/beatgrove-building-studio.zip
```

Plugin source is in `plugins/beatgrove-building-studio`. Package acceptance does not prove installed image-generation/export behavior; host tools must be available.
