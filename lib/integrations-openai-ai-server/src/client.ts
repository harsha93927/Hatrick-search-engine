import OpenAI from "openai";

const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

export const openai = new OpenAI({
  apiKey: apiKey || "dummy-key",
  baseURL: baseURL || "https://api.openai.com/v1",
});

if (!baseURL || !apiKey) {
  console.warn(
    "OpenAI integration not fully configured. Defaulting to dummy client. Ensure Gemini key is provided by user for full functionality.",
  );
}
