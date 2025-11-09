import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAggregateStats, Filters } from "../api/fmcg";
import MetricDropdown from "./MetricDropdown";

interface Props {
  filters: Filters;
}

export default function AggregateStats({ filters }: Props) {
  const [metric, setMetric] = useState<"sales" | "volume">("sales");

  const { data, isLoading } = useQuery({
    queryKey: ["aggregate-stats", metric, JSON.stringify(filters)],
    queryFn: () => fetchAggregateStats(metric, filters),
  });

  const items = useMemo(() => {
    if (!data) return [] as { label: string; value: string }[];
    return [
      { label: "Min", value: formatNumber(data.min) },
      { label: "Max", value: formatNumber(data.max) },
      { label: "Sum", value: formatNumber(data.sum) },
      { label: "Avg", value: formatNumber(data.avg) },
    ];
  }, [data]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Overview</h3>
        <MetricDropdown value={metric} onChange={setMetric} />
      </div>
      {isLoading ? (
        <p className="text-gray-500">Loading overview...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {items.map((it) => (
            <StatCard key={it.label} label={it.label} value={it.value} />)
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n == null || !Number.isFinite(n)) return "0";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)} K`;
  return n.toFixed(0);
}


