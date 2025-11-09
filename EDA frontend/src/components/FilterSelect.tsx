import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { FilterOption } from "../assets/types";

interface MultiSelectProps {
  label: string;
  value: string[];
  options: FilterOption[];
  onChange: (value: string[]) => void;
}

export default function FilterSelect({
  label,
  value,
  options,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value : [];

  const toggle = (opt: string) =>
    onChange(
      selected.includes(opt)
        ? selected.filter((v) => v !== opt)
        : [...selected, opt]
    );

  const labelText =
    selected.length === 0 || selected.length === options.length
      ? "All"
      : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label
      : `${selected.length} selected`;

  const handleSelectAll = () => onChange(options.map((o) => o.value));
  const handleClear = () => onChange([]);

  return (
    <div className="flex flex-col min-w-[170px]">
      <label className="text-sm font-medium text-gray-600 mb-1 text-left">
        {label}
      </label>

      <div
        className="relative inline-block w-full"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          type="button"
          aria-expanded={open}
          className="inline-flex w-full justify-between items-center rounded-lg bg-white py-2 px-3 
                     text-gray-700 border border-gray-300 shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     transition hover:shadow-md"
        >
          <span>{labelText}</span>
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </button>

        <div
          className={`absolute left-0 mt-1 w-full origin-top rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 
                      z-50 overflow-hidden transition-all duration-200 ease-out
                      ${open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="flex justify-between items-center px-3 py-2 border-b text-sm">
            <button onClick={handleSelectAll} className="text-indigo-600 hover:underline">
              Select All
            </button>
            <button onClick={handleClear} className="text-gray-500 hover:underline">
              Clear
            </button>
          </div>

          {options.map(({ value, label }) => {
            const active = selected.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggle(value)}
                className={`flex items-center w-full px-4 py-2 text-sm text-left transition 
                            ${active ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"}`}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={active}
                  className="mr-2 rounded text-indigo-600 border-gray-300"
                />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
