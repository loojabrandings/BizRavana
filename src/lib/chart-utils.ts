import { getMonthRange, getDateKey } from "./date-utils";

export type RevenueWindow = "7d" | "this_month" | "last_month";

export function createRevenueFlow(
  orders: Array<{ created_at: string; total: number }>,
  expenses: Array<{ expense_date: string; amount: number }>,
  window: RevenueWindow,
) {
  const now = new Date();
  let start: Date;
  let days: number;

  if (window === "7d") {
    start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    days = 7;
  } else {
    const range = getMonthRange(window === "this_month" ? 0 : -1);
    start = range.start;
    days = range.end.getDate();
  }

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return {
      label,
      revenue: orders
        .filter((order) => getDateKey(order.created_at) === key)
        .reduce((sum, order) => sum + Number(order.total || 0), 0),
      expenses: expenses
        .filter((expense) => expense.expense_date === key)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    };
  });
}

export function summarizeBy<T>(
  rows: T[],
  getLabel: (row: T) => string,
  getValue: (row: T) => number,
) {
  const totals = new Map<string, number>();
  rows.forEach((row) => {
    const label = getLabel(row) || "Uncategorized";
    totals.set(label, (totals.get(label) || 0) + getValue(row));
  });

  return Array.from(totals.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}
