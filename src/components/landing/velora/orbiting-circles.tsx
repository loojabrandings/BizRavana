import { cn } from "@/lib/utils";

interface OrbitingCirclesProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  duration?: number;
  radius?: number;
  reverse?: boolean;
  path?: boolean;
  iconSize?: number;
  speed?: number;
}

export function OrbitingCircles({
  className,
  children,
  duration = 20,
  radius = 160,
  reverse = false,
  path = true,
  iconSize = 32,
  speed = 1,
  ...props
}: OrbitingCirclesProps) {
  const items = Array.isArray(children) ? children : [children];
  const calculatedDuration = duration / speed;

  return (
    <>
      {path && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            className="rounded-full border border-dashed border-border"
            style={{ width: radius * 2, height: radius * 2 }}
          />
        </div>
      )}
      {items.map((child, i) => {
        const angle = (360 / items.length) * i;
        return (
          <div
            key={i}
            data-slot="orbiting-circle"
            style={
              {
                "--duration": calculatedDuration,
                "--radius": radius,
                "--angle": angle,
              } as React.CSSProperties
            }
            className={cn(
              "animate-orbit absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 transform-gpu items-center justify-center rounded-full",
              reverse && "[animation-direction:reverse]",
              className
            )}
            {...props}
          >
            <div
              className="flex items-center justify-center"
              style={{ width: iconSize, height: iconSize }}
            >
              {child}
            </div>
          </div>
        );
      })}
    </>
  );
}
