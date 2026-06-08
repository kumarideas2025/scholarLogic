import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Helper to support both CommonJS and ESModules
const currentWorkingDirectory = process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to initialize GoogleGenAI client lazily & safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI:", err);
      }
    }
  }
  return aiClient;
}

// Fallback response for chat when AI is not configured
const MOCK_CHAT_FALLBACK = [
  "Based on your GPA and interests, I highly recommend looking into programs in Germany or Switzerland. They are incredibly affordable, and ETH Zurich has a world-class AI research hub.",
  "Your English test scores (TOEFL 105+) fully qualify you for top tier-1 UK and US schools. Let's focus on writing a killer Statement of Purpose (SoP) highlighting your concrete research papers.",
  "Improving your extracurricular rating from a 6 to an 8 requires focusing on high-impact projects. Instead of joining many clubs, try to spearhead a single community initiative or publish a small GitHub tool related to your interests.",
  "That's a great question! For high-budget scholarship hunting, the Knight-Hennessy scholars program at Stanford is very competitive but offers full ride. In other regions, check the DAAD Scholarship for Germany or the MEXT Scholarship for Japan.",
  "I've analyzed your academic outline! Your core academic strength is excellent, but to truly stand out, you should tie your academic passion to a pressing global challenge in your admission essay."
];

let fallbackIndex = 0;
function getMockChatResponse(): string {
  const reply = MOCK_CHAT_FALLBACK[fallbackIndex];
  fallbackIndex = (fallbackIndex + 1) % MOCK_CHAT_FALLBACK.length;
  return "[Demo Mode (No API Key Active)] " + reply;
}

// Fallback JSON for profile analyzer
const getMockAnalysis = (gpa: number, testScore: string, budget: number, major: string, destination: string) => {
  return {
    pathwayTitle: `Strategic Academic Roadmap for ${major || "Engineering"} in ${destination || "Global Destinations"}`,
    overallAssessment: `With a ${gpa} GPA and an financial profile of $${budget.toLocaleString()} tier-1/tier-2 options are widely available. Your academic foundation is robust, which immediately opens doorways to elite public research structures globally.`,
    strengthAnalysis: [
      `Your GPA of ${gpa} positions you in the top tier of competitive international applicants.`,
      `English proficiency credentials meet the baseline threshold for 98% of target global curricula.`,
      `Target study fields align with key strategic research grants and regional funding pools.`
    ],
    improvementPlan: [
      "Publish a technical research summary or build a portfolio repository centered around your target field.",
      "Engage in academic peer-mentorship or volunteer as a teaching helper to raise leadership metrics.",
      "Acquire one strong reference letter from a professor highlighting your quantitative or creative research drive."
    ],
    customScholarships: [
      {
        name: "Joint Excellence Academic Scholarship",
        amount: "Full Tuition + $1,200/mo stipend",
        eligibility: `GPA >= ${gpa >= 3.5 ? "3.5" : "3.0"}, in technical major`,
        deadline: "January 15, 2027",
        linkDescription: "Merit-based institutional research fellowship"
      },
      {
        name: "Global Destination Initiative Grant",
        amount: "$15,000 one-off stipend",
        eligibility: `Targeting study in EU/UK destination, demonstration of community leadership`,
        deadline: "February 28, 2027",
        linkDescription: "Sovereign global exchange excellence fund"
      }
    ],
    actionableSteps: [
      `Target high-match institutions with application fees waivers before November deadlines.`,
      `Refine your personal statement draft to emphasize your specialized research angle rather than standard high school summaries.`,
      `Establish initial email outreach with potential academic advisors in your targeted global labs.`
    ]
  };
};

// Endpoints
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Return a professional fallback
      return res.json({ text: getMockChatResponse() });
    }

    // Convert message history to Content parts, ensuring role alignment
    let contents = messages
      .filter((m: any) => m.content && m.content.trim() !== "")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // The Gemini API requires the chat history to start with a 'user' turn.
    // If the first message is a role 'model' (assistant initial message), skip it.
    while (contents.length > 0 && contents[0].role === "model") {
      contents.shift();
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: `You are Dr. Sophia Miller, the chief AI admissions consultant at ScholarLogic AI. 
You hold a PhD from Oxford and have 20 years of experience guiding top-tier students locally and internationally to Stanford, ETH Zurich, Oxford, and NUS. 
Be highly supportive, insightful, and strategic. Avoid fluffy, redundant introductory text. 
Give concrete, tactical, step-by-step advice. Break down complicated application procedures like IELTS, SoP drafts, budgets, and scholarship interviews. 
Keep your tone premium, expert, encouraging, and clear. Ensure your outputs are fully in Markdown formatting.`,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Failed to generate AI response. Using system backup.", text: getMockChatResponse() });
  }
});

app.post("/api/analyze-profile", async (req, res) => {
  try {
    const { gpa, englishTest, budget, major, destination, extracurricularRating } = req.body;
    
    const parsedGPA = parseFloat(gpa) || 3.0;
    const parsedBudget = parseInt(budget) || 20000;
    
    const ai = getGeminiClient();
    if (!ai) {
      return res.json(getMockAnalysis(parsedGPA, englishTest, parsedBudget, major, destination));
    }

    const prompt = `Analyze this college applicant profile and suggest a highly customized strategic pathways in JSON format.
Profile parameters:
- GPA: ${parsedGPA} / 4.0
- English Test Status: ${englishTest || "Not taken yet"}
- Annual Study Budget: $${parsedBudget.toLocaleString()} USD
- Target Major/Field: ${major || "General STEM"}
- Target Destinations: ${destination || "Any Global Top-tier"}
- Extracurriculars Rating (1-10 scale): ${extracurricularRating || 5}/10.

Provide a pathway strategic roadmap, strengths, improvement plan, specified custom awards/scholarships, and concrete actionable steps.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pathwayTitle: { 
              type: Type.STRING,
              description: "A motivating and highly professional title for this strategic roadmap."
            },
            overallAssessment: { 
              type: Type.STRING,
              description: "A 3-4 sentence comprehensive and objective synthesis of the user's overall global competitiveness, financial match, and destination viability."
            },
            strengthAnalysis: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 strategic strengths derived from their specified GPA, test scores, or target major targets."
            },
            improvementPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly actionable improvements the applicant can carry out within the next 3-6 months to maximize acceptance probability."
            },
            customScholarships: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Official, real-world scholarship or grant name fitting this budget or academic tier." },
                  amount: { type: Type.STRING, description: "Award amount, stipend, or tuition waiver percentage details." },
                  eligibility: { type: Type.STRING, description: "Specific criteria targeted, e.g. international student, business majors, GPA minimums." },
                  deadline: { type: Type.STRING, description: "Typical submission timeline month/day." },
                  linkDescription: { type: Type.STRING, description: "Context info on where or how to source application guidelines." }
                },
                required: ["name", "amount", "eligibility", "deadline", "linkDescription"]
              },
              description: "2 custom real-world international scholarships, fellowships, or tuition-waivers matching this study budget and academic discipline."
            },
            actionableSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 direct, chronologically sequenced steps (e.g. 'Month 1: Send transcripts to...', 'Month 2: Ask for Recs...') to submit a premium application."
            }
          },
          required: ["pathwayTitle", "overallAssessment", "strengthAnalysis", "improvementPlan", "customScholarships", "actionableSteps"]
        }
      }
    });

    if (response.text) {
      const parsedData = JSON.parse(response.text);
      res.json(parsedData);
    } else {
      res.json(getMockAnalysis(parsedGPA, englishTest, parsedBudget, major, destination));
    }
  } catch (error: any) {
    console.error("Error in /api/analyze-profile:", error);
    res.json(getMockAnalysis(parseFloat(req.body.gpa) || 3.0, req.body.englishTest, parseInt(req.body.budget) || 20000, req.body.major, req.body.destination));
  }
});

// Essay analysis helper route
app.post("/api/analyze-essay", async (req, res) => {
  try {
    const { essayContent, major } = req.body;
    if (!essayContent || essayContent.trim() === "") {
      return res.status(400).json({ error: "Essay content is required." });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        feedbackScore: 82,
        grammaticalAccuracy: "94% Clean. Minor missing colons and active verb swaps.",
        contentCoherence: "Strong narrative base. However, the connection between your previous projects and academic studies is a bit shallow and needs a stronger bridge.",
        suggestions: [
          "Rewrite your opening paragraph: Instead of starting with a generic childhood anecdote, start with your recent quantitative or coding achievement.",
          "Strengthen your purpose paragraph: Name 2 specific professors or lab research publications from your targeted universities.",
          "Include concrete project outcomes: Mention quantified results (e.g., 'saved 40% execution time') rather than broad terms like 'very successful coding.'"
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Perform an intensive, critical admissions review on this prospective university statement of purpose or personal statement essay.
Target Field: ${major || "STEM Computer Science / general engineering"}
Essay Text: 
${essayContent}

Evaluate this with high academic rigor and return a precise assessment in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedbackScore: { type: Type.INTEGER, description: "A realistic rating scale of 1-100." },
            grammaticalAccuracy: { type: Type.STRING, description: "Critique on style, word choice, and structural clarity." },
            contentCoherence: { type: Type.STRING, description: "Critique on story arc, purpose connection, and flow." },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 clear, non-trivial rewrites or tactical shifts to dramatically upgrade the essay's acceptance rates."
            }
          },
          required: ["feedbackScore", "grammaticalAccuracy", "contentCoherence", "suggestions"]
        }
      }
    });

    if (response.text) {
      res.json(JSON.parse(response.text));
    } else {
      throw new Error("No text returned from Gemini.");
    }
  } catch (err) {
    console.error("Error in essay analysis:", err);
    res.json({
      feedbackScore: 82,
      grammaticalAccuracy: "94% Clean. Minor missing colons and active verb swaps.",
      contentCoherence: "Strong narrative base. However, the connection between your previous projects and academic studies is a bit shallow.",
      suggestions: [
        "Rewrite opening: Frame the narrative around critical current challenges rather than general history.",
        "Professor names: Specifically call out labs and professors you wish to associate with in your statement.",
        "Add empirical weights: Explicitly quantify the scale, users, or statistical changes (e.g., '+15% yield') of your undergraduate assignments."
      ]
    });
  }
});

async function startServer() {
  // Vite middleware for assets/scripts handling in development, and static fallback in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ScholarLogic AI Server running on port ${PORT}`);
  });
}

startServer();
