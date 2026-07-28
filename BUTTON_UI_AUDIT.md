# BizRavana Button UI Consistency Audit

> Audit date: 2026-07-26  
> Scope: `src/**/*.tsx`, shared UI primitives, public/auth pages, dashboard, payments, settings, and Super Admin  
> Audit type: Read-only review; no application UI or behavior was changed

## Executive summary

BizRavana has a capable shared `Button` primitive, but it is not the single source of truth for button presentation. The audit found 471 button elements/usages across the TypeScript React code:

| Implementation | Count |
|---|---:|
| Shared `<Button>` usages | 281 |
| Raw `<button>` usages | 190 |
| Files using shared `<Button>` | 65 |
| Files using raw `<button>` | 78 |
| Files containing potential button-like links | 23 |

The core inconsistency is structural: 40% of the audited button elements are raw buttons, and many shared Button usages override the primitive's height, radius, or typography.

The most important outcome is to make `src/components/ui/button.tsx` the canonical visual contract, while retaining raw buttons only for controls whose interaction pattern is not a conventional button, such as tab triggers, accordion headers, navigation rows, and complex selectable cards.

## Audit methodology

1. Inventoried every `.tsx` file under `src`.
2. Counted shared `<Button>`, raw `<button>`, and button-like link patterns.
3. Parsed shared Button tags to classify variants, sizes, and class overrides.
4. Inspected reusable controls and high-volume raw-button files.
5. Sampled computed styles from the deployed public landing, login, and registration pages.
6. Compared dimensions, radius, typography, borders, hover/focus/disabled patterns, icon treatment, and responsive hit areas.

The deployed visual sample was used only to validate visible patterns. Authenticated dashboard/admin findings are based on the current local source because a local development server was not available during the audit.

## Current shared Button contract

Source: `src/components/ui/button.tsx`

### Variants

- `default`
- `gradient`
- `outline`
- `secondary`
- `ghost`
- `destructive`
- `link`

### Sizes

| Size | Current dimension |
|---|---|
| `xs` | 28px height |
| `sm` | 32px height |
| `default` | 36px height |
| `lg` | 40px height |
| `icon-xs` | 28×28px |
| `icon-sm` | 32×32px |
| `icon` | 36×36px |
| `icon-lg` | 40×40px |

### Actual shared Button usage

| Variant | Count |
|---|---:|
| `ghost` | 98 |
| `outline` | 76 |
| `gradient` | 58 |
| default/unspecified | 41 |
| `destructive` | 8 |

| Size | Count |
|---|---:|
| default/unspecified | 125 |
| `sm` | 81 |
| `icon-xs` | 45 |
| `xs` | 14 |
| `lg` | 9 |
| `icon-sm` | 4 |
| `icon` | 3 |

Shared Button customizations also include:

- 34 explicit height overrides
- 9 explicit radius overrides
- 69 explicit typography-size overrides

These overrides reduce the value of having a shared primitive because identical size or variant names can render differently depending on the caller.

## Visual sample measurements

### Landing page

Observed button heights:

- 32px header CTA
- 35–36px icon controls
- 40px secondary/pricing CTAs
- 42px featured-plan CTA
- 48px hero CTA
- 56px closing CTA

Observed radii:

- 10px
- 14px
- full pill
- 0px for FAQ accordion triggers

The landing page can intentionally use a marketing-specific scale, but the current six-height range makes CTA hierarchy feel assembled section-by-section rather than system-driven.

### Login and registration

- Primary and secondary form actions: 48px height, 14px radius, 14px semibold text.
- Password visibility controls: computed 16×16px interactive area.

The 48px auth actions are internally consistent with each other. The password controls are substantially below a recommended touch target and visually/interaction-wise inconsistent with the form actions.

## Prioritized findings

### P0 — Password visibility controls have a 16×16px hit area

Affected areas:

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`

The icon is positioned directly as the button without a larger interactive box. The deployed computed size is 16×16px.

Impact:

- Difficult to use on touch screens.
- Fails the spirit of WCAG target-size guidance.
- Focus indication is easy to miss.
- Does not match other icon controls.

Recommendation:

- Use an icon-button size with at least a 36px desktop hit area and 44px mobile hit area.
- Keep the eye glyph at 16px while expanding the invisible/visible button box.
- Standardize the focus ring and disabled state.

### P1 — Raw buttons bypass the shared design system

190 raw buttons appear in 78 files. Some are valid complex controls, but many are normal actions, icon buttons, toolbar controls, or CTA buttons that duplicate shared Button behavior.

High-volume hotspots:

| Area | Raw buttons |
|---|---:|
| Dashboard settings page | 9 |
| Admin notifications | 8 |
| Admin activity log | 7 |
| WhatsApp template settings | 7 |
| Orders page | 7 |
| Subscription payment page | 7 |
| Global search popover | 6 |
| Admin layout | 5 |
| Products page | 5 |
| Pagination primitive | 5 |
| Waybill settings | 5 |

Impact:

- Different heights/radii for the same action priority.
- Missing or inconsistent focus-visible rings.
- Disabled and loading states differ.
- Icon hit areas vary.
- Future theme changes require many manual edits.

Recommendation:

- Classify each raw button as `action`, `icon action`, `navigation`, `toggle/tab`, `selectable card`, or `disclosure`.
- Migrate the first two categories to the shared Button primitive.
- Keep raw semantic buttons only where the interaction truly requires custom structure.

### P1 — The current size scale is too small for many touch interactions

The shared primitive defines four icon sizes between 28px and 40px. The code frequently uses `icon-xs`, raw `size-7`, raw `size-8`, or `p-1`.

Examples include:

- Admin notification row actions
- Payment receipt/more actions
- Orders table more-actions trigger
- Uploaded receipt removal
- Waybill settings remove/clear actions
- WhatsApp template toolbar actions
- Pagination

Impact:

- Desktop-dense controls leak into mobile layouts.
- Visual size and actual hit area are often identical.
- Closely packed destructive and neutral actions are easier to mis-tap.

Recommendation:

- Separate visual icon size from interactive hit area.
- Use at least 36×36px for desktop icon actions.
- Use at least 44×44px at touch breakpoints.
- Reserve 28×28px only for genuinely dense, desktop-only toolbars with sufficient spacing.

### P1 — Shared size names do not guarantee consistent rendering

34 shared Button instances override height, and 69 override text size.

The clearest hotspot is:

- `src/components/whatsapp/whatsapp-templates-settings.tsx`

It uses combinations such as `size="xs"` plus `h-7 text-xxs`, and `size="sm"` plus `h-8 text-xs rounded-md`. Desktop and mobile sections repeat similar controls with separate styling.

Other affected areas:

- Order and quotation previews
- Order and quotation form wizards
- Inventory forms/previews
- Product form
- Auth pages
- Waybill settings

Impact:

- A developer cannot infer visual output from `variant` and `size`.
- Global Button improvements will not reliably propagate.
- Duplicate desktop/mobile sections can drift independently.

Recommendation:

- Prohibit height, horizontal padding, radius, and font-size overrides on shared Button except through an approved named size.
- Add missing semantic sizes to the primitive instead of overriding callers.
- Document exceptions explicitly.

### P1 — Button hierarchy is not consistent across product surfaces

The product currently uses:

- `default` and `gradient` as competing primary actions.
- `outline` for both secondary actions and emphasized actions.
- `ghost` for neutral actions, positive approve actions, destructive actions, and toolbar controls.
- Raw colored buttons for success/warning/destructive states.

Example:

- Admin Payments uses ghost buttons with page-specific success/destructive color classes for Approve and Reject.
- Some confirm dialogs use destructive variant; others implement destructive appearance manually.
- Settings and notification toggles use custom raw buttons.

Impact:

- Color no longer reliably communicates action priority.
- Primary CTA appearance changes by module.
- Destructive actions can look like low-risk toolbar actions.

Recommendation:

Adopt a semantic hierarchy:

1. `primary` — one preferred action per region.
2. `secondary` — alternative non-destructive action.
3. `outline` — tertiary action on a card/surface.
4. `ghost` — low-emphasis utility action.
5. `destructive` — delete/revoke/reject.
6. `success` — approve/activate only when a distinct positive action is necessary.
7. `link` — inline navigation, not form submission.

Choose either `default` or `gradient` as the product primary style. Do not use both interchangeably.

### P1 — Focus, disabled, and loading behavior is not guaranteed on raw controls

The shared primitive supplies a common focus ring, disabled opacity, pointer blocking, transitions, icon sizing, and press feedback. Raw buttons frequently supply hover colors only.

Common missing states:

- `focus-visible` styling
- consistent `disabled` opacity/cursor
- loading spinner spacing and label behavior
- pressed/active feedback
- `aria-label` for icon-only controls

Impact:

- Keyboard navigation quality differs page by page.
- Loading and disabled controls can shift width.
- Icon-only controls may not have accessible names.

Recommendation:

- Treat these states as mandatory Button API behavior.
- Audit all icon-only buttons for `aria-label` or equivalent accessible text.
- Add a standard loading contract rather than manually swapping icons in each page.

### P2 — Radius language is fragmented

Observed button/control radii include:

- `rounded-md`
- `rounded-lg`
- `rounded-xl`
- 10px
- 14px
- full pill
- square/0px disclosure rows

Some variation is intentional, but there is no documented mapping between radius and control role.

Recommendation:

- Standard actions: 10px.
- Large auth/marketing actions: 12px or 14px as a documented surface variant.
- Icon actions: 8–10px.
- Pills: filters/chips only.
- Disclosure rows: inherit container geometry rather than appearing as standalone CTA buttons.

### P2 — Typography varies inside equivalent actions

Observed sizes include `text-xxs`, `text-xs`, `text-sm`, and `text-base`, with weights from regular to semibold.

Problem areas:

- WhatsApp template controls
- Delivery/waybill controls
- Admin table actions
- Landing CTA hierarchy
- Auth buttons versus dashboard buttons

Recommendation:

- `xs` dense utility: 12px medium.
- normal action: 14px medium.
- large CTA/auth: 14px or 15px semibold.
- Avoid `text-xxs` for clickable actions unless it is a desktop-only auxiliary control with a larger hit area.

### P2 — Button-like links use separate styling paths

At least 23 files contain links styled as buttons. `buttonVariants` is used in only a small subset.

Impact:

- Links and buttons with the same visual role can have different height, focus ring, press feedback, and icon spacing.
- Some navigation CTAs are 40px while adjacent button CTAs are 42px.

Recommendation:

- Provide a supported Button-as-link abstraction compatible with the project's Base UI implementation.
- If polymorphic composition is not supported, expose a shared `ButtonLink` component using the same variant generator.
- Keep semantic `<a>`/`Link` behavior for navigation.

### P2 — Admin has a parallel button system

`src/components/admin/page-header.tsx` renders raw buttons with its own variant names and sizing instead of the shared Button primitive. Admin tables, mobile cards, action sheets, tabs, and search controls add more local patterns.

Impact:

- Admin and user dashboard actions feel related but not identical.
- Fixes to the shared Button do not reach admin header actions.
- Mobile admin controls can have different hit-area behavior.

Recommendation:

- Map AdminPageHeader actions to shared semantic Button variants.
- Keep Admin-specific layout components, but remove Admin-specific visual button definitions where possible.

### P2 — Dense table controls need a dedicated standard

Orders, products, inventory, expenses, quotations, payments, and admin lists mix:

- icon buttons
- three-dot menus
- clickable record names
- inline status triggers
- bulk actions
- mobile action sheets

Recommendation:

Create an explicit table-action specification:

- One visible primary quick action at most.
- One standard 36×36px “More actions” trigger.
- Destructive actions inside the menu/action sheet.
- Clickable record names should look like links, not ghost buttons.
- Mobile uses the same icon and label vocabulary through the action sheet.

### P3 — Marketing and auth buttons are intentionally distinct but undocumented

Landing and auth pages can reasonably use larger, more expressive CTAs than the data-dense dashboard. The issue is not that they differ; the issue is that the difference is not represented by named variants.

Recommendation:

- Add documented `marketing` and `auth` surface rules, or named sizes such as `cta` and `form-lg`.
- Preserve the 48px auth actions as a coherent pattern.
- Reduce landing CTAs to two or three intentional size levels instead of six.

## Areas that are reasonably custom

The following should not automatically be converted to conventional Button components:

- Accordion/FAQ triggers
- Tab and segmented-control triggers
- Selectable cards/payment-method cards
- Navigation sidebar rows
- Table row links
- Switches/toggles
- Drag/drop upload areas
- Dropdown menu items

They should still share focus, disabled, target-size, and typography tokens where applicable.

## Recommended canonical button specification

### Sizes

| Name | Height | Text | Typical use |
|---|---:|---:|---|
| `compact` | 32px | 12px | Desktop-only dense toolbar |
| `sm` | 36px | 13px | Table and card actions |
| `md` | 40px | 14px | Standard dashboard/admin action |
| `lg` | 44px | 14px semibold | Dialog/footer primary action |
| `cta` | 48px | 14–15px semibold | Auth and marketing |

Icon glyphs can remain 14–18px. Icon button hit areas should follow the same height scale.

### Styling

- Standard radius: 10px.
- Large/auth radius: 12–14px.
- Horizontal padding determined only by size.
- Icon gap determined only by size.
- One canonical primary treatment.
- Semantic destructive and optional success variants.
- Standard focus-visible ring for every interactive surface.
- Disabled state must preserve readable contrast.
- Loading state must prevent double submission without collapsing button width.

### Responsive target rule

- Mobile/touch interactive target: minimum 44×44px.
- Desktop dense target: minimum 36×36px.
- A visually smaller icon may sit inside the larger hit box.

## Recommended remediation sequence

### Phase 1 — Foundation

1. Agree on semantic variants and canonical primary style.
2. Replace the current size scale with documented action sizes.
3. Add `ButtonLink` and a standardized loading API.
4. Document hit-area and icon-only accessibility rules.
5. Add development guidance forbidding arbitrary size/radius/font overrides.

### Phase 2 — Accessibility and highest-risk controls

1. Fix auth password visibility controls.
2. Fix all raw `size-7`, `size-8`, `p-1`, and `icon-xs` touch actions.
3. Add missing accessible names and focus-visible styling.
4. Standardize destructive confirmation actions.

### Phase 3 — Shared infrastructure

1. AdminPageHeader and admin action components.
2. DataTable, Pagination, FilterBar, and table more-actions triggers.
3. Dialog footers and form action bars.
4. Button-like links.

### Phase 4 — High-drift feature modules

1. WhatsApp template settings.
2. Delivery/waybill settings.
3. Subscription payment page.
4. Dashboard settings.
5. Admin notifications and activity log.
6. Orders/products/inventory/quotations page toolbars.

### Phase 5 — Marketing/auth polish

1. Consolidate landing CTAs into documented levels.
2. Preserve the coherent 48px auth action pattern.
3. Align secondary link-buttons and icon controls with the canonical focus/target rules.

## Suggested verification checklist

- Shared Button is used for all conventional actions.
- No shared Button caller overrides height, padding, radius, or font size.
- Every icon-only action has an accessible name.
- All mobile actions meet the 44×44px target.
- Primary action is visually unique within its region.
- Destructive actions always use the destructive semantic treatment.
- Button-like links use the same visual generator as buttons.
- Loading buttons cannot be submitted twice and do not shift width unexpectedly.
- Keyboard focus is visible on every interactive control.
- Light/dark themes preserve button contrast.
- Disabled states remain understandable.
- Desktop and mobile versions of the same action use the same label/icon vocabulary.

## Audit conclusion

The inconsistency is not caused by a weak base component; it is caused by multiple parallel button styling paths and frequent caller-level overrides. A successful cleanup should start with the Button API and semantic rules, then migrate high-risk accessibility controls and shared infrastructure before touching feature pages. Converting raw buttons blindly would be counterproductive; each control should first be classified by interaction role.
