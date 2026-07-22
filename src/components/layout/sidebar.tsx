"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronLeft,
  FileText,
  Home,
  Package,
  Plus,
  Settings,
  ShoppingCart,
  Store,
  type LucideIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { NavActiveBar, navItemVariants } from "@/components/layout/nav-item-indicator";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useSidebarStore } from "@/stores/sidebar-store";

// ─── Types ─────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

// ─── Navigation Data ──────────────────────────────────────────

const coreNav: (NavItem | NavGroup)[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Expenses", href: "/dashboard/expenses", icon: Package },
  { label: "Quotations", href: "/dashboard/quotations", icon: FileText },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Inventory", href: "/dashboard/inventory", icon: Boxes },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
];

const systemNav: (NavItem | NavGroup)[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ─── Helpers ──────────────────────────────────────────────────

function isGroup(item: NavItem | NavGroup): item is NavGroup {
  return "items" in item;
}

function useIsActive(href: string): boolean {
  const pathname = usePathname();
  if (pathname === href) return true;
  // Only match sub-routes (e.g. /dashboard/orders/123 → Orders active)
  // but avoid false positives where /dashboard matches every /dashboard/* route
  const segments = href.split("/").filter(Boolean);
  if (segments.length > 1 && pathname.startsWith(href + "/")) return true;
  return false;
}

// ─── Navigation Data helpers ──────────────────────────────

const systemGroups = systemNav.filter(isGroup) as NavGroup[];
const systemLinks = systemNav.filter((item): item is NavItem => !isGroup(item));

// ═══════════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── SidebarBrand ────────────────────────────────────────────

function SidebarBrand({ collapsed, mobile }: { collapsed: boolean; mobile?: boolean }) {
  const [businessName, setBusinessName] = useState("BizRavana");
  const [businessTagline, setBusinessTagline] = useState("Business OS");
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("user_id", session.user.id)
          .single();

        if (!profile?.business_id) return;

        const { data: business } = await supabase
          .from("businesses")
          .select("name, logo_url")
          .eq("id", profile.business_id)
          .single();

        if (business) {
          setBusinessName(business.name || "BizRavana");
          setBusinessLogo(business.logo_url);
        }

        const { data: settings } = await supabase
          .from("business_settings")
          .select("value")
          .eq("business_id", profile.business_id)
          .eq("key", "tagline")
          .single();

        if (settings?.value) {
          setBusinessTagline(String(settings.value));
        }
      } catch {
        // Fall back to defaults on error
      }
    };

    fetchBranding();
  }, []);

  const logoSize = collapsed ? 48 : 150;

  const logoEl = (
    <div
      style={{ width: logoSize, height: logoSize }}
      className="flex shrink-0 items-center justify-center"
    >
      {businessLogo ? (
        <img
          src={businessLogo}
          alt={businessName}
          style={{ width: logoSize, height: logoSize }}
          className="object-contain"
        />
      ) : (
        <Store className={cn("shrink-0 text-sidebar-primary", collapsed ? "size-8" : "size-14")} />
      )}
    </div>
  );

  // ─── Mobile: compact branding ─────────────────────────────
  if (mobile) {
    return (
      <div className="flex flex-col items-center px-4 pt-2 pb-2">
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-1.5"
          aria-label={`${businessName} — Back to Dashboard`}
        >
          {/* Logo (smaller) */}
          <div
            style={{ width: 110, height: 110 }}
            className="flex shrink-0 items-center justify-center"
          >
            {businessLogo ? (
              <img
                src={businessLogo}
                alt={businessName}
                style={{ width: 110, height: 110 }}
                className="object-contain"
              />
            ) : (
              <Store className="shrink-0 text-sidebar-primary size-10" />
            )}
          </div>

          {/* Business Name (larger, visual focus) + Tagline */}
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-lg font-bold tracking-tight text-sidebar-foreground">
              {businessName}
            </p>
            {businessTagline && (
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-sidebar-foreground/40">
                {businessTagline}
              </p>
            )}
          </div>
        </Link>

        {/* Powered by (compact) */}
        <p className="mt-1.5 text-xs tracking-wide text-sidebar-primary/70">
          Powered by{" "}
          <span className="font-semibold text-sidebar-primary">BizRavana</span>
        </p>
      </div>
    );
  }

  // ─── Desktop / collapsed ──────────────────────────────────
  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-5">
      <Link
        href="/dashboard"
        className="flex flex-col items-center gap-2.5"
        aria-label={`${businessName} — Back to Dashboard`}
      >
        {/* Logo */}
        {logoEl}

        {/* Business Name + Tagline (hidden when collapsed) */}
        {!collapsed && (
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-base font-bold tracking-tight text-sidebar-foreground">
              {businessName}
            </p>
            {businessTagline && (
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-sidebar-foreground/40">
                {businessTagline}
              </p>
            )}
          </div>
        )}
      </Link>

      {/* Powered by (hidden when collapsed) */}
      {!collapsed && (
        <p className="mt-2.5 text-sm tracking-wide text-sidebar-primary/70">
          Powered by{" "}
          <span className="font-semibold text-sidebar-primary">BizRavana</span>
        </p>
      )}
    </div>
  );
}

// ─── SidebarDivider ──────────────────────────────────────────

function SidebarDivider() {
  return <div className="sidebar-divider mx-3" />;
}

// ─── SidebarNavItem ──────────────────────────────────────────

function SidebarNavItem({
  item,
  collapsed,
  onItemClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onItemClick?: () => void;
}) {
  const isActive = useIsActive(item.href);

  const linkContent = (
    <>
      {!collapsed && <NavActiveBar active={isActive} />}
      <span
        className={cn(
          "flex shrink-0 items-center justify-center transition-all duration-150",
          collapsed && isActive
            ? "size-9 rounded-xl bg-sidebar-accent text-sidebar-primary shadow-xs"
            : collapsed
              ? "size-9 rounded-xl text-sidebar-foreground/50"
              : "",
        )}
      >
        <item.icon
          className={cn(
            "size-[18px] shrink-0 transition-colors duration-150",
            !collapsed && (isActive
              ? "text-sidebar-primary"
              : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"),
          )}
        />
      </span>
      {!collapsed && (
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      )}
    </>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "group relative flex min-h-[46px] w-full items-center justify-center gap-3 px-2 py-2.5 text-sm font-medium transition-all duration-150",
                isActive ? "rounded-r-xl" : "rounded-xl",
                navItemVariants({ active: isActive }),
              )}
              aria-current={isActive ? "page" : undefined}
            />
          }
        >
          {linkContent}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="text-sm font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onItemClick}
      className={cn(
        "group relative flex min-h-[46px] w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150",
        isActive ? "rounded-r-xl" : "rounded-xl",
        navItemVariants({ active: isActive }),
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {linkContent}
    </Link>
  );
}

// ─── SidebarNavGroup (dropdown) ─────────────────────────────

function SidebarNavGroup({
  group,
  collapsed,
  onItemClick,
}: {
  group: NavGroup;
  collapsed: boolean;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = group.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  const [open, setOpen] = useState(isActive);

  const buttonContent = (
    <>
      {!collapsed && <NavActiveBar active={isActive} />}
      <span
        className={cn(
          "flex shrink-0 items-center justify-center transition-all duration-150",
          collapsed && isActive
            ? "size-9 rounded-xl bg-sidebar-accent text-sidebar-primary shadow-xs"
            : collapsed
              ? "size-9 rounded-xl text-sidebar-foreground/50"
              : "",
        )}
      >
        <group.icon
          className={cn(
            "size-[18px] shrink-0 transition-colors duration-150",
            !collapsed && (isActive
              ? "text-sidebar-primary"
              : "text-sidebar-foreground/50"),
          )}
        />
      </span>
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-left">{group.label}</span>
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 text-sidebar-foreground/40 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </>
      )}
    </>
  );

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        <Tooltip>
          <TooltipTrigger
            render={
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "group relative flex min-h-[46px] w-full items-center justify-center gap-3 px-2 py-2.5 transition-all duration-150",
                isActive ? "rounded-r-xl" : "rounded-xl",
                navItemVariants({ active: isActive }),
                (open && !isActive) && "bg-sidebar-accent/40",
              )}
              aria-label={group.label}
              aria-expanded={open}
            />
            }
          >
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="text-sm font-medium">
            {group.label}
          </TooltipContent>
        </Tooltip>

        {open && (
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                collapsed={collapsed}
                onItemClick={onItemClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group relative flex min-h-[46px] w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150",
          isActive ? "rounded-r-xl" : "rounded-xl",
          navItemVariants({ active: isActive }),
          (open && !isActive) && "bg-sidebar-accent/40 text-sidebar-accent-foreground",
        )}
        aria-expanded={open}
      >
        {buttonContent}
      </button>

      {open && (
        <div className="ml-7 space-y-0.5 border-l border-sidebar-border pl-2">
          {group.items.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SidebarNavigation ───────────────────────────────────────

function SidebarNavigation({
  collapsed,
  onItemClick,
}: {
  collapsed: boolean;
  onItemClick?: () => void;
}) {
  return (
    <ScrollArea className="flex-1 px-3 py-4">
      <nav className="space-y-0.5" aria-label="Primary navigation">
        {coreNav.map((item) =>
          isGroup(item) ? (
            <SidebarNavGroup
              key={item.label}
              group={item}
              collapsed={collapsed}
              onItemClick={onItemClick}
            />
          ) : (
            <SidebarNavItem
              key={item.href}
              item={item}
              collapsed={collapsed}
              onItemClick={onItemClick}
            />
          ),
        )}
      </nav>
    </ScrollArea>
  );
}

// ─── SidebarQuickActions ────────────────────────────────────

function SidebarQuickActions({
  collapsed,
  onItemClick,
  mobile,
}: {
  collapsed: boolean;
  onItemClick?: () => void;
  mobile?: boolean;
}) {
  // Duplicate quick actions already in bottom nav — skip on mobile drawer
  if (mobile) return null;
  const actions = [
    {
      label: "+ New Order",
      href: "/dashboard/orders?action=new",
      collapsedClass: "bg-primary text-primary-foreground shadow-xs shadow-primary/20",
    },
    {
      label: "+ Expense",
      href: "/dashboard/expenses?action=new",
      collapsedClass: "border border-sidebar-border bg-sidebar text-sidebar-foreground",
    },
  ];

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 px-2 pb-3">
        {actions.map((action) => (
          <Tooltip key={action.href}>
            <TooltipTrigger
              render={
                <Link
                  href={action.href}
                  onClick={onItemClick}
                  className={cn(
                    "group relative flex size-9 items-center justify-center rounded-xl transition-all duration-200 active:scale-[0.97]",
                    action.collapsedClass,
                  )}
                  aria-label={action.label}
                />
              }
            >
              <Plus className="size-4 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12} className="text-sm font-medium">
              {action.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <div className="px-3 pb-3">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/orders?action=new"
          onClick={onItemClick}
          className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all duration-200 active:scale-[0.97] hover:shadow-md hover:shadow-primary/25 hover:-translate-y-0.5"
        >
          + New Order
        </Link>
        <Link
          href="/dashboard/expenses?action=new"
          onClick={onItemClick}
          className="flex w-full items-center justify-center rounded-xl border border-sidebar-border bg-sidebar px-4 py-2.5 text-sm font-semibold text-sidebar-foreground shadow-sm transition-all duration-200 active:scale-[0.97] hover:bg-sidebar-accent hover:text-sidebar-foreground hover:shadow-md"
        >
          + Expense
        </Link>
      </div>
    </div>
  );
}

// ─── SidebarSystemSection ────────────────────────────────────

function SidebarSystemSection({
  collapsed,
  onItemClick,
}: {
  collapsed: boolean;
  onItemClick?: () => void;
}) {
  return (
    <div className="border-t border-sidebar-border pt-3 pb-4">
      <div className="space-y-0.5 px-3">
        {systemLinks.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            collapsed={collapsed}
            onItemClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SidebarCollapseButton ──────────────────────────────────

function SidebarCollapseButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const label = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onToggle}
            title={label}
            aria-label={label}
            className={cn(
              "absolute top-6 -right-3 z-40 flex size-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/70 shadow-xs transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:shadow-md hover:border-sidebar-primary/30 hover:scale-110 active:scale-95",
              collapsed && "rotate-180",
            )}
          />
        }
      >
        <ChevronLeft className="size-3.5 shrink-0" />
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={16} className="text-sm font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function Sidebar({
  onItemClick,
  mobile = false,
}: {
  onItemClick?: () => void;
  mobile?: boolean;
}) {
  const { collapsed, toggleCollapsed } = useSidebarStore();
  const effectiveCollapsed = mobile ? false : collapsed;

  return (
    <TooltipProvider delay={250}>
      <aside
        className={cn(
          "sidebar-base relative flex flex-col text-sidebar-foreground",
          mobile
            ? "h-full w-full"
            : [
                "hidden lg:sticky lg:top-0 lg:z-40 lg:h-screen lg:flex",
                "transition-all duration-200 ease-in-out",
                effectiveCollapsed ? "w-[76px]" : "w-[268px]",
              ],
        )}
        aria-label="Main navigation"
      >
        {/* Inner wrapper with overflow hidden to keep scroll areas contained */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* ═══ Mobile layout: fixed brand + scrollable nav + sticky settings ═══ */}
          {mobile ? (
            <>
              <SidebarBrand collapsed={false} mobile />
              <SidebarDivider />
              <div className="flex-1 overflow-y-auto min-h-0">
                <SidebarNavigation collapsed={false} onItemClick={onItemClick} />
              </div>
              <SidebarSystemSection collapsed={false} onItemClick={onItemClick} />
            </>
          ) : (
            <>
              {/* ═══ Desktop / collapsed Brand Header ═════════════════ */}
              <SidebarBrand collapsed={effectiveCollapsed} />
              <SidebarDivider />

              {/* ═══ Navigation (flex:1 scrollable) ═════════════════ */}
              <SidebarNavigation
                collapsed={effectiveCollapsed}
                onItemClick={onItemClick}
              />

              {/* ═══ Quick Actions ══════════════════════════════════ */}
              <SidebarQuickActions collapsed={effectiveCollapsed} onItemClick={onItemClick} />

              {/* ═══ System Section ═════════════════════════════════ */}
              <SidebarSystemSection
                collapsed={effectiveCollapsed}
                onItemClick={onItemClick}
              />
            </>
          )}
        </div>

        {/* ═══ Collapse Toggle (desktop only) ═════════════════ */}
        {!mobile && (
          <SidebarCollapseButton
            collapsed={effectiveCollapsed}
            onToggle={toggleCollapsed}
          />
        )}
      </aside>
    </TooltipProvider>
  );
}
