# Southlake OS — v0.4 workspace foundation

This package is the next source iteration of the Southlake OS pilot.

## Included
- Existing React + Vite + Supabase app and working pilot workflows.
- Exact Southlake logo supplied by the owners, applied to login and app header.
- Responsive layout refinements.
- Existing job, assignment, note, photo and message features retained.

## Current scope / not yet employee-ready
The app still uses the original pilot data model for its existing screens. The expanded schema in
`supabase-complete-foundation.sql` is a design/migration artifact and must be reviewed and tested
against the actual Supabase schema before applying. Do not onboard staff until database policies,
Storage object policies, role-aware UI and multi-role tests are complete.

## Run locally
1. Copy `env.example` to `.env`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. `npm install`
4. `npm run dev`

Never put a Supabase service-role key in browser environment variables.
