import { cn } from "@/lib/utils";

interface BrowserMockupProps extends React.HTMLAttributes<HTMLDivElement> {
  url?: string;
  children: React.ReactNode;
}

export function BrowserMockup({
  url = "localhost",
  children,
  className,
  ...props
}: BrowserMockupProps) {
  return (
    <div
      data-slot="browser-mockup"
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-xl",
        className
      )}
      {...props}
    >
      {/* Browser top bar */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/50 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500/70" />
          <span className="size-2.5 rounded-full bg-amber-400/70" />
          <span className="size-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="mx-auto flex-1 max-w-[50%] rounded-md bg-background px-3 py-1 text-center text-xs text-muted-foreground truncate">
          {url}
        </div>
        <div className="w-12" />
      </div>
      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
