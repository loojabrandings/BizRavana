# BizRavana Quality Gates

Last updated: 2026-08-03

## Repository gate

Run the complete local gate before a release change is merged:

```bash
npm run quality
```

It runs ESLint, TypeScript, the repository regression suite, and a production
Next.js build. `npm test` runs the fast secret-free suite by itself. That suite
checks migration numbering/documentation, the centralized same-origin guard,
server upload-signature boundaries, and the required CI steps.

## Staging security gate

The full integration suite is intentionally separate because it requires the
ignored `.env.staging.local` service credentials and writes disposable data to
the dedicated BizRavana Staging project.

```bash
npm run staging:start
npm run test:staging
```

The runner refuses a non-staging project, requires the staging server on port
3001, creates disposable test identities/businesses, executes all security and
concurrency matrices, and attempts fixture cleanup even when a test fails. If a
previous interrupted run left `.env.staging.test.local`, run
`node scripts/staging/cleanup-test-fixtures.mjs` before retrying.

## GitHub Actions

`.github/workflows/release-quality.yml` runs on every pull request and every
push to `main`. It uses locked dependencies and executes install, lint,
TypeScript, repository tests, and the production build. CI uses inert placeholder
configuration; no Supabase or PayHere secret is stored in the workflow.

The workflow becomes active only after it is committed and pushed. After its
first successful remote run, protect `main` and require the `quality` status
check before merging. Branch protection has not been changed from this local
workspace.
