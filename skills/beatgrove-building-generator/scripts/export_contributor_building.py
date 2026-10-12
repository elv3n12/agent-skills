#!/usr/bin/env python3
"""Export a transparent source master as a compact review PNG + runtime WebP.
Requires Pillow. No generation/API key, repository, or network access needed.
The application packer remains authoritative for final integration.
"""
import argparse
import json
import math
from pathlib import Path
from PIL import Image

LIMITS = {'cottage': (224, 256, 112, 128), 'hall': (256, 288, 128, 144), 'tower': (192, 328, 96, 164)}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--name', required=True)
    parser.add_argument('--form', choices=LIMITS, default='hall')
    parser.add_argument('--scale', type=float, default=1)
    parser.add_argument('--doorway-x', type=float)
    parser.add_argument('--doorway-y', type=float)
    args = parser.parse_args()
    import re
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', args.name):
        parser.error('name must be lowercase kebab-case')
    if not math.isfinite(args.scale) or not 0 < args.scale <= 1:
        parser.error('scale must be in (0,1]')
    coords = [args.doorway_x, args.doorway_y]
    if (coords[0] is None) != (coords[1] is None):
        parser.error('provide both doorway coordinates, or neither')
    if coords[0] is not None and any(not math.isfinite(c) or not 0 < c < 1 for c in coords):
        parser.error('doorway coordinates must be normalized original-image values in (0,1)')
    with Image.open(args.input) as original:
        if 'A' not in original.getbands() and 'transparency' not in original.info:
            parser.error('source has no alpha; generate true transparency first')
        source = original.convert('RGBA')
    alpha = source.getchannel('A')
    if alpha.getextrema()[0] == 255:
        parser.error('source is fully opaque; checkerboard/painted background is not transparency')
    bounds = alpha.point(lambda a: 255 if a >= 8 else 0).getbbox()
    if bounds is None:
        parser.error('source contains no visible building')
    width, height, world_w, world_h = LIMITS[args.form]
    crop = source.crop(bounds)
    crop.thumbnail((width - 4, height - 4), Image.Resampling.LANCZOS)
    packed = Image.new('RGBA', (crop.width + 4, crop.height + 4))
    packed.paste(crop, (2, 2))
    # Constructing a fresh image discards source metadata without changing visible pixels.
    args.output_dir.mkdir(parents=True, exist_ok=True)
    output_png = args.output_dir / (args.name + '.png')
    output_webp = args.output_dir / (args.name + '.webp')
    if args.input.resolve() in [output_png.resolve(), output_webp.resolve()]:
        parser.error('output must not overwrite the source master')
    packed.save(output_png, optimize=True)
    packed.save(output_webp, format='WEBP', lossless=True, method=6, exact=True)
    for target in [output_png, output_webp]:
        with Image.open(target) as check:
            assert check.convert('RGBA').getchannel('A').tobytes() == packed.getchannel('A').tobytes(), 'alpha changed during export'
            expected, actual = packed.tobytes(), check.convert('RGBA').tobytes()
            assert all(expected[k:k+3] == actual[k:k+3] for k in range(0, len(expected), 4) if expected[k+3]), 'visible pixels changed during export'
    metadata = {'name': args.name, 'form': args.form, 'kind': 'building', 'width': packed.width,
                'height': packed.height, 'drawnW': crop.width, 'drawnH': crop.height,
                'fit': round(min(world_w / crop.width, world_h / crop.height) * args.scale, 4),
                'sourceSize': list(source.size), 'sourceCrop': list(bounds),
                'doorwayStatus': 'needs_measurement' if coords[0] is None else 'needs_visual_review',
                'pngBytes': output_png.stat().st_size, 'webpBytes': output_webp.stat().st_size}
    if coords[0] is not None:
        x = (2 + (coords[0] * source.width - bounds[0]) / (bounds[2] - bounds[0]) * crop.width) / packed.width
        y = (2 + (coords[1] * source.height - bounds[1]) / (bounds[3] - bounds[1]) * crop.height) / packed.height
        if not .1 <= x <= .9 or not .55 <= y <= 1:
            parser.error('transformed doorway is outside the lower silhouette; measure it again')
        metadata.update(anchorX=round(x, 4), anchorY=round(y, 4))
    (args.output_dir / (args.name + '.export.json')).write_text(json.dumps(metadata, indent=2) + '\n')
    print(json.dumps(metadata, indent=2))
    print('Contributor export only. Inspect halo/clipping/doorway and use the application packer before integration.')

if __name__ == '__main__':
    main()
