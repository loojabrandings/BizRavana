"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-media-query";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OrdersAnalyticsContent } from "@/components/reports/orders-analytics-content";
import { ExpensesAnalyticsContent } from "@/components/reports/expenses-analytics-content";
import { FinancialPerformanceContent } from "@/components/reports/financial-performance-content";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("orders");
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Reports"
        description={isMobile ? undefined : "Comprehensive analytics on orders, expenses, and financial performance."}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList variant="line" className="w-full justify-start flex-nowrap">
            <TabsTrigger value="orders" className="text-sm px-4 py-2 whitespace-nowrap">
              Orders Analytics
            </TabsTrigger>
            <TabsTrigger value="expenses" className="text-sm px-4 py-2 whitespace-nowrap">
              Expenses Analytics
            </TabsTrigger>
            <TabsTrigger value="financial" className="text-sm px-4 py-2 whitespace-nowrap">
              Financial Performance
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4 sm:mt-6">
          <TabsContent value="orders">
            <OrdersAnalyticsContent />
          </TabsContent>
          <TabsContent value="expenses">
            <ExpensesAnalyticsContent />
          </TabsContent>
          <TabsContent value="financial">
            <FinancialPerformanceContent />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
