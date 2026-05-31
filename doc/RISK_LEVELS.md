# Risk Levels Documentation

**Author:** Hafeni Hilokuah (Risk Zones Management)  
**FR Reference:** FR-005, FR-006, FR-013  
**Last Updated:** May 31, 2026

## Overview

MineShield implements a three-tier risk classification system for mine zones. This system enables supervisors to quickly identify hazardous areas and take appropriate action.

## Risk Level Definitions

### 1. Safe Zone (Green)
- **Color Code:** `#4CAF50`
- **Threat Index:** 0-34
- **Description:** Normal operational area with no immediate hazards
- **Actions Required:** Routine monitoring only
- **Worker Access:** Full access allowed

**Criteria for Safe Classification:**
- Methane levels < 0.5%
- Oxygen levels between 19.5% - 22%
- Temperature between 15°C - 30°C
- No unresolved hazards in zone
- Threat index < 35

### 2. Warning Zone (Yellow)
- **Color Code:** `#FFA500`
- **Threat Index:** 35-69
- **Description:** Area with elevated risk factors requiring caution
- **Actions Required:** Increased monitoring, caution advised
- **Worker Access:** Access with PPE and caution

**Criteria for Warning Classification:**
- Methane levels 0.5% - 1.0%
- Oxygen levels 18% - 19.5%
- Temperature 30°C - 35°C or 5°C - 15°C
- Active hazards present but controlled
- Threat index between 35-69

### 3. Danger Zone (Red)
- **Color Code:** `#FF4444`
- **Threat Index:** 70-100
- **Description:** High-risk area requiring immediate action
- **Actions Required:** Evacuation, immediate intervention
- **Worker Access:** Restricted/No access until resolved

**Criteria for Danger Classification:**
- Methane levels > 1.0%
- Oxygen levels < 18%
- Temperature > 35°C or < 5°C
- Critical unresolved hazards
- Threat index ≥ 70

## Risk Calculation Formula

The threat index is calculated using weighted sensor data:
