# Git Workflow – MineShield

## Purpose
To maintain a clean, traceable, and collaborative development process for the MineShield project.

## Steps
1. **Initialize Repository**
   - Clone the repo: `git clone [repo-url]`
   - Checkout `develop`: `git checkout develop`

2. **Create Feature Branch**
   - `git checkout -b feature/phase3-files-[yourname]`

3. **Add Files**
   - Place your assigned files in correct directories.
   - Use the provided code template for all `.js` files.

4. **Commit Changes**
   - `git add .`
   - `git commit -m "feat: add assigned files for Phase 3"`

5. **Push to Remote**
   - `git push origin feature/phase3-files-[yourname]`

6. **Create Pull Request**
   - Base: `develop`
   - Compare: `feature/phase3-files-[yourname]`
   - Assign reviewer: Simon Shitana or Rauna Nehale.

7. **Review & Merge**
   - Ensure all checks pass.
   - Merge after approval.

## Validation
Automated branch validation is handled by `scripts/validate-branches.js`.

## Notes
- Never commit directly to `develop`.
- Always pull latest changes before starting work.
- Maintain clear commit messages referencing FR numbers.

