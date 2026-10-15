/* Shared by the tool scripts (js/tools/alexrecon.js, alexutils.js, alextrace.js),
   on the old SPA and on the Next tool pages. The tools' inline styles use the
   theme variables from css/variables.css (--accent, --fg-1..4, --fg-rgb, ...). */

// Current value of a theme variable (canvas drawing can't use var()).
function toolCssVar(name, fallback) {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  } catch (e) {
    return fallback;
  }
}

// A :root { ... } block with the current theme's values, for the standalone
// report files/windows (HTML export, print view): the report markup copied
// into them uses var(--...) and would otherwise lose its colours.
const TOOL_THEME_VARS = ['--accent', '--accent-bright', '--accent-deep', '--accent-rgb', '--on-accent', '--red',
  '--red-dim', '--surface', '--surface2', '--surface3', '--line-strong', '--border', '--fg-1', '--fg-2', '--fg-3',
  '--fg-4', '--fg-rgb'];
function toolThemeVarsCss() {
  const decls = TOOL_THEME_VARS.map(n => {
    const v = toolCssVar(n, '');
    return v ? `${n}:${v};` : '';
  }).join('');
  return decls ? `:root{${decls}}` : '';
}
