---
name: beatgrove-building-generator
description: Create, refine, export and integrate painted isometric buildings for BeatGrove (Soundmap). Use when asked for an artist house or music lodge, a biome cottage or humble hut, a decayed building, transparent building artwork, a smaller PNG or WebP export of a BeatGrove building, doorway anchors, or biome building assignment. Preserve the established art direction and miniature readability. Covers contributor artwork without repository access and runtime packing/integration when requested. Do not use for terrain, standalone props, character animation, generic architectural renders or unrelated image compression.
---

# BeatGrove Building Generator

Create new architecture that belongs in BeatGrove: detailed painted miniature buildings with consistent lighting, camera, scale and readable entrances. The Soundmap repository contains the BeatGrove application.

## Choose the workflow

For a contributor requesting an artist building in ordinary ChatGPT, read [contributors.md](references/contributors.md) and the art reference. Generate and export without requiring repository access. Use the repository workflow below only when packing/integration is requested. Source PNG size is not runtime file size; use the bundled export helper when file processing is available.

## Find the source of truth

Read the application's applicable `AGENTS.md`, decision log and current building code. Confirm the authoritative branch/worktree before editing; a chat checkout can be detached or stale. Follow the user's branch choice; BeatGrove commonly uses `preprod`. Keep unrelated changes unstaged. Do not push or deploy without authorization.

Read [art-direction.md](references/art-direction.md) before generating. Read [runtime.md](references/runtime.md) before packing or integrating. These document the verified October 2026 pipeline; resolve any drift against current code. Do not create a parallel atlas system when the repository already supplies one.

## Create the artwork

1. Resolve requested biomes, house count, architecture and prosperity/decay level. Do not silently drop or add a biome when these disagree.
2. Inspect an existing sprite from the target biome and desired form. Use it as a **style/camera reference**, while inventing a distinct silhouette. Bundled examples are linked in the art reference; prefer current approved project images.
3. Use the available image-generation tool for raster artwork. In Codex, load the imagegen skill when available and use the built-in tool, one call per distinct building. Inspect local references before supplying them. If unavailable, report the limitation; do not substitute generic procedural shapes and claim matched painted art.
4. Request genuine transparency. Preserve source PNGs and exact prompts, reference identifiers and approval/integration status. Inspect the output for clipped roofs/bases, halo, background pixels and mismatched architecture. Fix a visible halo with an image edit; resizing or renaming does not fix it.
5. Show full-size and approximately 80–110px previews. Also show the final intended runtime scale: humble houses are smaller. Honor an explicitly requested approval loop. If the user already authorizes creation and integration, complete both without asking for permission again. Otherwise, distinguish a proposal from an approved production asset.

## Pack and integrate

Use the existing biome-building definitions and packer described in the runtime reference. Name assets `<biome>-<architecture>` with unique lowercase hyphenated names. Measure the doorway anchor in the original image, then let the packer transform it through cropping, resizing and padding. Never use an arbitrary bottom-centre anchor for buildings or alter the shared renderer origin to compensate for bad metadata.

Adding a sprite to the admin catalogue does not prove it can appear in the World. When automatic integration is requested, verify it enters the correct biome pool, preserves manual overrides/custom artist precedence, and is effectively selected with stable artist-ID randomness. Preserve current placement probabilities unless the user asks to change them. Do not rewrite artist coordinates or persisted assignments merely to add visual variants.

## Validate and finish

Run the included structural validator from the BeatGrove checkout:

```sh
node /path/to/beatgrove-building-generator/scripts/validate_buildings.mjs --repo "$PWD"
```

It resolves Sharp from that checkout and checks all additional biome buildings. To restrict inspection, add `--names forest-woodcutter-hut,swamp-rotting-shack`.

Also inspect a contact sheet with doorway markers, runtime scale and transparency on light/dark backgrounds. For automatic integration, run a synthetic renderer census and confirm each new sprite is actually selected only in its biome. A census is not a live placement screenshot; review the running game when available and state any remaining boundary.

Follow repository checks: normally lint, application typecheck and `git diff --check`; leave unit tests/test typecheck to CI when instructed. Record decisions and validation in the application decision log. Commit only scoped changes locally when repository/user instructions require it. Report saved assets, selection behavior, preview, checks and commit; distinguish local integration from deployment.
