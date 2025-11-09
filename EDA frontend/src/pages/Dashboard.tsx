import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAggregate, fetchMarketShare, Filters as APIFilters } from "../api/fmcg";
import { getCurrentUser } from "../api/auth";
import { Filters } from "../assets/types";

// Components
import StackedBarChart from "../components/charts/StackedBarChart";
import MarketSharePie from "../components/charts/MarketSharePie";
import YearlySalesChart from "../components/charts/YearlySalesChart";
import SalesTrendChart from "../components/charts/SalesTrendChart";
import FilterBar from "../components/FilterBar";
import Placeholder from "../components/Placeholder";
import AggregateStats from "../components/AggregateStats";

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

type DataTab =
  | "Brand"
  | "PPG"
  | "Pack Type"
  | "Brand X Pack Type X PPG"
  | "Correlation and Trends";

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Try to get user from localStorage first
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.role) {
          setUserRole(user.role);
          // Still try to refresh user info in background if we have a token
          const token = localStorage.getItem("token");
          if (token) {
            // Fetch in background to update user info, but don't wait for it
            getCurrentUser()
              .then((user) => {
                if (user && user.role) {
                  setUserRole(user.role);
                  localStorage.setItem("user", JSON.stringify(user));
                }
              })
              .catch((error: unknown) => {
                // Silently handle 401 - token might be expired but we have cached user
                const axiosError = error as { response?: { status?: number } };
                if (axiosError?.response?.status !== 401) {
                  console.error("Failed to refresh user:", error);
                }
              });
          }
          return; // Exit early - we have user info
        }
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        localStorage.removeItem("user");
      }
    }
    
    // Only try to fetch from API if we have a token and no cached user
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    
    // Fetch user from API
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user && user.role) {
          setUserRole(user.role);
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch (error: unknown) {
        // If 401, token is invalid/expired
        const axiosError = error as { response?: { status?: number } };
        if (axiosError?.response?.status === 401) {
          // Only clear if we don't have cached user
          if (!userStr) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } else {
          console.error("Failed to fetch user:", error);
        }
      }
    };
    
    fetchUser();
  }, []);

  const [filters, setFilters] = useState<Filters>({});
  const [dataTab, setDataTab] = useState<DataTab>("Brand");

  // Memoize setFilters to prevent infinite loops
  const handleSetFilters = useCallback((f: Filters) => {
    setFilters(f);
  }, []);

  // Convert Filters from types.ts to APIFilters from fmcg.ts
  const convertFilters = (f: Filters): APIFilters => {
    const apiFilters: APIFilters = {
      brand: f.brand,
      year: f.year,
      pack_type: f.pack_type,
      ppg: f.ppg,
      channel: f.channel,
      groupMode: f.groupMode === "channel" ? "channel" : (f.groupMode as "brand" | "ppg" | "channel" | undefined),
    };
    return apiFilters;
  };

  // Separate metrics for each chart
  const [marketMetric, setMarketMetric] = useState<"sales" | "volume">("sales");
  const [yearlyMetric, setYearlyMetric] = useState<"sales" | "volume">("sales");
  const [trendMetric, setTrendMetric] = useState<"sales" | "volume">("sales");
  const [trendGroupBy, setTrendGroupBy] = useState<"brand" | "channel">("brand");

  // Memoize filters to keep queryKeys stable
  const serializedFilters = useMemo(() => JSON.stringify(filters), [filters]);
  const apiFilters = useMemo(() => convertFilters(filters), [filters]);

  // ---------------------------------------------------------------------------
  // 1️⃣ Aggregate (Sales)
  // ---------------------------------------------------------------------------
  const { data: salesValue, isLoading: salesLoading } = useQuery({
    queryKey: ["aggregate-sales", apiFilters.groupMode, serializedFilters],
    queryFn: () =>
      fetchAggregate("sales", {
        ...apiFilters,
        groupMode: apiFilters.groupMode || "brand",
      }),
  });

  // ---------------------------------------------------------------------------
  // 2️⃣ Aggregate (Volume)
  // ---------------------------------------------------------------------------
  const { data: volumeContribution, isLoading: volumeLoading } = useQuery({
    queryKey: ["aggregate-volume", apiFilters.groupMode, serializedFilters],
    queryFn: () =>
      fetchAggregate("volume", {
        ...apiFilters,
        groupMode: apiFilters.groupMode || "brand",
      }),
  });

  // ---------------------------------------------------------------------------
  // 3️⃣ Yearly Sales (reuses aggregate based on selected metric)
  // ---------------------------------------------------------------------------
  const yearlyData = yearlyMetric === "sales" ? salesValue : volumeContribution;
  const yearlyLoading = yearlyMetric === "sales" ? salesLoading : volumeLoading;

  // ---------------------------------------------------------------------------
  // 4️⃣ Trend
  // ---------------------------------------------------------------------------
  const { data: salesTrend, isLoading: trendLoading } = useQuery({
    queryKey: ["sales-trend", trendGroupBy, trendMetric, serializedFilters],
    queryFn: () =>
      fetchAggregate(
        trendMetric,
        {
          ...apiFilters,
          groupMode: trendGroupBy === "brand" ? "brand" : "channel",
        },
        true, // include group_by
        true // include month
      ),
  });

  // ---------------------------------------------------------------------------
  // 5️⃣ Market Share
  // ---------------------------------------------------------------------------
  const { data: marketShare, isLoading: shareLoading } = useQuery({
    queryKey: ["market-share", apiFilters.groupMode, marketMetric, serializedFilters],
    queryFn: () =>
      fetchMarketShare(marketMetric, {
        ...apiFilters,
        year: [], // no year filter for market share
        groupMode: apiFilters.groupMode,
      }),
  });

  // Show charts only for Brand/PPG tabs
  const showCharts = dataTab === "Brand" || dataTab === "PPG";

  return (
    <div className="p-6 space-y-6">
      {/* Filters + Tabs */}
      <FilterBar
        filters={filters}
        setFilters={handleSetFilters}
        activeTab={dataTab}
        setActiveTab={setDataTab}
      />

      {/* Overview stats between filters and charts */}
      <AggregateStats filters={apiFilters} />

      {showCharts ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* --- Sales Value --- */}
            {/* Only show stacked bar charts for admin users */}
            {userRole === "admin" && (
              <ChartCard title="Sales Value (EURO)" isLoading={salesLoading}>
                {salesValue && (
                  <StackedBarChart
                    data={salesValue}
                    type="sales"
                    groupMode={(apiFilters.groupMode === "channel" ? "brand" : apiFilters.groupMode) || "brand"}
                  />
                )}
              </ChartCard>
            )}

            {/* --- Volume Contribution --- */}
            {/* Only show stacked bar charts for admin users */}
            {userRole === "admin" && (
              <ChartCard
                title="Volume Contribution (KG)"
                isLoading={volumeLoading}
              >
                {volumeContribution && (
                  <StackedBarChart
                    data={volumeContribution}
                    type="volume"
                    groupMode={(apiFilters.groupMode === "channel" ? "brand" : apiFilters.groupMode) || "brand"}
                  />
                )}
              </ChartCard>
            )}

            {/* --- Yearly Sales --- */}
            <ChartCard title="Year Wise Data" isLoading={yearlyLoading}>
              {yearlyData && (
                <YearlySalesChart
                  data={yearlyData}
                  groupMode={(apiFilters.groupMode === "channel" ? "brand" : apiFilters.groupMode) || "brand"}
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
                  metric={trendMetric}
                  setMetric={setTrendMetric}
                  groupBy={trendGroupBy}
                  setGroupBy={setTrendGroupBy}
                />
              )}
            </ChartCard>
          </div>

          {/* --- Market Share --- */}
          <MarketSharePie
            data={marketShare || []}
            groupMode={(apiFilters.groupMode === "channel" ? "brand" : apiFilters.groupMode) || "brand"}
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
