# MineShield Code Style Guide

## Purpose

This guide defines the code style and implementation standards for the MineShield app.
It is written for a cross-platform React Native + Expo codebase backed by Firebase.

## Language And Framework Standards

- Use React Native functional components and hooks.
- Keep Expo APIs as the preferred platform integration layer for camera, location, sensors, and sharing.
- Use Firebase modular SDK patterns for Auth, Firestore, Storage, and any future backend services.
- Keep UI logic in screens and reusable UI elements in components.
- Keep data access, sync, and backend interaction in services.
- Prefer small, composable functions over large monolithic blocks.

## Naming Conventions

- Use `PascalCase` for components, screens, hooks, and navigation containers.
- Use `camelCase` for variables, functions, handlers, and utility methods.
- Use `UPPER_CASE` for constants and environment-style values.
- Use descriptive names that reflect the domain:
  - `hazardReport`
  - `workerLocation`
  - `syncOfflineQueue`
  - `SupervisorDashboardScreen`
- Name files to match the main export whenever practical.

## File And Folder Structure

Keep the app organized by responsibility:

- `src/components`
  - Reusable UI building blocks
  - Shared elements such as buttons, cards, modals, badges, and map markers
- `src/screens`
  - Full screens and feature views
  - Subfolders for role-based areas such as `auth`, `worker`, `supervisor`, and `visitor`
- `src/services`
  - Firebase access, persistence, sync, offline queue, and external integration logic
- `src/navigation`
  - Stack, tab, and role-based navigation flow
- `src/styles`
  - Shared theme tokens, colors, spacing, and style helpers
- `src/hooks`
  - Reusable hooks for sync, sensors, location, account state, and live data
- `src/utils`
  - Pure helper functions, formatting, and domain-safe transformers

## Formatting Rules

- Use 2-space indentation.
- Keep semicolons enabled.
- Prefer single quotes for strings.
- Keep trailing commas where supported by the formatter.
- Keep line length readable, ideally around 100 characters or less.
- Use blank lines to separate logical sections, not every small statement.
- Let Prettier handle formatting and use ESLint to catch logic and style issues.

## React Native Practices

- Use functional components with hooks instead of class components.
- Keep state local when it is only needed in one screen.
- Lift state only when multiple features need the same source of truth.
- Avoid unnecessary memoization unless there is a measured benefit.
- Prefer reusable presentation components over repeated layout code.
- Keep gesture, sensor, and navigation behavior isolated from display logic when possible.

## Firebase Practices

- Use the modular Firebase SDK style already used in the project.
- Keep Firestore document writes and reads inside service files.
- Keep collection names and field names stable and predictable.
- Treat Firestore writes as domain events, not just UI callbacks.
- Always consider offline behavior and permission rules when adding a new data path.

## Type Safety And Type Checking

- Prefer TypeScript for new modules when a file is being created from scratch.
- If a file remains JavaScript, use `@ts-check` and JSDoc to document object shapes and function contracts.
- Keep domain objects consistent across screens, services, and Firestore documents.
- Validate external data before it reaches UI code.
- Avoid passing loosely shaped objects deeper into the component tree.

## Commenting Guidelines

- Comment why a block exists, not what every line does.
- Keep comments short and relevant to the domain.
- Add comments for complex sync flows, Firestore fallbacks, and permission-sensitive logic.
- Avoid noisy comments that restate obvious code.
- Remove outdated comments when logic changes.

## Feature Implementation Best Practices

- Keep feature code split across UI, service, and data layers.
- Use reusable helpers for repeated Firestore mapping logic.
- Keep role-based behavior explicit and centralized.
- Keep offline queue logic isolated from online submission logic.
- Prefer stable keys and IDs over translated labels for any persisted data.
- Use a single source of truth for user roles, hazard status, and alert priority.

## Review Checklist

- Does the file belong in the right folder?
- Is the naming consistent with the rest of the project?
- Are Firestore writes and reads handled in services?
- Are role rules and route decisions explicit?
- Is the feature safe when offline?
- Are there any duplicated components or dead code paths?

