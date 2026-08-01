// ─── Courier Provider Auto-Registration ──────────────────────────────
//
// All courier provider modules are imported here so they auto-register
// themselves via `registerProvider()`. This file must be imported once
// before any courier functionality is used.
//
// Adding a new courier:
//   1. Create src/lib/delivery/providers/<new-courier>.ts
//   2. Import it below
//   3. Done — the provider is available everywhere.
// ──────────────────────────────────────────────────────────────────────

import "./royal-express";

import "./koombiyo";

// Future providers will be imported here:
// import "./domestic-courier";

export {};
