
import { GoogleGenAI } from "@google/genai";
import { Task, CategoryConfig, DailyLog } from "./types";

export const generateDailyInsight = async (
  tasks: Task[], 
  categories: CategoryConfig[],
  dateStr: string,
  log?: DailyLog
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  const taskSummary = tasks.map(t => 
    `- [${t.startTime} - ${t.endTime}] ${t.title} (${categoryMap.get(t.categoryId) || 'Unknown'}) ${t.completed ? '(Done)' : '(Pending)'}`
  ).join('\n');

  const reflectionContext = log 
    ? `The user scored this day ${log.score}/5. Their reflection: "${log.reflection}"` 
    : "The user has not added a reflection yet.";

  const prompt = `
    You are a productivity coach. Analyze the schedule for ${dateStr}.
    
    Tasks:
    ${taskSummary}
    
    Reflection:
    ${reflectionContext}
    
    Provide a concise, motivating paragraph (max 3 sentences) summarizing how the day looks, identifying any gaps or overload, and offering a quick tip.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate insight at this time.";
  }
};
