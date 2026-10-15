#!/usr/bin/env python3
"""One-off codemod (kept for reference): turns hard-coded neutral colours in
the CSS/markup used by the Next pages into theme variables (css/variables.css),
so [data-theme="light"] can recolour them. Brand/status colours are left alone.

  python3 scripts/themeify.py            # rewrite files in place
"""
import colorsys
import re
import sys

CSS_FILES = ['css/nav.css', 'css/home.css', 'css/learn.css', 'css/auth.css', 'css/profile.css',
             'css/modal.css', 'css/ctf-room.css', 'web/src/app/compat.css']
TSX_GLOB = 'web/src'
# index.html: only the home sections the Next home page reads (lib/home.ts).
INDEX_SLICES = [('<div class="hero-left">', '<!-- /HERO LEFT -->'),
                ('<!-- ABOUT -->', '</div><!-- end #homePage -->')]

FG = ('color', 'fill', 'stroke', 'caret-color', '-webkit-text-fill-color')
BG = ('background', 'background-color', 'background-image')
BORDER = ('border', 'border-color', 'border-top', 'border-bottom', 'border-left', 'border-right',
          'border-top-color', 'border-bottom-color', 'border-left-color', 'border-right-color',
          'outline', 'outline-color')

HEX = re.compile(r'#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b')
RGBA_W = re.compile(r'rgba\(\s*255\s*,\s*255\s*,\s*255\s*,')


def parse_hex(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    a = h[6:8]
    return r, g, b, a


def neutral(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return s < 0.22 or (max(r, g, b) - min(r, g, b)) < 0.09, l


def map_hex(tok, kind):
    r, g, b, alpha = parse_hex(tok)
    is_neutral, l = neutral(r, g, b)
    if not is_neutral or alpha:
        return tok
    if kind == 'fg':
        if l > 0.86: return 'var(--fg-1)'
        if l > 0.70: return 'var(--fg-2)'
        if l > 0.47: return 'var(--fg-3)'
        if l > 0.20: return 'var(--fg-4)'
        return tok
    if kind == 'bg':
        if l < 0.05: return 'var(--surface)'
        if l < 0.10: return 'var(--surface2)'
        if l < 0.16: return 'var(--surface3)'
        if l < 0.26: return 'var(--line-strong)'
        return tok
    if kind == 'border':
        if l < 0.26: return 'var(--line-strong)'
        return tok
    return tok


def map_value(prop, val):
    p = prop.strip().lower()
    if p in FG: kind = 'fg'
    elif p in BG: kind = 'bg'
    elif p in BORDER: kind = 'border'
    else: return val
    if kind == 'fg' and re.search(r'#fff(fff)?\b', val, re.I):
        return val  # white text: usually on a coloured badge/button, left to the light override
    val = RGBA_W.sub('rgba(var(--fg-rgb),', val)
    return HEX.sub(lambda m: map_hex(m.group(0), kind), val)


def css_decls(text):
    # property: value pairs inside one rule body / style attribute
    return re.sub(r'(?<![\w-])([a-zA-Z-]+)(\s*:\s*)([^;{}"]+)',
                  lambda m: m.group(1) + m.group(2) + map_value(m.group(1), m.group(3)), text)


def do_css(s):
    return re.sub(r'\{([^{}]*)\}', lambda m: '{' + css_decls(m.group(1)) + '}', s)


def do_html(s):
    return re.sub(r'style="([^"]*)"', lambda m: 'style="' + css_decls(m.group(1)) + '"', s)


def camel_to_css(k):
    return re.sub(r'[A-Z]', lambda c: '-' + c.group(0).lower(), k)


def do_tsx(s):
    def obj(m):
        body = m.group(1)
        body = re.sub(r"([a-zA-Z]+)(\s*:\s*)'([^']*)'",
                      lambda k: k.group(1) + k.group(2) + "'" + map_value(camel_to_css(k.group(1)), k.group(3)) + "'", body)
        return 'style={{' + body + '}}'
    s = re.sub(r'style=\{\{(.*?)\}\}', obj, s, flags=re.S)
    return s


def main():
    import glob
    changed = []
    for f in CSS_FILES:
        s = open(f).read(); n = do_css(s)
        if n != s: open(f, 'w').write(n); changed.append(f)
    for f in glob.glob(TSX_GLOB + '/**/*.tsx', recursive=True):
        s = open(f).read(); n = do_tsx(s)
        if n != s: open(f, 'w').write(n); changed.append(f)
    s = open('index.html').read(); n = s
    for a, b in INDEX_SLICES:
        i = n.index(a); j = n.index(b, i)
        n = n[:i] + do_html(n[i:j]) + n[j:]
    if n != s: open('index.html', 'w').write(n); changed.append('index.html')
    print('\n'.join(changed))


if __name__ == '__main__':
    sys.exit(main())
