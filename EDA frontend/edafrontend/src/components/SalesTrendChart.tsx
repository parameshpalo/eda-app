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
  // transform backend data → "YYYY-MM" for X-axis
  const chartData = data.map((d) => ({
    date: `${d.year}-${String(d.month).padStart(2, "0")}`,
    total_sales: d.total_sales,
  }));

  return (
    <div className="bg-white p-4 rounded-2xl">
      {/* <h2 className="text-lg font-semibold mb-4 text-left">Sales Trend</h2> */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          {/* Grid background */}
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

          {/* X Axis (format: Jan 2021, Feb 2021...) */}
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(date) => {
              const [year, month] = date.split("-");
              return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              });
            }}
          />

          {/* Y Axis in Millions */}
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
          />

          {/* Tooltip with dark style */}
          <Tooltip
            formatter={(value: number) => `${(value / 1_000_000).toFixed(1)}M`}
            labelFormatter={(date) => {
              const [year, month] = date.split("-");
              return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              });
            }}
            contentStyle={{
              backgroundColor: "#111827", // dark tooltip
              borderRadius: "0.5rem",
              border: "none",
              color: "#fff",
            }}
          />

          {/* Smooth green line */}
          <Line
            type="monotone"
            dataKey="total_sales"
            stroke="#10b981"
            strokeWidth={2}
            dot={false} // no dots on every point
            activeDot={{ r: 5, fill: "#10b981" }} // highlight only on hover
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
