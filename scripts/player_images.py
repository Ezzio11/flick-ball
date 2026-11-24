#!/usr/bin/env python3
"""
Comic-style portraits for players who don't have one yet.

    python3 scripts/player_images.py            # every player in titans_data.ts without an image
    python3 scripts/player_images.py --only gabriel-jesus,rodri --force
    python3 scripts/player_images.py --dry-run  # just list what's missing and where the photo comes from

Steps per player:
  1. source: the official portrait from fcbarcelona.com (first-team page og:image, a transparent cut-out),
     or an entry in scripts/player_images_sources.json for players without one (e.g. Barça Atlètic).
  2. generate: local Codex CLI (its image tool) redraws the photo in the style of two existing portraits
     (full + face close-ups, so it copies the pen work rather than filtering the photo),
     keeping the likeness and removing every crest/sponsor/manufacturer mark.
  3. finish: rembg removes the background; the figure is placed like the existing images
     (1078x1280, bottom-aligned, centred) and saved as public/images/players/<slug>-profile.webp.
  4. review: a contact sheet (source | result) is written to .cache/player-images/review.png. Look at it.

Chosen after 5 side-by-side rounds on Gordon/Jesus: Gemini (agy) kept the style but changed faces and hair\ncolour every time; Codex kept the likeness, and matches the hand-inked look once shown face close-ups.
Needs: codex CLI logged in, Pillow, rembg. Work files live in .cache/player-images/<slug>/.
"""

import argparse
import concurrent.futures
import html
import json
import re
import subprocess
import sys
import unicodedata
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLAYERS_DIR = ROOT / 'public' / 'images' / 'players'
TITANS = ROOT / 'src' / 'lib' / 'titans_data.ts'
OVERRIDES = Path(__file__).resolve().parent / 'player_images_sources.json'
WORK = ROOT / '.cache' / 'player-images'
STYLE_REFS = [PLAYERS_DIR / 'pedri-profile.webp', PLAYERS_DIR / 'marcus-rashford-profile.webp']  # full portraits; face close-ups are cropped from them
SQUAD_URL = 'https://www.fcbarcelona.com/en/football/first-team/players'
SITE = 'https://www.fcbarcelona.com'
SIZE = (1078, 1280)   # every existing portrait
TOP_MARGIN = 30       # head sits ~30px below the top edge in the existing set
KIT_OUTFIELD = "FC Barcelona home shirt in the references' design (blue sleeves, red and blue vertical stripes with soft gradient)."
KIT_KEEPER = "He is a goalkeeper: keep his goalkeeper shirt from image 1 (same colours and pattern), not the outfield kit."
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'

PROMPT = """Image 1 is a photo of a real footballer. Images 2-5 are from a series of illustrated player portraits (2 and 3 full portraits, 4 and 5 close-ups of their faces). Draw the footballer from image 1 as a new portrait in that series.
{hint}
LIKENESS: instantly recognisable as the person in image 1: exact hair colour, hairstyle, eyes, nose, jaw, facial hair (or lack of it), skin tone, tattoos, age and expression. Do not change his hair colour, age him or generalise his face.

ART STYLE, this is what matters most: it must look HAND-INKED, like the face close-ups (images 4 and 5), NOT like a filtered photograph. Heavy black ink cross-hatching for every shadow on the face, neck and arms; visible pen strokes across the skin; a thick black contour line around the head, hair and body; hair drawn as inked strands with black shadow areas; colour laid as flat warm tones with halftone dots, not photographic skin gradients; no photographic skin texture, pores or blemishes.

POSE AND KIT (copy images 2 and 3): waist-up, centred, facing the viewer, hands clasped behind his back, head near the top edge, shirt reaching the bottom edge. {kit} Remove every logo and mark: no club crest, no sponsor, no manufacturer logo, no sleeve badge, no text, no numbers.

BACKGROUND: plain solid white, nothing else. Portrait orientation, about 5:6.

Use your image generation tool. Save the final image as ./{out} in the current directory."""


# ---------- pure helpers (tested in scripts/test_player_images.py) ----------

def slugify(name: str) -> str:
    """Same as nameToSlug() in src/lib/playerHelpers.ts: the image file name the app looks for."""
    s = unicodedata.normalize('NFD', name.lower())
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r'\s+', '-', s)
    return re.sub(r'[^a-z0-9-]', '', s)


def _tokens(s: str):
    return [t for t in re.split(r'[^a-z0-9]+', slugify(s.replace('-', ' '))) if t]


def parse_squad(page: str):
    """[(display name, path)] from the official squad page's player links."""
    pat = r'href="(/en/football/first-team/players/\d+/[a-z0-9-]+)"\s+class="footer-sitemap__nav-link">\s*([^<]+?)\s*<'
    return list(dict.fromkeys((html.unescape(n), p) for p, n in re.findall(pat, page)))


def match_player(name: str, squad):
    """The squad entry whose words each start with one of `name`'s words ("Rodri" -> "Rodrigo"),
    checked against both the display name and the URL slug. None unless exactly one matches."""
    want = _tokens(name)
    hits = []
    for display, path in squad:
        have = set(_tokens(display)) | set(_tokens(path.rsplit('/', 1)[-1]))
        if want and all(any(h.startswith(w) for h in have) for w in want):
            hits.append((display, path))
    return hits[0] if len(hits) == 1 else None


def og_image(page: str):
    """Full-size portrait URL from a player page, or None for the generic club share image."""
    m = re.search(r'<meta property="og:image" content="([^"]+)"', page)
    if not m or 'fcb-share' in m.group(1):
        return None
    return m.group(1).split('?')[0] + '?width=3200'  # the image server needs a width; 3200 is the max


def prepare(img):
    """Source for the generator: a cut-out is cropped to the player and centred on white in 5:6;
    an ordinary photo is passed through (downscaled)."""
    from PIL import Image
    if img.mode == 'RGBA' and img.getchannel('A').getextrema()[0] < 250:
        box = img.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
        fig = img.crop(box)
        w = max(int(fig.height * SIZE[0] / SIZE[1]), fig.width + 40)
        h = int(w * SIZE[1] / SIZE[0])
        canvas = Image.new('RGBA', (w, h), (255, 255, 255, 255))
        canvas.alpha_composite(fig, ((w - fig.width) // 2, h - fig.height))
        return canvas.convert('RGB')
    out = img.convert('RGB')
    out.thumbnail((2400, 2400))
    return out


def place(figure):
    """Put a transparent cut-out on the 1078x1280 canvas the way the existing portraits sit:
    as tall as fits under the top margin (or as wide as the canvas), bottom-aligned, centred."""
    from PIL import Image
    box = figure.getchannel('A').point(lambda a: 255 if a > 10 else 0).getbbox()
    if not box:
        raise ValueError('empty cut-out')
    fig = figure.crop(box)
    scale = min((SIZE[1] - TOP_MARGIN) / fig.height, SIZE[0] / fig.width)
    fig = fig.resize((max(1, round(fig.width * scale)), max(1, round(fig.height * scale))), Image.LANCZOS)
    canvas = Image.new('RGBA', SIZE, (0, 0, 0, 0))
    canvas.alpha_composite(fig, ((SIZE[0] - fig.width) // 2, SIZE[1] - fig.height))
    return canvas


def coverage(img):
    """Share of the canvas the player covers (existing portraits: 0.22-0.65)."""
    a = img.getchannel('A')
    return sum(1 for v in a.getdata() if v > 10) / (a.width * a.height)


# ---------- I/O ----------

def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def players_from_data():
    """{name: is_goalkeeper} for every player in titans_data.ts."""
    s = TITANS.read_text(encoding='utf-8')
    data = json.loads(s[s.index('[', s.index('=')):s.rindex(']') + 1])
    return {p['name']: p.get('position') in ('GK', 'Goalkeeper') for p in data}


def generate(src: Path, refs: list, workdir: Path, hint: str, keeper: bool) -> Path:
    out = workdir / 'comic.png'
    out.unlink(missing_ok=True)
    prompt = PROMPT.format(out=out.name, hint=f'\nWhich person: {hint}\n' if hint else '',
                           kit=KIT_KEEPER if keeper else KIT_OUTFIELD)
    # -i takes several files, so the prompt goes on stdin (as an argument it is swallowed as an image).
    images = [arg for path in [src, *refs] for arg in ('-i', str(path))]
    run = subprocess.run(['codex', 'exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', str(workdir), *images],
                         input=prompt, text=True, capture_output=True, timeout=900)
    (workdir / 'codex.log').write_text(run.stdout + run.stderr)
    if not out.exists():
        raise RuntimeError(f'codex produced no image (exit {run.returncode}); see {workdir / "codex.log"}')
    return out


def make(slug: str, keeper: bool, source: dict, refs: list, force: bool):
    from PIL import Image
    from rembg import remove
    dest = PLAYERS_DIR / f'{slug}-profile.webp'
    if dest.exists() and not force:
        return slug, 'exists (use --force)'
    wd = WORK / slug
    wd.mkdir(parents=True, exist_ok=True)
    (wd / 'source_raw').write_bytes(fetch(source['url']))
    src = wd / 'source.png'
    prepare(Image.open(wd / 'source_raw')).save(src)
    comic = generate(src, refs, wd, source.get('hint', ''), keeper)
    final = place(remove(Image.open(comic).convert('RGBA')))
    cov = coverage(final)
    if not 0.15 <= cov <= 0.8:  # existing portraits: 22%-65%
        raise RuntimeError(f'cut-out covers {cov:.0%} of the canvas; check {comic}')
    final.save(dest, 'WEBP', quality=80, method=6)  # ~200KB each (hand-made set: 110-150KB)
    return slug, f'saved {dest.relative_to(ROOT)} (covers {cov:.0%})'


def face_crop(img):
    """Head-and-shoulders crop of a portrait on white, so the generator can see the pen work up close."""
    from PIL import Image
    rgba = img.convert('RGBA')
    flat = Image.new('RGBA', rgba.size, (255, 255, 255, 255))
    flat.alpha_composite(rgba)
    w, h = flat.size
    return flat.convert('RGB').crop((int(w * .3), 0, int(w * .7), int(h * .42)))


def style_references():
    """[full portrait 1, full portrait 2, face close-up 1, face close-up 2] as PNGs in the work dir."""
    from PIL import Image
    out = []
    for i, ref in enumerate(STYLE_REFS, 1):
        full = Image.open(ref).convert('RGBA')
        flat = Image.new('RGBA', full.size, (255, 255, 255, 255))
        flat.alpha_composite(full)
        flat.convert('RGB').save(WORK / f'style_full_{i}.png')
        out.append(WORK / f'style_full_{i}.png')
    for i, ref in enumerate(STYLE_REFS, 1):
        face_crop(Image.open(ref)).save(WORK / f'style_face_{i}.png')
        out.append(WORK / f'style_face_{i}.png')
    return out


def review_sheet(slugs):
    from PIL import Image, ImageDraw
    rows = []
    for slug in slugs:
        src, dest = WORK / slug / 'source.png', PLAYERS_DIR / f'{slug}-profile.webp'
        if src.exists() and dest.exists():
            a, b = Image.open(src).convert('RGB'), Image.open(dest).convert('RGBA')
            a.thumbnail((400, 480)); b.thumbnail((400, 480))
            row = Image.new('RGB', (820, 510), 'white')
            row.paste(a, (0, 30)); row.paste(b, (420, 30), b)
            ImageDraw.Draw(row).text((5, 8), slug, fill='black')
            rows.append(row)
    if rows:
        sheet = Image.new('RGB', (820, 510 * len(rows)), 'white')
        for i, r in enumerate(rows):
            sheet.paste(r, (0, 510 * i))
        sheet.save(WORK / 'review.png')
        return WORK / 'review.png'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--only', help='comma-separated slugs')
    ap.add_argument('--force', action='store_true', help='regenerate even if the image exists')
    ap.add_argument('--dry-run', action='store_true', help='list players and photo sources, generate nothing')
    ap.add_argument('--jobs', type=int, default=3, help='players generated in parallel (default 3)')
    args = ap.parse_args()
    if args.force and not args.only:
        ap.error('--force needs --only: it would otherwise redraw every hand-made portrait')

    roster = players_from_data()
    names = {slugify(n): n for n in roster}
    only = set(args.only.split(',')) if args.only else None
    todo = {s: n for s, n in names.items()
            if (only is None or s in only) and (args.force or not (PLAYERS_DIR / f'{s}-profile.webp').exists())}
    if only and only - set(names):
        print(f'Unknown slugs: {", ".join(sorted(only - set(names)))}', file=sys.stderr)
    if not todo:
        print('Every player has an image.')
        return 0

    overrides = json.loads(OVERRIDES.read_text()) if OVERRIDES.exists() else {}
    squad = parse_squad(fetch(SQUAD_URL).decode('utf-8', 'replace'))
    sources, problems = {}, []
    for slug, name in sorted(todo.items()):
        if slug in overrides:
            sources[slug] = overrides[slug]
            continue
        hit = match_player(name, squad)
        url = og_image(fetch(SITE + hit[1]).decode('utf-8', 'replace')) if hit else None
        if url:
            sources[slug] = {'url': url}
        else:
            problems.append(f'{slug}: no official portrait found; add one to {OVERRIDES.name}')
    for slug in sorted(todo):
        print(f'{slug:<22} {sources[slug]["url"] if slug in sources else "NO SOURCE"}')
    if args.dry_run:
        return 1 if problems else 0

    WORK.mkdir(parents=True, exist_ok=True)
    refs = style_references()

    done = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.jobs)) as pool:
        futures = {pool.submit(make, s, roster[todo[s]], src, refs, args.force): s for s, src in sources.items()}
        for f in concurrent.futures.as_completed(futures):
            slug = futures[f]
            try:
                print(f'{slug}: {f.result()[1]}')
                done.append(slug)
            except Exception as e:  # one failed player must not stop the others
                problems.append(f'{slug}: {e}')
    sheet = review_sheet(sorted(done))
    if sheet:
        print(f'\nReview: {sheet}')
    for p in problems:
        print(f'PROBLEM {p}', file=sys.stderr)
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
