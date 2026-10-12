#!/usr/bin/env python3
"""Package the canonical building skill into a single-root private plugin ZIP."""
import argparse
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
plugin = root / 'plugins/beatgrove-building-studio'
skill = root / 'skills/beatgrove-building-generator'
manifest = json.loads((plugin / 'plugin.json').read_text())
name = manifest['name']
interface = manifest['extensions']['com.openai']['interface']
assert len(interface['shortDescription']) <= 30
assert interface['displayName'] and manifest['version'] == '0.1.0'
args.output.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(args.output, 'w', ZIP_DEFLATED) as archive:
    for source, prefix in [(plugin, Path(name)), (skill, Path(name) / 'skills' / skill.name)]:
        for file in sorted(source.rglob('*')):
            if file.is_file() and '__pycache__' not in file.parts and file.suffix != '.pyc':
                assert not file.is_symlink(), f'Symlink: {file}'
                archive.write(file, str(prefix / file.relative_to(source)))
with ZipFile(args.output) as archive:
    files = archive.namelist()
    assert all(file.startswith(name + '/') and '..' not in Path(file).parts for file in files)
    assert name + '/plugin.json' in files
    assert name + '/skills/beatgrove-building-generator/SKILL.md' in files
    for key in ['logo', 'composerIcon']:
        assert name + '/' + interface[key].removeprefix('./') in files
print(f'{args.output}: {len(files)} files, {args.output.stat().st_size} bytes')
