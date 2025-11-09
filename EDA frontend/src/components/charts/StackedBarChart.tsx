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
} from "recharts";

interface ChartRecord {
  year: number;
  brand?: string;
  ppg?: string;
  value: number;
}

interface ChartRow {
  year: number;
  [key: string]: number | string;
}

interface Props {
  data: ChartRecord[];
  type?: "sales" | "volume";
  groupMode?: "brand" | "ppg";
}

// const COLORS = ["#06b6d4", "#f43f5e", "#fbbf24", "#a3e635", "#6366f1", "#f97316"];

const formatMillions = (v: number | null | undefined) =>
  v == null ? "0 M" : `${(v / 1_000_000).toFixed(1)} M`;

export default function StackedBarChart({
  data,
  type = "sales",
  groupMode = "brand",
}: Props) {

  // ✅ Transform data efficiently
  const { chartData, keys } = useMemo(() => {
    const transformed: Record<number, ChartRow> = {};
    const keySet = new Set<string>();

    data.forEach(({ year, brand, ppg, value }) => {
      const key = groupMode === "ppg" ? ppg : brand;
      if (!key) return;
      keySet.add(key);
      if (!transformed[year]) transformed[year] = { year };
      transformed[year][key] = Number(value) || 0;
    });

    const rows = Object.values(transformed).sort(
      (a: ChartRow, b: ChartRow) => Number(a.year) - Number(b.year)
    );
    return { chartData: rows, keys: Array.from(keySet) };
  }, [data, groupMode]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    groupKey: string;
    value: number;
    color: string;
  } | null>(null);

  // ✅ Track hovered cell for custom tooltip
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!el) return setTooltip(null);
      const cell = el.closest("[data-key][data-year]") as HTMLElement | null;
      if (!cell || !containerRef.current?.contains(cell)) return setTooltip(null);

      const key = cell.getAttribute("data-key") || "";
      const year = Number(cell.getAttribute("data-year") || "");
      const row = chartData.find((r : ChartRow) => Number(r.year) === year);
      if (!row || !key) return setTooltip(null);

      const value = Number(row[key]) || 0;
      const rect = cell.getBoundingClientRect();
      const contRect = containerRef.current.getBoundingClientRect();
      const x = rect.left - contRect.left + rect.width / 2;
      const y = rect.top - contRect.top;
      const color = cell.getAttribute("fill") || "#111827";

      setTooltip({ x, y, groupKey: key, value, color });
    },
    [chartData]
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  // ✅ Empty state
  if (!data?.length)
    return (
      <div className="bg-white p-4 rounded-2xl text-gray-500 text-center">
        No {type} data available
      </div>
    );

  return (
    <div
      className="relative bg-white p-4 rounded-2xl"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ✅ Custom Tooltip */}
      {tooltip && (
        <div
          className="absolute transition-opacity duration-100"
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
          <div style={{ fontWeight: 600 }}>{tooltip.groupKey}</div>
          <div>{formatMillions(tooltip.value)}</div>
        </div>
      )}

      {/* ✅ Chart */}
      <ResponsiveContainer width="100%" height={260}>
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
          {/* Hide default tooltip */}
          {/* @ts-ignore
          <Tooltip wrapperStyle={{ display: "none" }} /> */}
          <Legend verticalAlign="bottom" align="center" iconType="circle" />

          {keys.map((key, i) => {
            // Create color dynamically based on index, using HSL for distinction
            const color = `hsl(${(i * 360) / keys.length}, 65%, 55%)`;
            return (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={color}
                radius={[0, 3, 3, 0]}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-in-out"
              >
                {chartData.map((row : ChartRow , idx: number) => (
                  <Cell
                    key={`${key}-${idx}`}
                    fill={color}
                    data-key={key}
                    data-year={String(row.year)}
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
