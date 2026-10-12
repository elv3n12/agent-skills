#!/usr/bin/env python3
"""Check discoverable skill packaging and saved evaluation fixtures."""
import argparse
import json
import re
from pathlib import Path

import yaml


def check(condition, message):
    if not condition:
        raise ValueError(message)


def validate(root):
    skills = sorted((root / 'skills').glob('*/SKILL.md'))
    check(bool(skills), 'No skills found')
    for entry in skills:
        folder = entry.parent
        text = entry.read_text()
        match = re.match(r'^---\n(.*?)\n---\n', text, re.S)
        check(match is not None, f'{entry}: missing YAML frontmatter')
        meta = yaml.safe_load(match.group(1))
        check(isinstance(meta, dict), f'{entry}: frontmatter must be a mapping')
        name = meta.get('name')
        check(isinstance(name, str) and re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', name)
              and len(name) <= 64 and name == folder.name, f'{entry}: invalid name or folder mismatch')
        desc = meta.get('description')
        check(isinstance(desc, str) and 0 < len(desc.strip()) <= 1024
              and '<' not in desc and '>' not in desc, f'{entry}: invalid description')
        check(len(text.splitlines()) < 500, f'{entry}: move detailed guidance into references')
        for doc in [entry, *sorted((folder / 'references').rglob('*.md'))]:
            for link in re.findall(r'\[[^\]]*\]\(([^)]+)\)', doc.read_text()):
                if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', link) or link.startswith('#'):
                    continue
                target = link.split('#', 1)[0]
                check((doc.parent / target).exists(), f'{doc}: broken reference {link}')
        ui = yaml.safe_load((folder / 'agents/openai.yaml').read_text())
        check(isinstance(ui, dict) and isinstance(ui.get('interface'), dict), f'{name}: invalid Codex metadata')
        for key in ['display_name', 'short_description', 'default_prompt']:
            check(isinstance(ui['interface'].get(key), str) and ui['interface'][key].strip(), f'{name}: missing {key}')
        check('$' + name in ui['interface']['default_prompt'], f'{name}: prompt references another skill')
        triggers = json.loads((folder / 'evals/trigger-evals.json').read_text())
        check(isinstance(triggers, list) and len(triggers) == 20, f'{name}: expected twenty trigger cases')
        queries = set()
        for case in triggers:
            check(isinstance(case, dict) and isinstance(case.get('query'), str)
                  and case['query'].strip() and type(case.get('should_trigger')) is bool,
                  f'{name}: invalid trigger case')
            check(case['query'] not in queries, f'{name}: duplicate trigger query')
            queries.add(case['query'])
        check(sum(case['should_trigger'] for case in triggers) == 10, f'{name}: expected ten positive and ten negative cases')
        tasks = json.loads((folder / 'evals/evals.json').read_text())
        check(isinstance(tasks, dict) and tasks.get('skill_name') == name
              and isinstance(tasks.get('evals'), list) and len(tasks['evals']) >= 3,
              f'{name}: invalid task evals')
        ids = set()
        for case in tasks['evals']:
            check(isinstance(case, dict) and type(case.get('id')) is int and case['id'] not in ids,
                  f'{name}: invalid or duplicate task ID')
            ids.add(case['id'])
            for key in ['prompt', 'expected_output']:
                check(isinstance(case.get(key), str) and case[key].strip(), f'{name}: missing {key}')
            check(isinstance(case.get('files'), list), f'{name}: files must be a list')
            for file in case['files']:
                check(isinstance(file, str) and (folder / file).is_file(), f'{name}: missing eval input {file}')
        print(f'{name}: metadata, links, Codex UI, {len(triggers)} trigger cases and {len(tasks["evals"])} task cases valid')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    try:
        validate(args.repo.resolve())
    except (ValueError, OSError, yaml.YAMLError) as error:
        parser.exit(1, f'Validation failed: {error}\n')
