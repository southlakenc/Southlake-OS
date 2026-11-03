# Southlake OS — build sequence

1. Shared job workspace: one job record, department scopes, stage, priority, dates and work-order reference.
2. Change orders: numbered requests, source evidence, amount, submit/approve/reject lifecycle.
3. Documents: private storage + searchable register for work orders, screenshots, plans, approvals and closeout.
4. Coordination: cross-team dependency flags, affected departments, owner and resolution.
5. Crew management: account-backed assignments, reassign/unassign, schedule and immutable assignment history.
6. Role security: owner, manager, team lead, employee; database RLS plus Storage policies.
7. Test matrix: two owners on phone/desktop; then test each role using test accounts before any staff onboarding.

The existing pilot UI remains connected to the current schema in this package. The next coding pass will wire the new workspace screens to the reviewed migration.
