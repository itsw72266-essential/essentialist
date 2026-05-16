/**
 * Shared Gemini client for text generation (translation, moderation, etc.).
 * Model defaults to gemini-3-flash-preview; override with GEMINI_MODEL.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_MODEL = "gemini-3-flash-preview";

/** Fix common .env typo (emini-* → gemini-*). */
export function normalizeGeminiModel(value) {
  const trimmed = value?.trim() || "";
  if (!trimmed) return DEFAULT_MODEL;
  if (trimmed.startsWith("emini-")) return `g${trimmed}`;
  return trimmed;
}

export const GEMINI_MODEL = normalizeGeminiModel(process.env.GEMINI_MODEL);

const MODEL_FALLBACK_CHAIN = [
  ...new Set(
    [
      GEMINI_MODEL,
      DEFAULT_MODEL,
      "gemini-2.5-flash-preview",
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
    ].map(normalizeGeminiModel),
  ),
];

const RETRYABLE = new Set([429, 503]);
const MAX_ATTEMPTS = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || "";
}

export function isGeminiConfigured() {
  return Boolean(getApiKey());
}

function getGenerativeModel(modelName, systemInstruction) {
  const client = new GoogleGenerativeAI(getApiKey());
  return client.getGenerativeModel({
    model: modelName,
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });
}

function isRetryableError(error) {
  const status = error?.status ?? error?.statusCode;
  if (RETRYABLE.has(status)) return true;
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("429") ||
    message.includes("503") ||
    message.includes("resource exhausted")
  );
}

function isModelNotFoundError(error) {
  const status = error?.status ?? error?.statusCode;
  if (status === 404) return true;
  const message = String(error?.message || "").toLowerCase();
  return message.includes("not found") && message.includes("models/");
}

/**
 * Generate JSON from a prompt. Retries on 429/503; tries alternate models on 404.
 */
export async function generateJsonWithFallback(prompt, systemInstruction) {
  if (!isGeminiConfigured()) return null;

  let lastError;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const model = getGenerativeModel(modelName, systemInstruction);
        const result = await model.generateContent(prompt);
        const text = result?.response?.text?.() ?? "";
        if (!text.trim()) return null;
        const parsed = JSON.parse(text);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch (error) {
        lastError = error;
        if (isModelNotFoundError(error)) {
          console.warn(`[gemini] Model unavailable: ${modelName}, trying next…`);
          break;
        }
        if (isRetryableError(error) && attempt < MAX_ATTEMPTS - 1) {
          await sleep(1000 * (attempt + 1));
          continue;
        }
        throw error;
      }
    }
  }

  throw lastError ?? new Error("No Gemini model available for generateContent");
}
