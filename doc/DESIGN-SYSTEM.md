# MineShield Mobile Application — Production Design System

## 1. Design Vision & Context
Following final integration testing on hardware devices, the MineShield interface was pivoted from a dark theme to a High-Visibility Light Theme. This optimization guarantees pristine contrast ratios, removes background alpha-rendering artifacts, and ensures text and critical telemetry remain legible under intense glare or high-stress industrial mining conditions.

---

## 2. Layout Grid & Spatial Architecture

*   **Global Canvas Backdrop:** A soft, desaturated off-white/blue tint that minimizes eye fatigue while maintaining high ambient contrast.
*   **Card Container Surface:** Elevated, pure white modules utilizing subtle outer borders and low-opacity drop shadows to establish structural depth and scannability.
*   **Global Border Radius:** All metric blocks, interaction inputs, and layout containers follow a unified `16px` to `20px` curvature standard for a modern, cohesive interface.

---

## 3. Typography Hierarchy

*   **Font Family:** System Sans-Serif (`Roboto` for Android / `SF Pro` for iOS).
*   **Primary Section Headers:** `20px` | Heavy Bold | Uppercase | Color: Deep Navy (`#1E2E4A`).
*   **Sub-branding Subtitles:** `13px` | Regular | Color: Slate Steel Gray (`#7A8B9E`).
*   **Primary Hero Metrics:** `28px` to `32px` | Bold | Color: Deep Navy (`#1E2E4A`).
*   **Component Card Labels:** `14px` | Semi-Bold | Color: Medium Slate (`#4A5A6A`).

---

## 4. Reusable UI Component Specifications

### 4.1 Welcome / Sync Banner
*   **Visual Structure:** Top-anchored, full-width card styled with an abstract geometric blue circular overlay graphic on the right boundary.
*   **Behavior:** Houses personalized profile greetings and dynamic database status indicators (e.g., "Your control room is syncing in real time.").

### 4.2 Quad-Grid Action Metrics
*   **Layout:** A symmetrical $2 \times 2$ grid matrix dividing real-time site data into high-priority visual buckets.
*   **Aesthetic Styling:**
    *   *Active Hazards:* Soft Amber background block with a thin muted amber stroke perimeter.
    *   *Resolved Today:* Soft Green background block with a thin sage green stroke perimeter.
    *   *Live SOS / Safe Zones:* Crisp light gray/blue tint panels emphasizing active numerical data tracking.

### 4.3 Floating Persistent Navigation Dock
*   **Structure:** A bottom-anchored, rounded navigation island suspended gracefully above scrolling page content.
*   **Active States:** Houses five icon markers (`Home`, `Alerts`, `Logs`, `Analytics`, `Settings`). The active panel state is boldly signaled using a solid safety-orange filled circular button base, while inactive choices rest on clear light-blue outlines.

### 4.4 Environmental Telemetry Matrix
*   **Layout:** Split-column data cards mapping individual atmospheric sensor feeds.
*   **Visual Indicators:** Integrates horizontal, solid fill progress indicator bars (e.g., Threat Level Index at 100%) color-coded to map structural or gas threat severity directly.eft-hand hazard icon markers (e.g., warning triangle) and explicit right-hand semantic solid text priority badges (`HIGH`, `MEDIUM`, `LOW`) matching the defined operational system status colors.
