import { useLayoutEffect, useState } from "react";

// Reads a CSS custom property as a color string, resolved for the current theme.
// The app toggles `.dark` on its root wrapper, and `src/index.css` mirrors those
// dark tokens onto `:root:has(.dark)`, so the document element always reflects
// whichever theme is active.
export function cssColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Reads a set of color tokens and re-reads them once after each theme change.
// The read runs in a layout effect (after the DOM has the new theme, before paint),
// so it never happens per frame and never shows the previous theme's colors.
export function useThemeColors(names, themeKey) {
  const [colors, setColors] = useState(() => names.map(cssColor));
  useLayoutEffect(() => {
    setColors(names.map(cssColor));
  }, [themeKey]);
  return colors;
}
