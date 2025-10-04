import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

const DEFAULT_COLORS = [
  "#f59e0b", "#3b82f6", "#10b981", "#a7f3d0",
  "#9333ea", "#ef4444", "#6366f1", "#f97316",
];

interface Datum {
  brand?: string;
  ppg?: string;
  value: number;
  percentage?: number;
}

interface Props {
  data: Datum[];
  groupMode?: "brand" | "ppg";
  isLoading: boolean;
  colors?: string[];
}

function formatNumberM(v: number) {
  return `${(v / 1_000_000).toFixed(2)}M`;
}

// Tooltip that only shows brand/ppg
function GroupOnlyTooltip({ active, payload }: any) {
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

// Outer labels (show value + %)
function renderOuterLabel({ cx, cy, midAngle, outerRadius, payload }: any) {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  const x = cx + (outerRadius + 24) * cos;
  const y = cy + (outerRadius + 24) * sin;

  const value = payload.value;
  const percent = payload.percentage?.toFixed(1) ?? "0.0";

  return (
    <text
      x={x}
      y={y}
      textAnchor={cos >= 0 ? "start" : "end"}
      dominantBaseline="central"
      style={{ fontSize: 11, fill: "#374151" }}
    >
      {formatNumberM(value)} ({percent}%)
    </text>
  );
}

export default function MarketSharePie({ data, groupMode, colors, isLoading }: Props) {
  const palette = colors ?? DEFAULT_COLORS;

  // ✅ derive percentage locally
  const normalized = useMemo(() => {
    const total = data.reduce((s: number, d: Datum) => s + (d.value ?? 0), 0);
    return data.map((d) => ({
      ...d,
      percentage: d.percentage ?? (total > 0 ? (d.value / total) * 100 : 0),
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl text-center text-gray-500">
        Loading Market Share...
      </div>
    );
  }

  if (!normalized.length) {
    return (
      <div className="bg-white p-6 rounded-2xl text-center text-gray-500">
        No market share data available
      </div>
    );
  }

  const total = normalized.reduce((s, d) => s + (d.value ?? 0), 0);

  return (
    <div className="bg-white p-4 rounded-2xl relative">
      <h2 className="text-lg font-semibold text-gray-800 text-center mb-6">
        Market Share
      </h2>

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
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-in-out"
          >
            {normalized.map((_: any, idx: number) => (
              <Cell key={`cell-${idx}`} fill={palette[idx % palette.length]} />
            ))}
          </Pie>

          {/* Center Total */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 14, fontWeight: 700, fill: "#111827" }}
          >
            {formatNumberM(total)}
          </text>
          <text
            x="50%"
            y="65%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 12, fill: "#6b7280" }}
          >
            Total
          </text>

          <Tooltip content={<GroupOnlyTooltip />} isAnimationActive={false} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ fontSize: 13, marginTop: 10 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
