---
name: sprite-animation-generator
description: Generate, repair, and validate 2D raster sprite-sheet animations from character art or separated body parts. Use for directional walk cycles, flipbook loops, joint anchoring, occlusion, stable origins, runtime packing, and game-scale visual QA. Do not use for native 3D animation or runtime skeletal rigs unless their rendered output must become raster sheets.
---

# Sprite Animation Generator

Build a reproducible animation pipeline rather than treating every frame as an unrelated illustration. Preserve the character's identity, costume, proportions, palette, and render style while making the motion readable at the final in-game size.

## Start from the runtime contract

Inspect the existing assets, animation consumers, manifests, generators, and review tools before editing. Establish:

- frame width and height;
- row-to-direction mapping and whether opposite directions are mirrored;
- idle and motion frame counts;
- frame duration and loop semantics;
- sprite origin, ground contact, transparent margins, filtering, and display size;
- runtime format, content fingerprinting, and manifest update rules.

Preserve an existing contract unless the user explicitly changes it. If the repository already has a deterministic generator, extend it instead of replacing it with hand-edited frames.

## Prove one canonical cycle first

Choose one hero and one direction that exposes the body mechanics clearly. Build and review that complete loop before propagating the motion to every hero or direction. Transfer the numeric gait and timing; measure each character's painted joints separately.

Use a flipbook sequence with clearly different phases:

1. left contact;
2. left support/down;
3. left passing;
4. left push-off/up;
5. right contact;
6. the mirrored support, passing, and push-off phases;
7. enough in-betweens to make the loop rhythmic at its target cadence.

The opposite leg must lead half a cycle later. Arms counter-swing against their corresponding legs. Keep the support leg mostly extended, bend the swing leg enough for clearance, and keep limb lengths constant. Read [references/gait-and-assembly.md](references/gait-and-assembly.md) when creating or repairing the motion model.

## Choose a source strategy

Use full-frame artwork when the user supplies reviewed poses that only need packing or small corrections. Use deterministic cut-out assembly when identity consistency across many poses and directions matters:

- one torso/head painting per view;
- disconnected arm, thigh, calf, and foot artwork;
- explicit shoulder, wrist, hip, knee, and ankle coordinates;
- procedural transforms for pose generation;
- rasterization only after the complete pose is assembled.

When new raster source art is required, use an image-generation tool for the clean character reference or disconnected parts. Do not ask it to create the final multi-frame sheet in one stochastic image: frame-to-frame proportions, equipment, and limb ordering drift too easily.

Measure joints from the painted pixels. Bounding-box percentages are fallbacks, not trusted anatomy. Record per-character and per-view overrides when a limb is asymmetrical inside its crop.

## Assemble with stable geometry

Rotate and scale a limb from its measured source joint pair to its target joint pair. Apply thickness perpendicular to that axis so length and hand/foot paths stay unchanged.

Choose layers from the actual artwork. A torso may contain an opaque shoulder socket that the animated arm must cover; placing the arm behind it leaves a detached disc. Keep near/far limb identities stable throughout the cycle and do not reorder whole legs from ankle depth on each frame.

Mirror the fully reviewed assembly for the opposite direction when the art direction allows it. Mirror limb art around its measured joints, not around an assumed crop center.

Use one origin for the full cycle, normally for the full sheet. Never align every frame independently to its lowest opaque pixel: a lifted or projected foot then moves the torso and creates a periodic jump. Body bob must come from the gait model and remain small and intentional.

## Generate reviewable outputs

Produce the runtime sheet and, when useful:

- one looping preview per direction;
- a contact sheet containing all heroes and directions;
- a frame-stepping review page with pause and slow motion;
- a manifest that references the final fingerprinted runtime files;
- a short note describing the sheet contract and reproduction commands.

Regenerate derived files from source. Do not patch packed sheets by hand unless the repository explicitly treats them as primary artwork.

## Validate in the medium that matters

Run the repository's existing QA first. The helper [scripts/validate_sprite_sheet.mjs](scripts/validate_sprite_sheet.mjs) can inspect a conventional grid when no equivalent exists.

Then review the live animation at the actual game size and at 2× detail. Pause on both contact poses, the passing poses, the last frame, and the loop seam. Inspect every direction and any asymmetrical costume. Describe problem limbs with direction, frame, and screen side; anatomical left/right becomes ambiguous in rear and mirrored views.

Read [references/qa.md](references/qa.md) for acceptance checks and failure diagnosis. Treat automated checks as structural evidence; visual acceptance still requires watching the loop.

## Finish safely

Update relevant documentation and decision records when the project requires them. Preserve unrelated working-tree changes. Commit only the intended source, generated assets, manifests, and evidence, and follow the repository's push/deployment rules.
