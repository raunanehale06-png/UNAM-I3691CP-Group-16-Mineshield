import React, { createContext, useContext, useMemo } from 'react';

import colors, { withAlpha } from '../styles/colors';
import spacing, { radii } from '../styles/spacing';
import typography from '../styles/typography';

const baseTheme = Object.freeze({
  colors,
  spacing,
  radii,
  typography,
  withAlpha,
});

const ThemeContext = createContext(baseTheme);

export function ThemeProvider({ children, value }) {
  const theme = useMemo(() => {
    if (!value) {
      return baseTheme;
    }

    return {
      ...baseTheme,
      ...value,
      colors: {
        ...baseTheme.colors,
        ...value.colors,
      },
      spacing: {
        ...baseTheme.spacing,
        ...value.spacing,
      },
      radii: {
        ...baseTheme.radii,
        ...value.radii,
      },
      typography: {
        ...baseTheme.typography,
        ...value.typography,
      },
    };
  }, [value]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
