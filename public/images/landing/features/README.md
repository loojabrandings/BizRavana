# Features showcase images

Drop your screenshots into this folder. The landing page Features showcase
(`src/components/landing/velora/features-data.ts`) references the paths below.
Each image is preloaded on mount and crossfaded with Framer Motion.

## Expected files

| File            | Suggested size | Content                                                              |
| --------------- | -------------- | -------------------------------------------------------------------- |
| `overview.png`  | 1600×1200      | Unified dashboard: orders, customers, delivery, inventory, profit, reports |
| `orders.png`    | 1600×1200      | Orders table, status workflow, payments                              |
| `customers.png` | 1600×1200      | Customer profiles and order history                                  |
| `courier.png`   | 1600×1200      | Courier status, waybills and delivery cards                          |
| `expenses.png`  | 1600×1200      | Revenue, expense and net-profit analytics                            |
| `inventory.png` | 1600×1200      | Product stock and low-stock alerts                                   |
| `reports.png`   | 1600×1200      | Charts, trends and reports                                           |

Notes:

- PNG or WEBP both work; the component uses `next/image` with `object-cover`,
  so a 4:3 source looks best.
- Until a file exists, the component renders a graceful icon placeholder
  (a 404 triggers the fallback automatically — no dev server restart needed).
- The visual is cropped slightly at the right/bottom edge for depth, so keep
  important content away from the bottom-right corner.
