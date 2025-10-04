import { useEffect, useRef, useState } from "react";
import { Tab } from "../assets/types";

interface SubHeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const tabs: Tab[] = ["Trends", "CSF Results", "Scenario Planning"];

export default function SubHeader({ activeTab, setActiveTab }: SubHeaderProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]); // array of refs

  useEffect(() => {
    const idx = tabs.indexOf(activeTab);
    const currentTab = tabRefs.current[idx];
    if (currentTab) {
      setIndicatorStyle({
        width: currentTab.offsetWidth,
        transform: `translateX(${currentTab.offsetLeft}px)`,
      });
    }
  }, [activeTab]);

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Consumer Surplus Factor (CSF)
        </h2>

        <div className="relative bg-gray-200 border-b rounded-md">
          <div className="flex items-center space-x-2 relative">
            {/* Active Tab Indicator */}
            <span
              className="absolute left-0 bg-white shadow rounded-md transition-all duration-300 ease-in-out z-0"
              style={{
                ...indicatorStyle,
                height: "calc(100% - 8px)",
                top: "4px",
              }}
            />
            {tabs.map((tab, i) => (
              <button
                key={tab}
                ref={(el) => {(tabRefs.current[i] = el)}}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium relative z-10 transition-colors ${
                  activeTab === tab
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
