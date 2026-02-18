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

    // Extract relevance score if present
    let relevanceScore = null;
    const scoreMatch = content.match(/relevance.*?(\d+)\/10/i) || content.match(/score.*?(\d+)/i);
    if (scoreMatch) {
      relevanceScore = parseInt(scoreMatch[1]);
    }

    // Extract metadata
    const arxivId = f.split("_")[0] + "_" + f.split("_")[1];
    const arxivIdClean = arxivId.replace(/_/g, '.');

    // Extract title, authors, date from content
    const titleMatch = content.match(/# (?:Technical Review|YRSN Comparison): (.+)/);
    const title = titleMatch ? titleMatch[1] : `Paper ${arxivId}`;

    const authorsMatch = content.match(/\*\*Authors\*\*: (.+)/);
    const authors = authorsMatch ? authorsMatch[1] : "Unknown";

    const dateMatch = content.match(/\*\*Published\*\*: (\d{4}-\d{2}-\d{2})/);
    const publishedDate = dateMatch ? dateMatch[1] : null;

    // Placeholder citation count (in real implementation, fetch from Semantic Scholar or arXiv API)
    const citationCount = Math.floor(Math.random() * 150);

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
      arxivUrl: `https://arxiv.org/abs/${arxivIdClean}`,
      pdfUrl: `https://arxiv.org/pdf/${arxivIdClean}`,
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
