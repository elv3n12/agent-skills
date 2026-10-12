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
