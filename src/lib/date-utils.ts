export function getMonthRange(offset: 0 | -1) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59);
  return { start, end };
}

export function getDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export const dateFilterOptions = [
  { value: "this_month", label: "This month" },
  { value: "today", label: "Today" },
  { value: "last_month", label: "Last month" },
  { value: "custom", label: "Custom" },
] as const;

export function getDateRange(filter: string, customFrom?: string, customTo?: string): { start: Date; end: Date } | null {
  if (filter === "today") {
    const s = new Date(); s.setHours(0, 0, 0, 0);
    const e = new Date(); e.setHours(23, 59, 59, 999);
    return { start: s, end: e };
  }
  if (filter === "this_month") {
    const n = new Date();
    return { start: new Date(n.getFullYear(), n.getMonth(), 1), end: new Date(n.getFullYear(), n.getMonth() + 1, 0, 23, 59, 59, 999) };
  }
  if (filter === "last_month") {
    const n = new Date();
    return { start: new Date(n.getFullYear(), n.getMonth() - 1, 1), end: new Date(n.getFullYear(), n.getMonth(), 0, 23, 59, 59, 999) };
  }
  if (filter === "custom" && customFrom && customTo) {
    return { start: new Date(customFrom + "T00:00:00"), end: new Date(customTo + "T23:59:59.999") };
  }
  return null;
}
