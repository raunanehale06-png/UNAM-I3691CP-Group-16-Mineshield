# UI Components Documentation – Multi‑Theme Support

**Author:** Tegameno Iyambo (UI/UX Lead)  
**FR Reference:** All FRs (UI/UX supports every functional requirement)

## Overview

All MineShield components now support **four themes** (Light, Dark, Warm, Night). Components retrieve their colours from `ThemeContext`, which provides the current theme’s palette. Semantic variants (`danger`, `warning`, `safe`) remain unchanged across themes.

---

## 1. ThemeContext Usage

### Import and use the hook
```jsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const theme = useTheme();
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.textPrimary }}>Hello</Text>
    </View>
  );
};
