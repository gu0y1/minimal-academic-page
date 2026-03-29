#!/usr/bin/env python3
"""
build.py — Scan section folders and generate items.json for each.

Usage:
    python build.py

For each section (research, publications, teaching), this script:
1. Scans all sub-folders
2. Reads meta.json from each sub-folder
3. Generates items.json sorted by year (newest first)
"""

import os, json, sys

SECTIONS = ['research', 'publications', 'teaching']
ROOT = os.path.dirname(os.path.abspath(__file__))


def build_section(section):
    section_dir = os.path.join(ROOT, section)
    if not os.path.isdir(section_dir):
        print(f'  {section}/ not found, skipping.')
        return

    items = []

    for entry in sorted(os.scandir(section_dir), key=lambda e: e.name):
        if not entry.is_dir():
            continue

        meta_path = os.path.join(entry.path, 'meta.json')
        if not os.path.exists(meta_path):
            continue

        with open(meta_path, 'r', encoding='utf-8') as f:
            meta = json.load(f)

        meta['folder'] = entry.name

        # Auto-detect thumbnail
        if 'thumbnail' not in meta:
            for ext in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']:
                thumb = os.path.join(entry.path, f'thumbnail.{ext}')
                if os.path.exists(thumb):
                    meta['thumbnail'] = f'thumbnail.{ext}'
                    break

        # Check for detail page
        if os.path.exists(os.path.join(entry.path, 'index.html')):
            meta['has_page'] = True

        items.append(meta)

    # Sort: year desc → order asc → title asc
    items.sort(key=lambda x: (
        -x.get('year', 0),
        x.get('order', 999),
        x.get('title', '')
    ))

    output_path = os.path.join(section_dir, 'items.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2, ensure_ascii=False)

    print(f'  {section}/items.json — {len(items)} item(s)')


def main():
    print('Building items.json for each section...\n')
    for section in SECTIONS:
        build_section(section)
    print('\nDone.')


if __name__ == '__main__':
    main()
