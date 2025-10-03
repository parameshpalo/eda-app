import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchSalesValue,
  fetchMarketShare,
  fetchVolumeContribution,
  fetchYearlySales,
  fetchSalesTrend,
} from "../api/fmcg";

import SalesBarChart from "../components/SalesBarChart";
import MarketSharePie from "../components/MarketSharePie";
import VolumeContributionChart from "../components/VolumeContributionChart";
import YearlySalesChart from "../components/YearlySalesChart";
import SalesTrendChart from "../components/SalesTrendChart";
import FilterBar from "../components/FilterBar";
import { Filters } from "../api/fmcg";

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>({});
  const [activeTab, setActiveTab] = useState("Brand");

  // Queries (unchanged)
  const { data: salesValue, isLoading: salesLoading } = useQuery({
    queryKey: ["sales-value", filters],
    queryFn: () => fetchSalesValue(filters),
  });

  const { data: marketShare, isLoading: shareLoading } = useQuery({
    queryKey: ["market-share", filters],
    queryFn: () => fetchMarketShare("sales", filters),
  });

  const { data: volumeContribution, isLoading: volumeLoading } = useQuery({
    queryKey: ["volume-contribution", filters],
    queryFn: () => fetchVolumeContribution(filters),
  });

  const { data: yearlySales, isLoading: yearlyLoading } = useQuery({
    queryKey: ["yearly-sales", filters],
    queryFn: () => fetchYearlySales(filters),
  });

  const { data: salesTrend, isLoading: trendLoading } = useQuery({
    queryKey: ["sales-trend", filters],
    queryFn: () => fetchSalesTrend(filters),
  });

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "Brand" ? (
        <>
          {/* 4 Charts */}
          <div className="grid grid-cols-2 gap-6">
            {/* Sales Value */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-2 text-left">Sales Value (EURO)</h2>
              {salesLoading ? (
                <p>Loading Sales Value...</p>
              ) : (
                salesValue && <SalesBarChart data={salesValue} />
              )}
            </div>

            {/* Volume Contribution */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-2 text-left">Volume Contribution (KG)</h2>
              {volumeLoading ? (
                <p>Loading Volume...</p>
              ) : (
                volumeContribution && <VolumeContributionChart data={volumeContribution} />
              )}
            </div>

            {/* Yearly Sales */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-2 text-left">Yearly Sales</h2>
              {yearlyLoading ? (
                <p>Loading Yearly Sales...</p>
              ) : (
                yearlySales && <YearlySalesChart data={yearlySales} />
              )}
            </div>

            {/* Sales Trend */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-2 text-left">Sales Trend</h2>
              {trendLoading ? (
                <p>Loading Trend...</p>
              ) : (
                salesTrend && <SalesTrendChart data={salesTrend} />
              )}
            </div>
          </div>

          {/* Market Share */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold mb-2">Market Share</h2>
            {shareLoading ? (
              <p>Loading Market Share...</p>
            ) : (
              marketShare && <MarketSharePie data={marketShare} />
            )}
          </div>
        </>
      ) : (
        // Placeholder image if not "Brand"
        <div className="flex justify-center items-center p-12 rounded-2xl ">
          <img
            src="/ifdata.png"
            alt="insufficient data"
            className="max-w-sm opacity-70"
          />
        </div>
      )}
    </div>
  );
}
