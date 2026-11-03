# v0.7 logo reliability fix

Both the sign-in and authenticated header now import `src/assets/southlake-logo.png` directly into the Vite bundle. This avoids relying on `/public` being uploaded or deployed at the expected root.

Upload the contents of `Southlake-OS-main` to the repository root, preserving `src/assets/southlake-logo.png`. Do not upload the ZIP itself. The logo is not a database asset.

If the logo still fails, check Vercel Deployment > Build Logs and the browser network request for the image. Verify the deployment is sourced from the new repository and the intended branch.
