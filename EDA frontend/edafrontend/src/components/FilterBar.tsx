import React, { useRef, useEffect, useState } from "react";
import { Filters } from "../assets/types";
import FilterSelect from "./FilterSelect";

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/** Ensure filters object always has arrays for keys */
function normalizeFilters(input?: Filters): Filters {
  return {
    brand: input?.brand ? [...input.brand] : [],
    year: input?.year ? [...input.year] : [],
    pack_type: input?.pack_type ? [...input.pack_type] : [],
    ppg: input?.ppg ? [...input.ppg] : [],
    channel: input?.channel ? [...input.channel] : [],
  };
}

export default function FilterBar({
  filters,
  setFilters,
  activeTab,
  setActiveTab,
}: Props) {
  const tabs: string[] = [
    "Brand",
    "Pack Type",
    "PPG",
    "Brand X Pack Type X PPG",
    "Correlation and Trends",
  ];

  // underline animation for tabs
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>(
    {} as Record<string, HTMLButtonElement | null>
  );

  // local pending filters (applied only after "Apply")
  const [pendingFilters, setPendingFilters] = useState<Filters>(() => normalizeFilters(filters));

  // keep pendingFilters in sync if parent `filters` changes from outside
  useEffect(() => {
    setPendingFilters(normalizeFilters(filters));
  }, [filters]);

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
    setFilters(normalizeFilters(pendingFilters));
  };

  const resetFilters = () => {
    const cleared: Filters = {
      brand: [],
      year: [],
      pack_type: [],
      ppg: [],
      channel: [],
    };
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
                activeTab === tab ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
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
          value={pendingFilters.channel || []}
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
          value={pendingFilters.brand || []}
          options={[
            { label: "Brand 1", value: "Brand 1" },
            { label: "Brand 2", value: "Brand 2" },
            { label: "Brand 3", value: "Brand 3" },
            { label: "Brand 4", value: "Brand 4" },
            { label: "Brand 5", value: "Brand 5" },
            { label: "Brand 6", value: "Brand 6" },
          ]}
          onChange={(v) => updatePendingFilter("brand", v)}
        />

        <FilterSelect
          label="Pack Type"
          value={pendingFilters.pack_type || []}
          options={[
            { label: "Small", value: "Small" },
            { label: "Medium", value: "Medium" },
            { label: "Large", value: "Large" },
          ]}
          onChange={(v) => updatePendingFilter("pack_type", v)}
        />

        <FilterSelect
          label="PPG"
          value={pendingFilters.ppg || []}
          options={[
            { label: "Small Single", value: "Small Single" },
            { label: "Small Multi", value: "Small Multi" },
            { label: "Small SNAP POTS", value: "Small SNAP POTS" },
            { label: "Standard Single", value: "Standard Single" },
            { label: "Standard Multi", value: "Standard Multi" },
            { label: "Others", value: "Others" },
          ]}
          onChange={(v) => updatePendingFilter("ppg", v)}
        />

        <FilterSelect
          label="Year"
          value={pendingFilters.year || []}
          options={[
            { label: "2021", value: "2021" },
            { label: "2022", value: "2022" },
            { label: "2023", value: "2023" },
            { label: "2024", value: "2024" }, // fixed value
          ]}
          onChange={(v) => updatePendingFilter("year", v)}
        />

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm 
                     hover:bg-indigo-700 hover:scale-105 active:scale-95 
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
