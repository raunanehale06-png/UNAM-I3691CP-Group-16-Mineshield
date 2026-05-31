# MineShield Mobile Application — Production Design System

## 1. Design Vision & Context
Following final integration testing on hardware devices, the MineShield interface was pivoted from a dark theme to a **High-Visibility Light Theme**. This optimization guarantees pristine contrast ratios, removes background alpha-rendering artifacts, and ensures text and critical telemetry remain legible under intense glare or high-stress industrial mining conditions.

## 2. Layout Grid & Spatial Architecture

- **Global Canvas Backdrop:** `#F4F7FA` – soft, desaturated off-white/blue tint that minimizes eye fatigue while maintaining high ambient contrast.
- **Card Container Surface:** `#FFFFFF` – elevated, pure white modules using subtle outer borders and low-opacity drop shadows for structural depth.
- **Global Border Radius:** All metric blocks, interaction inputs, and layout containers follow a unified `16px` to `20px` curvature standard.

## 3. Typography Hierarchy

| Element                     | Size | Weight       | Color (Hex)  |
|-----------------------------|------|--------------|--------------|
| Primary Section Headers     | 20px | Heavy Bold   | `#1E2E4A`    |
| Sub-branding Subtitles      | 13px | Regular      | `#64748B`    |
| Primary Hero Metrics        | 28–32px | Bold     | `#1E2E4A`    |
| Component Card Labels       | 14px | Semi-Bold    | `#4A5A6A`    |

**Font Family:** System Sans-Serif (`Roboto` on Android, `SF Pro` on iOS).

## 4. Color Palette (from `color-palette.pdf`)

### Base & Surface
- **Canvas Background:** `#F4F7FA`
- **Module Container Surface:** `#FFFFFF`
- **Structural Stroke Lines:** `#E2E8F0`

### Brand Identity
- **Primary Safety Orange:** `#E88D43` / `#FA8100` (active tabs, main action buttons)

### Semantic Alert Status
- **Critical / Evacuation:**  
  - Fill: `#D46B5A`  
  - Text/Progress: `#C63A27`
- **Warning / Pending:**  
  - Fill: `#FDF2E2`  
  - Text/Badges: `#D97706`
- **Nominal / Safe:**  
  - Fill: `#EAF7F0`  
  - Text/Badges: `#2E7D32`

### Typography Contrast
- **Primary Text (Navy):** `#1E2E4A`
- **Secondary Text (Slate Gray):** `#64748B`

## 5. Reusable UI Component Specifications

### 5.1 Welcome / Sync Banner
- **Visual Structure:** Top-anchored, full-width card with an abstract geometric blue circular overlay graphic on the right.
- **Behavior:** Houses personalized greetings and real‑time sync status.

### 5.2 Quad-Grid Action Metrics
- **Layout:** 2×2 grid matrix for high‑priority data.
- **Styling:**
  - *Active Hazards:* Soft amber fill (`#FDF2E2`) with thin amber stroke.
  - *Resolved Today:* Soft green fill (`#EAF7F0`) with sage green stroke.
  - *Live SOS / Safe Zones:* Light gray/blue tint panels.

### 5.3 Floating Persistent Navigation Dock
- **Structure:** Bottom‑anchored, rounded navigation island.
- **Active States:** Five icons (Home, Alerts, Logs, Analytics, Settings). Active state uses solid safety‑orange circular button; inactive states use light blue outlines.

### 5.4 Environmental Telemetry Matrix
- **Layout:** Split‑column data cards for atmospheric sensor feeds.
- **Visual Indicators:** Horizontal progress bars color‑coded to threat severity (red = critical, amber = warning, green = safe).

## 6. Code Implementation Notes
- All components consume `ThemeContext` provided in `src/contexts/ThemeContext.js`.
- Consistent spacing: `xs=4`, `sm=8`, `md=16`, `lg=24`, `xl=32`.
- Border radius: `sm=8`, `md=16`, `lg=20`, `xl=24`.

*Last updated: May 31, 2026 – UI/UX Lead, Tegameno Iyambo*
