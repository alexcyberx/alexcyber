# AlexCyberX brand

Official mark: **Glitch X**. An X cut along the middle; the lower half slips sideways like a broken
signal. Drawn from scratch with basic shapes (two strokes, two clip rectangles, two bars). It is not taken
from any icon set, font or other logo. Before a trademark filing, run a trademark search (IP India).

| File | Use |
|---|---|
| `logo-mark-green.svg` / `-blue.svg` / `-red.svg` | Mark only, transparent, on dark backgrounds (one per theme) |
| `logo-mark-dark-ink.svg` | Mark for light backgrounds (print, documents) |
| `logo-wordmark.svg` | Mark + "Alex CyberX" (the text uses the Rajdhani font, so outside the site it may fall back) |
| `favicon.svg`, `favicon.ico` (16/32/48), `favicon-32.png` | Browser tab (dark tile, no border) |
| `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Phone home screen / install |
| `site.webmanifest` | Install manifest |

On the site: Express serves this folder at `/brand/` and the icons at the root (`/favicon.ico` etc.).
The Next navbar draws the mark inline (`web/src/components/LogoMark.tsx`) so it follows the theme colour.

Geometry (64x64 viewBox): strokes `M19 17 45 47` and `M45 17 19 47`, width 7, square caps. Top half
(y < 31) in white, bottom half (y > 33) shifted 4px right in the accent colour. Bars: accent `x10 y31.2 9x1.6`,
white 55% `x47 y31.2 7x1.6`. Favicon tile: `rx 15`, `#0c0f0e`.
