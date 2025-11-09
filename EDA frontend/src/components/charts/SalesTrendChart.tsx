import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import MetricDropdown from "../MetricDropdown";
import GroupModeDropdown from "../GroupModeDropdown";

interface TrendRecord {
  year: number;
  month: number;
  value: number;
  brand?: string;
  channel?: string;
}
interface Props {
  data: TrendRecord[];
  metric: "sales" | "volume";
  setMetric: (val: "sales" | "volume") => void;
  groupBy?: "brand" | "channel";
  setGroupBy?: (v: "brand" | "channel") => void;
}

export default function SalesTrendChart({ data, metric, setMetric, groupBy = "brand", setGroupBy }: Props) {
  // Build a unified time axis and one series per brand
  const { chartData, brands } = useMemo(() => {
    const dateSet = new Set<string>();
    const seriesSet = new Set<string>();
    data.forEach((d) => {
      const date = `${d.year}-${String(d.month).padStart(2, "0")}`;
      dateSet.add(date);
      const key = groupBy === "channel" ? d.channel : d.brand;
      if (key) seriesSet.add(key);
    });

    const dates = Array.from(dateSet).sort();
    const seriesList = Array.from(seriesSet);

    const rows: Array<Record<string, string | number>> = dates.map((date) => {
      const row: Record<string, string | number> = { date };
      seriesList.forEach((s) => (row[s] = 0));
      return row;
    });

    const indexByDate = new Map<string, number>();
    rows.forEach((r, idx) => indexByDate.set(r.date as string, idx));

    data.forEach((d) => {
      const date = `${d.year}-${String(d.month).padStart(2, "0")}`;
      const rowIdx = indexByDate.get(date);
      const key = groupBy === "channel" ? d.channel : d.brand;
      if (rowIdx == null || !key) return;
      const targetRow = rows[rowIdx] as Record<string, string | number>;
      targetRow[key] = d.value;
    });

    return { chartData: rows, brands: seriesList };
  }, [data, groupBy]);

  if (!chartData.length)
    return <div className="bg-white p-4 rounded-2xl text-gray-500 text-center">No trend data</div>;
  return (
    <div className="bg-white p-4 rounded-2xl relative">
      <div className="flex justify-end gap-2 mb-4">
        {setGroupBy && (
          <GroupModeDropdown value={groupBy} onChange={setGroupBy} />
        )}
        <MetricDropdown value={metric} onChange={setMetric} />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 30, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickFormatter={(date) => {
              const [y, m] = date.split("-");
              return new Date(Number(y), Number(m) - 1).toLocaleString("en", {
                month: "short",
                year: "2-digit",
              });
            }}
          />
          <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} tick={{ fill: "#6b7280" }} />
          <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
          <Tooltip
            formatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
            labelFormatter={(date) => {
              const [y, m] = date.split("-");
              return new Date(Number(y), Number(m) - 1).toLocaleString("en", {
                month: "long",
                year: "numeric",
              });
            }}
            contentStyle={{
              backgroundColor: "#111827",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              padding: "6px 10px",
            }}
          />
          {brands.map((brand, i) => (
            <Line
              key={brand}
              type="monotone"
              dataKey={brand}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: LINE_COLORS[i % LINE_COLORS.length], stroke: "#fff", strokeWidth: 1.5 }}
              animationDuration={600}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const LINE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#6366f1", "#f97316"];
