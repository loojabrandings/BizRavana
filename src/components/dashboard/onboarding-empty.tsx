"use client";

import { Check } from "lucide-react";
import Link from "next/link";

interface OnboardingStep {
  label: string;
  href: string;
  completed: boolean;
}

interface OnboardingEmptyStateProps {
  businessName: string;
  steps: OnboardingStep[];
}

export function OnboardingEmptyState({ businessName, steps }: OnboardingEmptyStateProps) {
  const completedCount = steps.filter((s) => s.completed).length;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Illustration */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/20">
        <svg
          className="h-10 w-10 text-primary"
          viewBox="0 0 40 40"
          fill="none"
        >
          <rect x="8" y="12" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M14 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" stroke="currentColor" strokeWidth="2" />
          <path d="M16 20h8M16 26h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-foreground">
        Welcome to BizRavana, {businessName}!
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        You&apos;re all set up. Let&apos;s add your first data to get started.
      </p>

      {/* Progress */}
      <div className="mt-6 w-full max-w-sm rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-card-foreground">Getting Started</span>
          <span className="text-sm text-muted-foreground">
            {completedCount} / {steps.length} done
          </span>
        </div>
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <Link
              key={step.href}
              href={step.completed ? "#" : step.href}
              className={`flex items-center gap-2.5 rounded-lg p-2 text-sm transition-colors ${
                step.completed
                  ? "text-muted-foreground"
                  : "hover:bg-muted text-card-foreground"
              }`}
              onClick={(e) => step.completed && e.preventDefault()}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  step.completed
                    ? "bg-success text-success-foreground"
                    : "border-2 border-muted-foreground/30"
                }`}
              >
                {step.completed ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                )}
              </div>
              <span className={step.completed ? "line-through" : ""}>
                {step.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href={steps.find((s) => !s.completed)?.href || "/dashboard/orders/new"}
        className="mt-6 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 active:translate-y-px"
      >
        {completedCount === 0
          ? "Create your first product"
          : "Continue setup"}
      </Link>
    </div>
  );
}
