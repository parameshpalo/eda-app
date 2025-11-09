import React, { useRef, useEffect, useState } from "react";
import FilterSelect from "./FilterSelect";
import { Filters } from "../assets/types";

type DataTab = "Brand" | "PPG" | "Pack Type" | "Brand X Pack Type X PPG" | "Correlation and Trends";

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  activeTab: DataTab;
  setActiveTab: (tab: DataTab) => void;
}

const TABS : DataTab[] = [
  "Brand",
  "Pack Type",
  "PPG",
  "Brand X Pack Type X PPG",
  "Correlation and Trends",
];

const CHANNELS = ["Supermarkets", "Tesco", "Convenience", "Iceland"];
const BRANDS = Array.from({ length: 6 }, (_, i) => `Brand ${i + 1}`);
const PACK_TYPES = ["Small", "Medium", "Large"];
const PPGS = [
  "Small Single",
  "Small Multi",
  "Small SNAP POTS",
  "Standard Single",
  "Standard Multi",
  "Others",
];
const YEARS = [2021, 2022, 2023, 2024];

const normalizeFilters = (input?: Filters): Filters => ({
  brand: [...(input?.brand ?? [])],
  year: [...(input?.year ?? [])],
  pack_type: [...(input?.pack_type ?? [])],
  ppg: [...(input?.ppg ?? [])],
  channel: [...(input?.channel ?? [])],
  groupMode: input?.groupMode,
});

const clearFilters = (tab: string): Filters => ({
  brand: [],
  year: [],
  pack_type: [],
  ppg: [],
  channel: [],
  groupMode: tab === "PPG" ? "ppg" : "brand",
});

export default function FilterBar({
  filters,
  setFilters,
  activeTab,
  setActiveTab,
}: Props) {
  const [pending, setPending] = useState<Filters>(() => normalizeFilters(filters));
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => setPending(normalizeFilters(filters)), [filters]);

  useEffect(() => {
    const cleared = clearFilters(activeTab);
    setPending(cleared);
    setFilters(cleared);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // setFilters is a setState function and is stable, no need to include it

  useEffect(() => {
    const tab = tabRefs.current[activeTab];
    if (!tab) return setIndicatorStyle({});
    setIndicatorStyle({
      width: `${tab.offsetWidth}px`,
      transform: `translateX(${tab.offsetLeft}px)`,
    });
  }, [activeTab]);

  const updateFilter = (key: keyof Filters, value: string[]) =>
    setPending((prev) => ({ ...prev, [key]: value }));

  const apply = () => {
    const updated = normalizeFilters(pending);
    updated.groupMode = activeTab === "PPG" ? "ppg" : "brand";
    setFilters(updated);
  };

  const reset = () => {
    const cleared = clearFilters(activeTab);
    setPending(cleared);
    setFilters(cleared);
  };

  const renderSelect = (
    label: string,
    key: keyof Filters,
    items: (string | number)[]
  ) => (
    <FilterSelect
      label={label}
      value ={pending[key] ?? []}
      options={items.map((i) => ({ label: String(i), value: String(i) }))}
      onChange={(v) => updateFilter(key, v)}
    />
  );


  return (
    <div>
      {/* Tabs */}
      <div className="relative mb-4">
        <div className="flex space-x-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              ref={(el) => {(tabRefs.current[tab] = el)}}
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
        {renderSelect("Channel", "channel", CHANNELS)}
        {renderSelect("Brand", "brand", BRANDS)}
        {renderSelect("Pack Type", "pack_type", PACK_TYPES)}
        {renderSelect("PPG", "ppg", PPGS)}
        {renderSelect("Year", "year", YEARS)}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={apply}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-sm 
                       hover:bg-yellow-600 hover:scale-105 active:scale-95 
                       transition-all duration-200"
          >
            Apply
          </button>
          <button
            onClick={reset}
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
