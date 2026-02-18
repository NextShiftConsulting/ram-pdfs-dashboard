// Data loader: Fetch paper data from ram_pdfs
import fs from "fs";
import path from "path";
import https from "https";

const RAM_PDFS_ROOT = path.resolve("../");
const CACHE_FILE = path.join(RAM_PDFS_ROOT, "dashboard", ".citation_cache.json");

// Load citation cache
let citationCache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    citationCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch (error) {
    console.error("Error loading citation cache:", error.message);
    citationCache = {};
  }
}

// Rate limiting: delay between API calls (in ms)
// Semantic Scholar API recommends 1 request per second for public API
const API_DELAY = 1100; // 1100ms (1.1 seconds) between requests to avoid rate limiting
let lastApiCall = 0;

// Helper to enforce rate limiting
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
  // Check cache first
  if (citationCache[arxivId] !== undefined) {
    return citationCache[arxivId];
  }

  // Apply rate limiting
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
            citationCache[arxivId] = citationCount;
            resolve(citationCount);
          } else {
            console.error(`Failed to fetch citations for ${arxivId}: HTTP ${res.statusCode}`);
            citationCache[arxivId] = null;
            resolve(null);
          }
        } catch (error) {
          console.error(`Error parsing citation data for ${arxivId}:`, error.message);
          citationCache[arxivId] = null;
          resolve(null);
        }
      });
    }).on("error", (error) => {
      console.error(`Network error fetching citations for ${arxivId}:`, error.message);
      citationCache[arxivId] = null;
      resolve(null);
    });
  });
}

// Save citation cache to disk
function saveCitationCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(citationCache, null, 2));
  } catch (error) {
    console.error("Error saving citation cache:", error.message);
  }
}

// Load processed papers
const processedPath = path.join(RAM_PDFS_ROOT, "processed_papers.json");
let processedPapers = [];

if (fs.existsSync(processedPath)) {
  processedPapers = JSON.parse(fs.readFileSync(processedPath, "utf-8"));
}

// Count papers in research_papers directory
const papersDir = path.join(RAM_PDFS_ROOT, "research_papers");
let paperCount = 0;
if (fs.existsSync(papersDir)) {
  paperCount = fs.readdirSync(papersDir).filter(f => f.endsWith(".pdf")).length;
}

// Count reviews
const reviewsDir = path.join(RAM_PDFS_ROOT, "reviews");
let reviews = [];

// Process reviews in batches to avoid overwhelming the API
async function processReviewsBatch(files, batchSize = 10) {
  const results = [];
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(f => processSingleReview(f))
    );
    results.push(...batchResults);

    // Log progress
    console.error(`Processed ${Math.min(i + batchSize, files.length)}/${files.length} reviews`);
  }
  return results;
}

// Process a single review file
async function processSingleReview(f) {
  const content = fs.readFileSync(path.join(reviewsDir, f), "utf-8");
  const isYrsn = f.includes("vs_yrsn");
  const isTech = f.includes("techreview");

  // Extract relevance score if present (handles /10 and /18 scales)
  let relevanceScore = null;
  const scoreMatch = content.match(/relevance.*?score.*?(\d+)\/(\d+)/i);
  if (scoreMatch) {
    const numerator = parseInt(scoreMatch[1]);
    const denominator = parseInt(scoreMatch[2]);
    // Normalize to 0-10 scale (10/10 stays 10, 18/18 becomes 10)
    relevanceScore = denominator === 10 ? numerator : Math.round((numerator / denominator) * 10);
  }

  // Extract metadata - split filename once and cache it
  const parts = f.split("_");
  const arxivId = parts.length >= 2 ? `${parts[0]}_${parts[1]}` : parts[0];
  const arxivIdClean = arxivId.replace(/_/g, '.');
  // Remove version suffix (e.g., "v1") for cleaner URLs
  const arxivIdForUrl = arxivIdClean.replace(/v\d+$/, '');

  // Extract title, authors, date from content (flexible patterns)
  const titleMatch = content.match(/# (?:Technical Review|YRSN Comparison|Review):\s*(.+)/) ||
                     content.match(/# (.+)/);
  const title = titleMatch ? titleMatch[1].trim() : `Paper ${arxivId}`;

  const authorsMatch = content.match(/[-*]*\s*\*\*Authors?\*\*:\s*(.+)/);
  const authors = authorsMatch ? authorsMatch[1].trim() : "Unknown";

  const dateMatch = content.match(/\*\*Published\*\*: (\d{4}-\d{2}-\d{2})/);
  const publishedDate = dateMatch ? dateMatch[1] : null;

  // Fetch citation count from Semantic Scholar
  const citationCount = await fetchCitationCount(arxivIdForUrl);

  return {
    filename: f,
    arxivId: arxivId,
    arxivIdClean: arxivIdClean,
    title: title,
    authors: authors,
    publishedDate: publishedDate,
    type: isYrsn ? "yrsn" : isTech ? "tech" : "other",
    relevanceScore,
    citations: citationCount,
    size: content.length,
    arxivUrl: `https://arxiv.org/abs/${arxivIdForUrl}`,
    pdfUrl: `https://arxiv.org/pdf/${arxivIdForUrl}.pdf`,
    reviewContent: content, // Include full review content for modal display
  };
}

async function processReviews() {
  if (!fs.existsSync(reviewsDir)) {
    return [];
  }

  const reviewFiles = fs.readdirSync(reviewsDir).filter(f => f.endsWith(".md"));
  // Process one at a time to respect API rate limits
  return await processReviewsBatch(reviewFiles, 1);
}

// Main execution
async function main() {
  reviews = await processReviews();

  // Save citation cache after all fetches complete
  saveCitationCache();

  // Build output
  const output = {
    summary: {
      totalPapers: paperCount,
      totalReviews: reviews.length,
      yrsnReviews: reviews.filter(r => r.type === "yrsn").length,
      techReviews: reviews.filter(r => r.type === "tech").length,
      processedCount: processedPapers.length,
      lastUpdated: new Date().toISOString(),
    },
    papers: processedPapers,
    reviews: reviews,
    byType: {
      yrsn: reviews.filter(r => r.type === "yrsn").length,
      tech: reviews.filter(r => r.type === "tech").length,
      other: reviews.filter(r => r.type === "other").length,
    },
    relevanceDistribution: reviews
      .filter(r => r.relevanceScore !== null)
      .reduce((acc, r) => {
        acc[r.relevanceScore] = (acc[r.relevanceScore] || 0) + 1;
        return acc;
      }, {}),
  };

  process.stdout.write(JSON.stringify(output, null, 2));
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
