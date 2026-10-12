# Artist-building contributions in ChatGPT

This mode creates artwork and portable export files. It does not require access to BeatGrove's repository. Do not request repository access or pretend integration occurred when the contributor only wants a building.

## Inputs and art

Use the artist name and any supplied musical description. Suggest the artist through architecture, material, roof and one or two restrained ornaments. Do not invent factual artist symbolism or reproduce a logo, album cover or readable band name. If the contributor also supplies a biome, honor it; otherwise do not guess a biome merely from genre.

Inspect the bundled painted-building images and read art-direction.md. Preserve front/right isometric camera, warm upper-left light, fine painted structural detail, complete contact base and a clear lower-left doorway. No surrounding scene, giant platform or opaque background. Use available image generation with transparency enabled. Keep high-resolution source art for future repacking.

## File size: generation and export are separate

A detailed source PNG can be 1–3 MB. Text instructions cannot guarantee byte size; asking for a tiny PNG does not perform an export. Generate first, then resize/crop and encode with code when available. Do not reduce art quality or promise a size limit without measuring the actual exported file.

For a compact artist lodge, default to **hall**: at most 256×288 packed pixels. A smaller cottage uses 224×256; a tower uses 192×328. Keep aspect ratio, two transparent pixels on each edge and alpha. Deliver:

- `artist-slug-source.png`: original transparent master, preserved separately.
- `artist-slug.png`: compact review PNG.
- `artist-slug.webp`: lossless alpha runtime candidate.
- `artist-slug.export.json`: measured dimensions, file bytes, crop/fit and anchor status.

Aim around 50–150 KB for the WebP, but report actual bytes; dense artwork may exceed this. Do not use JPEG, strip transparency or silently reduce dimensions below the required form. Larger source files are not loaded by the game.

If Python/Pillow and the generated file are accessible, run the bundled exporter:

```sh
python /path/to/skill/scripts/export_contributor_building.py \
  --input /path/to/artist-source.png --output-dir /path/to/export \
  --name artist-slug --form hall
```

If Pillow is absent, use the environment's supported image library or install it only when permitted. The script needs no API credentials or repository. If code/file processing is unavailable, deliver the source and state that compact exports remain pending; do not claim the source is runtime-sized. A skills-only plugin supplies instructions/scripts and cannot add missing image-generation or code-execution capabilities.

The helper crops bounds above alpha 8 and preserves pixels within them; it is not an artistic background remover or the app's strongest-silhouette packer. Attached glow and stray painted residue require visual review/image editing. Default output intentionally has no invented anchor. Pass `--doorway-x` and `--doorway-y` only after measuring the original image. Final registration and authoritative repacking belong to the BeatGrove integration workflow in runtime.md.

## Contributor prompt

```text
Use BeatGrove Building Studio to create one isolated compact music lodge
representing {{artist}}, using its visual references and painted isometric style.
Let materials, roof and one or two small ornaments suggest the artist's music.
Keep a clear lower-left doorway and a readable miniature silhouette.
No readable names, logos, album titles or letters. Genuine transparent background;
complete building/base with margins, no surrounding scene or giant platform.

Generate a detailed source master, then use code to export a hall-sized sprite
(maximum 256×288px) with two-pixel transparent borders. Return the compact PNG,
a lossless transparent WebP, actual dimensions and file sizes, and preserve the
original source separately. If export tools are unavailable, say so explicitly.
```

Use the installed plugin name if mention selection is supported, or select it from the interface. Show the result at full size and miniature size. Never state an installed plugin has been tested just because its package was accepted.
