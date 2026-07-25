"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextType {
  openValue: string | null;
  setOpenValue: (value: string | null) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion components must be used within Accordion");
  return ctx;
}

// Sub-context for each AccordionItem to share its value with children
const ItemContext = createContext<string | null>(null);

interface AccordionProps {
  children: ReactNode;
  type?: "single";
  collapsible?: boolean;
  className?: string;
}

export function Accordion({
  children,
  className,
}: AccordionProps) {
  const [openValue, setOpenValue] = useState<string | null>(null);

  return (
    <AccordionContext.Provider value={{ openValue, setOpenValue }}>
      <div data-slot="accordion" className={cn("divide-y divide-border", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export function AccordionItem({ children, value, className }: AccordionItemProps) {
  return (
    <ItemContext.Provider value={value}>
      <div data-slot="accordion-item" className={cn("py-4", className)}>
        {children}
      </div>
    </ItemContext.Provider>
  );
}

interface AccordionTriggerProps {
  children: ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const { openValue, setOpenValue } = useAccordion();
  const itemValue = useContext(ItemContext);
  const isOpen = openValue === itemValue;

  return (
    <button
      type="button"
      data-slot="accordion-trigger"
      onClick={() => setOpenValue(isOpen ? null : itemValue)}
      className={cn(
        "flex w-full items-center justify-between py-2 text-sm font-medium transition-all hover:text-foreground/80",
        className
      )}
    >
      {children}
      <ChevronDownIcon
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

interface AccordionContentProps {
  children: ReactNode;
  className?: string;
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const { openValue } = useAccordion();
  const itemValue = useContext(ItemContext);
  const isOpen = openValue === itemValue;

  if (!isOpen) return null;

  return (
    <div
      data-slot="accordion-content"
      className={cn("overflow-hidden pb-4 pt-0 text-sm transition-all", className)}
    >
      {children}
    </div>
  );
}
