"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  FileText,
  Home,
  Package,
  Plus,
  ReceiptText,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { navItemVariants } from "@/components/layout/nav-item-indicator";
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

interface NavSection {
  label: string;
  items: (NavItem | NavGroup)[];
}

// ─── Navigation Data ──────────────────────────────────────────

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: Home }],
  },
  {
    label: "Sales",
    items: [
      { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
      { label: "Customers", href: "/dashboard/customers", icon: Users },
      { label: "Quotations", href: "/dashboard/quotations", icon: FileText },
      { label: "Products", href: "/dashboard/products", icon: Package },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Courier", href: "/dashboard/courier", icon: Truck },
      { label: "Inventory", href: "/dashboard/inventory", icon: Boxes },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Expenses", href: "/dashboard/expenses", icon: ReceiptText },
      { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
      { label: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
    ],
  },
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

const systemLinks = systemNav.filter((item): item is NavItem => !isGroup(item));

// ═══════════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── SidebarBrand ────────────────────────────────────────────

function SidebarBrand({ collapsed, mobile }: { collapsed: boolean; mobile?: boolean }) {
  const [businessName, setBusinessName] = useState("BizRavana");
  const [businessTagline, setBusinessTagline] = useState("Manage Smarter. Grow Faster");
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

  const logoEl = (
    <div className="flex shrink-0 items-center justify-center">
      {businessLogo ? (
        <Image
          src={businessLogo}
          alt={businessName}
          width={48}
          height={48}
          unoptimized
          style={{ height: "auto" }}
          className={cn("h-auto object-contain", collapsed ? "w-8" : "w-9")}
        />
      ) : (
        <Image
          src="/darkmode-logo.png"
          alt={businessName}
          width={1678}
          height={2364}
          style={{ height: "auto" }}
          className={cn("h-auto object-contain", collapsed ? "w-8" : "w-9")}
        />
      )}
    </div>
  );

  // ─── Mobile: compact branding ─────────────────────────────
  if (mobile) {
    return (
      <div className="flex flex-col items-center px-4 py-2">
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-1 rounded-lg px-4 py-1 outline-none transition-all duration-200 hover:bg-sidebar-accent/55 active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-sidebar-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
          aria-label={`${businessName} — Back to Dashboard`}
        >
          {logoEl}

          {/* Business Name (larger, visual focus) + Tagline */}
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-sm font-bold tracking-tight text-sidebar-foreground">
              {businessName}
            </p>
            {businessTagline && (
              <p className="text-center text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/70">
                {businessTagline}
              </p>
            )}
          </div>
        </Link>

        {/* Powered by (compact) */}
        <p className="mt-0.5 text-[10px] text-sidebar-foreground/60">
          Powered by{" "}
          <span className="font-semibold text-sidebar-primary">BizRavana</span>
        </p>
      </div>
    );
  }

  // ─── Desktop / collapsed ──────────────────────────────────
  return (
    <div className="flex flex-col items-center px-3 pb-1 pt-2">
      <Link
        href="/dashboard"
        className="flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 outline-none transition-all duration-200 hover:bg-sidebar-accent/55 active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-sidebar-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        aria-label={`${businessName} — Back to Dashboard`}
      >
        {/* Logo */}
        {logoEl}

        {/* Business Name + Tagline (hidden when collapsed) */}
        {!collapsed && (
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-sm font-bold tracking-tight text-sidebar-foreground">
              {businessName}
            </p>
            {businessTagline && (
              <p className="text-center text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/70">
                {businessTagline}
              </p>
            )}
          </div>
        )}
      </Link>

      {/* Powered by (hidden when collapsed) */}
      {!collapsed && (
        <p className="mt-0.5 text-[10px] text-sidebar-foreground/60">
          Powered by{" "}
          <span className="font-semibold text-sidebar-primary">BizRavana</span>
        </p>
      )}
    </div>
  );
}

// ─── SidebarDivider ──────────────────────────────────────────

function SidebarDivider() {
  return <div className="sidebar-divider mx-3 my-1" />;
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
      <span
        className={cn(
          "flex shrink-0 items-center justify-center transition-all duration-150",
          collapsed && isActive
            ? "size-9 rounded-lg bg-sidebar-accent text-sidebar-primary shadow-xs"
            : collapsed
              ? "size-9 rounded-lg text-sidebar-foreground/70"
              : "",
        )}
      >
        <item.icon
          className={cn(
            "size-[17px] shrink-0 transition-colors duration-150",
            !collapsed && (isActive
              ? "text-sidebar-primary"
              : "text-sidebar-foreground/65 group-hover:text-sidebar-foreground"),
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
                "group relative flex h-[38px] min-h-[38px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium outline-none transition-all duration-150 active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-sidebar-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                navItemVariants({ active: isActive }),
              )}
              aria-current={isActive ? "page" : undefined}
            />
          }
        >
          {linkContent}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="text-xs font-medium">
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
        "group relative flex h-[38px] min-h-[38px] w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium outline-none transition-all duration-150 active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-sidebar-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
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
      <span
        className={cn(
          "flex shrink-0 items-center justify-center transition-all duration-150",
          collapsed && isActive
            ? "size-9 rounded-lg bg-sidebar-accent text-sidebar-primary shadow-xs"
            : collapsed
              ? "size-9 rounded-lg text-sidebar-foreground/70"
              : "",
        )}
      >
        <group.icon
          className={cn(
            "size-[17px] shrink-0 transition-colors duration-150",
            !collapsed && (isActive
              ? "text-sidebar-primary"
              : "text-sidebar-foreground/65 group-hover:text-sidebar-foreground"),
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
                "group relative flex h-[38px] min-h-[38px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-2 py-1.5 outline-none transition-all duration-150 active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-sidebar-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
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
          <TooltipContent side="right" sideOffset={12} className="text-xs font-medium">
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
          "group relative flex h-[38px] min-h-[38px] w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium outline-none transition-all duration-150 active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-sidebar-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
          navItemVariants({ active: isActive }),
          (open && !isActive) && "bg-sidebar-accent/40 text-sidebar-accent-foreground",
        )}
        aria-expanded={open}
      >
        {buttonContent}
      </button>

      {open && (
        <div className="ml-6 space-y-0.5 border-l border-sidebar-border pl-2">
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
    <ScrollArea
      className="min-h-0 flex-1 px-2.5 py-1.5 [scrollbar-width:thin] [scrollbar-color:var(--sidebar-border)_transparent]"
    >
      <nav className="space-y-2.5" aria-label="Primary navigation">
        {navSections.map((section, sectionIndex) => (
          <div key={section.label} className="space-y-0.5">
            {collapsed && sectionIndex > 0 ? (
              <div className="mx-2 my-1 h-px bg-sidebar-border/70" aria-hidden="true" />
            ) : !collapsed ? (
              <p className="sidebar-section-label mb-1 px-1.5 text-[10px]">{section.label}</p>
            ) : null}
            <div className="space-y-0.5">
              {section.items.map((item) =>
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
            </div>
          </div>
        ))}
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
      label: "New order",
      href: "/dashboard/orders?action=new",
      collapsedIcon: Plus,
      collapsedClass: "bg-primary text-primary-foreground shadow-xs shadow-primary/20",
    },
    {
      label: "New expense",
      href: "/dashboard/expenses?action=new",
      collapsedIcon: ReceiptText,
      collapsedClass: "border border-sidebar-border bg-sidebar text-sidebar-foreground",
    },
  ];

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 px-2 pb-2">
        {actions.map((action) => (
          <Tooltip key={action.href}>
            <TooltipTrigger
              render={
                <Link
                  href={action.href}
                  onClick={onItemClick}
                  className={cn(
                    "group relative flex size-8.5 cursor-pointer items-center justify-center rounded-lg outline-none transition-all duration-150 active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-sidebar-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                    action.collapsedClass,
                  )}
                  aria-label={action.label}
                />
              }
            >
              <action.collapsedIcon className="size-4 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12} className="text-xs font-medium">
              {action.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <div className="px-2.5 pb-2 pt-0.5">
      <p className="sidebar-section-label mb-1 px-1 text-[10px]">Quick actions</p>
      <div className="flex flex-col gap-1.5">
        <Link
          href="/dashboard/orders?action=new"
          onClick={onItemClick}
          className="flex h-[34px] min-h-[34px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white shadow-xs outline-none transition-all duration-150 hover:bg-primary/90 active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-sidebar-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        >
          <Plus className="size-3.5 shrink-0" aria-hidden="true" />
          <span>New order</span>
        </Link>
        <Link
          href="/dashboard/expenses?action=new"
          onClick={onItemClick}
          className="flex h-[34px] min-h-[34px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-sidebar-border bg-sidebar-accent/35 px-3 text-xs font-medium text-sidebar-foreground/80 shadow-xs outline-none transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-sidebar-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        >
          <Plus className="size-3.5 shrink-0 text-sidebar-foreground/70" aria-hidden="true" />
          <span>New expense</span>
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
    <div className="border-t border-sidebar-border pt-1.5 pb-2">
      <div className="space-y-0.5 px-2.5">
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
              "absolute top-3 z-20 flex size-10 cursor-pointer items-center justify-center rounded-[10px] border border-sidebar-border bg-sidebar text-sidebar-foreground/70 shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-sidebar-primary/30 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:shadow-md focus-visible:ring-3 focus-visible:ring-sidebar-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar active:scale-[0.97]",
              collapsed ? "-right-4 rotate-180" : "right-3",
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
                "hidden lg:sticky lg:top-0 lg:z-100 lg:h-screen lg:flex",
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
