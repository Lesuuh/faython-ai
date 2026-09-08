# Export project source as a zip file

## Goal
Produce a downloadable zip archive containing all the code and dependencies used to build and run the Faython | Scholar website, then share a download link in chat.

## Plan

1. **Prepare the archive**
   - Create a zip of the entire `/dev-server` project directory.
   - Include `node_modules` so the project is runnable offline without installing dependencies.
   - Exclude `.git` to avoid a huge, unnecessary history bundle and any local `.env` files that may contain secrets.

2. **Save the zip to persistent storage**
   - Write the final archive to `/mnt/documents/faython-scholar-full-project.zip` so it is cloud-backed and user-visible.

3. **Deliver the download link**
   - Present the file in chat using a `<presentation-artifact>` tag so the user can download it directly.
   - Include the approximate file size and a note that the `.git` history and any `.env` files were excluded for security/size reasons.

## Notes
- The full archive including `node_modules` will be large (likely tens to hundreds of megabytes).
- If the resulting zip is too large to deliver efficiently, the fallback is a source-only archive plus the `package.json`/`bun.lock` instructions to re-install dependencies locally.
- No source code changes are required; this is a pure export task.
