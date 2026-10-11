# Sprite animation QA

Read this reference before declaring an animation complete.

## Structural checks

For every sheet, verify:

- exact sheet and cell dimensions;
- expected row and column counts;
- every required cell contains opaque pixels;
- transparent padding is sufficient to prevent clipping;
- every motion frame in a direction is distinct;
- frame indices match the runtime consumer;
- preview loops contain the expected page count and delay values;
- lossless runtime encodes preserve visible RGBA pixels when that is the contract;
- the manifest points to files that exist and matches their content fingerprints.

Useful measurements across a row include topmost opaque pixel, bottommost opaque pixel, alpha bounds, and visible-pixel hash. A head/top range larger than the modeled bob often indicates a jump. Compare the last frame with the first as well as adjacent frames.

The generic validator reports these measurements:

```sh
node /path/to/sprite-animation-generator/scripts/validate_sprite_sheet.mjs \
  --sheet path/to/sheet.png \
  --frame-width 128 --frame-height 128 \
  --columns 16 --rows 4 \
  --motion-start 4 --motion-frames 12 \
  --max-top-range 3 --max-seam-top-delta 2
```

Omit optional range limits when the animation intentionally contains large jumps or vertical movement.

## Visual checks

Watch each loop at normal speed, slow motion, and frame-by-frame:

- contact alternates between left and right;
- the planted foot does not slide noticeably;
- the support leg does not collapse into a crouch;
- the swing foot clears the ground;
- legs do not change apparent length;
- arms counter-swing and remain attached at the shoulders;
- sleeves, shoulder caps, hands, thighs, knees, calves, and shoes do not pop between layers;
- torso bob is rhythmic and has no once-per-loop jump;
- the loop seam is no more abrupt than other adjacent frames;
- mirrored directions preserve the intended facing and attachments;
- silhouettes remain readable at the actual game size.

Use a flat contrasting background and ground ellipse. Inspect both the runtime filter and a nearest-neighbor/detail view when the game uses smoothing.

## Diagnosing common failures

**A black shoulder disc remains visible:** the socket is opaque in the torso, the arm is behind it, or the target shoulder does not match the socket center.

**The arm moves but looks detached:** the source shoulder anchor is based on the crop center rather than the painted shoulder cap. Measure both shoulder and wrist again.

**One frame makes the hero taller:** a foot or limb length changed, or the renderer aligned that frame to its own lowest pixel. Restore one cycle-wide origin.

**The same foot stays forward:** both legs use the same phase or their half-cycle offset was lost.

**A leg crosses behind the other for one frame:** near/far layers were sorted dynamically. Keep identity stable or introduce an explicit reviewed occlusion transition.

**The mirrored direction is still wrong:** determine whether the source limb, target joint, complete pose, or all three were mirrored. Record the failing direction, frame index, and screen side.

**The change is not visible in the review page:** confirm which checkout the server uses, regenerate runtime assets, refresh content-fingerprinted URLs or bypass the browser cache, and verify the page loads the edited sheet rather than a stale path.

## Evidence and claims

Record which checks actually ran. Distinguish static validation, browser review, in-game review, deployed review, and user acceptance. A structurally valid sheet can still have an implausible gait.
