import { ChevronDownIcon } from "@heroicons/react/20/solid";
import React, { useMemo, useRef, useState } from "react";
import { FilterOption } from "../assets/types";

interface MultiSelectProps {
  label: string;
  value: string[]; // multiple selections
  options: FilterOption[];
  onChange: (value: string[]) => void;
}

/** Small selected chips component (inline so no extra file) */
function SelectedChips({
  values,
  maxVisible = 3,
  onRemove,
}: {
  values: string[];
  maxVisible?: number;
  onRemove: (v: string) => void;
}) {
  const visible = values.slice(0, maxVisible);
  const hidden = values.slice(maxVisible);

  return (
    <div className="flex items-center gap-2 flex-wrap min-w-0">
      {visible.map((v) => (
        <span
          key={v}
          className="flex items-center gap-2 bg-white/90 border border-gray-200 px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm"
          title={v}
        >
          <span className="max-w-[10rem] truncate">{v}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(v);
            }}
            className="ml-1 -mr-1 p-1 rounded-full hover:bg-gray-100"
            aria-label={`Remove ${v}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}

      {hidden.length > 0 && (
        <span
          className="bg-gray-100 text-sm text-gray-700 px-3 py-1 rounded-full cursor-default"
          title={hidden.join(", ")}
        >
          +{hidden.length} more
        </span>
      )}
    </div>
  );
}

export default function FilterSelect({ label, value, options, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const safeValue = Array.isArray(value) ? value : [];
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const toggleOption = (opt: string) => {
    if (safeValue.includes(opt)) {
      onChange(safeValue.filter((v) => v !== opt)); // remove if selected
    } else {
      onChange([...safeValue, opt]); // add if not selected
    }
  };

  const clearAll = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange([]);
  };

  // helpful memoized strings
  const displayCount = safeValue.length;
  const displayText = useMemo(() => {
    if (displayCount === 0) return "Select options";
    // don't show long joined text; chips will show
    return `${displayCount} selected`;
  }, [displayCount]);

  return (
    <div className="flex flex-col min-w-[170px]">
      <label className="text-sm font-medium text-gray-600 mb-1 text-left">{label}</label>

      <div className="relative inline-block text-left w-full">
        {/* Trigger */}
        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex w-full justify-between items-center rounded-lg bg-white py-2 px-3 
                     text-gray-700 shadow-sm border border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     transition hover:shadow-md min-w-0"
        >
          <div className="flex-1 min-w-0">
            {safeValue.length === 0 ? (
              <span className="text-sm text-gray-400">{displayText}</span>
            ) : (
              <SelectedChips
                values={safeValue}
                maxVisible={2}
                onRemove={(v) => onChange(safeValue.filter((x) => x !== v))}
              />
            )}
          </div>

          <div className="flex items-center ml-3 gap-2">
            {safeValue.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll(e);
                }}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full hover:bg-gray-200"
                title="Clear all"
              >
                Clear
              </button>
            )}
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
              {safeValue.length}
            </span>
            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute left-0 mt-2 w-full rounded-lg bg-white shadow-lg z-50 
                       ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto"
            role="listbox"
          >
            {/* optional quick actions */}
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(options.map((o) => o.value));
                  }}
                  className="text-xs px-2 py-1 rounded hover:bg-gray-100"
                >
                  Select all
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll(e);
                  }}
                  className="text-xs px-2 py-1 rounded hover:bg-gray-100"
                >
                  Clear
                </button>
              </div>
              <div className="text-xs text-gray-500">{options.length} options</div>
            </div>

            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleOption(opt.value)}
                className="flex items-center w-full text-left px-4 py-2 text-sm 
                           text-gray-700 hover:bg-indigo-50 transition"
              >
                <input
                  type="checkbox"
                  checked={safeValue.includes(opt.value)}
                  readOnly
                  className="mr-2 rounded text-indigo-600 border-gray-300"
                />
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
