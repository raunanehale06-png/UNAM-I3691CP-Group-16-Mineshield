# MineShield Mobile Application — Design System Guidelines

## 1. Design Philosophy
The MineShield UI/UX architecture is engineered for high-stress, low-visibility industrial mining environments. The interface prioritizes maximum information density, rapid cognitive processing, and strict behavioral role contrasts across Worker, Supervisor, and Visitor operational contexts.

---

## 2. Color Palette & Semantic Hierarchy

### 2.1 Base Colors
*   **Background (Deep Slate Navy):** `#0A1C2A` / `#0D1E2D`
    *   *Usage:* Global screen backgrounds to prevent eye strain and save device battery life under active duty conditions.
*   **Card Container Background (Muted Charcoal/Blue):** `#132637`
    *   *Usage:* Surfaces for metric modules, list containers, and structural sections.
*   **Border Strokes:** `#20384E`
    *   *Usage:* Subtle separation boundaries for quick grid alignment.

### 2.2 Brand Accent
*   **Primary Active Orange:** `#FF8C00` / `#FA8100`
    *   *Usage:* Secure login actions, active navigation tabs, active role selectors, and core branding elements.

### 2.3 Emergency & Priority Status Hierarchy (Semantic Colors)
*   **High Alert / Danger / Emergency Red:** `#D31515` (Containers) | `#FF1F1F` (Text/Badges)
    *   *Usage:* SOS triggers, immediate hazard markers, Danger Zones, "Critical Incidents" metric cards, and "High" priority background indicators.
*   **Medium Alert / Warning Yellow-Orange:** `#D38015` / `#FFA500`
    *   *Usage:* Gas leaks, equipment failure reports, Warning Zones, and "Medium" priority tracking badges.
*   **Low Alert / Safe Operational Green:** `#158343` / `#00C853`
    *   *Usage:* Resolved statuses, Safe Zones, "Workers Online" badges, and safe vitals indicators.

---

## 3. Typography & Hierarchy

*   **Primary Font Family:** System Sans-Serif (`Roboto` for Android / `SF Pro` for iOS)
*   **Title Large (e.g., "OVERVIEW", "LIVE MINE MAPS"):** `22px` | Bold | Uppercase | Letter Spacing: `0.5px`
*   **Hero Metric Value (e.g., "128", "86"):** `32px` | Extra Bold | Color: `#FFFFFF`
*   **Body Content (e.g., "Rock fall Reported"):** `14px` | Semi-Bold | Color: `#FFFFFF`
*   **Secondary Caption (e.g., "Zone A1", "+12% vs yesterday"):** `12px` | Regular | Color: Muted Gray (`#A0AAB2`) or matching semantic alert color.

---

## 4. Key Reusable Components (As Designed)

### 4.1 Role Navigation Selector (`Splash_Screen`)
*   **Structure:** Capsule layout tracking horizontal tabs (`Worker`, `Supervisor`, `Visitor`).
*   **Behavior:** Active selection snaps with a bold background capsule pill (`#FA8100` for active role, unselected roles maintain muted grey text).

### 4.2 Supervisor Overview Metrics Carousel
*   **Structure:** Multi-card horizontal swipe layout.
*   **Dimensions:** Fixed width aspect-ratio bounding boxes utilizing conditional semantic borders.
*   **Interaction:** Allows the supervisor to pan between high-level operational values seamlessly:
    1.  *Total Hazards:* Gold-Orange border wrap (`#FFA500`)
    2.  *Workers Online:* Safe Green border wrap (`#00C853`)
    3.  *Active Alerts:* Dark Red border wrap (`#FF1F1F`)
    4.  *Critical Incidents:* Danger Red fill/border wrap (`#D31515`)
    5.  *Avg Response Time:* Tech Blue border wrap (`#0091EA`)

### 4.3 Live Mine Map Interface 
*   **Map Container:** Dark geographic/schematic map rendering backdrop.
*   **Overlays:** Transparent vector-bounded polygon zones with dashed color thresholds:
    *   *Safe Zone:* Green dash outline with low opacity green fill color.
    *   *Warning Zone:* Orange dash outline with low opacity orange fill color.
    *   *Danger Zone:* Red dash outline with low opacity red fill color.
*   **Status Pins:** Concentric circle pulse nodes indicating active event triggers (`Resolved` = Checked Green Map Pin, `Pending` = Pulsing Red Communication Message Pin).

### 4.4 List Item Roster Cards (`Recent Alerts`)
*   **Layout:** Row layout with explicit left-hand hazard icon markers (e.g., warning triangle) and explicit right-hand semantic solid text priority badges (`HIGH`, `MEDIUM`, `LOW`) matching the defined operational system status colors.