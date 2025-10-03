import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface YearlySalesRecord {
  brand: string;
  year: number;
  total_sales: number;
}

interface YearlyChartRow {
  brand: string;
  [year: string]: number | string;
}

interface Props {
  data: YearlySalesRecord[];
}

export default function YearlySalesChart({ data }: Props) {
  const transformed: Record<string, YearlyChartRow> = {};
  const yearSet = new Set<number>();

  // Transform API → Recharts format
  data.forEach((item) => {
    yearSet.add(item.year);
    if (!transformed[item.brand]) {
      transformed[item.brand] = { brand: item.brand };
    }
    transformed[item.brand][String(item.year)] = item.total_sales;
  });

  const chartData = Object.values(transformed);
  const years = Array.from(yearSet).sort();

  // Color palette (consistent)
  const colors = [
    "#f59e0b", // amber
    "#3b82f6", // blue
    "#10b981", // green
    "#a7f3d0", // soft teal
    "#9333ea", // purple
    "#ef4444", // red
  ];

  return (
    <div className="bg-white p-4 rounded-2xl">
      {/* <h2 className="text-lg font-semibold mb-4 text-left">Yearly Sales</h2> */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          barCategoryGap="25%"
          margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="brand"
            axisLine={true}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <YAxis
            axisLine={true}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)} M`}
          />

          <Tooltip
            formatter={(value: number) => `${(value / 1_000_000).toFixed(0)}M`}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ marginTop: 10 }}
          />

          {/* Render bars dynamically per year */}
          {years.map((year, idx) => (
            <Bar
              key={year}
              dataKey={String(year)}
              fill={colors[idx % colors.length]}
              radius={[3, 3, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
