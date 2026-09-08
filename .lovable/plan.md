# Export project source as a zip file

## Goal
Produce a downloadable zip archive containing all the code and dependencies used to build and run the Faython | Scholar website, with a README that documents exact install and run steps, then share a download link in chat.

## Plan

1. **Create an internal README for the archive**
   - Write a `README-INSIDE-ZIP.md` file into a temporary staging copy of the project.
   - Include:
     - Project name and short description.
     - Requirements: Node.js (v20+ recommended) or Bun.
     - Install step: `bun install` (or `npm install` / `pnpm install`).
     - Development run step: `bun run dev` (or `npm run dev` / `pnpm dev`).
     - Build step: `bun run build`.
     - Preview step: `bun run preview`.
     - Notes about environment variables (n8n webhook URLs, optional) and that `.env` files are intentionally excluded.

2. **Prepare the archive**
   - Create a zip of the project directory.
   - Include `node_modules` so the project is runnable offline without installing dependencies.
   - Exclude `.git` to avoid a huge, unnecessary history bundle and any local `.env` files that may contain secrets.

3. **Save the zip to persistent storage**
   - Write the final archive to `/mnt/documents/faython-scholar-full-project.zip` so it is cloud-backed and user-visible.

4. **Deliver the download link**
   - Present the file in chat using a `<presentation-artifact>` tag so the user can download it directly.
   - Include the approximate file size and a note that the `.git` history and any `.env` files were excluded for security/size reasons.

## Notes
- The full archive including `node_modules` will be large (likely tens to hundreds of megabytes).
- If the resulting zip is too large to deliver efficiently, the fallback is a source-only archive plus the `package.json`/`bun.lock` instructions to re-install dependencies locally, with the same README included.
- No source code changes are required; this is a pure export task.