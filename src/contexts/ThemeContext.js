/**
 * File: ThemeContext.js
 * Author: Tegameno Iyambo
 * Role: UI/UX Lead
 * FR: All (UI consistency across all FRs)
 * Description: Provides a high-visibility light theme based on MineShield's color palette.
 *              Used across the entire app to ensure consistent theming.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

// Color palette from design system (color-palette.pdf + DESIGN_SYSTEM.md)
export const Colors = {
  // Base & Surface
  background: '#F4F7FA',      // Screen canvas
  surface: '#FFFFFF',          // Card & module surfaces
  divider: '#E2E8F0',          // Structural lines

  // Brand Identity
  primaryOrange: '#E88D43',    // Active tabs, main actions
  primaryOrangeDark: '#FA8100',

  // Semantic alerts
  criticalFill: '#D46B5A',
  criticalText: '#C63A27',
  warningFill: '#FDF2E2',
  warningText: '#D97706',
  safeFill: '#EAF7F0',
  safeText: '#2E7D32',

  // Typography
  textPrimary: '#1E2E4A',      // Headers, bold metrics
  textSecondary: '#64748B',    // Explanatory texts

  // Status badges
  statusHigh: '#C63A27',
  statusMedium: '#D97706',
  statusLow: '#2E7D32',
};

export const Theme = {
  light: {
    colors: Colors,
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 8,
      md: 16,
      lg: 20,
      xl: 24,
    },
    typography: {
      fontFamily: 'System',
      header: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        textTransform: 'uppercase',
      },
      subheader: {
        fontSize: 13,
        fontWeight: '400',
        color: Colors.textSecondary,
      },
      metric: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.textPrimary,
      },
      body: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textPrimary,
      },
    },
  },
};

const ThemeContext = createContext(Theme.light);

export const ThemeProvider = ({ children }) => {
  // Force light theme as per design system (high visibility)
  const scheme = useColorScheme();
  const theme = useMemo(() => Theme.light, [scheme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
