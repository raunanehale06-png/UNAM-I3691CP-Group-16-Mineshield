# UI Components Documentation

**Author:** Tegameno Iyambo (UI/UX Lead)  
**FR Reference:** All FRs (UI/UX supports every functional requirement)

## Overview
This document describes the core reusable UI components built for MineShield. All components follow the high‑visibility light theme defined in `DESIGN_SYSTEM.md` and consume theme values from `ThemeContext`.

## 1. Button Component
**Path:** `src/components/common/Button.js`

### Props
| Prop       | Type       | Default   | Description                                   |
|------------|------------|-----------|-----------------------------------------------|
| title      | string     | required  | Button text                                   |
| onPress    | function   | required  | Click handler                                 |
| variant    | string     | 'primary' | primary, secondary, danger, warning, outline  |
| loading    | boolean    | false     | Shows spinner                                 |
| disabled   | boolean    | false     | Disables interaction                          |
| style      | object     | {}        | Custom container style                        |
| textStyle  | object     | {}        | Custom text style                             |

### Example
```jsx
<Button title="Report Hazard" variant="primary" onPress={submit} />
<Button title="SOS" variant="danger" loading={sending} />
