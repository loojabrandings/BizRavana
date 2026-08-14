# BizRavana Production Migration Readiness

Audit date: 2026-08-03  
Production project: `BizRavana` (`htcqkdajlhvkspsmwyfk`)  
Audit mode: read-only

## Backup gate

The Supabase production dashboard reports **No backups**. The organization is
on the Free plan, which does not include scheduled project backups.

**2026-08-14:** A recoverable logical backup was created and verified at
`~/bizravana-backups/bizravana-prod-20260814-pre-migration.sql` (data only,
154 INSERTs across 34 tables, valid BEGIN/COMMIT structure). Scheduled
Supabase backups or a full `pg_dump`-style backup would still be stronger;
see the options below.

Safe options:

1. Upgrade the production project to a plan with scheduled backups and confirm
   that a current backup is visible and restorable.
2. Create and verify an encrypted logical backup with `pg_dump` using the
   production database password. The service-role API key is not a substitute
   for a complete schema/data backup.

The configured direct database endpoint is IPv6-only from this workstation.
The dashboard-confirmed IPv4 session pooler was reachable, but authentication
with the password currently embedded in `.env.local` failed. That database
password is therefore stale or incorrect. Resetting it will invalidate any
other direct database connections and requires explicit approval before the
local environment is updated.

An attempted pgAdmin client-utility installation stalled without installing a
package and its exact package-manager process was stopped. A portable official
PostgreSQL binary archive remains the preferred client-only option after the
password is repaired.

Storage objects require a separate inventory/copy and restore check; database
backups do not replace that Storage verification.

## Migration drift result

A read-only SQL audit checked unique schema/function/permission markers for
migrations `040–051`. No required marker set was present:

| Migration | Production state |
|-----------|------------------|
| 040 | Missing or drifted |
| 041 | Missing or drifted |
| 042 | Missing or drifted |
| 043 | Missing or drifted |
| 044 | Missing or drifted |
| 045 | Missing or drifted |
| 046 | Missing or drifted |
| 047 | Missing or drifted |
| 048 | Missing or drifted |
| 049 | Missing or drifted |
| 050 | Missing or drifted |
| 051 | Missing or drifted |

The production dashboard also reports **No migrations** because previous SQL
Editor deployments were not recorded in Supabase CLI migration history. The
deployment must therefore use an explicitly reviewed ordered transaction and
later reconcile the remote migration-history table.

## Deployment decision

Do not apply only `040–046`. The current application also depends on `047–051`
for Message Template deletion, distributed rate limiting, verified uploads,
and Storage write restrictions.

**EXECUTED 2026-08-14:** Migration `027` (missing `team_invitations` table,
discovered during deployment) plus `040–047` and `049–051` were applied to
production in order through the session pooler; `048` was already present.
Every marker was re-verified and functional smoke checks passed (see Milestone
29 in `RELEASE_FIXING_LOG.md`). `.env.local` still embeds the stale database
password; the current password was supplied directly for this deployment.
