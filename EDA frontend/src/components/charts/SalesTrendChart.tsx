import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import MetricDropdown from "../MetricDropdown";

interface TrendRecord {
  year: number;
  month: number;
  value: number;
}
interface Props {
  data: TrendRecord[];
  metric: "sales" | "volume";
  setMetric: (val: "sales" | "volume") => void;
}

export default function SalesTrendChart({ data, metric, setMetric }: Props) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        date: `${d.year}-${String(d.month).padStart(2, "0")}`,
        value: d.value,
      })),
    [data]
  );

  if (!chartData.length)
    return <div className="bg-white p-4 rounded-2xl text-gray-500 text-center">No trend data</div>;

  return (
    <div className="bg-white p-4 rounded-2xl relative">
      <div className="flex justify-end mb-4">
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
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 1.5 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
