import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { FilterOption } from "../assets/types";

interface HoverDropdownProps {
  label: string;
  value: string; // 👈 added
  options: FilterOption[];
  onChange: (value: string) => void;
}

export default function FilterSelect({ label, value, options, onChange }: HoverDropdownProps) {
  const [open, setOpen] = useState(false);

  // find the label for the current value
  const selectedLabel = options.find((opt) => opt.value === value)?.label || "Select option";

  return (
    <div className="flex flex-col min-w-[170px]">
      <label className="text-sm font-medium text-gray-600 mb-1 text-left">{label}</label>

      <div
        className="relative inline-block text-left"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Trigger */}
        <button
          className="inline-flex w-full justify-between items-center rounded-lg bg-white py-2 px-3 
                     text-gray-700 shadow-sm border border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     transition hover:shadow-md"
        >
          <span>{selectedLabel}</span> {/* ✅ shows selected option */}
          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </button>

        {/* Dropdown with smooth slide-down */}
        <div
          className={`absolute left-0 mt-1 w-full origin-top rounded-lg bg-white 
                      shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 
                      overflow-hidden transform transition-all duration-300 ease-out
                      ${open ? "max-h-60 opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-2"}`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false); // close after selecting
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-900"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
