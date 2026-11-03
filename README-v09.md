# Southlake OS v0.9 — Drawing + Remove Assignments

New features:
- Finger/stylus/mouse sketch pad in **Job notes**, with pen color, line width, Clear and Save.
- Saved drawings are PNG files in the existing private `job-photos` bucket and appear in **Job photos**.
- **Remove** button next to each assignment, with confirmation and a refreshed assignment list.
- Optional `supabase-v09-assignment-audit.sql` creates a trigger to retain a removal record before deleting an assignment. Apply before testing removals if you want the audit trail.

Requirements:
- Supabase Storage `job-photos` bucket must allow the signed-in pilot owners to upload.
- `job_photos` table must allow owner inserts.
- `assignments` table must allow owner DELETE operations. If not, the UI reports the permission error; do not loosen RLS for all employees.
- Keep the existing two-owner pilot only; this is not employee-ready access control.

Deploy: upload **the contents of this ZIP** to the GitHub repository connected to `southlake-os-eta.vercel.app`, preserving `src/assets/southlake-logo.png` and the `src` directory. Leave the original Southlake OS Vercel project unchanged.
