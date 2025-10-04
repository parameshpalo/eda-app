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

interface TrendRecord {
  year: number;
  month: number;
  total_sales: number;
}

interface SalesTrendChartProps {
  data: TrendRecord[];
}

export default function SalesTrendChart({ data }: SalesTrendChartProps) {
  // ✅ Memoized transformation to avoid recalculating on every render
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        date: `${d.year}-${String(d.month).padStart(2, "0")}`,
        total_sales: d.total_sales,
      })),
    [data]
  );

  // ✅ Graceful handling of empty data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-2xl text-gray-500 text-center">
        No sales trend data available
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl relative overflow-hidden">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          {/* Background Grid */}
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

          {/* X Axis → formatted like “Jan 2025” */}
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(date) => {
              const [year, month] = date.split("-");
              return new Date(Number(year), Number(month) - 1).toLocaleDateString(
                "en-US",
                { month: "short", year: "numeric" }
              );
            }}
          />

          {/* Y Axis → show values in millions */}
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
          />

          {/* Custom Dark Tooltip */}
          <Tooltip
            formatter={(value: number) => `${(value / 1_000_000).toFixed(1)}M`}
            labelFormatter={(date) => {
              const [year, month] = date.split("-");
              return new Date(Number(year), Number(month) - 1).toLocaleDateString(
                "en-US",
                { month: "short", year: "numeric" }
              );
            }}
            contentStyle={{
              backgroundColor: "#111827",
              borderRadius: "0.5rem",
              border: "none",
              color: "#fff",
              fontSize: "12px",
              padding: "6px 10px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          />

          {/* Smooth Animated Line */}
          <Line
            type="monotone"
            dataKey="total_sales"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: "#10b981",
              stroke: "#fff",
              strokeWidth: 1.5,
            }}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
