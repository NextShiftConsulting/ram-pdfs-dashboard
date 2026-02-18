# Papers

Browse all processed research papers and their reviews.

```js
const papers = await FileAttachment("data/papers.json").json();
```

## Quick Filters

<div class="filter-grid">

```js
const typeFilter = view(Inputs.select(["All", "yrsn", "tech", "other"], {
  label: "Review Type",
  value: "All"
}));
```

```js
const relevanceFilter = view(Inputs.select(["All", "High (7-10)", "Medium (4-6)", "Low (0-3)"], {
  label: "Relevance",
  value: "All"
}));
```

```js
const sortBy = view(Inputs.select(["relevance", "date", "arxivId"], {
  label: "Sort By",
  value: "relevance"
}));
```

```js
const topicFilter = view(Inputs.text({
  label: "Filter by Topic/Keywords",
  placeholder: "e.g., LLM, ranking, bias..."
}));
```

</div>

```js
// Apply all filters
let filteredReviews = papers.reviews;

// Type filter
if (typeFilter !== "All") {
  filteredReviews = filteredReviews.filter(r => r.type === typeFilter);
}

// Relevance filter
if (relevanceFilter !== "All") {
  if (relevanceFilter === "High (7-10)") {
    filteredReviews = filteredReviews.filter(r => r.relevanceScore >= 7);
  } else if (relevanceFilter === "Medium (4-6)") {
    filteredReviews = filteredReviews.filter(r => r.relevanceScore >= 4 && r.relevanceScore < 7);
  } else if (relevanceFilter === "Low (0-3)") {
    filteredReviews = filteredReviews.filter(r => r.relevanceScore !== null && r.relevanceScore < 4);
  }
}

// Topic/keyword filter (searches title, authors, filename, and arxivId)
if (topicFilter && topicFilter.trim() !== "") {
  const query = topicFilter.toLowerCase();
  filteredReviews = filteredReviews.filter(r =>
    r.filename.toLowerCase().includes(query) ||
    r.arxivId.toLowerCase().includes(query) ||
    (r.title && r.title.toLowerCase().includes(query)) ||
    (r.authors && r.authors.toLowerCase().includes(query))
  );
}

// Sort
if (sortBy === "relevance") {
  filteredReviews = filteredReviews.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
} else if (sortBy === "date") {
  filteredReviews = filteredReviews.sort((a, b) => b.arxivId.localeCompare(a.arxivId));
} else if (sortBy === "arxivId") {
  filteredReviews = filteredReviews.sort((a, b) => a.arxivId.localeCompare(b.arxivId));
}
```

<div class="card">
  <p>Showing <strong>${filteredReviews.length}</strong> of ${papers.reviews.length} reviews</p>
  <button onclick="exportBibTeX()">Export BibTeX</button>
</div>

## Reviews Table

```js
Inputs.table(filteredReviews, {
  columns: ["title", "arxivId", "type", "relevanceScore", "citations", "publishedDate"],
  header: {
    title: "Paper Title",
    arxivId: "ArXiv",
    type: "Type",
    relevanceScore: "Relevance",
    citations: "Citations",
    publishedDate: "Published"
  },
  format: {
    title: (d, i, data) => {
      const row = data[i];
      return html`<div class="paper-title">
        <strong>${d || row.filename}</strong><br/>
        <small style="color: #666;">${row.authors || 'Unknown authors'}</small>
      </div>`;
    },
    arxivId: (d, i, data) => {
      const row = data[i];
      return html`<div class="arxiv-links">
        <a href="${row.arxivUrl || `https://arxiv.org/abs/${d}`}" target="_blank" title="View on arXiv">${d}</a><br/>
        <a href="${row.pdfUrl || `https://arxiv.org/pdf/${d}`}" target="_blank" class="pdf-link">📄 PDF</a>
      </div>`;
    },
    relevanceScore: d => d !== null ? html`<span class="score score-${d >= 7 ? 'high' : d >= 4 ? 'medium' : 'low'}">${d}/10</span>` : "—",
    type: d => d === "yrsn" ? "🎯 YRSN" : d === "tech" ? "📋 Tech" : "📄 Other",
    citations: d => html`<span class="citations">${d !== undefined ? d : '—'}</span>`,
    publishedDate: d => d || "—"
  },
  rows: 20,
  width: {
    title: 400,
    arxivId: 120,
    type: 80,
    relevanceScore: 100,
    citations: 80,
    publishedDate: 100
  }
})
```

## Score Analysis

```js
import * as Plot from "npm:@observablehq/plot";

const scoredReviews = papers.reviews.filter(r => r.relevanceScore !== null);
```

```js
scoredReviews.length > 0 ? Plot.plot({
  title: `Relevance Scores (${scoredReviews.length} papers)`,
  width: 800,
  height: 400,
  x: {label: "ArXiv ID"},
  y: {label: "Score", domain: [0, 10]},
  marks: [
    Plot.barY(scoredReviews, {
      x: "arxivId",
      y: "relevanceScore",
      fill: d => d.relevanceScore >= 7 ? "High" : d.relevanceScore >= 4 ? "Medium" : "Low",
      tip: true,
      sort: {x: "-y"},
    }),
    Plot.ruleY([7], {stroke: "#2E86AB", strokeDasharray: "4"}),
    Plot.ruleY([4], {stroke: "#F39237", strokeDasharray: "4"}),
  ],
  color: {
    domain: ["High", "Medium", "Low"],
    range: ["#2E86AB", "#7CB518", "#F39237"],
    legend: true,
  },
}) : html`<p class="note">No scored reviews yet.</p>`
```

```js
// BibTeX export functionality
function generateBibTeX(reviews) {
  // Escape LaTeX special characters
  function escapeLaTeX(str) {
    if (!str) return str;
    return str.replace(/([&%$#_{}~^\\])/g, '\\$1');
  }

  return reviews.map(r => {
    const arxivIdClean = r.arxivIdClean || r.arxivId.replace(/_/g, '.');
    const arxivIdNoVersion = arxivIdClean.replace(/v\d+$/, '');
    const year = r.publishedDate ? r.publishedDate.substring(0, 4) : `20${r.arxivId.substring(0, 2)}`;
    const month = r.publishedDate ? r.publishedDate.substring(5, 7) : r.arxivId.substring(2, 4);
    const bibtexKey = `arxiv${arxivIdNoVersion.replace(/\./g, '_')}`;
    const title = escapeLaTeX(r.title || `Paper ${r.arxivId}`);

    // Format authors properly for BibTeX (comma-separated or "and"-separated)
    const authorList = r.authors ?
      r.authors.split(/,\s*(?![^()]*\))/).map(a => a.trim()).join(' and ') :
      "Author Name";
    const authors = escapeLaTeX(authorList);

    return `@article{${bibtexKey},
  title = {{${title}}},
  author = {${authors}},
  journal = {arXiv preprint arXiv:${arxivIdNoVersion}},
  year = {${year}},
  month = {${month}},
  url = {${r.arxivUrl || `https://arxiv.org/abs/${arxivIdNoVersion}`}},
  note = {Relevance Score: ${r.relevanceScore || 'N/A'}/10, YRSN Type: ${r.type}}
}`;
  }).join('\n\n');
}

function exportBibTeX() {
  const bibtex = generateBibTeX(filteredReviews);
  const blob = new Blob([bibtex], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `papers_export_${new Date().toISOString().split('T')[0]}.bib`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Make function globally available
window.exportBibTeX = exportBibTeX;
```

<style>
.card {
  background: var(--theme-background-alt);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card button {
  background: #2E86AB;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.card button:hover {
  background: #236B8E;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.note {
  color: var(--theme-foreground-muted);
}

.score {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  display: inline-block;
}

.score-high {
  background: #d4edda;
  color: #155724;
}

.score-medium {
  background: #fff3cd;
  color: #856404;
}

.score-low {
  background: #f8d7da;
  color: #721c24;
}

.citations {
  color: #666;
  font-weight: 600;
}

.paper-title {
  line-height: 1.4;
}

.paper-title strong {
  display: block;
  margin-bottom: 0.25rem;
}

.arxiv-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.arxiv-links a {
  text-decoration: none;
  color: #2E86AB;
}

.arxiv-links a:hover {
  text-decoration: underline;
}

.pdf-link {
  font-size: 0.875rem;
  color: #666 !important;
}

.pdf-link:hover {
  color: #2E86AB !important;
}
</style>
