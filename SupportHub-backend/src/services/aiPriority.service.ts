import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "llama-3.3-70b-versatile";
const MAX_AGE_HOURS = 72;
const WEIGHTS = { sentiment: 0.4, complexity: 0.35, aging: 0.25 };

export interface AIScores {
  sentimentScore: number;
  complexityScore: number;
  agingScore: number;
  aiPriorityScore: number;
  llmReasoning: string;
}

function computeAgingScore(createdAt: Date): number {
  const hoursElapsed =
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  return Math.min(1.0, hoursElapsed / MAX_AGE_HOURS);
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export async function scoreTicket(
  title: string,
  description: string | null | undefined,
  createdAt: Date
): Promise<AIScores> {
  const agingScore = computeAgingScore(createdAt);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "You are a support ticket analyzer. Respond with valid JSON only. No explanation, no markdown, no code blocks.",
      },
      {
        role: "user",
        content: `Analyze this support ticket and return ONLY this JSON object:
{
  "sentimentScore": <number 0.0 to 1.0 — emotional urgency, where 1.0 means the client is highly distressed or the issue is critical>,
  "complexityScore": <number 0.0 to 1.0 — technical difficulty, where 1.0 means extremely complex or multi-system issue>,
  "reasoning": "<one sentence summarizing the urgency and complexity>"
}

Title: ${title}
Description: ${description ?? "No description provided"}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";

  let parsed: { sentimentScore?: number; complexityScore?: number; reasoning?: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("[aiPriority] Failed to parse LLM response:", raw);
    parsed = {};
  }

  const sentimentScore = clamp(parsed.sentimentScore ?? 0.5);
  const complexityScore = clamp(parsed.complexityScore ?? 0.5);

  const aiPriorityScore =
    WEIGHTS.sentiment * sentimentScore +
    WEIGHTS.complexity * complexityScore +
    WEIGHTS.aging * agingScore;

  return {
    sentimentScore: Math.round(sentimentScore * 100) / 100,
    complexityScore: Math.round(complexityScore * 100) / 100,
    agingScore: Math.round(agingScore * 100) / 100,
    aiPriorityScore: Math.round(aiPriorityScore * 100) / 100,
    llmReasoning: parsed.reasoning ?? "",
  };
}

export async function rescoreOpenTickets(
  tickets: { id: string; title: string; description: string | null; createdAt: Date }[],
  updateFn: (id: string, scores: AIScores) => Promise<void>
): Promise<void> {
  for (const ticket of tickets) {
    try {
      const scores = await scoreTicket(
        ticket.title,
        ticket.description,
        ticket.createdAt
      );
      await updateFn(ticket.id, scores);
    } catch (err) {
      console.error(`[aiPriority] Failed to rescore ticket ${ticket.id}:`, err);
    }
  }
}
