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
} from "recharts";

interface YearlySalesRecord {
  brand?: string;
  ppg?: string;
  year: number;
  total_sales: number;
}

interface YearlyChartRow {
  groupKey: string;
  [year: string]: number | string;
}

interface Props {
  data: YearlySalesRecord[];
  groupMode?: "brand" | "ppg";
}

const COLORS = [
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#10b981", // green
  "#8b5cf6", // purple
  "#ef4444", // red
  "#14b8a6", // teal
];

function formatMillions(v: number | null | undefined) {
  if (v == null) return "0 M";
  return `${(v / 1_000_000).toFixed(1)} M`;
}

export default function YearlySalesChart({ data, groupMode = "brand" }: Props) {
  // ✅ Transform data once when dependencies change
  const { chartData, years } = useMemo(() => {
    const transformed: Record<string, YearlyChartRow> = {};
    const yearSet = new Set<number>();

    data.forEach((item) => {
      const groupKey = groupMode === "ppg" ? item.ppg : item.brand;
      if (!groupKey) return;

      yearSet.add(item.year);
      if (!transformed[groupKey]) transformed[groupKey] = { groupKey };
      transformed[groupKey][String(item.year)] = item.total_sales;
    });

    return {
      chartData: Object.values(transformed),
      years: Array.from(yearSet).sort(),
    };
  }, [data, groupMode]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // ✅ Tooltip state
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    groupKey: string;
    year: string;
    value: number;
  } | null>(null);

  // ✅ Tooltip mouse tracking
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!el) return setTooltip(null);

      const cell = el.closest("[data-key][data-year]") as HTMLElement | null;
      if (!cell || !containerRef.current?.contains(cell)) return setTooltip(null);

      const groupKey = cell.getAttribute("data-key") || "";
      const year = cell.getAttribute("data-year") || "";
      if (!groupKey || !year) return setTooltip(null);

      const row: any = chartData.find((r: any) => r.groupKey === groupKey);
      const value = row ? Number(row[year] || 0) : 0;

      const rect = cell.getBoundingClientRect();
      const contRect = containerRef.current.getBoundingClientRect();
      const x = rect.left - contRect.left + rect.width / 2;
      const y = rect.top - contRect.top;

      setTooltip({ x, y, groupKey, year, value });
    },
    [chartData]
  );

  const onMouseLeave = useCallback(() => setTooltip(null), []);

  // ✅ Prevent rendering when no data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-2xl text-gray-500 text-center">
        No yearly sales data available
      </div>
    );
  }

  return (
    <div
      className="relative bg-white p-4 rounded-2xl"
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Custom Tooltip */}
      {tooltip && (
        <div
          className="absolute"
          style={{
            transform: `translate(${tooltip.x}px, ${tooltip.y - 10}px) translate(-50%, -100%)`,
            background: "#111827",
            color: "#fff",
            fontSize: "12px",
            lineHeight: "16px",
            padding: "6px 8px",
            borderRadius: 6,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 999,
          }}
        >
          <div style={{ fontWeight: 600 }}>{tooltip.year}</div>
          <div>{formatMillions(tooltip.value)}</div>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          barCategoryGap="25%"
          margin={{ top: 10, right: 20, left: 20, bottom: 20 }}

        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="groupKey"
            axisLine
            tickLine={false}
            interval={0}  
            tick={{ fontSize: 10, fill: "#6b7280" }}
          />
          <YAxis
            axisLine
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)} M`}
          />

          {/* Disable default tooltip */}
          {/* @ts-ignore */}
          <Tooltip wrapperStyle={{ display: "none" }} />
          <Legend verticalAlign="bottom" align="center"  iconType="circle"   />

          {/* Bars with safe one-time animation */}
          {years.map((year, idx) => {
            const color = COLORS[idx % COLORS.length];
            return (
              <Bar
                key={year}
                dataKey={String(year)}
                fill={color}
                radius={[3, 3, 0, 0]}
                isAnimationActive={true}
                animationDuration={700}
                animationEasing="ease-out"
              >
                {chartData.map((row: any) => (
                  <Cell
                    key={`cell-${row.groupKey}-${year}`}
                    fill={color}
                    data-key={row.groupKey}
                    data-year={String(year)}
                  />
                ))}
              </Bar>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
