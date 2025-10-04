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

interface SalesValueRecord {
  year: number;
  brand?: string;
  ppg?: string;
  value: number;
}

interface SalesChartRow {
  year: number;
  [key: string]: number | string;
}

interface Props {
  data: SalesValueRecord[];
  groupMode?: "brand" | "ppg";
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#14b8a6"];

function formatMillions(v: number | null | undefined) {
  if (v == null) return "0 M";
  return `${(v / 1_000_000).toFixed(1)} M`;
}

export default function SalesBarChart({ data, groupMode = "brand" }: Props) {
  /** ✅ Transform data only when dependencies change */
  const { chartData, keys } = useMemo(() => {
    const transformed: Record<number, SalesChartRow> = {};
    const keySet = new Set<string>();

    data.forEach((item) => {
      const groupKey = groupMode === "ppg" ? item.ppg : item.brand;
      if (!groupKey) return;

      keySet.add(groupKey);
      if (!transformed[item.year]) transformed[item.year] = { year: item.year };
      transformed[item.year][groupKey] = Number(item.value) || 0;
    });

    const rows = Object.values(transformed).sort(
      (a: any, b: any) => Number(a.year) - Number(b.year)
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

  /** ✅ Efficient custom tooltip tracking */
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!el) return setTooltip(null);

      const cell = el.closest("[data-key][data-year]") as HTMLElement | null;
      if (!cell || !containerRef.current?.contains(cell)) return setTooltip(null);

      const groupKey = cell.getAttribute("data-key") || "";
      const yearStr = cell.getAttribute("data-year") || "";
      const year = Number(yearStr);
      if (!groupKey || Number.isNaN(year)) return setTooltip(null);

      const row: any = chartData.find((r: any) => Number(r.year) === year);
      const value = row ? Number(row[groupKey] || 0) : 0;

      const rect = cell.getBoundingClientRect();
      const contRect = containerRef.current.getBoundingClientRect();
      const cx = rect.left - contRect.left + rect.width / 2;
      const cy = rect.top - contRect.top;

      const color =
        cell.getAttribute("fill") || (cell.style && cell.style.fill) || "#111827";

      setTooltip({ x: cx, y: cy, groupKey, value, color });
    },
    [chartData]
  );

  const onMouseLeave = useCallback(() => setTooltip(null), []);

  /** ✅ Empty state */
  if (!data?.length) {
    return (
      <div className="bg-white p-4 rounded-2xl text-gray-500 text-center">
        No sales data available
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
          {/* Disable default Recharts tooltip */}
          {/* @ts-ignore */}
          <Tooltip wrapperStyle={{ display: "none" }} />
          <Legend verticalAlign="bottom" align="center" iconType="circle" />

          {/* ✅ Bars with subtle animation */}
          {keys.map((key, idx) => {
            const color = COLORS[idx % COLORS.length];
            return (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={color}
                radius={[0, 3, 3, 0]}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-in-out"
              >
                {chartData.map((row: any, i: number) => (
                  <Cell
                    key={`cell-${key}-${i}`}
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
