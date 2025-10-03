import React, { useRef, useEffect, useState } from "react";
import { Filters } from "../assets/types";
import FilterSelect from "./FilterSelect";

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
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

  // typed as React.CSSProperties to satisfy `style` prop
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  // cast initial {} so TS knows current will be a Record<string, HTMLButtonElement | null>
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>(
    {} as Record<string, HTMLButtonElement | null>
  );

  useEffect(() => {
    const currentTab = tabRefs.current[activeTab];

    if (currentTab) {
      // measure after layout to avoid 0 width/left race conditions
      requestAnimationFrame(() => {
        setIndicatorStyle({
          width: `${currentTab.offsetWidth}px`, // string with px ensures CSS typing
          transform: `translateX(${currentTab.offsetLeft}px)`,
        });
      });
    } else {
      // reset if tab not found
      setIndicatorStyle({});
    }
  }, [activeTab]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters({ ...filters, [key]: value === "All" ? undefined : value });
  };

  const resetFilters = () => setFilters({} as Filters);

  return (
    <div>
      {/* Tabs */}
      <div className="relative mb-4">
        <div className="flex space-x-6 relative">
          {tabs.map((tab) => (
            <button
              key={tab}
              ref={(el) => {
                // explicit typing for el helps TS inference
                tabRefs.current[tab] = el;
              }}
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
          value={filters.channel || "All"}
          options={[
            { label: "All", value: "All" },
            { label: "Retail", value: "Retail" },
            { label: "Online", value: "Online" },
          ]}
          onChange={(v) => updateFilter("channel", v)}
        />

        <FilterSelect
          label="Brand"
          value={filters.brand || "All"}
          options={[
            { label: "All", value: "All" },
            { label: "Brand 1", value: "Brand 1" },
            { label: "Brand 2", value: "Brand 2" },
            { label: "Brand 3", value: "Brand 3" },
            { label: "Brand 4", value: "Brand 4" },
          ]}
          onChange={(v) => updateFilter("brand", v)}
        />

        <FilterSelect
          label="Pack Type"
          value={filters.pack_type || "All"}
          options={[
            { label: "All", value: "All" },
            { label: "Small", value: "Small" },
            { label: "Medium", value: "Medium" },
            { label: "Large", value: "Large" },
          ]}
          onChange={(v) => updateFilter("pack_type", v)}
        />

        <FilterSelect
          label="PPG"
          value={filters.ppg || "All"}
          options={[
            { label: "All", value: "All" },
            { label: "PPG 1", value: "PPG1" },
            { label: "PPG 2", value: "PPG2" },
          ]}
          onChange={(v) => updateFilter("ppg", v)}
        />

        <FilterSelect
          label="Year"
          value={filters.year || "All"}
          options={[
            { label: "All", value: "All" },
            { label: "2021", value: "2021" },
            { label: "2022", value: "2022" },
            { label: "2023", value: "2023" },
          ]}
          onChange={(v) => updateFilter("year", v)}
        />

        {/* Reset */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1 text-left">&nbsp;</label>
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 
                       rounded-lg shadow-sm hover:bg-gray-100 hover:scale-105 active:scale-95
                       transition-all duration-200 ease-in-out"
          >
            {/* icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12a7.5 7.5 0 1112.6 5.3l2.4 2.4m-2.4-2.4L15 17.25" />
            </svg>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
