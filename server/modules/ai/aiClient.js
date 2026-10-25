import Groq from "groq-sdk";
import AppError from "../../utils/AppError.js";

export const getAiSettings = (env = process.env) => {
  const provider = env.AI_PROVIDER?.trim().toLowerCase();
  const apiKey = env.AI_API_KEY?.trim();
  const model = env.AI_MODEL?.trim() || "openai/gpt-oss-120b";
  const timeoutMs = Number(env.AI_TIMEOUT_MS || 15000);

  if (provider !== "groq") {
    throw new AppError("AI_PROVIDER must be set to groq", 503);
  }

  if (!apiKey) {
    throw new AppError("AI_API_KEY is not configured", 503);
  }

  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 120000) {
    throw new AppError("AI_TIMEOUT_MS must be between 1000 and 120000", 500);
  }

  return { apiKey, model, timeoutMs };
};

export const createAiClient = (env = process.env) => {
  const { apiKey, timeoutMs } = getAiSettings(env);
  return new Groq({ apiKey, timeout: timeoutMs, maxRetries: 1 });
};

export const createChatCompletion = async (messages, env = process.env) => {
  const { model, timeoutMs } = getAiSettings(env);
  const client = createAiClient(env);

  try {
    const stream = await client.chat.completions.create(
      {
        model,
        messages,
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        reasoning_effort: "medium",
        stream: true,
        stop: null,
      },
      { signal: AbortSignal.timeout(timeoutMs) }
    );

    let answer = "";

    for await (const chunk of stream) {
      answer += chunk.choices[0]?.delta?.content || "";
    }

    if (!answer.trim()) {
      throw new AppError("The AI provider returned an empty response", 502);
    }

    return answer.trim();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new AppError("The AI request timed out. Please try again.", 504);
    }

    throw new AppError("The AI service is temporarily unavailable. Please try again.", 502);
  }
};
