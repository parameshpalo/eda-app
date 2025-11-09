import React from "react";
import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
type GroupMode = "brand" | "channel";


export default function GroupModeDropdown({ value, onChange }: { value: GroupMode; onChange: (v: GroupMode) => void }) {
  const [open, setOpen] = useState(false);
  const options = [
    { label: "Brand", value: "brand" },
    { label: "Channel", value: "channel" },
  ];

  const selected = options.find((o) => o.value === value)?.label;

  return (
    <div
      className="relative inline-block text-left"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="inline-flex justify-between items-center rounded-lg bg-white py-1.5 px-3 
                   text-sm text-gray-700 shadow-sm border border-gray-300
                   focus:outline-none focus:ring-2 focus:ring-indigo-500
                   transition hover:shadow-md min-w-[110px]"
      >
        <span>{selected}</span>
        <ChevronDownIcon className="h-4 w-4 text-gray-400 ml-1" />
      </button>

      <div
        className={`absolute left-0 mt-1 w-full origin-top rounded-lg bg-white 
                    shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden
                    transition-all duration-200 ease-out
                    ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              onChange(opt.value as "sales" | "volume");
              setOpen(false);
            }}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-900"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}


