#!/usr/bin/env python3
"""Replace hard-coded brand greens with the theme accent variables
(css/variables.css), so Blue/Red themes recolour them too. On pages without
data-theme (old SPA) the variables resolve to the same green.
SVG presentation attributes (stroke="#..", fill="#..") can't take var(),
so they become a style attribute. Run: python3 scripts/accentify.py"""
import glob, re

FILES = (['index.html'] + glob.glob('components/*.html') + glob.glob('js/*.js') + glob.glob('js/tools/*.js')
         + glob.glob('web/src/**/*.tsx', recursive=True) + glob.glob('web/src/**/*.ts', recursive=True))
SKIP = re.compile(r'admin|chapter|ctf-challenges-data|/lib/theme\.ts$|ThemeToggle\.tsx$')
COL = [(r'#10b981', 'var(--accent)'), (r'#34d399', 'var(--accent-bright)'), (r'#6ee7b7', 'var(--accent-bright)'),
       (r'#059669', 'var(--accent-deep)'), (r'#047857', 'var(--accent-deep)'), (r'#065f46', 'var(--accent-deep)'),
       (r'#03120c', 'var(--on-accent)')]
HEX = '|'.join(c for c, _ in COL)
VAR = {c: v for c, v in COL}

def attr_to_style(s, jsx):
    # <tag ... stroke="#10b981" ...> (no style yet) -> style="stroke:var(--accent)"
    def fix(m):
        tag = m.group(0)
        hits = re.findall(r'\s(stroke|fill)="(' + HEX + r')"', tag, re.I)
        if not hits or 'style=' in tag: return tag
        for prop, col in hits:
            tag = re.sub(r'\s' + prop + '="' + col + '"', '', tag, count=1)
        decl = ';'.join(f'{p}:{VAR[c.lower()]}' for p, c in hits)
        if jsx:
            decl = ', '.join(f"{p}: '{VAR[c.lower()]}'" for p, c in hits)
            return re.sub(r'(<\w+)', r'\1 style={{ ' + decl.replace('\\', '\\\\') + ' }}', tag, count=1)
        return re.sub(r'(<\w+)', r'\1 style="' + decl + '"', tag, count=1)
    return re.sub(r'<(path|rect|circle|ellipse|line|polyline|polygon|g|svg)\b[^<>]*>', fix, s)

changed = []
for f in sorted(set(FILES)):
    if SKIP.search(f): continue
    s = open(f, encoding='utf-8').read(); o = s
    s = attr_to_style(s, f.endswith('.tsx'))
    for c, v in COL: s = re.sub(c + r'(?![0-9a-f])', v, s, flags=re.I)
    s = re.sub(r'rgba\(\s*16\s*,\s*185\s*,\s*129\s*,', 'rgba(var(--accent-rgb),', s)
    if s != o: open(f, 'w', encoding='utf-8').write(s); changed.append(f)
print('\n'.join(changed))
# (8-digit hex like #10b98133 was converted once by hand to rgba(var(--accent-rgb),a).)
