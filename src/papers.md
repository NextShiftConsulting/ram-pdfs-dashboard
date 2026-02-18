# Papers

Browse all processed research papers and their reviews.

```js
// Loading indicator
const loadingDiv = html`<div class="loading-container">
  <div class="spinner"></div>
  <p>Loading papers...</p>
</div>`;

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

<div class="filter-actions">
  <button class="btn-clear" onclick="clearAllFilters()">🔄 Clear All Filters</button>
</div>

```js
// Clear filters function
function clearAllFilters() {
  typeFilter.value = "All";
  relevanceFilter.value = "All";
  sortBy.value = "relevance";
  topicFilter.value = "";
}
window.clearAllFilters = clearAllFilters;
```

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
  <div class="button-group">
    <button onclick="exportBibTeX()">Export BibTeX</button>
    <button onclick="exportCSV()">Export CSV</button>
  </div>
</div>

<div class="info-banner">
  💡 <strong>Tip:</strong> Click on any paper row to view the full review. ArXiv links can still be clicked separately.
</div>

## Reviews Table

```js
// State for modal
const selectedReview = Mutable(null);
const reviewContent = Mutable("");
```

```js
// Function to load and display review
function showReview(review) {
  selectedReview.value = review;
  // Use the review content that's already loaded in the data
  reviewContent.value = review.reviewContent || `# Error\n\nReview content not available for ${review.filename}`;
}

function closeReview() {
  selectedReview.value = null;
  reviewContent.value = "";
}

// Make functions globally available
window.showReview = showReview;
window.closeReview = closeReview;
```

```js
// Custom table with clickable rows
{
  const table = Inputs.table(filteredReviews, {
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
        return html`<div class="arxiv-links" onclick="event.stopPropagation()">
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
  });

  // Add click handlers to table rows
  const tableElement = table.querySelector('table');
  if (tableElement) {
    const tbody = tableElement.querySelector('tbody');
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        // Don't trigger if clicking on a link
        if (e.target.tagName === 'A' || e.target.closest('a')) {
          return;
        }

        const row = e.target.closest('tr');
        if (row) {
          const rowIndex = Array.from(tbody.children).indexOf(row);
          if (rowIndex >= 0 && rowIndex < filteredReviews.length) {
            showReview(filteredReviews[rowIndex]);
          }
        }
      });

      // Add hover effect to rows
      tbody.querySelectorAll('tr').forEach(tr => {
        tr.style.cursor = 'pointer';
        tr.addEventListener('mouseenter', () => {
          tr.style.backgroundColor = 'var(--theme-background-alt)';
        });
        tr.addEventListener('mouseleave', () => {
          tr.style.backgroundColor = '';
        });
      });
    }
  }

  return table;
}
```

```js
// Review modal with markdown rendering
import {marked} from "npm:marked";

html`${selectedReview.value ? html`
  <div class="modal-overlay" onclick="if (event.target === this) closeReview()">
    <div class="modal-content">
      <div class="modal-header">
        <h2>${selectedReview.value.title}</h2>
        <button class="close-button" onclick="closeReview()">✕</button>
      </div>
      <div class="modal-body">
        ${html([marked.parse(reviewContent.value)])}
      </div>
    </div>
  </div>
` : ''}`
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

// CSV export functionality
function generateCSV(reviews) {
  // Escape CSV values (handle commas, quotes, newlines)
  function escapeCSV(str) {
    if (str === null || str === undefined) return '';
    const strValue = String(str);
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  }

  // CSV header
  const header = 'arxivId,title,authors,relevance,type,date,citations';

  // CSV rows
  const rows = reviews.map(r => {
    const arxivId = escapeCSV(r.arxivId);
    const title = escapeCSV(r.title || r.filename);
    const authors = escapeCSV(r.authors || 'Unknown authors');
    const relevance = r.relevanceScore !== null && r.relevanceScore !== undefined ? r.relevanceScore : '';
    const type = escapeCSV(r.type);
    const date = escapeCSV(r.publishedDate || '');
    const citations = r.citations !== undefined ? r.citations : '';

    return `${arxivId},${title},${authors},${relevance},${type},${date},${citations}`;
  });

  return [header, ...rows].join('\n');
}

function exportCSV() {
  const csv = generateCSV(filteredReviews);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `papers_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Make functions globally available
window.exportBibTeX = exportBibTeX;
window.exportCSV = exportCSV;
```

<style>
/* Loading Indicator */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  animation: fadeIn 0.4s ease-out;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--theme-background-alt);
  border-top: 4px solid #2E86AB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Card Styles */
.card {
  background: linear-gradient(135deg, var(--theme-background-alt) 0%, var(--theme-background) 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.button-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.card button,
.btn-export,
.btn-clear {
  background: linear-gradient(135deg, #2E86AB 0%, #236B8E 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(46, 134, 171, 0.3);
}

.card button:hover,
.btn-export:hover,
.btn-clear:hover {
  background: linear-gradient(135deg, #236B8E 0%, #1d5570 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(46, 134, 171, 0.4);
}

.btn-clear {
  background: linear-gradient(135deg, #7CB518 0%, #679614 100%);
  box-shadow: 0 2px 6px rgba(124, 181, 24, 0.3);
}

.btn-clear:hover {
  background: linear-gradient(135deg, #679614 0%, #567e10 100%);
  box-shadow: 0 4px 10px rgba(124, 181, 24, 0.4);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
  animation: fadeInUp 0.6s ease-out;
}

.filter-actions {
  margin: 1rem 0;
  animation: fadeInUp 0.7s ease-out;
}

.info-banner {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-left: 4px solid #2E86AB;
  padding: 1.25rem;
  margin: 1.5rem 0;
  border-radius: 8px;
  color: #1565c0;
  box-shadow: 0 2px 6px rgba(46, 134, 171, 0.15);
  animation: fadeInUp 0.5s ease-out;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  overflow-y: auto;
}

.modal-content {
  background: var(--theme-background);
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid var(--theme-foreground-faintest);
  gap: 1rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.3;
  flex: 1;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--theme-foreground-muted);
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-button:hover {
  background: var(--theme-background-alt);
  color: var(--theme-foreground);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-body h1 {
  font-size: 1.75rem;
  margin-top: 0;
}

.modal-body h2 {
  font-size: 1.5rem;
  margin-top: 2rem;
  border-bottom: 1px solid var(--theme-foreground-faintest);
  padding-bottom: 0.5rem;
}

.modal-body h3 {
  font-size: 1.25rem;
  margin-top: 1.5rem;
}

.modal-body p {
  line-height: 1.6;
  margin: 1rem 0;
}

.modal-body ul, .modal-body ol {
  line-height: 1.6;
  margin: 1rem 0;
  padding-left: 2rem;
}

.modal-body pre {
  background: var(--theme-background-alt);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1rem 0;
}

.modal-body code {
  background: var(--theme-background-alt);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9em;
}

.modal-body pre code {
  background: transparent;
  padding: 0;
}

.modal-body blockquote {
  border-left: 4px solid #2E86AB;
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--theme-foreground-muted);
}

.modal-body a {
  color: #2E86AB;
  text-decoration: none;
}

.modal-body a:hover {
  text-decoration: underline;
}

.modal-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.modal-body th,
.modal-body td {
  padding: 0.5rem;
  border: 1px solid var(--theme-foreground-faintest);
  text-align: left;
}

.modal-body th {
  background: var(--theme-background-alt);
  font-weight: 600;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .card {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }

  .button-group {
    width: 100%;
    justify-content: stretch;
  }

  .btn-export,
  .btn-clear,
  .card button {
    flex: 1;
    min-width: 100px;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
  }

  .paper-title {
    font-size: 0.875rem;
  }

  .arxiv-links {
    font-size: 0.8rem;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-header h2 {
    font-size: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .info-banner {
    padding: 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .button-group {
    flex-direction: column;
  }

  .btn-export,
  .btn-clear,
  .card button {
    width: 100%;
  }

  .filter-grid {
    gap: 0.75rem;
  }

  .modal-content {
    width: 98%;
    max-height: 98vh;
  }

  .modal-header {
    padding: 0.75rem;
  }

  .modal-body {
    padding: 0.75rem;
  }
}
</style>
