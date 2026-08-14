# BizRavana Public Release Roadmap

Last updated: 2026-08-03

This is the consolidated release checklist. Completed work is struck through;
open work remains as a checkbox. Detailed evidence is recorded in
[`RELEASE_FIXING_LOG.md`](./RELEASE_FIXING_LOG.md).

## Phase 0 — Release baseline

- [x] ~~Audit findings and release-fixing scope documented~~
- [x] ~~Existing working-tree changes preserved~~
- [x] ~~Separate staging Supabase project created and verified~~
- [x] ~~Obtain a recoverable production database backup~~ (logical data backup 2026-08-14; scheduled/pg_dump-style backup still recommended)
- [ ] Verify the Storage backup and restore process
- [x] ~~Produce a production migration-drift report for `040–051`~~
- [ ] Reconcile SQL Editor deployment with CLI migration history for `001–051`

## Phase 1 — Critical security

- [x] ~~Secure Team Invitation routes and enforce tenant isolation~~
- [x] ~~Harden Invitation RPC permissions and identity binding~~
- [x] ~~Verify Owner, Business Manager, and Member role preservation~~
- [x] ~~Pass the 17-check Invitation identity/concurrency matrix~~
- [x] ~~Protect all Super Admin APIs with verified server authorization~~
- [x] ~~Pass five authenticated non-admin Admin API `403` checks~~
- [x] ~~Harden broadcast delivery and pass 13 concurrency checks~~
- [x] ~~Repair and execute the hourly automatic-notification worker~~
- [x] ~~Test Message Template Owner/Manager/Member CRUD in staging~~
- [x] ~~Verify Message Template cross-business isolation~~
- [x] ~~Verify unified and legacy order-template default behavior~~
- [x] ~~Pass the 13-check PayHere callback security/concurrency matrix in staging~~
- [x] ~~Add distributed rate limiting for login and the PayHere callback~~
- [x] ~~Complete upload MIME/signature and CSRF/Origin verification~~
- [x] ~~Apply approved migrations `040–051` to production~~ (2026-08-14, incl. prerequisite 027; see Milestone 29)

## Phase 2 — Quality gates

- [x] ~~Reach zero ESLint errors and warnings~~
- [x] ~~Pass TypeScript validation~~
- [x] ~~Pass the Next.js production build~~
- [x] ~~Complete public, auth-guard, Super Admin, and business-user smoke tests~~
- [x] ~~Add a permanent automated regression-test runner and minimum suite~~
- [x] ~~Add CI for install, lint, TypeScript, tests, build, and migration checks~~
- [ ] Configure CI failures to block merging

## Phase 3 — Public website and trust

- [x] ~~Correct the Sri Lankan landing-page badge~~
- [x] ~~Complete unauthenticated public-page smoke coverage~~
- [ ] Re-verify every CTA, pricing, contact, and footer link
- [ ] Verify evidence and consent for public marketing claims/testimonials
- [ ] Clearly mark or remove unavailable and coming-soon features
- [ ] Complete mobile navigation, keyboard, focus, and screen-reader testing
- [ ] Verify contrast and reduced-motion behavior

## Phase 4 — SEO, headers, and performance

- [x] ~~Complete authenticated performance release-blocker triage~~
- [ ] Finalize public-page metadata, canonical URLs, and social-share metadata
- [ ] Add or verify `robots.txt`, sitemap, and private-page `noindex`
- [ ] Add or verify structured data
- [ ] Enable and verify CSP, HSTS, and remaining security headers
- [ ] Record a mobile Lighthouse/Core Web Vitals baseline
- [ ] Complete dependency vulnerability and production bundle audits

## Phase 5 — Production readiness

- [ ] Verify production environment variables and HTTPS application URL
- [ ] Configure and verify PayHere live credentials and production mode
- [ ] Verify production migration state through `001–051`
- [ ] Add hosting-provider/WAF rate limits for volumetric login and callback abuse
- [ ] Disable or rotate exposed legacy staging keys after explicit approval
- [ ] Decide whether orphaned courier tables are retained, migrated, or removed
- [ ] Verify production cron jobs
- [ ] Configure error monitoring and uptime alerts
- [ ] Complete sensitive-data logging review
- [ ] Complete backup-restore and deployment/database rollback drills

## Phase 6 — Final QA

- [ ] Test visitor, Trial Owner, Paid Owner, Business Manager, Member, expired,
  suspended, and Super Admin roles
- [ ] Test registration, login, and password reset
- [ ] Test state-changing Orders, Products, Inventory, and Expenses workflows
- [ ] Test courier dispatch and tracking
- [ ] Test bank-transfer and PayHere-hosted Sandbox end-to-end workflows on a
  public HTTPS staging deployment
- [ ] Test subscription expiry and read-only behavior
- [ ] Test import, export, reset, and account deletion
- [ ] Test mobile/desktop and light/dark modes

## Phase 7 — Staged public launch

- [ ] Prepare internal production test accounts
- [ ] Run a closed beta with 5–10 trusted users
- [ ] Monitor errors and payment results for 24–48 hours
- [ ] Start a limited public release
- [ ] Proceed to full public release only after the Go/No-Go checklist passes

## Current next action

Obtain and verify a recoverable production database backup plus a separate
Storage inventory/copy. Production is on Supabase Free and currently reports
no backups; the read-only drift audit found every `040–051` marker missing or
drifted, so no production migration was applied.
