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


# ── Tool pages (step 5c): AlexRecon / AlexUtils / AlexTrace ─────────────────
#   python3 scripts/themeify.py --tools
# Same neutral mapping, plus the brand accent (the old hard-coded green
# #10b981 / rgba(16,185,129,a), which was red #dc1414 before) -> --accent, and
# white text/icons on a tinted background -> --fg-1. Status colours (#4ade80,
# #fbbf24, #f87171, ...) stay as they are. Only style="..." strings in the JS
# are touched; colours set from JS code (canvas, exports) are done by hand.
TOOL_CSS = ['css/alexrecon.css', 'css/alexutils.css', 'css/alextrace.css']
TOOL_JS = ['js/tools/alexrecon.js', 'js/tools/alexutils.js', 'js/tools/alextrace.js']
TOOL_SLICES = [('<div id="alexReconPage" class="page">', '</div><!-- end #alexTracePage -->')]

ACCENT_ALPHA = re.compile(r'#10b981([0-9a-fA-F]{2})\b', re.I)


def accent(val):
    val = ACCENT_ALPHA.sub(lambda m: 'rgba(var(--accent-rgb),%s)' % round(int(m.group(1), 16) / 255, 2), val)
    val = re.sub(r'#10b981\b', 'var(--accent)', val, flags=re.I)
    val = re.sub(r'#03120c\b', 'var(--on-accent)', val, flags=re.I)
    return re.sub(r'rgba\(\s*16\s*,\s*185\s*,\s*129\s*,', 'rgba(var(--accent-rgb),', val)


def tool_decls(body):
    on_accent = re.search(r'background(-color)?\s*:\s*var\(--(red|accent)\)', body)
    body = css_decls(accent(body))
    white = 'var(--on-accent)' if on_accent else 'var(--fg-1)'
    return re.sub(r'(?<![\w-])(color\s*:\s*)#fff(fff)?\b', lambda m: m.group(1) + white, body, flags=re.I)


SVG_TAG = re.compile(r'<(path|circle|rect|line|polyline|polygon|ellipse)\b[^<>]*?/?>')


def svg_attrs(tag):
    # stroke="#10b981" -> style="stroke:var(--accent)" (var() is not allowed in
    # presentation attributes), grey icons -> --fg-3.
    if 'style=' in tag:
        return tag
    m = re.search(r'\s(stroke|fill)="(#[0-9a-fA-F]{3,6})"', tag)
    if not m:
        return tag
    col = m.group(2).lower()
    var = 'var(--accent)' if col == '#10b981' else ('var(--fg-3)' if col == '#8a8a95' else None)
    if not var:
        return tag
    return tag.replace(m.group(0), ' style="%s:%s"' % (m.group(1), var))


def do_tool_html(s):
    s = re.sub(r'style="([^"]*)"', lambda m: 'style="' + tool_decls(m.group(1)) + '"', s)
    return SVG_TAG.sub(lambda m: svg_attrs(m.group(0)), s)


def do_tool_css(s):
    return re.sub(r'\{([^{}]*)\}', lambda m: '{' + tool_decls(m.group(1)) + '}', s)


def tools_main():
    changed = []
    for f in TOOL_CSS:
        s = open(f).read(); n = do_tool_css(s)
        if n != s: open(f, 'w').write(n); changed.append(f)
    for f in TOOL_JS:
        s = open(f).read(); n = do_tool_html(s)
        if n != s: open(f, 'w').write(n); changed.append(f)
    s = open('index.html').read(); n = s
    for a, b in TOOL_SLICES:
        i = n.index(a); j = n.index(b, i)
        n = n[:i] + do_tool_html(n[i:j]) + n[j:]
    if n != s: open('index.html', 'w').write(n); changed.append('index.html')
    print('\n'.join(changed))


def main():
    import glob
    if '--tools' in sys.argv:
        return tools_main()
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
