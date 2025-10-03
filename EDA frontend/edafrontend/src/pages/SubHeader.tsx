import { useEffect, useRef, useState } from "react";

interface SubHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SubHeader({ activeTab, setActiveTab }: SubHeaderProps) {
  const tabs = ["Trends", "CSF Results", "Scenario Planning"];

  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const currentTab = tabRefs.current[activeTab];
    if (currentTab) {
      setIndicatorStyle({
        width: currentTab.offsetWidth,
        height: currentTab.offsetHeight - 10,
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

        <div className="relative bg-gray-200 border-b">
          <div className="flex items-center space-x-2 relative">
            <span
              className="absolute left-0 bg-white shadow rounded-md transition-all duration-300 ease-in-out z-0"
              style={{
                ...indicatorStyle,
                top: "50%",
                transform: `${(indicatorStyle as any).transform} translateY(-50%)`,
              }}
            />

            {tabs.map((tab) => (
              <button
                key={tab}
                ref={(el: HTMLButtonElement | null) => {
                  tabRefs.current[tab] = el;
                }}
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
