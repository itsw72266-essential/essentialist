import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import axios from "axios";

const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(process.cwd(), "public");
const SITE_HOST = process.env.SITE_HOST || "www.example.com";
const SEARCH_ENGINES = [
  "https://www.bing.com/indexnow",
  "https://api.indexnow.org/indexnow",
];

let runtimeKey = process.env.INDEX_NOW_KEY?.trim() || null;

function generateKey() {
  return crypto.randomBytes(16).toString("hex");
}

function indexNowKey() {
  if (!runtimeKey) runtimeKey = generateKey();
  return runtimeKey;
}

async function initKeyFile() {
  try {
    const key = indexNowKey();
    const keyNamedFilePath = path.join(PUBLIC_DIR, `${key}.txt`);
    try {
      await fs.access(keyNamedFilePath);
    } catch {
      await fs.writeFile(keyNamedFilePath, key, "utf8");
    }
  } catch (error) {
    console.error("Error initializing IndexNow key file:", error);
  }
}

export async function indexNowSubmitUrlController(req, res) {
  try {
    await initKeyFile();
    const { url } = req.body;
    const key = indexNowKey();

    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }

    if (!url.startsWith(`https://${SITE_HOST}`)) {
      return res.status(400).json({
        success: false,
        message: "URL must belong to your website",
      });
    }

    const results = await Promise.allSettled(
      SEARCH_ENGINES.map((engine) =>
        axios.get(`${engine}?url=${encodeURIComponent(url)}&key=${key}`)
      )
    );

    const successfulSubmissions = results.filter((r) => r.status === "fulfilled").length;

    return res.json({
      success: true,
      message: `URL submitted to ${successfulSubmissions} of ${SEARCH_ENGINES.length} search engines`,
      details: results.map((r, i) => ({
        searchEngine: SEARCH_ENGINES[i],
        status: r.status === "fulfilled" ? "success" : "failed",
        statusCode: r.status === "fulfilled" ? r.value.status : null,
        error: r.status === "rejected" ? r.reason.message : null,
      })),
    });
  } catch (error) {
    console.error("Error submitting URL to IndexNow:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit URL to IndexNow",
      error: error.message,
    });
  }
}

export async function indexNowSubmitUrlsController(req, res) {
  try {
    await initKeyFile();
    const { urls } = req.body;
    const key = indexNowKey();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "A non-empty array of URLs is required",
      });
    }

    if (urls.length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Maximum of 10,000 URLs can be submitted at once",
      });
    }

    const invalidUrls = urls.filter((u) => !u.startsWith(`https://${SITE_HOST}`));
    if (invalidUrls.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All URLs must belong to your website",
        invalidUrls,
      });
    }

    const payload = {
      host: SITE_HOST,
      key,
      urlList: urls,
    };

    const results = await Promise.allSettled(
      SEARCH_ENGINES.map((engine) =>
        axios.post(engine, payload, {
          headers: { "Content-Type": "application/json; charset=utf-8" },
        })
      )
    );

    const successfulSubmissions = results.filter((r) => r.status === "fulfilled").length;

    return res.json({
      success: true,
      message: `URLs submitted to ${successfulSubmissions} of ${SEARCH_ENGINES.length} search engines`,
      details: results.map((r, i) => ({
        searchEngine: SEARCH_ENGINES[i],
        status: r.status === "fulfilled" ? "success" : "failed",
        statusCode: r.status === "fulfilled" ? r.value.status : null,
        error: r.status === "rejected" ? r.reason.message : null,
      })),
    });
  } catch (error) {
    console.error("Error submitting URLs to IndexNow:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit URLs to IndexNow",
      error: error.message,
    });
  }
}

export async function indexNowNotifyContentChangeController(req, res) {
  try {
    await initKeyFile();
    const { url, type } = req.body;
    const key = indexNowKey();

    if (!url) {
      return res.status(400).json({ success: false, message: "URL is required" });
    }

    if (!url.startsWith(`https://${SITE_HOST}`)) {
      return res.status(400).json({
        success: false,
        message: "URL must belong to your website",
      });
    }

    const results = await Promise.allSettled(
      SEARCH_ENGINES.map((engine) =>
        axios.get(`${engine}?url=${encodeURIComponent(url)}&key=${key}`)
      )
    );

    const successfulSubmissions = results.filter((r) => r.status === "fulfilled").length;

    return res.json({
      success: true,
      message: `URL change (${type || "update"}) submitted to ${successfulSubmissions} of ${SEARCH_ENGINES.length} search engines`,
      details: results.map((r, i) => ({
        searchEngine: SEARCH_ENGINES[i],
        status: r.status === "fulfilled" ? "success" : "failed",
        statusCode: r.status === "fulfilled" ? r.value.status : null,
        error: r.status === "rejected" ? r.reason.message : null,
      })),
    });
  } catch (error) {
    console.error("Error notifying content change to IndexNow:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to notify content change to IndexNow",
      error: error.message,
    });
  }
}

export async function indexNowGetKeyController(req, res) {
  await initKeyFile();
  return res.json({ key: indexNowKey() });
}

export async function indexNowRegenerateKeyController(req, res) {
  try {
    const oldKey = indexNowKey();
    const newKey = generateKey();
    const oldKeyNamedFilePath = path.join(PUBLIC_DIR, `${oldKey}.txt`);
    const newKeyNamedFilePath = path.join(PUBLIC_DIR, `${newKey}.txt`);

    await fs.writeFile(newKeyNamedFilePath, newKey, "utf8");

    try {
      await fs.unlink(oldKeyNamedFilePath);
    } catch (error) {
      console.warn("Could not delete old key file:", error);
    }

    runtimeKey = newKey;
    process.env.INDEX_NOW_KEY = newKey;

    return res.json({
      success: true,
      message: "IndexNow key regenerated successfully",
      key: newKey,
    });
  } catch (error) {
    console.error("Error regenerating IndexNow key:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to regenerate IndexNow key",
      error: error.message,
    });
  }
}
