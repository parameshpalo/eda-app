import React, { useRef, useEffect, useState } from "react";
import { Filters } from "../assets/types";
import FilterSelect from "./FilterSelect";

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function normalizeFilters(input?: Filters): Filters {
  return {
    brand: [...(input?.brand ?? [])],
    year: [...(input?.year ?? [])],
    pack_type: [...(input?.pack_type ?? [])],
    ppg: [...(input?.ppg ?? [])],
    channel: [...(input?.channel ?? [])],
    groupMode: input?.groupMode,
  };
}

function clearFilters(activeTab: string): Filters {
  return {
    brand: [],
    year: [],
    pack_type: [],
    ppg: [],
    channel: [],
    groupMode: activeTab === "PPG" ? "ppg" : "brand",
  };
}

export default function FilterBar({
  filters,
  setFilters,
  activeTab,
  setActiveTab,
}: Props) {
  const tabs = [
    "Brand",
    "Pack Type",
    "PPG",
    "Brand X Pack Type X PPG",
    "Correlation and Trends",
  ];

  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [pendingFilters, setPendingFilters] = useState<Filters>(() =>
    normalizeFilters(filters)
  );

  useEffect(() => {
    setPendingFilters(normalizeFilters(filters));
  }, [filters]);

  // reset filters when active tab changes
  useEffect(() => {
    const cleared = clearFilters(activeTab);
    setPendingFilters(cleared);
    setFilters(cleared);
  }, [activeTab, setFilters]);

  // animate tab underline
  useEffect(() => {
    const currentTab = tabRefs.current[activeTab];
    if (currentTab) {
      requestAnimationFrame(() => {
        setIndicatorStyle({
          width: `${currentTab.offsetWidth}px`,
          transform: `translateX(${currentTab.offsetLeft}px)`,
        });
      });
    } else {
      setIndicatorStyle({});
    }
  }, [activeTab]);

  const updatePendingFilter = (key: keyof Filters, value: string[]) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const updated = normalizeFilters(pendingFilters);
    if (activeTab === "Brand") updated.groupMode = "brand";
    else if (activeTab === "PPG") updated.groupMode = "ppg";
    setFilters(updated);
  };

  const resetFilters = () => {
    const cleared = clearFilters(activeTab);
    setPendingFilters(cleared);
    setFilters(cleared);
  };

  return (
    <div>
      {/* Tabs */}
      <div className="relative mb-4">
        <div className="flex space-x-6 relative">
          {tabs.map((tab) => (
            <button
              key={tab}
              ref={(el) => (tabRefs.current[tab] = el)}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium transition-colors ${
                activeTab === tab
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span
          className="absolute bottom-0 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ease-in-out"
          style={indicatorStyle}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-end">
        <FilterSelect
          label="Channel"
          value={pendingFilters.channel ?? []}
          options={[
            { label: "Supermarkets", value: "Supermarkets" },
            { label: "Tesco", value: "Tesco" },
            { label: "Convenience", value: "Convenience" },
            { label: "Iceland", value: "Iceland" },
          ]}
          onChange={(v) => updatePendingFilter("channel", v)}
        />

        <FilterSelect
          label="Brand"
          value={pendingFilters.brand ?? []}
          options={Array.from({ length: 6 }, (_, i) => ({
            label: `Brand ${i + 1}`,
            value: `Brand ${i + 1}`,
          }))}
          onChange={(v) => updatePendingFilter("brand", v)}
        />

        <FilterSelect
          label="Pack Type"
          value={pendingFilters.pack_type ?? []}
          options={["Small", "Medium", "Large"].map((p) => ({
            label: p,
            value: p,
          }))}
          onChange={(v) => updatePendingFilter("pack_type", v)}
        />

        <FilterSelect
          label="PPG"
          value={pendingFilters.ppg ?? []}
          options={[
            "Small Single",
            "Small Multi",
            "Small SNAP POTS",
            "Standard Single",
            "Standard Multi",
            "Others",
          ].map((p) => ({ label: p, value: p }))}
          onChange={(v) => updatePendingFilter("ppg", v)}
        />

        <FilterSelect
          label="Year"
          value={pendingFilters.year ?? []}
          options={[2021, 2022, 2023, 2024].map((y) => ({
            label: String(y),
            value: String(y),
          }))}
          onChange={(v) => updatePendingFilter("year", v)}
        />

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-sm 
                       hover:bg-yellow-600 hover:scale-105 active:scale-95 
                       transition-all duration-200"
          >
            Apply
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm 
                       hover:bg-gray-300 hover:scale-105 active:scale-95 
                       transition-all duration-200"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
