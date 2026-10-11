# Gait and articulated assembly

Read this reference when creating or repairing a walk cycle or a cut-out pose generator.

## Motion model

A walk reads from alternating contact, support, passing, and push-off phases. The two legs use the same curve with a half-cycle phase offset. A useful stylized baseline is:

- 55–65% of the cycle in stance;
- one foot planted while the other returns through swing;
- a smooth swing return rather than a linear snap;
- maximum foot lift near mid-swing;
- small vertical torso bob with two peaks per full cycle;
- arm swing opposite the leg on the same side.

The exact frame count is secondary to distinct silhouettes and even timing. Twelve frames provide room for contact, support, passing, push-off, and in-betweens without forcing duplicate poses.

Keep the planted support leg substantially straighter than the swing leg. Excessive support-knee bend makes the character crouch or bounce. A swing knee can bend more, but the ankle must still follow a smooth path and clear the ground.

## Joint geometry

Represent each painted limb with two measured source points:

- arm: shoulder center to wrist/hand attachment;
- thigh: hip to knee;
- calf/foot: knee to ankle or the chosen foot pivot.

For a target segment A→B:

1. translate the source joint A to the origin;
2. rotate the source axis onto the target axis;
3. scale uniformly by target length/source length;
4. apply any width multiplier perpendicular to the axis;
5. translate to target A.

Apply mirroring inside this joint-aware transform. Mirroring around the crop center is wrong whenever the painted joint is off-center.

Do not infer joints solely from crop dimensions. A bent painted arm may put its shoulder cap far from `width / 2`. Inspect the source at original resolution and store overrides per character and view.

## Direction and mirroring

Construct the canonical direction first. If the opposite direction is a mirror, mirror the completed pose so torso, limbs, hair, and equipment stay coherent. Keep intentional asymmetry only when the product requires it and has dedicated source art.

For diagonal rear views, name visual sides as `screen-left` and `screen-right` during review. Map them back to near/far or anatomical limbs only after checking the actual facing transform.

## Layering and occlusion

A typical front-view order is:

1. far arm;
2. far leg;
3. near leg;
4. torso;
5. near arm.

This is only a baseline. Inspect the paintings. If the torso contains an opaque empty shoulder socket, an arm behind the torso cannot fill it. Put the relevant arm over the socket or mask the socket while keeping hair and clothing in front.

Keep limb identity stable across the cycle. Sorting a whole leg by ankle height can swap it in front of the torso for one frame and create a pop. If depth must change, split the limb or use an explicit phase transition with visual review.

## Stable origin

Choose one origin and one vertical alignment for the whole character sheet. A projected foot may have a lower opaque pixel on one pose; that is not permission to move the whole character upward.

Measure torso/head top positions across the walk frames. A small modeled bob is expected. A single outlier usually means per-frame normalization, an inconsistent joint length, or a source part whose crop/anchor changed.

## Propagating to a cast

Once one canonical loop is accepted:

- reuse phase timing, target joint trajectories, cadence, and layer policy;
- retain per-character body scale and origin;
- measure each character's source joints;
- inspect long hair, hats, skirts, coats, and oversized shoes separately;
- verify every mirrored direction rather than assuming the transform succeeded.

Do not propagate an unreviewed cycle across the full cast. Small anchor mistakes become multiplied asset churn.
