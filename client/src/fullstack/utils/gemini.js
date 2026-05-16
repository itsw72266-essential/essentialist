/**
 * Shared Gemini client for text generation (translation, moderation, etc.).
 * Defaults to models with the most free-tier headroom for bulk translation.
 * Override primary model with GEMINI_MODEL in .env.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

/** Best for high-volume backfill (500 RPD on free tier). */
const DEFAULT_MODEL = "gemini-3.1-flash-lite-preview";

/**
 * Ordered by typical free-tier availability (avoid models you already maxed out).
 * Gemini 3 Flash is last — often hits 20 RPD quickly.
 */
const QUOTA_FRIENDLY_MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-3-flash-preview",
];

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
    [GEMINI_MODEL, ...QUOTA_FRIENDLY_MODELS].map(normalizeGeminiModel),
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

function getErrorMessage(error) {
  return String(error?.message || "").toLowerCase();
}

function isRetryableError(error) {
  const status = error?.status ?? error?.statusCode;
  if (RETRYABLE.has(status)) return true;
  const message = getErrorMessage(error);
  return message.includes("503") || message.includes("resource exhausted");
}

function isQuotaError(error) {
  const status = error?.status ?? error?.statusCode;
  if (status === 429) return true;
  return getErrorMessage(error).includes("quota");
}

function isModelNotFoundError(error) {
  const status = error?.status ?? error?.statusCode;
  if (status === 404) return true;
  const message = getErrorMessage(error);
  return message.includes("not found") && message.includes("models/");
}

function getRetryDelayMs(error, attempt) {
  const message = String(error?.message || "");
  const match = message.match(/retry in (\d+(?:\.\d+)?)s/i);
  if (match) return Math.ceil(Number(match[1]) * 1000) + 500;
  return 1000 * (attempt + 1);
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
        if (isModelNotFoundError(error) || isQuotaError(error)) {
          const reason = isQuotaError(error) ? "quota" : "not found";
          console.warn(`[gemini] ${modelName} ${reason}, trying next model…`);
          break;
        }
        if (isRetryableError(error) && attempt < MAX_ATTEMPTS - 1) {
          await sleep(getRetryDelayMs(error, attempt));
          continue;
        }
        throw error;
      }
    }
  }

  throw lastError ?? new Error("No Gemini model available for generateContent");
}
