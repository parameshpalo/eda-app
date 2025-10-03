import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DEFAULT_COLORS = [
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#10b981", // green
  "#a7f3d0", // soft teal
  "#9333ea", // purple
  "#ef4444", // red
  "#6366f1", // indigo
  "#f97316", // orange
];

interface Datum {
  brand: string;
  value: number;
  percentage?: number; // optional: if backend gives it, we'll use it; otherwise computed
}

interface Props {
  data: Datum[];
  colors?: string[];
  title?: string;
}

function formatNumberM(v: number) {
  return `${(v / 1_000_000).toFixed(2)}M`;
}

/** Custom tooltip showing brand, value and percentage */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0].payload as Datum;
  const value = p.value ?? payload[0].value ?? 0;
  const percent = p.percentage ?? payload[0].percent ?? NaN;

  return (
    <div
      style={{
        background: "#111827",
        color: "#fff",
        padding: "8px 10px",
        borderRadius: 8,
        fontSize: 12,
        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
        minWidth: 110,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.brand}</div>
      <div style={{ fontSize: 13 }}>{formatNumberM(value)}</div>
      {!Number.isNaN(percent) && (
        <div style={{ opacity: 0.9, marginTop: 4 }}>{`${(percent * 100).toFixed(
          1
        )}%`}</div>
      )}
    </div>
  );
}

/** Render outside label with small leader line */
function renderOuterLabel(props: any) {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, outerRadius, percent, index, payload } = props;
  const label = payload.brand;
  const value = payload.value;
  const percentNum = payload.percentage ?? percent;

  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);

  const sx = cx + (outerRadius + 6) * cos;
  const sy = cy + (outerRadius + 6) * sin;
  const mx = cx + (outerRadius + 18) * cos;
  const my = cy + (outerRadius + 18) * sin;
  const tx = cx + (outerRadius + 28) * cos;
  const ty = cy + (outerRadius + 28) * sin;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g key={`label-${index}`}>
      {/* leader line */}
      <polyline
        points={`${sx},${sy} ${mx},${my} ${tx},${ty}`}
        fill="none"
        stroke="#9ca3af"
        strokeWidth={1}
        strokeLinecap="round"
      />
      {/* value and percent */}
      <text
        x={tx}
        y={ty - 2}
        textAnchor={textAnchor}
        dominantBaseline="central"
        style={{ fontSize: 11, fill: "#374151", fontWeight: 600 }}
      >
        {formatNumberM(value)}
      </text>
      <text
        x={tx}
        y={ty + 12}
        textAnchor={textAnchor}
        dominantBaseline="central"
        style={{ fontSize: 11, fill: "#6b7280" }}
      >
        {`${(percentNum * 100).toFixed(1)}%`}
      </text>
    </g>
  );
}

export default function MarketSharePie({ data, colors, title }: Props) {
  const palette = colors ?? DEFAULT_COLORS;
  const total = data.reduce((s, d) => s + (d.value ?? 0), 0);

  // If backend didn't supply percentages, compute them
  const normalized = data.map((d) => ({
    ...d,
    percentage: d.percentage ?? (total > 0 ? d.value / total : 0),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          {/* center total label */}
          <Pie
            data={normalized}
            dataKey="value"
            nameKey="brand"
            cx="50%"
            cy="50%"
            innerRadius={70} // donut
            outerRadius={120}
            paddingAngle={2}
            labelLine={false}
            label={renderOuterLabel}
          >
            {normalized.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={palette[idx % palette.length]} />
            ))}
          </Pie>

          {/* center total text drawn as simple overlay via a tiny invisible Pie's label is trickier,
              so render a text node instead (works inside PieChart) */}
          <text
            x="50%"
            y="48%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 14, fill: "#111827", fontWeight: 700 }}
          >
            {formatNumberM(total)}
          </text>
          <text
            x="50%"
            y="57%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 12, fill: "#6b7280" }}
          >
            Total
          </text>

          <Tooltip content={<CustomTooltip />} />

          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ marginTop: 10, fontSize: 13 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
