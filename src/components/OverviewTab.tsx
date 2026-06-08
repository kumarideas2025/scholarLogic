import React, { useState } from "react";
import { University, Scholarship, Activity, DeadlineItem } from "../types";

interface OverviewTabProps {
  universities: University[];
  scholarships: Scholarship[];
  activities: Activity[];
  deadlines: DeadlineItem[];
  setDeadlines: React.Dispatch<React.SetStateAction<DeadlineItem[]>>;
  profileStrength: number;
  userName: string;
  setTab: (tab: string) => void;
}

export function OverviewTab({
  universities,
  scholarships,
  activities,
  deadlines,
  setDeadlines,
  profileStrength,
  userName,
  setTab
}: OverviewTabProps) {
  
  // Custom interactive state for SVG chart tooltip
  const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null);

  // Toggle deadline items
  const toggleDeadline = (id: string) => {
    setDeadlines((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Mock data for Application Velocity chart (6 months of data points)
  const chartData = [
    { month: "Jan", targetApps: 1, submittedApps: 0 },
    { month: "Feb", targetApps: 2, submittedApps: 1 },
    { month: "Mar", targetApps: 4, submittedApps: 2 },
    { month: "Apr", targetApps: 5, submittedApps: 3 },
    { month: "May", targetApps: 6, submittedApps: 5 },
    { month: "Jun", targetApps: 7, submittedApps: 6 },
  ];

  // Calculations for KPI cards
  const matchedUniversitiesCount = universities.filter(u => u.matchPercentage >= 75).length;
  const scholarshipsFoundCount = scholarships.length;
  const activeApplicationsCount = deadlines.length;
  const pendingDeadlinesCount = deadlines.filter((d) => !d.completed).length;

  // Chart measurements for SVG graphing
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  // Calculate coordinates for SVGs
  const getX = (idx: number) => paddingX + (idx * (chartWidth - 2 * paddingX)) / (chartData.length - 1);
  const getY = (val: number) => chartHeight - paddingY - (val * (chartHeight - 2 * paddingY)) / 8;

  // Generate SVG path for the lines
  const targetPointsLine = chartData.map((d, i) => `${getX(i)},${getY(d.targetApps)}`).join(" ");
  const submittedPointsLine = chartData.map((d, i) => `${getX(i)},${getY(d.submittedApps)}`).join(" ");

  return (
    <div className="space-y-8 font-sans">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-[#eee] flex flex-col md:flex-row md:items-center justify-between shadow-none">
        <div className="space-y-2 font-sans">
          <div className="flex items-center space-x-2">
            <span className="bg-[#f0f0f0] text-black text-[10px] font-mono px-2.5 py-0.5 rounded border border-[#e5e5e5] tracking-widest uppercase font-bold">
              AI ADMISSIONS RADAR LIVE
            </span>
          </div>
          <h2 className="text-xl font-bold text-black tracking-tight">
            Welcome back, {userName}
          </h2>
          <p className="text-xs text-neutral-500 max-w-xl leading-relaxed">
            Your university alignment models are updated. The current profile strength is optimal, and {pendingDeadlinesCount} key scholarship deadlines are approaching.
          </p>
        </div>

        <button 
          onClick={() => setTab("profile")}
          id="btn-recalibrate-profile"
          className="mt-4 md:mt-0 flex items-center bg-black hover:bg-neutral-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg border border-black transition duration-200 cursor-pointer shadow-none"
        >
          <span>Recalibrate Profile</span>
        </button>
      </div>

      {/* KPI statistics cards - slick content without icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div id="kpi-score-universities" className="bg-white p-5 rounded-xl border border-[#eee] shadow-none flex flex-col justify-center">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest font-mono">Universities Matched</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-black text-black">{matchedUniversitiesCount}</span>
            <span className="text-[9px] text-[#222] font-mono font-bold bg-[#f5f5f5] px-1.5 py-0.5 rounded border border-neutral-200">
              +2 new
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div id="kpi-score-scholarships" className="bg-white p-5 rounded-xl border border-[#eee] shadow-none flex flex-col justify-center">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest font-mono">Scholarships Sourced</span>
          <div className="flex items-baseline space-x-1.5 mt-1 font-sans">
            <span className="text-2xl font-black text-black">{scholarshipsFoundCount}</span>
            <span className="text-[9px] text-neutral-500 font-bold font-mono">
              $180K+ pool
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div id="kpi-score-applications" className="bg-white p-5 rounded-xl border border-[#eee] shadow-none flex flex-col justify-center">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest font-mono">Active Applications</span>
          <div className="flex items-baseline space-x-1.5 mt-1 font-sans">
            <span className="text-2xl font-black text-black">{activeApplicationsCount}</span>
            <span className="text-[9px] text-neutral-400 font-mono font-medium">Target model</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div id="kpi-score-deadlines" className="bg-white p-5 rounded-xl border border-[#eee] shadow-none flex flex-col justify-center">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest font-mono">Approaching Deadlines</span>
          <div className="flex items-baseline space-x-1 mt-1 font-sans">
            <span className="text-2xl font-black text-black">{pendingDeadlinesCount} pending</span>
          </div>
        </div>
      </div>

      {/* Main analytical grid block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Double Content: Interactive Application Velocity & Budget */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart 1: Application Velocity */}
          <div className="bg-white p-6 rounded-xl border border-[#eee] shadow-none">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Application Milestones Velocity</h3>
                <p className="text-xs text-neutral-500">Milestone projections vs. submitted components</p>
              </div>
              <div className="flex items-center space-x-3 text-[10px] font-mono font-bold uppercase">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-1 bg-[#d4d4d4] rounded-sm" />
                  <span className="text-neutral-400">Monthly Target</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-1 bg-black rounded-sm" />
                  <span className="text-neutral-800">Submitted Items</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="relative w-full overflow-hidden flex flex-col items-center">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full max-w-xl h-44 cursor-default"
              >
                {/* SVG glowing definitions */}
                <defs>
                  <linearGradient id="neutralGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.06"/>
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>

                {/* Grid Gridlines */}
                {[0, 2, 4, 6, 8].map((lvl) => (
                  <line
                    key={lvl}
                    x1={paddingX}
                    y1={getY(lvl)}
                    x2={chartWidth - paddingX}
                    y2={getY(lvl)}
                    className="stroke-[#f5f5f5] stroke-1"
                  />
                ))}

                {/* Subtitle / Axis markers */}
                {chartData.map((d, index) => (
                  <text
                    key={d.month}
                    x={getX(index)}
                    y={chartHeight - 4}
                    className="text-[10px] font-mono fill-neutral-400 font-semibold text-center"
                    textAnchor="middle"
                  >
                    {d.month}
                  </text>
                ))}

                {/* Target Progress Shaded Area & Line */}
                <path
                  d={`M ${paddingX},${getY(0)} L ${targetPointsLine} L ${chartWidth - paddingX},${getY(0)} Z`}
                  fill="url(#neutralGlow)"
                />
                <polyline
                  fill="none"
                  stroke="#d4d4d4"
                  strokeWidth="2"
                  strokeDasharray="4"
                  points={targetPointsLine}
                />

                {/* Submitted Progress Line */}
                <polyline
                  fill="none"
                  stroke="#000000"
                  strokeWidth="3.5"
                  points={submittedPointsLine}
                />

                {/* Interaction Hotspots (vertical trigger slices) */}
                {chartData.map((d, i) => {
                  const x = getX(i);
                  const isHovered = activeChartIndex === i;
                  return (
                    <g 
                      key={i}
                      onMouseEnter={() => setActiveChartIndex(i)}
                      onMouseLeave={() => setActiveChartIndex(null)}
                      className="group cursor-pointer"
                    >
                      {/* Interactive hover column highlight */}
                      <rect
                        x={x - 20}
                        y={paddingY}
                        width="40"
                        height={chartHeight - 2 * paddingY}
                        fill="transparent"
                      />
                      {isHovered && (
                        <line
                          x1={x}
                          y1={paddingY}
                          x2={x}
                          y2={chartHeight - paddingY}
                          className="stroke-black stroke-1 stroke-dashed"
                        />
                      )}
                      
                      {/* Value nodes */}
                      <circle
                        cx={x}
                        cy={getY(d.submittedApps)}
                        r={isHovered ? 5.5 : 3.5}
                        className="fill-white stroke-black stroke-2 transition-all duration-150"
                      />
                      <circle
                        cx={x}
                        cy={getY(d.targetApps)}
                        r={isHovered ? 4.5 : 3}
                        className="fill-white stroke-[#d4d4d4] stroke-2 transition-all duration-150"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Dynamic Tooltip Display */}
              <div className="h-10 mt-2 flex items-center justify-center">
                {activeChartIndex !== null ? (
                  <div className="bg-white text-neutral-900 text-[10px] font-mono border border-[#eee] px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-3 transition-opacity duration-150 uppercase font-bold">
                    <span className="text-neutral-500 font-black">{chartData[activeChartIndex].month}:</span>
                    <span>Target: <b>{chartData[activeChartIndex].targetApps}</b></span>
                    <span className="text-[#eee]">|</span>
                    <span>Submitted: <b>{chartData[activeChartIndex].submittedApps}</b></span>
                  </div>
                ) : (
                  <p className="text-[10px] text-neutral-400 flex items-center font-mono uppercase tracking-wider font-bold">
                    <span>Hover nodes to analyze milestone details</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Budget Utilization Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Box 1: Budget Breakdown Chart */}
            <div className="bg-white p-5 rounded-xl border border-[#eee] shadow-none flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-widest mb-2">Annual Financial Allocation</h3>
                <p className="text-[11px] text-neutral-500 mb-4 leading-normal">Estimated average annual funding for study plans ($35K threshold cap)</p>
              </div>

              {/* Circular Radial Donut display */}
              <div className="flex items-center space-x-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f5f5f5" strokeWidth="3" />
                    {/* Tuition share: 65% (stroke-dasharray="65 35") */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#000000" strokeWidth="3.5" strokeDasharray="65 35" strokeDashoffset="0" />
                    {/* Living cost share: 25% (stroke-dasharray="25 75" offset -65) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#737373" strokeWidth="3.5" strokeDasharray="25 75" strokeDashoffset="-65" />
                    {/* Savings buffer: 10% (stroke-dasharray="10 90" offset -90) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#c3c3c3" strokeWidth="3.5" strokeDasharray="10 90" strokeDashoffset="-90" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-neutral-900">$35K</span>
                    <span className="text-[8px] font-mono text-neutral-400 uppercase">Budget</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2 font-sans">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center space-x-1.5 text-neutral-600">
                      <span className="w-2 h-2 bg-black rounded-sm" />
                      <span>Tuition fee (65%)</span>
                    </span>
                    <span className="font-mono text-neutral-800 font-semibold">$22.7K</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center space-x-1.5 text-neutral-600">
                      <span className="w-2 h-2 bg-[#737373] rounded-sm" />
                      <span>Living cost (25%)</span>
                    </span>
                    <span className="font-mono text-neutral-800 font-semibold">$8.7K</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center space-x-1.5 text-neutral-600">
                      <span className="w-2 h-2 bg-[#c3c3c3] rounded-sm" />
                      <span>Leeway fund (10%)</span>
                    </span>
                    <span className="font-mono text-neutral-800 font-semibold">$3.5K</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Profile Strength Checklist Progress */}
            <div className="bg-white p-5 rounded-xl border border-[#eee] shadow-none flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-widest mb-2">Calibration Tasks</h3>
                <p className="text-[11px] text-neutral-500 mb-3 leading-normal">Complete these to reach 100% precision score</p>
              </div>

              <div className="space-y-1.5 font-sans">
                <div className="flex items-center justify-between text-xs bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                  <span className="text-neutral-700 font-medium">Verify TOEFL/IELTS scores</span>
                  <span className="bg-black text-white px-1.5 py-0.5 rounded font-mono text-[9px] font-bold">DONE</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                  <span className="text-neutral-700 font-medium">Calibrate research experience</span>
                  <span className="bg-neutral-100 text-neutral-600 border border-neutral-200 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold">TODO</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                  <span className="text-neutral-700 font-medium">Submit Draft Statement (SoP)</span>
                  <span className="text-neutral-400 bg-neutral-50 border border-neutral-150 px-1.5 py-0.5 rounded font-mono text-[9px] font-semibold">PENDING</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Dashboard Sidebar: Upcoming Deadlines checklist + Recent Activity */}
        <div className="space-y-6">
          
          {/* Section 1: Deadlines Tracker */}
          <div className="bg-white p-5 rounded-xl border border-[#eee] shadow-none font-sans">
            <div className="flex items-center justify-between mb-4 border-b border-[#f5f5f5] pb-2">
              <h3 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center">
                <span>Scholarship Deadlines</span>
              </h3>
              <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold">Real-time Tracker</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {deadlines.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleDeadline(item.id)}
                  id={`activity-deadline-${item.id}`}
                  className={`flex items-start space-x-3 p-2.5 rounded-lg border transition duration-150 cursor-pointer ${
                    item.completed 
                      ? "bg-neutral-50/50 border-[#eee] opacity-60" 
                      : "bg-white border-[#eee] hover:border-black"
                  }`}
                >
                  <button className="flex-shrink-0 mt-0.5 w-4.5 h-4.5 rounded border border-neutral-300 flex items-center justify-center text-[10px] font-bold text-black font-sans hover:border-black bg-neutral-50 cursor-pointer">
                    {item.completed ? "✓" : " "}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-bold text-neutral-800 leading-snug truncate ${item.completed ? "line-through text-neutral-400 font-medium" : ""}`}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-neutral-500 font-medium truncate mt-0.5">
                      {item.university}
                    </p>
                    {!item.completed && (
                      <span className="inline-block text-[9px] font-mono mt-1 px-1.5 py-0.5 rounded font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 uppercase">
                        {item.daysRemaining} days left
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Recent Activity Timeline */}
          <div className="bg-white p-5 rounded-xl border border-[#eee] shadow-none">
            <h3 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4 border-b border-[#f5f5f5] pb-2">
              Advisor Telemetry Activity
            </h3>

            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex space-x-3 text-xs">
                  <div className="flex flex-col items-center">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      activity.type === "match" ? "bg-black" :
                      activity.type === "document" ? "bg-neutral-600" :
                      activity.type === "scholarship" ? "bg-neutral-400" : "bg-neutral-200"
                    }`} />
                    <span className="w-px h-12 bg-neutral-100" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900">{activity.title}</h4>
                    <p className="text-neutral-500 mt-1 mr-1 leading-snug text-[11px]">{activity.description}</p>
                    <span className="text-[9px] font-mono text-neutral-400 mt-1 block font-bold uppercase">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
