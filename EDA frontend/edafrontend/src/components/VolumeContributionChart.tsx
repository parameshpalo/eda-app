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

interface VolumeRecord {
  year: number;
  brand: string;
  total_volume: number;
}

interface VolumeChartRow {
  year: number;
  [brand: string]: number | string;
}

interface Props {
  data: VolumeRecord[];
}

export default function VolumeContributionChart({ data }: Props) {
  const transformed: Record<number, VolumeChartRow> = {};
  const brandSet = new Set<string>();

  // Transform API → Recharts stacked bar format
  data.forEach((item) => {
    brandSet.add(item.brand);
    if (!transformed[item.year]) {
      transformed[item.year] = { year: item.year };
    }
    transformed[item.year][item.brand] = item.total_volume;
  });

  const chartData = Object.values(transformed);
  const brands = Array.from(brandSet);

  // Color palette (consistent with Sales chart)
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
      {/* <h2 className="text-lg font-semibold mb-4 text-left">Volume Contribution</h2> */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={chartData}
          layout="vertical"
          barCategoryGap="25%"
          margin={{ left: 40, right: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            type="number"
            axisLine={true}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)} M`}
          />
          <YAxis
            dataKey="year"
            type="category"
            axisLine={true}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />

          <Tooltip
            formatter={(value: number) =>
              `${(value / 1_000_000).toFixed(0)}M`
            }
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ marginTop: 10 }}
          />

          {/* Render dynamic bars */}
          {brands.map((brand, idx) => (
            <Bar
              key={brand}
              dataKey={brand}
              stackId="a"
              fill={colors[idx % colors.length]}
              radius={[0, 3, 3, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
