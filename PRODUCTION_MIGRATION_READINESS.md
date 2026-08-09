# BizRavana Production Migration Readiness

Audit date: 2026-08-03  
Production project: `BizRavana` (`htcqkdajlhvkspsmwyfk`)  
Audit mode: read-only

## Backup gate

The Supabase production dashboard reports **No backups**. The organization is
on the Free plan, which does not include scheduled project backups. No migration
was applied because a recoverable database copy is a mandatory precondition.

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
and Storage write restrictions. After backup verification, deploy `040–051` in
order, verify every marker again, run production-safe authorization checks, and
record the deployment without creating disposable customer-facing data.
