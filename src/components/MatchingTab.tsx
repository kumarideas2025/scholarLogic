import React, { useState, useMemo } from "react";
import { University } from "../types";

interface MatchingTabProps {
  universities: University[];
  userFilters: {
    gpa: number;
    budget: number;
    destination: string;
    major: string;
  };
}

export function MatchingTab({ universities, userFilters }: MatchingTabProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Local state for interactive filtering sidebar variables
  const [gpaFilter, setGpaFilter] = useState<number>(userFilters.gpa || 3.8);
  const [budgetFilter, setBudgetFilter] = useState<number>(userFilters.budget || 50000);
  const [selectedMajor, setSelectedMajor] = useState<string>("All Majors");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  
  // Card expansions tracking (which cards are currently expanded)
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Watchlist tracker
  const [watchlist, setWatchlist] = useState<string[]>(["univ-stanford"]);

  // Set country toggle
  const toggleCountryOption = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const countriesList = useMemo(() => {
    const list = new Set<string>();
    universities.forEach(u => list.add(u.country));
    return Array.from(list);
  }, [universities]);

  const majorsList = useMemo(() => {
    const list = new Set<string>();
    universities.forEach(u => u.majors.forEach(m => list.add(m)));
    return Array.from(list);
  }, [universities]);

  // Handlers for dynamic math calculation matching weights based on GPA & Budget thresholds
  const computedUniversities = useMemo(() => {
    return universities.map((u) => {
      let score = 90; // baseline

      // GPA delta factor
      const gpaDiff = gpaFilter - u.gpaThreshold;
      if (gpaDiff >= 0.2) score += 8;
      else if (gpaDiff >= 0) score += 3;
      else score -= 15; // penalty if below minimum GPA threshold

      // Budget delta factor (total expense = tuition + living)
      const totalExpense = u.tuition + u.livingCost;
      const budgetDiff = budgetFilter - totalExpense;
      if (budgetDiff >= 10000) score += 5;
      else if (budgetDiff >= 0) score += 2;
      else score -= Math.min(25, Math.floor(Math.abs(budgetDiff) / 1500)); // incremental penalty

      // Study field alignment bonus
      if (selectedMajor !== "All Majors" && u.majors.includes(selectedMajor)) {
        score += 5;
      }

      // bound total percentage rating
      const finalPercentage = Math.max(45, Math.min(99, score));

      return {
        ...u,
        matchPercentage: finalPercentage
      };
    });
  }, [universities, gpaFilter, budgetFilter, selectedMajor]);

  // Apply visual search query queries & checkbox overlays
  const filteredUniversities = useMemo(() => {
    return computedUniversities.filter((u) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        u.name.toLowerCase().includes(query) || 
        u.location.toLowerCase().includes(query) || 
        u.country.toLowerCase().includes(query);

      // 2. Country Match
      const matchesCountry = 
        selectedCountries.length === 0 || 
        selectedCountries.includes(u.country);

      // 3. Major Match
      const matchesMajor = 
        selectedMajor === "All Majors" || 
        u.majors.includes(selectedMajor);

      return matchesSearch && matchesCountry && matchesMajor;
    }).sort((a, b) => b.matchPercentage - a.matchPercentage); // Rank by computed match rate
  }, [computedUniversities, searchQuery, selectedCountries, selectedMajor]);

  const toggleWatchlist = (id: string) => {
    setWatchlist((prev) => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#eee] shadow-none">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-black flex items-center">
            <span>AI Multi-Vector Matcher</span>
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Real-time multi-criteria recommendation engine calibrating academic, language, and pricing parameters.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search universities, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 text-xs bg-[#fbfbfb] border border-neutral-200 rounded-lg focus:border-black focus:outline-none transition leading-normal font-sans"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-[#eee] shadow-none space-y-6">
          <div className="flex items-center border-b border-[#f5f5f5] pb-3">
            <span className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Calibration values</span>
          </div>

          {/* GPA Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-600 font-semibold">Your GPA Rating:</span>
              <span className="font-mono font-bold text-black">{gpaFilter.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="2.5"
              max="4.0"
              step="0.05"
              value={gpaFilter}
              onChange={(e) => setGpaFilter(parseFloat(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>Min (2.50)</span>
              <span>Perfect (4.00)</span>
            </div>
          </div>

          {/* Budget Limit Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-600 font-semibold">Annual Budget Limit:</span>
              <span className="font-mono font-bold text-black">${budgetFilter.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="90000"
              step="2000"
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(parseInt(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>$10,000/yr</span>
              <span>$90,000/yr</span>
            </div>
          </div>

          {/* Field of Study Dropdown */}
          <div className="space-y-2">
            <label className="text-xs text-neutral-600 font-semibold block">Preferred Academic Study:</label>
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-full bg-neutral-50 px-2.5 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-black cursor-pointer font-sans"
            >
              <option value="All Majors">Global/All Field Groups</option>
              {majorsList.sort().map((major) => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>
          </div>

          {/* Destination / Country Checkboxes */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-widest block">
              Destination Focus:
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {countriesList.sort().map((country) => {
                const isChecked = selectedCountries.includes(country);
                return (
                  <label
                    key={country}
                    className="flex items-center space-x-2.5 text-xs text-neutral-600 hover:text-black cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCountryOption(country)}
                      className="rounded text-black focus:ring-black accent-black cursor-pointer h-4 w-4 border-neutral-300"
                    />
                    <span>{country}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Direct reset actions */}
          <button
            onClick={() => {
              setGpaFilter(3.8);
              setBudgetFilter(50000);
              setSelectedMajor("All Majors");
              setSelectedCountries([]);
              setSearchQuery("");
            }}
            id="btn-parameters-reset"
            className="w-full text-center text-[10px] font-mono font-bold tracking-wider text-neutral-500 hover:text-black transition border border-neutral-200 py-2 rounded-lg cursor-pointer hover:bg-neutral-50 bg-white"
          >
            RESET ALL CRITERIA
          </button>
        </div>

        {/* Right Matched Universities List Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
              Matched Academies ({filteredUniversities.length} found)
            </span>
          </div>

          {filteredUniversities.length === 0 ? (
            <div className="bg-white border border-[#eee] rounded-xl p-12 text-center text-neutral-500 space-y-3 shadow-none">
              <h4 className="font-bold text-neutral-800 text-sm">No School Matches Found</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                No institutions fully coordinate under your current criteria. Consider adjusting your cumulative GPA threshold filter or raising the general study budget slider.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUniversities.map((school) => {
                const isExpanded = expandedCardId === school.id;
                const isWatchlisted = watchlist.includes(school.id);
                const isGPAEligible = gpaFilter >= school.gpaThreshold;
                const totalEstimatedAnnualCost = school.tuition + school.livingCost;

                return (
                  <div
                    key={school.id}
                    className="bg-white border border-[#eee] rounded-xl shadow-none hover:border-black transition duration-200 overflow-hidden"
                  >
                    {/* Primary Row Summary */}
                    <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      {/* Image + Meta details */}
                      <div className="flex items-center space-x-4">
                        <img
                          src={school.image}
                          alt={school.name}
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-100 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-sans font-bold text-neutral-900 text-xs sm:text-sm">{school.name}</h3>
                            <span className="text-[9px] bg-neutral-150 text-neutral-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
                              Rank #{school.rank}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3 text-xs text-neutral-400 mt-1">
                            <span className="flex items-center space-x-1 font-medium">
                              <span>{school.location}, {school.country}</span>
                            </span>
                            <span>•</span>
                            <span className="text-neutral-500 font-medium truncate max-w-[200px] md:max-w-xs">
                              {school.majors.slice(0, 2).join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score Metrics + Fast Expansion Button */}
                      <div className="flex items-center justify-between md:justify-end w-full md:w-auto space-x-4 border-t md:border-t-0 border-[#f5f5f5] pt-3 md:pt-0">
                        {/* Match Percentage circular indicator */}
                        <div id={`match-indicator-${school.id}`} className="flex items-center space-x-2">
                          <div className="text-right">
                            <span className="text-[9px] text-neutral-400 block font-mono uppercase font-bold">Match Vector</span>
                            <span className="text-xs font-bold text-black tracking-tight">
                              {school.matchPercentage}% Alignment
                            </span>
                          </div>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs bg-black text-white">
                            {school.matchPercentage}
                          </div>
                        </div>

                        {/* Watchlist Toggle */}
                        <button
                          onClick={() => toggleWatchlist(school.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition duration-150 cursor-pointer ${
                            isWatchlisted 
                              ? "bg-black text-white border-black" 
                              : "bg-white text-neutral-400 border-neutral-200 hover:text-black"
                          }`}
                        >
                          {isWatchlisted ? "SAVED" : "SAVE"}
                        </button>

                        {/* Accordion expand toggle */}
                        <button
                          onClick={() => setExpandedCardId(isExpanded ? null : school.id)}
                          id={`school-expand-${school.id}`}
                          className="flex items-center space-x-1 bg-white hover:bg-neutral-50 text-neutral-800 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition border border-neutral-250"
                        >
                          <span>{isExpanded ? "HIDE DETAILS" : "REVIEW METRICS"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable detailed advisor metrics & pitch justify */}
                    {isExpanded && (
                      <div className="bg-[#fafafa] border-t border-[#f5f5f5] p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Financials list */}
                          <div className="bg-white p-4 border border-[#eee] rounded-lg space-y-3 shadow-none font-sans">
                            <span className="text-[9px] font-mono tracking-wider uppercase font-extrabold text-neutral-400 flex items-center">
                              <span>Pricing & Costs / Yr</span>
                            </span>
                            <div className="space-y-1.5 text-xs text-neutral-700">
                              <div className="flex justify-between">
                                <span className="text-neutral-500">Academic Tuition:</span>
                                <span className="font-mono font-semibold text-neutral-900">${school.tuition.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-500">Living Costs:</span>
                                <span className="font-mono font-semibold text-neutral-900">${school.livingCost.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between border-t border-[#f2f2f2] pt-2 font-bold text-black">
                                <span>Estimated Total:</span>
                                <span className={`font-mono ${totalEstimatedAnnualCost > budgetFilter ? "text-neutral-500" : "text-black"}`}>
                                  ${totalEstimatedAnnualCost.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Academic Minimum thresholds check */}
                          <div className="bg-white p-4 border border-[#eee] rounded-lg space-y-3 shadow-none font-sans">
                            <span className="text-[9px] font-mono tracking-wider uppercase font-extrabold text-neutral-400 flex items-center">
                              <span>Academic Benchmarks</span>
                            </span>
                            <div className="space-y-1.5 text-xs text-neutral-700">
                              <div className="flex justify-between items-center">
                                <span className="text-neutral-500">GPA Cutoff:</span>
                                <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                                  isGPAEligible ? "text-neutral-800 bg-[#f0f0f0]" : "text-neutral-500 bg-neutral-100"
                                }`}>
                                  {school.gpaThreshold} Need ({gpaFilter.toFixed(2)} Got)
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-500">IELTS Cutoff:</span>
                                <span className="font-mono font-bold">{school.ieltsThreshold}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-500">Alternative TOEFL:</span>
                                <span className="font-mono font-bold">{school.toeflThreshold}</span>
                              </div>
                            </div>
                          </div>

                          {/* Recommended Scholarships & Funding */}
                          <div className="bg-white p-4 border border-[#eee] rounded-lg space-y-3 shadow-none flex flex-col justify-between font-sans">
                            <div>
                              <span className="text-[9px] font-mono tracking-wider uppercase font-extrabold text-neutral-400 flex items-center">
                                <span>Recommended Grant Match</span>
                              </span>
                              <h4 className="text-xs font-bold text-neutral-900 mt-2 line-clamp-1">
                                {school.popularScholarship}
                              </h4>
                              <p className="text-[10px] text-neutral-400 leading-normal mt-0.5">
                                Fully coordinated with host country {school.country} requirements.
                              </p>
                            </div>
                            <span className="text-[9px] font-mono bg-neutral-900 text-white py-0.5 px-2 rounded font-bold self-start mt-1.5 uppercase">
                              Merit waiver eligible
                            </span>
                          </div>
                        </div>

                        {/* AI Recommends Explanation Panel (The visual showcase matching standard mocks) */}
                        <div className="bg-neutral-900 text-white p-4 rounded-xl flex items-start space-x-3">
                          <div className="space-y-1 flex-1">
                            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono text-[10px]">
                              ScholarLogic AI Justification Pitch
                            </span>
                            <p className="text-xs text-neutral-200 leading-relaxed font-sans mt-1">
                              {school.aiJustification}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 border-t border-neutral-800 pt-2 text-[10px] font-mono text-neutral-400 font-bold">
                              <span className="flex items-center space-x-1">
                                <span>Core syllabus matches preferences</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>Direct advisor mentorship available</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
