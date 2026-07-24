# Team/Role Management — Implementation Plan

## Overview
Add multi-user team support with role-based access control to BizRavana. The database already has `profiles.role` (owner/admin/member) and `subscription_plans.team_members` — unused scaffolding. This plan builds on that.

## Phases

### Phase 1: Foundation (Database + RLS)
- Migration 027: `team_invitations` table, `get_user_business_role()` RPC, layered RLS policies
- Client-side RLS initially; server-layer restrictions only for sensitive operations
- TypeScript database type updates

### Phase 2: Invite Flow (Backend + UI)
- `/api/invite-team-member` route (validates role + plan limit + creates invitation)
- `/accept-invite?token=...` page (validates token, links profile to business)
- Registration flow integration (invite token creates linked profile, not new business)

### Phase 3: Team Management UI
- `/dashboard/team` page with members list, invite dialog, role management, removal
- Sidebar nav addition ("Team" with Users icon)
- Settings page integration (usage meter + link)

### Phase 4: Role-Based UI Guards
- `useBusinessRole()` hook
- `RoleGate` component for conditional rendering
- Member restrictions on delete/settings/subscription operations
- Integration with existing ReadOnlyModeProvider

### Phase 5: Future (Activity Log, Task Assignment, Notifications)
- Business-level activity logging
- Task assignment with team member selector
- Role-based notification routing

## Plan stored on: 2026-07-23

# Team/Role Management — Plan Update

## Subscription Plan Limit Enforcement

The `subscription_plans.team_members` column defined in the admin panel is the source of truth for team size limits:

| Plan | team_members |
|------|-------------|
| Trial | 1 |
| Basic | 1 |
| Standard | 2 |
| Premium | 3 |
| Enterprise | 10 |

### Enforcement Points
1. **Invite API** (Phase 2): Fetches business plan → reads `team_members` → counts current non-owner profiles → rejects if at limit
2. **Team page UI** (Phase 3): Usage meter showing "X of Y members used"
3. **Invite button** (Phase 3): Disabled with upgrade tooltip when at limit
4. **Plan change** (Phase 5): Warning when downgrading to a plan with lower limit
5. **fetchUsage()** on subscription page: Replace hardcoded `team_members: 1` with real count

The `subscription_plans` data schema in `src/types/database.ts` already has the typed `team_members` column.
