# Southlake OS v0.8 — change orders + coordination (two-owner test only)

New screens: Change orders (draft → submitted → approved/rejected → completed) and Team coordination (flag → resolved), attached to the selected job.

## Deployment order
1. In your EXISTING Southlake-Pilot Supabase project, open SQL Editor, paste and run `supabase-v08-features.sql`. This only adds two new tables and pilot policies; it does not wipe existing data.
2. Extract this ZIP. Upload its contents (not the enclosing folder) to the ROOT of the NEW `Southlake-OS` GitHub repository. Preserve `src/` and `src/assets/` folders.
3. Check that Vercel deploys the new commit to the ETA test project. Keep the original Southlake site untouched.
4. Test: open a job, create a change order and coordination flag; refresh and verify both persist. Try on both owners' phones.

## Safety and scope
- The pilot policies permit all authenticated users to view and update these new tables. This is ONLY appropriate while the two owner accounts are the only users. Do not add employees yet.
- Change order approval buttons record a status; they do not constitute legal approval or capture signatures/authorization evidence.
- The app is not yet feature-complete; document storage, role-based access, alerts and assignment history remain future work.
- No database migration has been executed by this package, and no deployment has been made automatically.
