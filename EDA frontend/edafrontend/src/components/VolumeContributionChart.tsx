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
  value: number;   // ✅ use value
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

  data.forEach((item) => {
    brandSet.add(item.brand);
    if (!transformed[item.year]) {
      transformed[item.year] = { year: item.year };
    }
    transformed[item.year][item.brand] = item.value;   // ✅ fixed
  });

  const chartData = Object.values(transformed);
  const brands = Array.from(brandSet);

  const colors = ["#f59e0b","#3b82f6","#10b981","#a7f3d0","#9333ea","#ef4444"];

  return (
    <div className="bg-white p-4 rounded-2xl">
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
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)} M`}
          />
          <YAxis
            dataKey="year"
            type="category"
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <Tooltip formatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M`} />
          <Legend verticalAlign="bottom" align="center" iconType="circle" />
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
