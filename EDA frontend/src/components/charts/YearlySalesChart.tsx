import React, { useMemo, useRef, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Tooltip,
  LabelList,
} from "recharts";
import MetricDropdown from "../MetricDropdown";

interface YearlySalesRecord {
  brand?: string;
  ppg?: string;
  year: number;
  value: number; // ✅ unified backend field
}

interface YearlyChartRow {
  groupKey: string;
  [year: string]: number | string;
}

interface Props {
  data: YearlySalesRecord[];
  groupMode?: "brand" | "ppg";
  metric: "sales" | "volume";
  setMetric: (val: "sales" | "volume") => void;
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#14b8a6"];

const formatM = (v: number | null | undefined) =>
  v == null ? "0 M" : `${(v / 1_000_000).toFixed(1)} M`;

const tooltipStyle: React.CSSProperties = {
  background: "#111827",
  color: "#fff",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "6px 8px",
  borderRadius: 6,
  pointerEvents: "none",
  whiteSpace: "nowrap",
  zIndex: 999,
};

export default function YearlySalesChart({
  data,
  groupMode = "brand",
  metric,
  setMetric,
}: Props) {
  // ✅ Transform backend data to chart rows
  const { chartData, years } = useMemo(() => {
    const grouped: Record<string, YearlyChartRow> = {};
    const yearSet = new Set<number>();

    data.forEach(({ brand, ppg, year, value }) => {
      const key = groupMode === "ppg" ? ppg : brand;
      if (!key) return;

      yearSet.add(year);
      if (!grouped[key]) grouped[key] = { groupKey: key };
      grouped[key][year] = value ?? 0;
    });

    return {
      chartData: Object.values(grouped),
      years: Array.from(yearSet).sort(),
    };
  }, [data, groupMode]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    groupKey: string;
    year: string;
    value: number;
  } | null>(null);

  // ✅ Custom tooltip positioning
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const cell = (e.target as HTMLElement).closest("[data-key][data-year]") as HTMLElement | null;
      if (!cell || !containerRef.current?.contains(cell)) return setTooltip(null);

      const groupKey = cell.dataset.key || "";
      const year = cell.dataset.year || "";
      if (!groupKey || !year) return setTooltip(null);

      const row = chartData.find((r: YearlyChartRow) => r.groupKey === groupKey);
      const value = row ? Number(row[year] || 0) : 0;

      const rect = cell.getBoundingClientRect();
      const contRect = containerRef.current.getBoundingClientRect();
      setTooltip({
        x: rect.left - contRect.left + rect.width / 2,
        y: rect.top - contRect.top,
        groupKey,
        year,
        value,
      });
    },
    [chartData]
  );

  if (!data.length)
    return <div className="bg-white p-4 rounded-2xl text-gray-500 text-center">No yearly data</div>;

  return (
    <div
      className="relative bg-white p-4 rounded-2xl"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip(null)}
    >
      {/* Header */}
      <div className="flex justify-end mb-4">
        <MetricDropdown value={metric} onChange={setMetric} />
      </div>

      {/* Custom Tooltip */}
      {tooltip && (
        <div
          className="absolute"
          style={{
            ...tooltipStyle,
            transform: `translate(${tooltip.x}px, ${tooltip.y - 10}px) translate(-50%, -100%)`,
          }}
        >
          <div className="font-semibold">{tooltip.year}</div>
          <div>{formatM(tooltip.value)}</div>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="groupKey"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)} M`}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
          />
          {/* Disable default tooltip */}
          <Tooltip wrapperStyle={{ display: "none" }} />
          <Legend verticalAlign="bottom" align="center" iconType="circle" />
          {years.map((year, i) => (
            <Bar
              key={year}
              dataKey={String(year)}
              fill={COLORS[i % COLORS.length]}
              radius={[3, 3, 0, 0]}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
            >
              <LabelList
                dataKey={String(year)}
                position="top"
                fill="#374151"
                content={(props: unknown) => {
                  const { x, y, value } = (props as { x?: number; y?: number; value?: number | string });
                  const numeric = typeof value === "number" ? value : Number(value ?? 0);
                  if (x == null || y == null || !Number.isFinite(numeric) || numeric <= 0) return null;
                  const label = `${(numeric / 1_000_000).toFixed(1)} M`;
                  const verticalOffset = 8 + i * 10; // stagger labels for spacing
                  return (
                    <text x={x} y={y - verticalOffset} fill="#374151" textAnchor="middle" fontSize={10}>
                      {label}
                    </text>
                  );
                }}
              />
              {chartData.map((row: YearlyChartRow) => (
                <Cell
                  key={`${row.groupKey}-${year}`}
                  data-key={row.groupKey}
                  data-year={String(year)}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
