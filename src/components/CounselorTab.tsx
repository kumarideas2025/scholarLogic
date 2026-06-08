import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface EssayEvaluation {
  feedbackScore: number;
  grammaticalAccuracy: string;
  contentCoherence: string;
  suggestions: string[];
}

export function CounselorTab() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am Dr. Sophia Miller, your lead admissions pathways counselor. I specialize in crafting global ivy-league research placement pathways.\n\nWhether you need feedback on your Statement of Purpose (SoP) essay outline, want suggestions for European funding scholarships, or need safety options for engineering, I am ready to advise."
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Essay feedback state
  const [essayContent, setEssayContent] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EssayEvaluation | null>(null);

  // Suggestions list
  const quickConsultationPrompts = [
    "What European universities match a $20K budget?",
    "How should I outline my AI Statement of Purpose?",
    "Suggest safety option targets in Germany/Switzerland",
    "How are extracurricular activities weighed vs GPA?"
  ];

  const wordCount = essayContent.trim() === "" ? 0 : essayContent.trim().split(/\s+/).length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle send message logic
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const updatedMessages = [...messages, { role: "user" as const, content: textToSend }];
    setMessages(updatedMessages);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (response.ok) {
        const replyObj = await response.json();
        setMessages((prev) => [...prev, { role: "assistant" as const, content: replyObj.text }]);
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      console.error("Chat failure:", err);
      setMessages((prev) => [
        ...prev, 
        { 
          role: "assistant" as const, 
          content: "I apologize, my primary connection is lagging, but I recommend checking out DAAD or Clarendon scholarships as they perfectly fit GPA thresholds above 3.7!" 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Essay submission logic
  const handleEvaluateEssay = async () => {
    if (!essayContent.trim()) return;
    setIsEvaluating(true);
    setEvaluation(null);

    try {
      const response = await fetch("/api/analyze-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essayContent: essayContent })
      });

      if (response.ok) {
        const evalData = await response.json();
        setEvaluation(evalData);
      } else {
        throw new Error("HTTP connection failed");
      }
    } catch (err) {
      console.error("Essay evaluation failure:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* Left Columns (7): Interactive counselor chat */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-[#eee] shadow-none h-[600px] flex flex-col justify-between overflow-hidden">
        
        {/* Chat top info */}
        <div className="p-4 border-b border-[#f5f5f5] bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="https://picsum.photos/seed/sophiamiller/100/100"
                alt="Dr. Sophia Miller"
                className="w-9 h-9 rounded-full border border-neutral-200 object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#1a1a1a] border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900">Dr. Sophia Miller</h3>
              <p className="text-[9px] text-[#888] font-semibold uppercase tracking-wider font-mono">Admissions Advisor Panel</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-neutral-950 border border-black text-white px-2.5 py-0.5 rounded-lg font-mono text-[9px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span>COUNSELOR AGENT ACTIVE</span>
          </div>
        </div>

        {/* Messages list scroll area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white">
          {messages.map((m, index) => {
            const isSophia = m.role === "assistant";
            return (
              <div
                key={index}
                className={`flex max-w-[85%] ${
                  isSophia ? "self-start items-start space-x-3" : "self-end items-end space-x-2 ml-auto justify-end flex-row-reverse"
                }`}
              >
                {isSophia && (
                  <img
                    src="https://picsum.photos/seed/sophiamiller/100/100"
                    alt="Sophia"
                    className="w-6.5 h-6.5 rounded-full border border-neutral-200 object-cover mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div
                  className={`p-3.5 rounded-lg text-xs leading-relaxed whitespace-pre-wrap ${
                    isSophia 
                      ? "bg-[#f5f5f5] text-neutral-900 border border-[#eee]" 
                      : "bg-black text-white border border-black"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex items-start space-x-3 max-w-[80%]">
              <img
                src="https://picsum.photos/seed/sophiamiller/100/100"
                alt="Sophia"
                className="w-6.5 h-6.5 rounded-full border border-neutral-200 object-cover mt-0.5 animate-pulse"
                referrerPolicy="no-referrer"
              />
              <div className="p-3.5 bg-[#f5f5f5] text-neutral-400 border border-[#eee] rounded-lg shadow-none flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions panel */}
        {messages.length === 1 && (
          <div className="px-5 py-3 border-t border-[#f5f5f5] bg-[#fafafa] space-y-1.5">
            <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#888] block mb-1">
              PROMPT TEMPLATES:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickConsultationPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSendMessage(p)}
                  className="bg-white hover:bg-neutral-100 text-[#1a1a1a] text-[11px] font-medium border border-neutral-200 py-1.5 px-3 rounded-lg transition cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Send prompt action container bar */}
        <div className="p-4 border-t border-[#eee] bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask Dr. Sophia about admissions, IELTS guidelines, safety targets..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#fbfbfb] p-2.5 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:border-black focus:ring-0 font-sans leading-normal"
            />
            <button
              type="submit"
              id="btn-chat-submit"
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-lg transition cursor-pointer flex items-center justify-center border border-black text-xs font-mono font-bold"
            >
              <span>SEND</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Column (5): Statement of Purpose Essay review */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Essay Upload Paste Form */}
        <div className="bg-white p-5 rounded-xl border border-[#eee] shadow-none space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#f5f5f5] pb-2">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-widest flex items-center font-mono">
              <span>Statement of Purpose Reviewer</span>
            </h3>
            <span className="text-[10px] font-mono text-[#888] font-bold uppercase">{wordCount} / 300 Words</span>
          </div>

          <textarea
            placeholder="Paste your draft Statement of Purpose (SoP) essay here to analyze narrative consistency, acceptance potential, and semantic cohesion..."
            value={essayContent}
            onChange={(e) => setEssayContent(e.target.value)}
            className="w-full h-40 bg-[#fafafa] border border-neutral-200 rounded-lg p-3 text-xs leading-relaxed focus:outline-none focus:border-black focus:ring-0 resize-none font-sans"
          />

          <div className="flex items-center justify-between gap-2.5">
            <span className="text-[10px] text-neutral-450 leading-tight">
              Evaluate acceptance potential of narrative.
            </span>

            <button
              onClick={handleEvaluateEssay}
              id="btn-essay-evaluate"
              disabled={isEvaluating || !essayContent.trim()}
              className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer transition disabled:opacity-50 inline-flex items-center uppercase font-mono tracking-wider border border-black"
            >
              {isEvaluating ? (
                <span>Reviewing...</span>
              ) : (
                <span>Critique Narrative</span>
              )}
            </button>
          </div>
        </div>

        {/* Evaluating loader result mockup */}
        {isEvaluating && (
          <div className="bg-white border border-[#eee] p-8 text-center rounded-xl flex flex-col items-center space-y-3 shadow-none">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <h4 className="font-bold text-neutral-800 text-xs font-mono uppercase">Evaluating Narrative Coherence...</h4>
            <p className="text-[10px] text-neutral-400">Reviewing word densities and acceptant weights.</p>
          </div>
        )}

        {/* Detailed Evaluation reports */}
        {evaluation && (
          <div className="bg-white rounded-xl border border-[#eee] overflow-hidden shadow-none transition duration-250">
            
            {/* Header circular grade */}
            <div className="bg-black text-white p-4 border-b border-black flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold tracking-widest text-neutral-300 uppercase">
                  SOVEREIGN CRITIQUE REPORT
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-tight">Admissions Coherence Index</h4>
              </div>
              <div className="flex items-center space-x-2 bg-neutral-800 border border-neutral-700 py-1 px-3 rounded-md font-mono text-xs font-bold uppercase tracking-wider text-white">
                <span>Score: {evaluation.feedbackScore}/100</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              
              {/* Coherence report status indicator */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#888] block font-mono">
                  Grammar & Style Tone:
                </span>
                <p className="text-xs text-neutral-700 leading-normal bg-[#fafafa] p-3 rounded-lg border border-[#eee]">
                  {evaluation.grammaticalAccuracy}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#888] block font-mono">
                  Concept Narrative Coherence:
                </span>
                <p className="text-xs text-neutral-700 leading-normal bg-[#fafafa] p-3 rounded-lg border border-[#eee]">
                  {evaluation.contentCoherence}
                </p>
              </div>

              {/* Suggestions bullets list */}
              <div className="space-y-2.5 border-t border-[#f5f5f5] pt-3.5">
                <span className="text-[10px] uppercase font-bold text-neutral-700 tracking-wider flex items-center font-mono">
                  <span>Strategic Suggested Redrafts:</span>
                </span>
                <div className="space-y-2">
                  {evaluation.suggestions.map((sug, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-neutral-600 leading-relaxed">
                      <span className="text-black font-extrabold mt-0.5">•</span>
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
