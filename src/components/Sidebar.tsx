import React from "react";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  profileStrength: number;
}

export function Sidebar({ currentTab, setTab, profileStrength }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Dashboard" },
    { id: "matcher", label: "Smart Matcher" },
    { id: "profile", label: "Profile Builder" },
    { id: "counselor", label: "AI Counselor" },
  ];

  return (
    <aside className="w-64 bg-white text-neutral-850 flex flex-col border-r border-[#eaeaea] h-full flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#eaeaea] flex items-center space-x-3 bg-white">
        <div className="w-8 h-8 bg-neutral-950 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-mono font-bold">SL</span>
        </div>
        <div>
          <h1 className="font-sans font-bold text-sm tracking-tight text-neutral-900 uppercase">
            SCHOLARLOGIC
          </h1>
          <p className="text-[9px] font-mono text-neutral-400 tracking-widest uppercase">ADMISSIONS SUITE</p>
        </div>
      </div>

      {/* Navigation Rails with Text-Only Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#f5f5f5] text-black border-l-2 border-black pl-3.5 font-bold"
                  : "text-neutral-500 hover:text-black hover:bg-[#fafafa]"
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Profile Calibration Tracker */}
      <div className="p-4 mx-4 mb-4 bg-white rounded-xl border border-[#eaeaea]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-neutral-700">Profile Progress</span>
          </div>
          <span className="text-xs font-mono text-neutral-900 font-bold">{profileStrength}%</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-[#f0f0f0] h-1.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-black h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${profileStrength}%` }}
          />
        </div>

        <p className="text-[10px] text-neutral-500 leading-normal font-sans">
          {profileStrength < 100 
            ? "Calibrate standards and research activities for top-tier acceptances."
            : "Optimized! Matched candidate model actively synced."
          }
        </p>
      </div>

      {/* Interactive Counselor Card Info */}
      <div className="p-4 border-t border-[#eaeaea] flex items-center space-x-3 bg-white">
        <div className="relative flex-shrink-0">
          <img
            src="https://picsum.photos/seed/sophiamiller/100/100"
            alt="Dr. Sophia Miller"
            className="w-9 h-9 rounded-full border border-neutral-100 object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-neutral-900 border-2 border-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0 font-sans">
          <h4 className="text-xs font-semibold text-neutral-900 truncate">Dr. Sophia Miller</h4>
          <p className="text-[9px] text-neutral-400 font-mono tracking-wider uppercase truncate">Admissions Advisor</p>
        </div>
      </div>
    </aside>
  );
}
