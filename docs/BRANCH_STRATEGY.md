# Branch Strategy – MineShield

## Overview
This document defines the branching model used for MineShield development to ensure consistency and traceability across all 19 contributors.

## Branch Types
- **develop** – Main integration branch for all features.
- **feature/** – Used for individual member tasks.
- **release/** – Used for preparing final submissions.
- **hotfix/** – Used for urgent corrections after release.

## Naming Convention
Each member must create a branch using the format:
`feature/phase3-files-[yourname]`

Example:
`feature/phase3-files-rauna`

## Workflow
1. Checkout `develop` and pull latest changes.
2. Create your feature branch.
3. Add your assigned files.
4. Commit with message:  
   `feat: add complete folder structure files for Phase 3`
5. Push to remote.
6. Create a Pull Request (PR) to `develop`.
7. Assign reviewer: Simon Shitana or Rauna Nehale.

## Merge Policy
- All PRs must pass validation checks.
- No direct commits to `develop`.
- Merge only after review approval.
