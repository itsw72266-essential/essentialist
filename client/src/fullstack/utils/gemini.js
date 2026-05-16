/**
 * Shared Gemini client for text generation (translation, moderation, etc.).
 * Model defaults to gemini-3-flash-preview; override with GEMINI_MODEL.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-3-flash-preview";

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

function getModel(systemInstruction) {
  const client = new GoogleGenerativeAI(getApiKey());
  return client.getGenerativeModel({
    model: GEMINI_MODEL,
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
  return message.includes("429") || message.includes("503") || message.includes("resource exhausted");
}

/**
 * Generate JSON from a prompt. Retries on 429/503-style failures (Educare-style fallback).
 */
export async function generateJsonWithFallback(prompt, systemInstruction) {
  if (!isGeminiConfigured()) return null;

  let lastError;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const model = getModel(systemInstruction);
      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.() ?? "";
      if (!text.trim()) return null;
      const parsed = JSON.parse(text);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      lastError = error;
      if (isRetryableError(error) && attempt < MAX_ATTEMPTS - 1) {
        await sleep(1000 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}
