// Data loader: Fetch paper data from ram_pdfs
import fs from "fs";
import path from "path";

const RAM_PDFS_ROOT = path.resolve("../");

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
if (fs.existsSync(reviewsDir)) {
  const reviewFiles = fs.readdirSync(reviewsDir).filter(f => f.endsWith(".md"));
  reviews = reviewFiles.map(f => {
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

    // Citation count not available (TODO: fetch from Semantic Scholar or arXiv API)
    const citationCount = null;

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
    };
  });
}

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
