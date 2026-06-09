# MineShield Mobile Application — Multi‑Theme Design System

**Version:** 2.0  
**Author:** Tegameno Iyambo (UI/UX Lead)  
**Last Updated:** June 10, 2026

## 1. Overview

MineShield now supports **four distinct themes** to accommodate user preference and varying lighting conditions in mining environments. Users can switch themes at any time from the Settings screen. Despite different background and accent colours, **semantic alert colours remain consistent** across all themes to avoid confusion during safety-critical operations.

The themes are:
- **Light Theme** – default high‑visibility theme for surface/office use.
- **Dark Theme** – reduces eye strain in low‑light underground conditions.
- **Warm Theme** – softer, earth‑toned theme for extended wear.
- **Night Theme** – optimised for complete darkness, using cool dark slate and glowing amber.

---

## 2. Theme Colour Palettes

All values are provided in **RGB** and approximate **HEX** equivalents.

### 2.1 Light Theme
| Element | RGB | HEX |
|---------|-----|-----|
| Canvas Background | `rgb(243, 246, 252)` | `#F3F6FC` |
| Card Background | `rgb(255, 255, 255)` | `#FFFFFF` |
| Active Accent / Primary Button | `rgb(212, 131, 61)` | `#D4833D` |
| Inactive Button Border | `rgb(175, 192, 214)` | `#AFC0D6` |
| Primary Text | `rgb(33, 43, 54)` | `#212B36` |

### 2.2 Dark Theme
| Element | RGB | HEX |
|---------|-----|-----|
| Canvas Background | `rgb(16, 25, 38)` | `#101926` |
| Card Background | `rgb(24, 37, 54)` | `#182536` |
| Active Accent / Primary Button | `rgb(235, 163, 80)` | `#EBA350` |
| Inactive Button Border | `rgb(45, 62, 84)` | `#2D3E54` |
| Primary Text | `rgb(220, 226, 235)` | `#DCE2EB` |

### 2.3 Warm Theme
| Element | RGB | HEX |
|---------|-----|-----|
| Canvas Background | `rgb(244, 238, 230)` | `#F4EEE6` |
| Card Background | `rgb(255, 255, 255)` | `#FFFFFF` |
| Active Accent / Primary Button | `rgb(141, 91, 56)` | `#8D5B38` |
| Inactive Button Border | `rgb(198, 187, 172)` | `#C6BBAC` |
| Primary Text | `rgb(46, 38, 33)` | `#2E2621` |

### 2.4 Night Theme
| Element | RGB | HEX |
|---------|-----|-----|
| Canvas Background | `rgb(13, 27, 38)` | `#0D1B26` |
| Card Background | `rgb(21, 39, 54)` | `#152736` |
| Active Accent / Primary Button | `rgb(222, 161, 78)` | `#DEA14E` |
| Inactive Button Border | `rgb(40, 60, 80)` | `#283C50` |
| Primary Text | `rgb(210, 220, 230)` | `#D2DCE6` |

---

## 3. Semantic Alert Colours (Identical Across All Themes)

These colours are **hardcoded** and do **not** change with theme switching. They ensure immediate recognition of hazard severity regardless of user preference.

| Severity | Background Fill | Text / Border | Usage |
|----------|----------------|---------------|-------|
| **Critical** (Red) | `#D46B5A` (fill), `#C63A27` (text) | High‑risk zones, SOS, evacuations |
| **Warning** (Amber) | `#FDF2E2` (fill), `#D97706` (text) | Pending hazards, gas thresholds |
| **Safe** (Green) | `#EAF7F0` (fill), `#2E7D32` (text) | Resolved hazards, on‑duty status |
| **Neutral / Info** | `#E2E8F0` (fill), `#64748B` (text) | General information cards |

*Example:* A `Card` with variant `danger` will always use the red palette, even in Dark or Night themes.

---

## 4. Typography (All Themes)

Typography is independent of theme – same sizes, weights, and font families across all themes.

| Style | Font Size | Weight | Colour (from active theme) |
|-------|-----------|--------|----------------------------|
| Header | 20px | Bold | Primary Text |
| Subheader | 13px | Regular | Secondary Text (Slate) |
| Hero Metric | 28–32px | Bold | Primary Text |
| Body | 14px | Regular | Primary Text |

**Font Family:** System Sans‑Serif (Roboto on Android, SF Pro on iOS).

---

## 5. Component Adaptation

All components consume the active theme via `ThemeContext`. The `useTheme()` hook returns an object with `colors`, `spacing`, `borderRadius`, and `typography`.

### Example: Themed Button
```jsx
const Button = ({ variant = 'primary' }) => {
  const theme = useTheme();
  const bgColor = variant === 'primary' 
    ? theme.colors.activeAccent   // D4833D, EBA350, 8D5B38, or DEA14E
    : theme.colors.surface;
  // ...
};

*Last updated: June 10, 2026 – UI/UX Lead, Tegameno Iyambo*
