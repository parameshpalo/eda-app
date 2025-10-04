import { ChevronDownIcon } from "@heroicons/react/20/solid";
import React, { useState } from "react";
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
  const safeValue = Array.isArray(value) ? value : [];

  const toggleOption = (opt: string) => {
    onChange(
      safeValue.includes(opt)
        ? safeValue.filter((v) => v !== opt)
        : [...safeValue, opt]
    );
  };

  const displayText =
    safeValue.length === 0
      ? "All"
      : safeValue.length === 1
      ? options.find((o) => o.value === safeValue[0])?.label
      : `${safeValue.length} selected`;

  return (
    <div className="flex flex-col min-w-[170px]">
      <label className="text-sm font-medium text-gray-600 mb-1 text-left">
        {label}
      </label>

      <div
        className="relative inline-block text-left w-full"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Trigger */}
        <button
          type="button"
          aria-expanded={open}
          aria-label={`Select ${label}`}
          className="inline-flex w-full justify-between items-center rounded-lg bg-white py-2 px-3 
                     text-gray-700 shadow-sm border border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     transition hover:shadow-md"
        >
          <span>{displayText}</span>
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </button>

        {/* Dropdown */}
        <div
          className={`absolute left-0 mt-1 w-full origin-top rounded-lg bg-white shadow-lg 
                      ring-1 ring-black ring-opacity-5 z-50 overflow-hidden 
                      transition-all duration-200 ease-out
                      ${open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="flex justify-between items-center px-3 py-2 border-b text-sm">
            <button
              onClick={() => onChange(options.map((o) => o.value))}
              className="text-indigo-600 hover:underline"
            >
              Select All
            </button>
            <button onClick={() => onChange([])} className="text-gray-500 hover:underline">
              Clear
            </button>
          </div>

          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleOption(opt.value)}
              className={`flex items-center w-full px-4 py-2 text-sm text-left transition
                ${
                  safeValue.includes(opt.value)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <input
                type="checkbox"
                readOnly
                checked={safeValue.includes(opt.value)}
                className="mr-2 rounded text-indigo-600 border-gray-300"
              />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
