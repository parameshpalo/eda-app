import { useState, useMemo } from "react";
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
import StackedBarChart from "../components/charts/StackedBarChart";
import MarketSharePie from "../components/charts/MarketSharePie";
import YearlySalesChart from "../components/charts/YearlySalesChart";
import SalesTrendChart from "../components/charts/SalesTrendChart";
import FilterBar from "../components/FilterBar";
import Placeholder from "../components/Placeholder";

/** Reusable Card Wrapper for Charts */
const ChartCard = ({
  title,
  isLoading,
  children,
}: {
  title: string;
  isLoading: boolean;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <h2 className="text-lg font-semibold mb-2 text-left">{title}</h2>
    {isLoading ? <p className="text-gray-500">Loading {title}...</p> : children}
  </div>
);

type DataTab = "Brand" | "PPG" | "Other";

export default function Dashboard() {
  const [filters, setFilters] = useState<Filters>({});
  const [dataTab, setDataTab] = useState<DataTab>("Brand");

  // Separate metrics for each chart
  const [marketMetric, setMarketMetric] = useState<"sales" | "volume">("sales");
  const [yearlyMetric, setYearlyMetric] = useState<"sales" | "volume">("sales");
  const [trendMetric, setTrendMetric] = useState<"sales" | "volume">("sales");

  // Memoize filters to keep queryKeys stable
  const serializedFilters = useMemo(() => JSON.stringify(filters), [filters]);

  // Queries (each with unique queryKey)
  const { data: salesValue, isLoading: salesLoading } = useQuery({
    queryKey: ["sales-value", serializedFilters],
    queryFn: () => fetchSalesValue(filters),
  });

  const { data: volumeContribution, isLoading: volumeLoading } = useQuery({
    queryKey: ["volume-contribution", serializedFilters],
    queryFn: () => fetchVolumeContribution(filters),
  });

  const { data: yearlySales, isLoading: yearlyLoading } = useQuery({
    queryKey: ["yearly-sales", filters.groupMode, yearlyMetric, serializedFilters],
    queryFn: () =>
      fetchYearlySales({
        ...filters,
        groupMode: filters.groupMode,
        metric: yearlyMetric,
      }),
  });

  const { data: salesTrend, isLoading: trendLoading } = useQuery({
    queryKey: ["sales-trend", filters.groupMode, trendMetric, serializedFilters],
    queryFn: () =>
      fetchSalesTrend({
        ...filters,
        groupMode: filters.groupMode,
        metric: trendMetric,
      }),
  });

  const { data: marketShare, isLoading: shareLoading } = useQuery({
    queryKey: ["market-share", filters.groupMode, marketMetric, serializedFilters],
    queryFn: () =>
      fetchMarketShare(marketMetric, {
        ...filters,
        year: [],
        groupMode: filters.groupMode,
      }),
  });

  const showCharts = dataTab === "Brand" || dataTab === "PPG";

  return (
    <div className="p-6 space-y-6">
      {/* Filters + Tabs */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        activeTab={dataTab}
        setActiveTab={setDataTab}
      />

      {showCharts ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* --- Sales Value --- */}
            <ChartCard title="Sales Value (EURO)" isLoading={salesLoading}>
              {salesValue && (
                <StackedBarChart
                  data={salesValue}
                  type="sales"
                  groupMode={filters.groupMode}
                />
              )}
            </ChartCard>

            {/* --- Volume Contribution --- */}
            <ChartCard title="Volume Contribution (KG)" isLoading={volumeLoading}>
              {volumeContribution && (
                <StackedBarChart
                  data={volumeContribution}
                  type="volume"
                  groupMode={filters.groupMode}
                />
              )}
            </ChartCard>

            {/* --- Yearly Sales --- */}
            <ChartCard title="Year Wise Data" isLoading={yearlyLoading}>
              {yearlySales && (
                <YearlySalesChart
                  data={yearlySales}
                  groupMode={filters.groupMode}
                  metric={yearlyMetric}
                  setMetric={setYearlyMetric}
                />
              )}
            </ChartCard>

            {/* --- Sales Trend --- */}
            <ChartCard title="Monthly Trends" isLoading={trendLoading}>
              {salesTrend && (
                <SalesTrendChart
                  data={salesTrend}
                  groupMode={filters.groupMode}
                  metric={trendMetric}
                  setMetric={setTrendMetric}
                />
              )}
            </ChartCard>
          </div>

          {/* --- Market Share --- */}
          <MarketSharePie
            data={marketShare || []}
            groupMode={filters.groupMode}
            metric={marketMetric}
            setMetric={setMarketMetric}
            isLoading={shareLoading}
          />
        </>
      ) : (
        <Placeholder />
      )}
    </div>
  );
}
