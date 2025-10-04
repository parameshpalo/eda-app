import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
  "#f59e0b", "#3b82f6", "#10b981", "#a7f3d0",
  "#9333ea", "#ef4444", "#6366f1", "#f97316",
];

const formatM = (v: number) => `${(v / 1_000_000).toFixed(2)}M`;

/** Tooltip that shows only the group name */
function GroupTooltip({ active, payload }: any) {
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
}

/** Outer label showing value + percentage */
function renderOuterLabel({ cx, cy, midAngle, outerRadius, payload }: any) {
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
}

export default function MarketSharePie({
  data,
  groupMode,
  metric,
  setMetric,
  isLoading,
  colors = DEFAULT_COLORS,
}: Props) {
  // calculate % locally
  const normalized = useMemo(() => {
    const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
    return data.map((d) => ({
      ...d,
      percentage: d.percentage ?? (total > 0 ? (d.value / total) * 100 : 0),
    }));
  }, [data]);

  if (isLoading)
    return <div className="bg-white p-6 rounded-2xl text-center text-gray-500">Loading Market Share...</div>;

  if (!normalized.length)
    return <div className="bg-white p-6 rounded-2xl text-center text-gray-500">No market share data available</div>;

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
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-in-out"
          >
            {normalized.map((_, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length]} />
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
          <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
