# Agent Skills

Reusable Agent Skills for Claude, Codex and other compatible agents. Each skill lives in `skills/<name>/SKILL.md`; its YAML `name` and `description` are the discovery metadata. Install a skill before expecting an agent to discover it.

| Skill | Use it for | Entry point |
| --- | --- | --- |
| `beatgrove-building-generator` | BeatGrove artist houses, biome architecture, transparent PNG/WebP exports and building integration | [Building skill](skills/beatgrove-building-generator/SKILL.md) |
| `sprite-animation-generator` | Game character walk cycles, sprite-sheet packing, motion repair and animation QA | [Animation skill](skills/sprite-animation-generator/SKILL.md) |

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

Building-generator instructions and scripts use the MIT License. The bundled reference images are supplied only to guide BeatGrove building creation; they are not covered by MIT. See [the building skill licence](skills/beatgrove-building-generator/LICENSE.md).

## Discovery and validation

The skill layout and descriptions follow [Anthropic's skill-creator guidance](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md): concise entry points, explicit use contexts and linked references loaded only when needed. Existing skill names remain stable. `agents/openai.yaml` supplies Codex UI metadata; it does not replace `SKILL.md` discovery metadata.

Each skill has `evals/trigger-evals.json` containing ten positive requests and ten nearby requests that should not trigger it, plus `evals/evals.json` with three task scenarios. These are review fixtures, not recorded benchmark results. Trigger examples include contributor requests, export size, animation defects and boundaries between the two skills. To measure Claude triggering, run the description optimizer from Anthropic's skill-creator tooling in an environment with the Claude CLI, using a held-out split. Compare behavioral outputs separately with and without the skill.

Run the repository checks with Python 3.11 or newer:

```sh
python -m pip install 'PyYAML>=6,<7'
python scripts/validate-skills.py
```

CI checks frontmatter, folder/name agreement, local reference links, Codex metadata and evaluation fixtures. This validates discoverable packaging; it does not prove a host's trigger rate, artwork quality or external directory indexing. Asset validators and rendered review remain part of each skill's own workflow.
