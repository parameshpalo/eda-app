import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchSalesValue,
  fetchMarketShare,
  fetchVolumeContribution,
  fetchYearlySales,
  fetchSalesTrend,
  Filters,
} from "../api/fmcg";

// Components
import SalesBarChart from "../components/charts/SalesBarChart";
import MarketSharePie from "../components/charts/MarketSharePie";
import VolumeContributionChart from "../components/charts/VolumeContributionChart";
import YearlySalesChart from "../components/charts/YearlySalesChart";
import SalesTrendChart from "../components/charts/SalesTrendChart";
import FilterBar from "../components/FilterBar";
import Placeholder from "../components/Placeholder";

type DataTab = "Brand" | "PPG" | "Other";

/** Reusable Card Wrapper for Charts */
function ChartCard({
  title,
  isLoading,
  children,
}: {
  title: string;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-left">{title}</h2>
      {isLoading ? <p>Loading {title}...</p> : children}
    </div>
  );
}

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>({});
  const [dataTab, setDataTab] = useState<DataTab>("Brand");

  // ✅ Serialize filters for stable query keys
  const serializedFilters = JSON.stringify(filters);

  // ✅ Queries
  const { data: salesValue, isLoading: salesLoading } = useQuery({
    queryKey: ["sales-value", serializedFilters],
    queryFn: () => fetchSalesValue(filters),
  });

  const { data: volumeContribution, isLoading: volumeLoading } = useQuery({
    queryKey: ["volume-contribution", serializedFilters],
    queryFn: () => fetchVolumeContribution(filters),
  });

  const { data: yearlySales, isLoading: yearlyLoading } = useQuery({
    queryKey: ["yearly-sales", serializedFilters],
    queryFn: () => fetchYearlySales(filters),
  });

  const { data: salesTrend, isLoading: trendLoading } = useQuery({
    queryKey: ["sales-trend", serializedFilters],
    queryFn: () => fetchSalesTrend(filters),
  });

  // ✅ Market Share (ignore year)
  const { data: marketShare, isLoading: shareLoading } = useQuery({
    queryKey: ["market-share", filters.groupMode, serializedFilters],
    queryFn: () =>
      fetchMarketShare("sales", {
        ...filters,
        year: [],
        groupMode: filters.groupMode
      }),
  });

  // ✅ Only show charts for valid tabs
  const showCharts = dataTab === "Brand" || dataTab === "PPG";

  return (
    <div className="p-6 space-y-6">
      {/* Filters + Tab Bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        activeTab={dataTab}
        setActiveTab={setDataTab}
      />

      {showCharts ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Sales Value (EURO)" isLoading={salesLoading}>
              {salesValue && (
                <SalesBarChart data={salesValue} groupMode={filters.groupMode} />
              )}
            </ChartCard>

            <ChartCard title="Volume Contribution (KG)" isLoading={volumeLoading}>
              {volumeContribution && (
                <VolumeContributionChart
                  data={volumeContribution}
                  groupMode={filters.groupMode}
                />
              )}
            </ChartCard>

            <ChartCard title="Yearly Sales" isLoading={yearlyLoading}>
              {yearlySales && (
                <YearlySalesChart
                  data={yearlySales}
                  groupMode={filters.groupMode}
                />
              )}
            </ChartCard>

            <ChartCard title="Sales Trend" isLoading={trendLoading}>
              {salesTrend && (
                <SalesTrendChart
                  data={salesTrend}
                  groupMode={filters.groupMode}
                />
              )}
            </ChartCard>
          </div>

          <MarketSharePie
            data={marketShare || []}
            groupMode={filters.groupMode}
            isLoading={shareLoading}
          />
        </>
      ) : (<Placeholder/>)}
    </div>
  );
}
