#!/usr/bin/env node

/**
 * Citation Cache Updater
 *
 * This script updates the citation cache by fetching data from Semantic Scholar API
 * for papers that currently have null values (due to previous rate limiting).
 *
 * Usage:
 *   node update_citations.js [--limit N]
 *
 * Options:
 *   --limit N    Only update N papers (default: all null values)
 */

import fs from "fs";
import https from "https";

const CACHE_FILE = ".citation_cache.json";
const API_DELAY = 1100; // 1.1 seconds between requests

// Load citation cache
let citationCache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    citationCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch (error) {
    console.error("Error loading citation cache:", error.message);
    process.exit(1);
  }
}

// Helper to enforce rate limiting
let lastApiCall = 0;
async function rateLimit() {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  if (timeSinceLastCall < API_DELAY) {
    await new Promise(resolve => setTimeout(resolve, API_DELAY - timeSinceLastCall));
  }
  lastApiCall = Date.now();
}

// Fetch citation count from Semantic Scholar API
async function fetchCitationCount(arxivId) {
  await rateLimit();

  return new Promise((resolve) => {
    const url = `https://api.semanticscholar.org/graph/v1/paper/arXiv:${arxivId}?fields=citationCount`;

    https.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            const citationCount = parsed.citationCount || 0;
            resolve(citationCount);
          } else {
            console.error(`Failed to fetch citations for ${arxivId}: HTTP ${res.statusCode}`);
            resolve(null);
          }
        } catch (error) {
          console.error(`Error parsing citation data for ${arxivId}:`, error.message);
          resolve(null);
        }
      });
    }).on("error", (error) => {
      console.error(`Network error fetching citations for ${arxivId}:`, error.message);
      resolve(null);
    });
  });
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  let limit = Infinity;

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) {
      limit = parseInt(args[i + 1]);
      i++;
    }
  }

  // Find papers with null citations
  const nullPapers = Object.entries(citationCache)
    .filter(([_, count]) => count === null)
    .map(([arxivId, _]) => arxivId)
    .slice(0, limit);

  if (nullPapers.length === 0) {
    console.log("No papers with null citations found. Cache is complete!");
    return;
  }

  console.log(`Found ${nullPapers.length} papers with null citations`);
  console.log(`Updating ${Math.min(limit, nullPapers.length)} papers...`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < nullPapers.length; i++) {
    const arxivId = nullPapers[i];
    console.log(`[${i + 1}/${nullPapers.length}] Fetching ${arxivId}...`);

    const citationCount = await fetchCitationCount(arxivId);

    if (citationCount !== null) {
      citationCache[arxivId] = citationCount;
      updated++;
      console.log(`  -> ${citationCount} citations`);
    } else {
      failed++;
      console.log(`  -> Failed (still null)`);
    }
  }

  // Save updated cache
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(citationCache, null, 2));
    console.log(`\nCache updated successfully!`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Failed: ${failed}`);
  } catch (error) {
    console.error("Error saving citation cache:", error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
