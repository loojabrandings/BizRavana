export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-44 animate-pulse rounded-[32px] bg-muted/80" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/80" />
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="h-44 animate-pulse rounded-3xl bg-muted/80" />
        <div className="h-44 animate-pulse rounded-3xl bg-muted/80" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="h-72 animate-pulse rounded-3xl bg-muted/80" />
        <div className="h-72 animate-pulse rounded-3xl bg-muted/80" />
      </div>
    </div>
  );
}
