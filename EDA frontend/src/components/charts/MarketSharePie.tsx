import React, { useMemo, useCallback, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import MetricDropdown from "../MetricDropdown";

interface Datum {
  brand?: string;
  ppg?: string;
  value: number;
  percentage?: number;
}

interface Props {
  data: Datum[];
  groupMode?: "brand" | "ppg";
  metric: "sales" | "volume";
  setMetric: (val: "sales" | "volume") => void;
  isLoading: boolean;
  colors?: string[];
}

const DEFAULT_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#a7f3d0",
  "#9333ea",
  "#ef4444",
  "#6366f1",
  "#f97316",
];

const formatM = (v: number) => `${(v / 1_000_000).toFixed(2)}M`;

/** Tooltip showing brand/PPG only */
const GroupTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const name = payload[0]?.payload?.brand || payload[0]?.payload?.ppg || "";
  return (
    <div
      style={{
        background: "#111827",
        color: "#fff",
        padding: "6px 8px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </div>
  );
};

/** ✅ Custom Legend with stable keys & no flicker */
const CustomLegend = React.memo(
  ({ data, colors }: { data: Datum[]; colors: string[] }) => (
    <ul className="flex flex-wrap justify-center gap-4 mt-3">
      {data.map((d, i) => (
        <li
          key={d.brand || d.ppg || `segment-${i}`}
          className="text-sm text-gray-700"
        >
          <span
            className="inline-block w-3 h-3 mr-2 rounded-full"
            style={{ backgroundColor: colors[i % colors.length] }}
          ></span>
          {(d.brand || d.ppg) ?? "N/A"} — {d.percentage?.toFixed(1) ?? "0.0"}%
        </li>
      ))}
    </ul>
  )
);

/** ✅ Outer label — memoized for stability */
const useRenderOuterLabel = () =>
  useCallback(({ cx, cy, midAngle, outerRadius, payload }: any) => {
    const RAD = Math.PI / 180;
    const sin = Math.sin(-midAngle * RAD);
    const cos = Math.cos(-midAngle * RAD);
    const x = cx + (outerRadius + 24) * cos;
    const y = cy + (outerRadius + 24) * sin;

    return (
      <text
        x={x}
        y={y}
        textAnchor={cos >= 0 ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontSize: 11, fill: "#374151" }}
      >
        {formatM(payload.value)} ({payload.percentage?.toFixed(1) ?? "0.0"}%)
      </text>
    );
  }, []);

export default function MarketSharePie({
  data,
  groupMode,
  metric,
  setMetric,
  isLoading,
  colors = DEFAULT_COLORS,
}: Props) {
  // ✅ Normalize + sort data for consistent rendering
  const normalized = useMemo(() => {
    if (!data?.length) return [];
    const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
    const sorted = [...data].sort((a, b) =>
      (a.brand || a.ppg || "").localeCompare(b.brand || b.ppg || "")
    );
    return sorted.map((d) => ({
      ...d,
      percentage: total > 0 ? (d.value / total) * 100 : 0,
    }));
  }, [data]);

  const [animate, setAnimate] = useState(true);
  // ✅ Disable animation on metric changes after first render
  useEffect(() => {
    setAnimate(false);
    const timeout = setTimeout(() => setAnimate(true), 200); // smooth recovery
    return () => clearTimeout(timeout);
  }, [metric]);

  const renderOuterLabel = useRenderOuterLabel();

  if (isLoading)
    return (
      <div className="bg-white p-6 rounded-2xl text-center text-gray-500">
        Loading Market Share...
      </div>
    );

  if (!normalized.length)
    return (
      <div className="bg-white p-6 rounded-2xl text-center text-gray-500">
        No market share data available
      </div>
    );

  const total = normalized.reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div className="bg-white p-4 rounded-2xl relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Market Share</h2>
        <MetricDropdown value={metric} onChange={setMetric} />
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={normalized}
            dataKey="value"
            nameKey={groupMode === "ppg" ? "ppg" : "brand"}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
            paddingAngle={2}
            label={renderOuterLabel}
            isAnimationActive={animate}
            animationDuration={900}
            animationEasing="ease-in-out"
          >
            {normalized.map((d, idx) => (
              <Cell
                key={d.brand || d.ppg || idx}
                fill={colors[idx % colors.length]}
              />
            ))}
          </Pie>

          {/* Center total */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 14, fontWeight: 700, fill: "#111827" }}
          >
            {formatM(total)}
          </text>
          <text
            x="50%"
            y="65%"
            textAnchor="middle"
            style={{ fontSize: 12, fill: "#6b7280" }}
          >
            Total
          </text>

          <Tooltip content={<GroupTooltip />} isAnimationActive={false} />
        </PieChart>
      </ResponsiveContainer>

      {/* ✅ Stable Custom Legend */}
      <CustomLegend data={normalized} colors={colors} />
    </div>
  );
}
