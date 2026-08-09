"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-loaded DateRangePickerModal.
 *
 * The heavy calendar code is split into its own chunk and only downloaded the
 * first time the modal actually opens, so pages that embed a date filter keep
 * their initial bundle untouched.
 */
export const DateRangePickerModal = dynamic(
  () =>
    import("./date-range-picker-modal").then((mod) => mod.DateRangePickerModal),
  { ssr: false },
);
