import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { OverviewTab } from "./components/OverviewTab";
import { MatchingTab } from "./components/MatchingTab";
import { ProfileBuilderTab } from "./components/ProfileBuilderTab";
import { CounselorTab } from "./components/CounselorTab";
import { getUniversities, getScholarships, getActivities, getDeadlines } from "./services/catalog";
import { University, Scholarship, Activity, DeadlineItem } from "./types";

export default function App() {
  // Navigation tabs state switcher
  const [currentTab, setCurrentTab] = useState("overview");

  // Global user filters parameters
  const [userFilters, setUserFilters] = useState({
    gpa: 3.82,
    budget: 45000,
    destination: "USA & Canada",
    major: "Computer Science"
  });

  // Strength calibration tracking (out of 100)
  const [profileStrength, setProfileStrength] = useState(85);

  // Catalog data fetched from the live backend API
  const [universities, setUniversities] = useState<University[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userName, setUserName] = useState("Kowshik Sarker");
  const [isEditingName, setIsEditingName] = useState(false);

  // Load catalog content from the API on mount
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [u, s, a, d] = await Promise.all([
          getUniversities(),
          getScholarships(),
          getActivities(),
          getDeadlines(),
        ]);
        if (!active) return;
        setUniversities(u);
        setScholarships(s);
        setActivities(a);
        setDeadlines(d);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-[#fcfcfc] overflow-hidden font-sans">
      {/* Dynamic Left Nav sidebar rail */}
      <Sidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
        profileStrength={profileStrength}
      />

      {/* Main Dashboard body content area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* Top Header Panel Section */}
        <header className="bg-white border-b border-[#eaeaea] px-8 py-4 flex items-center justify-between flex-shrink-0 z-10">
          <div>
            <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
              Candidate Workspace
            </span>
            <div className="flex items-center space-x-2 mt-0.5">
              <h1 className="text-sm font-bold text-neutral-900 tracking-tight">SCHOLARLOGIC STRATEGIC SUITE</h1>
              <span className="bg-neutral-100 text-neutral-800 border border-neutral-200 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider">
                V3.5 PROD
              </span>
            </div>
          </div>

          {/* User account details controls with text status indicators */}
          <div className="flex items-center space-x-5">
            <button className="relative px-2.5 py-1 text-xs font-mono font-bold text-neutral-500 hover:text-neutral-900 transition border border-neutral-250 rounded-lg cursor-pointer bg-white">
              <span>ALERTS: 2</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-neutral-900 border border-white rounded-full" />
            </button>
            <div className="flex items-center space-x-3.5 border-l border-[#eaeaea] pl-5">
              <div className="text-right hidden sm:block">
                {isEditingName ? (
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setIsEditingName(false);
                      }}
                      autoFocus
                      className="text-xs font-bold text-neutral-900 border border-neutral-300 rounded px-1.5 py-0.5 max-w-[130px] focus:outline-none focus:border-black"
                    />
                    <button onClick={() => setIsEditingName(false)} className="text-[10px] text-green-600 hover:text-green-800 font-bold cursor-pointer">✔</button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingName(true)}
                    className="cursor-pointer group flex items-center justify-end space-x-1"
                    title="Click to edit advisee name"
                  >
                    <span className="text-xs font-bold text-neutral-900 block truncate group-hover:underline">{userName}</span>
                    <span className="text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
                  </div>
                )}
                <span className="text-[10px] font-mono text-neutral-400 font-medium">Standard US Core Profile</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-mono text-[11px] font-bold">
                {getInitials(userName)}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab Router */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#fcfcfc]">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-neutral-400 font-mono text-sm">
                Loading…
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64 text-red-500 font-mono text-sm text-center px-4">
                Failed to load: {error}
              </div>
            ) : (
              <>
                {currentTab === "overview" && (
                  <OverviewTab
                    universities={universities}
                    scholarships={scholarships}
                    activities={activities}
                    deadlines={deadlines}
                    setDeadlines={setDeadlines}
                    profileStrength={profileStrength}
                    userName={userName}
                    setTab={setCurrentTab}
                  />
                )}

                {currentTab === "matcher" && (
                  <MatchingTab
                    universities={universities}
                    userFilters={userFilters}
                  />
                )}

                {currentTab === "profile" && (
                  <ProfileBuilderTab
                    userFilters={userFilters}
                    setUserFilters={setUserFilters}
                    setProfileStrength={setProfileStrength}
                    userName={userName}
                    setUserName={setUserName}
                  />
                )}

                {currentTab === "counselor" && (
                  <CounselorTab />
                )}
              </>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
