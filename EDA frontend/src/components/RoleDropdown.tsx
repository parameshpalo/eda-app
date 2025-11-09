import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

type Role = "user" | "admin";

export default function RoleDropdown({ 
  value, 
  onChange 
}: { 
  value: Role; 
  onChange: (v: Role) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = [
    { label: "User", value: "user" as Role },
    { label: "Admin", value: "admin" as Role },
  ];

  const selected = options.find((o) => o.value === value)?.label;

  return (
    <div
      className="relative inline-block text-left w-full"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex justify-between items-center rounded-lg bg-white py-2 px-3 w-full
                   text-sm text-gray-700 shadow-sm border border-gray-300
                   focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                   transition hover:shadow-md"
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
            type="button"
            onClick={() => {
              onChange(opt.value);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-900 transition-colors"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

