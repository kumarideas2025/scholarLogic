import React, { useState, useMemo } from "react";

interface ProfileBuilderTabProps {
  userFilters: {
    gpa: number;
    budget: number;
    destination: string;
    major: string;
  };
  setUserFilters: React.Dispatch<React.SetStateAction<{
    gpa: number;
    budget: number;
    destination: string;
    major: string;
  }>>;
  setProfileStrength: React.Dispatch<React.SetStateAction<number>>;
  userName: string;
  setUserName: (name: string) => void;
}

interface AIAnalysisReport {
  pathwayTitle: string;
  overallAssessment: string;
  strengthAnalysis: string[];
  improvementPlan: string[];
  customScholarships: Array<{
    name: string;
    amount: string;
    eligibility: string;
    deadline: string;
    linkDescription: string;
  }>;
  actionableSteps: string[];
}

export function ProfileBuilderTab({ userFilters, setUserFilters, setProfileStrength, userName, setUserName }: ProfileBuilderTabProps) {
  // Form profile values
  const [gpa, setGpa] = useState<number>(userFilters.gpa || 3.8);
  const [testType, setTestType] = useState<string>("TOEFL");
  const [testScore, setTestScore] = useState<number>(105);
  const [selectedMajor, setSelectedMajor] = useState<string>(userFilters.major || "Computer Science");
  const [budget, setBudget] = useState<number>(userFilters.budget || 50000);
  const [researchExp, setResearchExp] = useState<number>(7); // 1-10 scale
  const [extraCurricular, setExtraCurricular] = useState<number>(6); // 1-10 scale
  const [destinationRegion, setDestinationRegion] = useState<string>("USA & Canada");

  // Europass / European standard CV States
  const [cvEmail, setCvEmail] = useState("kowshik.sarker@example.com");
  const [cvPhone, setCvPhone] = useState("+33 6 1234 5678");
  const [cvAddress, setCvAddress] = useState("68 Rue de la Glacière, 75013 Paris, France");
  const [cvMotherTongue, setCvMotherTongue] = useState("English");
  const [cvOtherLanguage, setCvOtherLanguage] = useState("German (Professional)");
  const [cvJobTitle, setCvJobTitle] = useState("Junior Research Assistant");
  const [cvCompany, setCvCompany] = useState("Inria Research Institute, Paris");
  const [cvJobDates, setCvJobDates] = useState("2024 - Present");
  const [cvJobDesc, setCvJobDesc] = useState("Implemented computer vision classifiers and co-authored benchmark publications for deep neural network architectures under Advisor fellowship.");
  const [cvEducationQual, setCvEducationQual] = useState("Bachelor of Science in Computer Science");
  const [cvEducationUni, setCvEducationUni] = useState("University of Paris-Saclay");
  const [cvEducationDates, setCvEducationDates] = useState("2020 - 2024");
  const [cvDigitalSkills, setCvDigitalSkills] = useState("PyTorch, Python, Node.js, TensorFlow, Algorithms, Git");

  // Loading and AI report states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AIAnalysisReport | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<"summary" | "actions" | "scholarships" | "plan">("summary");

  // Calculate dynamic Profile Strength index out of 100
  const computedProfileStrength = useMemo(() => {
    let strength = 30; // base score
    
    // GPA contribution (up to 20 pts)
    strength += Math.round(((gpa - 2.0) / 2.0) * 20);
    
    // Testing contribution (up to 15 pts)
    if (testType === "TOEFL") {
      strength += Math.round((testScore / 120) * 15);
    } else { // IELTS
      strength += Math.round((testScore / 9.0) * 15);
    }
    
    // Research / Extracurriculars contribution (up to 20 pts)
    strength += (researchExp + extraCurricular) * 1.5;
    
    // Budget & major selections calibration completeness (up to 15 pts)
    if (selectedMajor) strength += 7;
    if (budget > 0) strength += 8;

    const finalScore = Math.min(100, Math.max(30, strength));
    // Synced upwards to state
    setProfileStrength(finalScore);
    return finalScore;
  }, [gpa, testType, testScore, researchExp, extraCurricular, selectedMajor, budget, setProfileStrength]);

  // Handle standard profile parameters sync update to primary app context
  const handleApplyChanges = () => {
    setUserFilters({
      gpa: gpa,
      budget: budget,
      destination: destinationRegion,
      major: selectedMajor
    });
  };

  // Trigger Gemini API based profile review report
  const handleRequestAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisReport(null);
    try {
      const response = await fetch("/api/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gpa: gpa,
          englishTest: `${testType}: ${testScore}`,
          budget: budget,
          major: selectedMajor,
          destination: destinationRegion,
          extracurricularRating: extraCurricular,
          researchRating: researchExp
        })
      });

      if (response.ok) {
        const reportData = await response.json();
        setAnalysisReport(reportData);
      } else {
        throw new Error("HTTP connection failed");
      }
    } catch (err) {
      console.error("AI Report failure:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Spider / Radar Chart coordinates mathematics ---
  const cx = 110;
  const cy = 110;
  const maxRadius = 80;

  // Normalized values for 5 points (0.0 to 1.0)
  const normalizedGPA = (gpa - 2.0) / 2.0; 
  const normalizedTests = testType === "TOEFL" ? (testScore - 40) / 80 : (testScore - 4.5) / 4.5;
  const normalizedResearch = researchExp / 10;
  const normalizedExtras = extraCurricular / 10;
  const normalizedBudget = Math.min(1.0, budget / 70000);

  const axesMetrics = [
    { label: "GPA", value: Math.max(0.15, normalizedGPA) },
    { label: "Testing", value: Math.max(0.15, normalizedTests) },
    { label: "Research", value: Math.max(0.15, normalizedResearch) },
    { label: "Activity", value: Math.max(0.15, normalizedExtras) },
    { label: "Funding", value: Math.max(0.15, normalizedBudget) }
  ];

  const getRadarPoint = (index: number, val: number) => {
    const angle = (72 * index * Math.PI) / 180 - Math.PI / 2; 
    const x = cx + maxRadius * val * Math.cos(angle);
    const y = cy + maxRadius * val * Math.sin(angle);
    return `${x},${y}`;
  };

  const radarPointsString = axesMetrics.map((axis, idx) => getRadarPoint(idx, axis.value)).join(" ");

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white p-6 rounded-xl border border-[#eee] shadow-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-black flex items-center">
            <span>Admissions Capability Modeler</span>
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Calibrate academic ratings to watch your eligibility spider vertices update in real-time.
          </p>
        </div>
        <div className="bg-black border border-black px-4 py-2 rounded-lg flex items-center">
          <span className="text-xs font-bold text-white font-mono">
            Acceptance Weight: {computedProfileStrength}%
          </span>
        </div>
      </div>

      {/* Main Form + Radar Split Screen Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form: parameters tuning */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#eee] shadow-none space-y-5">
          <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-[#f5f5f5] pb-2 flex items-center font-mono">
            <span>Calibration Values</span>
          </h3>

          {/* Advisee Name Calibration Field */}
          <div className="space-y-1.5 border-b border-[#f9f9f9] pb-2">
            <label className="text-xs text-neutral-600 font-semibold block">Advisee / Candidate Name:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Kowshik Sarker"
              className="w-full bg-[#fbfbfb] border border-neutral-200 px-3.5 py-2 text-xs font-semibold rounded-lg focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* GPA Input Select */}
            <div className="space-y-1.5 align-middle">
              <label className="text-xs text-neutral-600 font-semibold block">Cumulative GPA (out of 4.00):</label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="2.0"
                  max="4.0"
                  step="0.01"
                  value={gpa}
                  onChange={(e) => setGpa(Math.min(4.0, Math.max(2.0, parseFloat(e.target.value) || 2.0)))}
                  className="w-16 bg-[#fbfbfb] border border-neutral-200 p-1.5 text-xs text-center font-bold font-mono rounded-lg focus:border-black focus:outline-none"
                />
                <input
                  type="range"
                  min="2.0"
                  max="4.0"
                  step="0.02"
                  value={gpa}
                  onChange={(e) => setGpa(parseFloat(e.target.value))}
                  className="flex-1 accent-black cursor-pointer"
                />
              </div>
            </div>

            {/* Language Test Selector */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 space-y-1.5">
                <label className="text-xs text-neutral-600 font-semibold block">Scheme:</label>
                <select
                  value={testType}
                  onChange={(e) => {
                    setTestType(e.target.value);
                    setTestScore(e.target.value === "TOEFL" ? 100 : 7.0);
                  }}
                  className="w-full bg-[#fbfbfb] border border-neutral-200 p-1.5 text-xs rounded-lg font-bold focus:border-black focus:outline-none font-sans"
                >
                  <option value="TOEFL">TOEFL</option>
                  <option value="IELTS">IELTS</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-xs text-neutral-600 font-semibold block">Target Score:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={testType === "TOEFL" ? 40 : 4.0}
                    max={testType === "TOEFL" ? 120 : 9.0}
                    step={testType === "TOEFL" ? 1 : 0.5}
                    value={testScore}
                    onChange={(e) => setTestScore(parseFloat(e.target.value) || 0)}
                    className="w-14 bg-[#fbfbfb] border border-neutral-200 p-1.5 text-xs text-center font-bold font-mono rounded-lg focus:border-black focus:outline-none"
                  />
                  <input
                    type="range"
                    min={testType === "TOEFL" ? 40 : 4.0}
                    max={testType === "TOEFL" ? 120 : 9.0}
                    step={testType === "TOEFL" ? 1 : 0.5}
                    value={testScore}
                    onChange={(e) => setTestScore(parseFloat(e.target.value))}
                    className="flex-1 accent-black cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Destination region selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-600 font-semibold block">Destination Focus:</label>
              <select
                value={destinationRegion}
                onChange={(e) => setDestinationRegion(e.target.value)}
                className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-lg focus:border-black focus:outline-none font-sans"
              >
                <option value="USA & Canada">USA & Canada (Highly academic / funding)</option>
                <option value="United Kingdom">United Kingdom (Intensive single-year degrees)</option>
                <option value="Europe: Switzerland & Germany">Europe: Switzerland (Elite Low-fee public)</option>
                <option value="Singapore & Asia Pacific">Singapore & Asia Pacific (Global tech hubs)</option>
              </select>
            </div>

            {/* Target Major Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-600 font-semibold block">Area of Specialization:</label>
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-lg focus:border-black focus:outline-none font-sans"
              >
                <option value="Computer Science">Computer Science & AI Systems</option>
                <option value="Robotics Engineering">Robotics & Autonomous Machinery</option>
                <option value="Electrical Engineering">Electrical & Embedded Design</option>
                <option value="Mathematics">Mathematics & Theoretical Systems</option>
                <option value="Finance & Economics">Computational Finance & Economics</option>
                <option value="Biomedical Engineering">Biomedical Engineering & Genomics</option>
              </select>
            </div>

            {/* Funding Capacity Slider */}
            <div className="space-y-1.5 sm:col-span-2 border-t border-[#f5f5f5] pt-3 mt-1">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-600 font-semibold">Maximum Annual Budget Capacity:</span>
                <span className="font-mono font-bold text-black">${budget.toLocaleString()} USD/yr</span>
              </div>
              <input
                type="range"
                min="5000"
                max="80000"
                step="2500"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                <span>$5,000/yr (Self-funding cap)</span>
                <span>$80,000/yr (Max Elite US Unsubsidized)</span>
              </div>
            </div>

            {/* Extras experience indicators */}
            <div className="space-y-1.5 border-t border-[#f5f5f5] pt-3">
              <div className="flex justify-between text-xs border-slate-50">
                <span className="text-neutral-600 font-semibold">Research Experience Level:</span>
                <span className="font-mono text-black font-bold">{researchExp}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={researchExp}
                onChange={(e) => setResearchExp(parseInt(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            <div className="space-y-1.5 border-t border-[#f5f5f5] pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-600 font-semibold">Extracurricular Rating:</span>
                <span className="font-mono text-black font-bold">{extraCurricular}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={extraCurricular}
                onChange={(e) => setExtraCurricular(parseInt(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#f5f5f5] mt-2">
            <button
              onClick={handleApplyChanges}
              id="btn-apply-profile-changes"
              className="px-4 py-2.5 bg-black text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-neutral-800 transition tracking-wide text-center uppercase"
            >
              Apply Filter Selection
            </button>

            <button
              onClick={handleRequestAIAnalysis}
              id="btn-trigger-ai-pathway"
              disabled={isAnalyzing}
              className="px-5 py-2.5 bg-[#222222] hover:bg-black text-white rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition disabled:opacity-50 uppercase tracking-wide"
            >
              <span>{isAnalyzing ? "Processing Advisory..." : "Request AI Strategic Roadmap"}</span>
            </button>
          </div>
        </div>

        {/* Right Columns: Radar SVG and mini summaries banner */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Box 1: SVG Radar Spider Graph */}
          <div className="bg-white p-5 rounded-xl border border-[#eee] shadow-none flex flex-col items-center justify-center">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center mb-3 font-mono">
              Academic Competence Matrix
            </h4>

            {/* Radar Spider component */}
            <div className="relative w-52 h-52">
              <svg viewBox="0 0 220 220" className="w-full h-full transform rotate-18">
                {/* Concentric scale rings */}
                {[0.25, 0.5, 0.75, 1.0].map((scale) => {
                  const scalePoints = axesMetrics.map((axis, i) => getRadarPoint(i, scale)).join(" ");
                  return (
                    <polygon
                      key={scale}
                      points={scalePoints}
                      fill="none"
                      className="stroke-[#f0f0f0] stroke-1"
                    />
                  );
                })}

                {/* Grid spikes direction rays */}
                {axesMetrics.map((axis, i) => {
                  const edge = getRadarPoint(i, 1.0);
                  const [ex, ey] = edge.split(",");
                  return (
                    <line
                      key={axis.label}
                      x1={cx}
                      y1={cy}
                      x2={parseFloat(ex)}
                      y2={parseFloat(ey)}
                      className="stroke-[#f0f0f0] stroke-1 stroke-dashed"
                    />
                  );
                })}

                {/* Shaded Active Value Polygon */}
                <polygon
                  points={radarPointsString}
                  fill="#000000"
                  fillOpacity="0.08"
                  className="stroke-black stroke-2 transition-all duration-300"
                />

                {/* Dot vertices indicators */}
                {axesMetrics.map((axis, i) => {
                  const [px, py] = getRadarPoint(i, axis.value).split(",");
                  return (
                    <circle
                      key={i}
                      cx={parseFloat(px)}
                      cy={parseFloat(py)}
                      r="4"
                      className="fill-black stroke-white stroke-2 transition-all duration-300 shadow-sm"
                    />
                  );
                })}

                {/* Labels styling */}
                {axesMetrics.map((axis, i) => {
                  const labelEdge = getRadarPoint(i, 1.22);
                  const [lx, ly] = labelEdge.split(",");
                  return (
                    <text
                      key={axis.label}
                      x={parseFloat(lx)}
                      y={parseFloat(ly)}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-neutral-400 font-bold uppercase"
                    >
                      {axis.label}
                    </text>
                  );
                })}
              </svg>
            </div>

            <p className="text-[10px] text-neutral-400 text-center font-mono mt-2 leading-relaxed max-w-xs uppercase">
              FIVE-POINT ADMISSIONS CRITERIA MATRIX MODEL
            </p>
          </div>

          {/* Quick tips box */}
          <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-xl space-y-2.5 font-sans">
            <h4 className="text-[10px] font-extrabold text-neutral-800 uppercase tracking-widest flex items-center font-mono">
              <span>Advisor Guidance Pitch</span>
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              To break into a **90%+ match tier** for Stanford or Cambridge, focus on pulling your research score to at least **8/10**. 
              Use our AI Counselor chat tab to ask Dr. Sophia Miller for guidance on establishing peer-mentored publications.
            </p>
          </div>

        </div>

      </div>

      {/* Renders dynamic AI Strategy Report when loaded */}
      {isAnalyzing && (
        <div className="bg-white border border-[#eee] rounded-xl p-12 text-center text-neutral-500 shadow-none flex flex-col items-center space-y-4">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <div>
            <h4 className="font-bold text-neutral-800 text-sm">Evaluating Academic Index Parameters...</h4>
            <p className="text-xs text-neutral-400 mt-1 font-mono uppercase tracking-wider">
              Calibrating acceptances and grants acceptance scales.
            </p>
          </div>
        </div>
      )}

      {analysisReport && (
        <div className="bg-white border border-[#eee] rounded-xl shadow-none overflow-hidden transition duration-300 ease-in-out">
          
          {/* Report Header */}
          <div className="bg-black text-white p-6 border-b border-black flex items-center justify-between">
            <div className="space-y-1 flex-1 pr-4">
              <span className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                VERIFIED AI PATHWAY STRATEGY
              </span>
              <h3 className="text-base font-bold text-white tracking-tight mt-1">{analysisReport.pathwayTitle}</h3>
            </div>
          </div>

          {/* Tabs Switcher row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-b border-[#f5f5f5] bg-[#fafafa]">
            <button
              onClick={() => setActiveReportTab("summary")}
              className={`py-3 px-4 text-xs font-bold border-b-2 text-center cursor-pointer transition ${
                activeReportTab === "summary" 
                  ? "border-black text-black bg-white" 
                  : "border-transparent text-neutral-400 hover:text-black"
              }`}
            >
              EXECUTIVE SYNTHESIS
            </button>
            <button
              onClick={() => setActiveReportTab("actions")}
              className={`py-3 px-4 text-xs font-bold border-b-2 text-center cursor-pointer transition ${
                activeReportTab === "actions" 
                  ? "border-black text-black bg-white" 
                  : "border-transparent text-neutral-400 hover:text-black"
              }`}
            >
              ACADEMIC STRENGTHS
            </button>
            <button
              onClick={() => setActiveReportTab("scholarships")}
              className={`py-3 px-4 text-xs font-bold border-b-2 text-center cursor-pointer transition ${
                activeReportTab === "scholarships" 
                  ? "border-black text-black bg-white" 
                  : "border-transparent text-neutral-400 hover:text-black"
              }`}
            >
              TAILORED GRANTS
            </button>
            <button
              onClick={() => setActiveReportTab("plan")}
              className={`py-3 px-4 text-xs font-bold border-b-2 text-center cursor-pointer transition ${
                activeReportTab === "plan" 
                  ? "border-black text-black bg-white" 
                  : "border-transparent text-neutral-400 hover:text-black"
              }`}
            >
              6-MONTH ACTION PLAN
            </button>
          </div>

          {/* Active Tab Panel details */}
          <div className="p-6">
            
            {activeReportTab === "summary" && (
              <div className="space-y-4">
                <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-lg">
                  <h4 className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider mb-1.5 font-mono">Executive Synthesis</h4>
                  <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                    {analysisReport.overallAssessment}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-lg space-y-2">
                    <h5 className="text-[10px] font-bold text-black uppercase tracking-wider font-mono">Core Strengths found</h5>
                    <ul className="space-y-1.5 text-xs text-neutral-600">
                      {analysisReport.strengthAnalysis.slice(0, 2).map((st, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-black font-extrabold mt-0.5">•</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-lg space-y-2">
                    <h5 className="text-[10px] font-bold text-black uppercase tracking-wider font-mono">Strategic enhancements</h5>
                    <ul className="space-y-1.5 text-xs text-neutral-600">
                      {analysisReport.improvementPlan.slice(0, 2).map((st, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-black font-extrabold mt-0.5">•</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeReportTab === "actions" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-[#f5f5f5] pb-2 font-mono">Profile Strengths highlighted</h4>
                    <div className="space-y-2">
                      {analysisReport.strengthAnalysis.map((str, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-lg bg-[#fafafa] border border-[#eee]">
                          <span className="w-5 h-5 rounded bg-black text-white text-[9px] font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-neutral-700 leading-normal">{str}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-[#f5f5f5] pb-2 font-mono">Enhancement Focus Areas</h4>
                    <div className="space-y-2">
                      {analysisReport.improvementPlan.map((str, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-lg bg-[#fafafa] border border-[#eee]">
                          <span className="w-5 h-5 rounded bg-neutral-200 text-black text-[9px] font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-neutral-700 leading-normal">{str}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeReportTab === "scholarships" && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono mb-2">Specifically Evaluated Awards</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysisReport.customScholarships.map((sch, i) => (
                    <div key={i} className="p-4 border border-[#eee] rounded-lg space-y-3 bg-white shadow-none relative overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono tracking-wider font-extrabold uppercase text-white bg-black px-2 py-0.5 rounded">
                          {sch.amount}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase">DEADLINE: {sch.deadline}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-xs">{sch.name}</h4>
                        <p className="text-[11px] text-neutral-600 leading-normal mt-1.5">
                          <b>Eligibility:</b> {sch.eligibility}
                        </p>
                        <p className="text-[11px] text-neutral-500 italic mt-2 bg-neutral-50 p-2 rounded border border-dashed border-[#eee]">
                          {sch.linkDescription}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeReportTab === "plan" && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono mb-2">Chronological Pathway Checkpoint List</h4>
                <div className="space-y-2.5">
                  {analysisReport.actionableSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-3.5 bg-[#fafafa] p-3 rounded-lg border border-[#eee]">
                      <div>
                        <h5 className="text-[10px] font-bold text-black uppercase tracking-wider font-mono">PHASE {idx + 1} CHECKPOINT</h5>
                        <p className="text-xs text-neutral-600 leading-normal mt-0.5">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* European Standard Europass-Style CV Creator option */}
      <div id="european-cv-builder-section" className="bg-white rounded-xl border border-[#eee] shadow-none overflow-hidden mt-8 print:hidden">
        {/* Style block for printing rendering */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #europ-cv-printable-area, #europ-cv-printable-area * {
              visibility: visible;
            }
            #europ-cv-printable-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white !important;
              color: black !important;
              padding: 0px !important;
              margin: 0px !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        ` }} />

        <div className="p-6 border-b border-[#f5f5f5]">
          <span className="bg-[#f0f0f0] text-black text-[9px] font-mono px-2.5 py-0.5 rounded border border-[#e5e5e5] tracking-widest uppercase font-bold">
            EUROPEAN ADMISSIONS STANDARD
          </span>
          <h2 className="text-lg font-bold text-black tracking-tight mt-1.5 font-sans">
            European Standard CV Creator (Europass Layout)
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-2xl mt-1">
            Build and calibrate your Standard European CV. The split layout, margin structure, and font choices are engineered to coordinate with EU grant authorities and university panels.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-0 border-t border-[#f5f5f5]">
          
          {/* Editable Form Inputs Left Col */}
          <div className="xl:col-span-5 p-6 bg-white border-r border-[#f0f0f0] space-y-6">
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-[#f5f5f5] pb-2 font-mono">
              CURRICULUM SPECIFICATIONS
            </h3>

            {/* Block 1: Contacts */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider block font-mono">1. Personal & Contact details</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Candidate name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Email address</label>
                  <input
                    type="email"
                    value={cvEmail}
                    onChange={(e) => setCvEmail(e.target.value)}
                    className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Telephone contact</label>
                  <input
                    type="text"
                    value={cvPhone}
                    onChange={(e) => setCvPhone(e.target.value)}
                    className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Mailing Address</label>
                  <input
                    type="text"
                    value={cvAddress}
                    onChange={(e) => setCvAddress(e.target.value)}
                    className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Block 2: Work Experience */}
            <div className="space-y-3 border-t border-[#fbfbfb] pt-4">
              <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider block font-mono">2. Work Experience Timeline</span>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Dates duration</label>
                    <input
                      type="text"
                      value={cvJobDates}
                      onChange={(e) => setCvJobDates(e.target.value)}
                      placeholder="e.g. 2024 - Present"
                      className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Job title / Role</label>
                    <input
                      type="text"
                      value={cvJobTitle}
                      onChange={(e) => setCvJobTitle(e.target.value)}
                      className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Employer / Company & city</label>
                  <input
                    type="text"
                    value={cvCompany}
                    onChange={(e) => setCvCompany(e.target.value)}
                    className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Main tasks & contributions</label>
                  <textarea
                    rows={2}
                    value={cvJobDesc}
                    onChange={(e) => setCvJobDesc(e.target.value)}
                    className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none resize-none font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Block 3: Education */}
            <div className="space-y-3 border-t border-[#fbfbfb] pt-4">
              <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider block font-mono">3. Education & Credentials</span>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-[10px] text-neutral-500 font-semibold block uppercase">School Duration</label>
                    <input
                      type="text"
                      value={cvEducationDates}
                      onChange={(e) => setCvEducationDates(e.target.value)}
                      className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Qualification Title</label>
                    <input
                      type="text"
                      value={cvEducationQual}
                      onChange={(e) => setCvEducationQual(e.target.value)}
                      className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Institution & Country</label>
                  <input
                    type="text"
                    value={cvEducationUni}
                    onChange={(e) => setCvEducationUni(e.target.value)}
                    className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Block 4: Skills & Language */}
            <div className="space-y-3 border-t border-[#fbfbfb] pt-4">
              <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider block font-mono">4. Personal Skills & Languages</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Mother tongue</label>
                  <input
                    type="text"
                    value={cvMotherTongue}
                    onChange={(e) => setCvMotherTongue(e.target.value)}
                    className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Other languages</label>
                  <input
                    type="text"
                    value={cvOtherLanguage}
                    onChange={(e) => setCvOtherLanguage(e.target.value)}
                    className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] text-neutral-500 font-semibold block uppercase">Digital competencies (csv)</label>
                  <input
                    type="text"
                    value={cvDigitalSkills}
                    onChange={(e) => setCvDigitalSkills(e.target.value)}
                    className="w-full bg-[#fbfbfb] border border-neutral-200 p-2 text-xs rounded-md focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => window.print()}
                id="btn-print-europ-cv"
                className="w-full bg-black hover:bg-neutral-800 text-white font-mono text-xs font-bold py-3 px-4 rounded-lg cursor-pointer text-center uppercase tracking-wider"
              >
                🖨️ Print or Save CV (PDF)
              </button>
            </div>
          </div>

          {/* Interactive live preview on screen */}
          <div className="xl:col-span-7 p-6 bg-neutral-100 flex flex-col items-center justify-start overflow-x-auto min-h-[500px]">
            <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase tracking-widest mb-4">
              isomorphic standard layout preview (A4 Proportional)
            </span>

            {/* Isomorphic CV canvas printable wrapper container */}
            <div 
              id="europ-cv-printable-area" 
              className="w-[210mm] min-h-[297mm] bg-white text-black p-10 font-sans shadow-lg border border-neutral-200 flex flex-col justify-between"
              style={{ boxSizing: "border-box" }}
            >
              <div>
                {/* Europass header strip */}
                <div className="border-b-4 border-[#0b3c5d] pb-6 mb-8 flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono tracking-widest text-[#0b3c5d] font-bold uppercase block">
                      Curriculum Vitae
                    </span>
                    <h1 className="text-2xl font-black tracking-tight text-neutral-900 uppercase font-sans">
                      {userName || "Unspecified Candidate"}
                    </h1>
                    <p className="text-xs text-neutral-500 font-medium font-sans">European Admissions Candidate Alignment Model</p>
                  </div>
                  
                  <div className="text-right text-[10px] text-neutral-400 font-mono tracking-wider font-bold">
                    <span>EUROPASS STANDARD</span>
                  </div>
                </div>

                {/* Main Double Column Layout */}
                <div className="grid grid-cols-12 gap-8 items-start">
                  
                  {/* Left Metadata Bar */}
                  <div className="col-span-4 bg-neutral-50 p-4 rounded border border-[#eee] space-y-5">
                    
                    {/* Block A: Contacts info */}
                    <div className="space-y-2 mt-1">
                      <span className="text-[9px] font-mono text-[#0b3c5d] font-bold uppercase tracking-widest block border-b border-neutral-200 pb-1">
                        Contact Info
                      </span>
                      <div className="space-y-1.5 text-[10.5px] leading-relaxed text-neutral-800 break-words">
                        <p><b>Email:</b><br />{cvEmail}</p>
                        <p><b>Phone:</b><br />{cvPhone}</p>
                        <p><b>Address:</b><br /><span className="text-[10px]">{cvAddress}</span></p>
                      </div>
                    </div>

                    {/* Block B: Languages */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-[#0b3c5d] font-bold uppercase tracking-widest block border-b border-neutral-200 pb-1">
                        Languages
                      </span>
                      <div className="space-y-1 text-[10.5px] text-neutral-800">
                        <p><b>Mother Tongue:</b> {cvMotherTongue}</p>
                        <p><b>Other:</b> {cvOtherLanguage}</p>
                      </div>
                    </div>

                    {/* Block C: Tech stack */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-[#0b3c5d] font-bold uppercase tracking-widest block border-b border-neutral-200 pb-1">
                        Digital Skills
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cvDigitalSkills.split(",").map((s, idx) => (
                          <span 
                            key={idx} 
                            className="bg-neutral-200 text-neutral-900 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-neutral-300"
                          >
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right Core Timeline Content Column */}
                  <div className="col-span-8 space-y-6">
                    
                    {/* Statement of purpose pitch brief */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-neutral-400 font-extrabold tracking-widest uppercase block mb-1">
                        Professional Profile
                      </span>
                      <p className="text-[11px] text-neutral-600 leading-relaxed">
                        Top-tier academic candidate calibrated for {selectedMajor} pathways in {destinationRegion}. Currently presenting {computedProfileStrength}% Admissions index alignment, specializing in collaborative engineering research pipelines.
                      </p>
                    </div>

                    {/* Work Experience timelines */}
                    <div className="space-y-3.5">
                      <span className="text-[9px] font-mono text-[#0b3c5d] font-bold uppercase tracking-widest block border-b border-neutral-150 pb-1">
                        Professional Work Experience
                      </span>
                      <div className="flex space-x-4">
                        <div className="w-24 text-[10.5px] font-mono text-neutral-400 font-bold flex-shrink-0 mt-0.5">
                          {cvJobDates}
                        </div>
                        <div className="flex-1 space-y-1 mb-1">
                          <h4 className="text-xs font-black text-neutral-900">{cvJobTitle}</h4>
                          <p className="text-[11px] text-neutral-500 font-semibold font-sans">{cvCompany}</p>
                          <p className="text-[10.5px] text-neutral-600 leading-relaxed font-sans">{cvJobDesc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Education timelines */}
                    <div className="space-y-3.5">
                      <span className="text-[9px] font-mono text-[#0b3c5d] font-bold uppercase tracking-widest block border-b border-neutral-150 pb-1">
                        Education and Training
                      </span>
                      <div className="flex space-x-4">
                        <div className="w-24 text-[10.5px] font-mono text-neutral-400 font-bold flex-shrink-0 mt-0.5">
                          {cvEducationDates}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <h4 className="text-xs font-black text-neutral-900">{cvEducationQual}</h4>
                          <p className="text-[11px] text-neutral-500 font-semibold font-sans">{cvEducationUni}</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional admissions checklist calibration summary */}
                    <div className="space-y-2 pt-4 border-t border-neutral-100">
                      <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase tracking-widest block">
                        Academic Calibration Index Summary
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-neutral-500 font-bold">
                        <div>GPA SCORE: {gpa.toFixed(2)}</div>
                        <div>ENGLISH: {testScore} ({testType})</div>
                        <div>BUDGET ALIGN: ${budget.toLocaleString()}</div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* Bottom footer stamp */}
              <div className="border-t border-neutral-200 pt-3 mt-12 flex justify-between items-center text-[8.5px] font-mono text-neutral-400">
                <span>© europass alignment framework • ScholarLogic Admissions Suite</span>
                <span>Page 1 of 1</span>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
