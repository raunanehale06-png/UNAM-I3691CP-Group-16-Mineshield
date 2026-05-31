# Zone Colors Documentation

**Author:** Hafeni Hilokuah
**FR Reference:** FR-005, FR-006  
**Last Updated:** May 31, 2026

## Color System Overview

MineShield uses a standardized color coding system for risk zones on the live map. Colors provide immediate visual recognition of area safety status.

## Primary Zone Colors

| Risk Level | Color Name | Hex Code | RGBA (Map Overlay) |
|------------|------------|----------|---------------------|
| Safe | Green | `#4CAF50` | `rgba(76, 175, 80, 0.4)` |
| Warning | Orange/Yellow | `#FFA500` | `rgba(255, 165, 0, 0.4)` |
| Danger | Red | `#FF4444` | `rgba(255, 68, 68, 0.4)` |

## Color Application

### Map Zone Overlays
- **Fill Opacity:** 0.35 - 0.45 (allows visibility of underlying map)
- **Stroke Width:** 2px on polygons, 2px on circles
- **Stroke Color:** Full saturation version of risk color

### Status Badges
- Used for zone list items and quick status indicators
- Badge size: 12x12px to 24x24px depending on context

### Text Highlights
- Risk level text matches zone color when displayed in lists
- Headers use `#FF6B35` (MineShield brand orange) regardless of zone

## Hazard Marker Colors

In addition to zone colors, individual hazard markers use:

| Hazard Type | Color | Hex |
|-------------|-------|-----|
| Unresolved/Pending | Red | `#FF4444` |
| In Progress | Orange | `#FFA500` |
| Resolved/Closed
