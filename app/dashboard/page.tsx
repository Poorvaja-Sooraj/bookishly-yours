import React from "react";
import StatsCards from "@/components/dashboard/StatsCards";
import Statistics from "@/components/dashboard/Statistics";

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col space-y-4 md:space-y-6">
      {/* Statistics Cards */}
      <StatsCards />

      {/* Statistics Section Placeholder */}
      <Statistics />
    </div>
  );
}
