import AppError from "../../utils/AppError.js";
import AiLog from "../../models/aiLog.model.js";
import { createChatCompletion } from "./aiClient.js";

const systemPrompt = [
  "You are HCM Lite's AI assistant.",
  "Answer clearly and briefly, and reply in the user's language, including Roman Urdu.",
  "You have no access to company records, databases, passwords, API keys, or other users' private data.",
  "Never claim to have queried or changed records. For questions requiring live company data, explain that this chat is not yet connected to those data tools.",
  "Give policy answers only when the policy is included in the conversation; otherwise say you do not know.",
].join(" ");

export const askAssistant = async ({ user, message, completeChat = createChatCompletion }) => {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const requestCount = await AiLog.countDocuments({ userId: user._id, createdAt: { $gte: hourAgo } });
  const hourlyLimit = Number(process.env.AI_HOURLY_LIMIT || 20);

  if (!Number.isInteger(hourlyLimit) || hourlyLimit < 1) {
    throw new AppError("AI_HOURLY_LIMIT must be a positive integer", 500);
  }

  if (requestCount >= hourlyLimit) {
    throw new AppError("AI request limit reached. Try again later.", 429);
  }

  const startedAt = Date.now();
  let answer;
  let failure;

  try {
    answer = await completeChat([
      { role: "system", content: systemPrompt },
      { role: "user", content: message.trim() },
    ]);
  } catch (error) {
    failure = error;
  }

  try {
    await AiLog.create({
      userId: user._id,
      role: user.role,
      question: message.trim(),
      toolUsed: null,
      ok: !failure,
      ms: Date.now() - startedAt,
    });
  } catch (error) {
    console.error("Failed to write AI request log", error);

    if (!failure) {
      throw new AppError("The AI response could not be logged. Please try again.", 500);
    }
  }

  if (failure) {
    throw failure;
  }

  return { answer, toolUsed: null, label: "AI-generated" };
};
