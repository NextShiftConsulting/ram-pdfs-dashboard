# Metrics

System performance and processing metrics.

```js
// Loading indicator
const loadingDiv = html`<div class="loading-container">
  <div class="spinner"></div>
  <p>Loading metrics...</p>
</div>`;

const papers = await FileAttachment("data/papers.json").json();
```

## Summary Statistics

<div class="grid grid-cols-3">
  <div class="metric-card">
    <div class="metric-value">${papers.summary.totalPapers}</div>
    <div class="metric-label">PDFs Downloaded</div>
  </div>
  <div class="metric-card">
    <div class="metric-value">${papers.summary.totalReviews}</div>
    <div class="metric-label">Reviews Generated</div>
  </div>
  <div class="metric-card">
    <div class="metric-value">${((papers.summary.totalReviews / Math.max(papers.summary.totalPapers, 1)) * 100).toFixed(0)}%</div>
    <div class="metric-label">Processing Rate</div>
  </div>
</div>

## Review Type Breakdown

```js
import * as Plot from "npm:@observablehq/plot";

const typeData = [
  {type: "YRSN Analysis", count: papers.byType.yrsn, pct: papers.byType.yrsn / papers.summary.totalReviews * 100},
  {type: "Tech Review", count: papers.byType.tech, pct: papers.byType.tech / papers.summary.totalReviews * 100},
  {type: "Other", count: papers.byType.other, pct: papers.byType.other / papers.summary.totalReviews * 100},
].filter(d => d.count > 0);
```

```js
Plot.plot({
  title: "Review Type Distribution",
  width: 500,
  height: 300,
  marks: [
    Plot.barX(typeData, {
      y: "type",
      x: "count",
      fill: "type",
      tip: d => `${d.type}: ${d.count} (${d.pct.toFixed(1)}%)`,
    }),
    Plot.text(typeData, {
      y: "type",
      x: "count",
      text: d => `${d.count}`,
      dx: 5,
      textAnchor: "start",
    }),
  ],
  color: {
    domain: ["YRSN Analysis", "Tech Review", "Other"],
    range: ["#2E86AB", "#7CB518", "#F39237"],
  },
  x: {label: "Count"},
  y: {label: null},
})
```

## Relevance Score Statistics

```js
const scores = papers.reviews
  .filter(r => r.relevanceScore !== null)
  .map(r => r.relevanceScore);

const avgScore = scores.length > 0
  ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
  : "N/A";

const highRelevance = scores.filter(s => s >= 7).length;
const medRelevance = scores.filter(s => s >= 4 && s < 7).length;
const lowRelevance = scores.filter(s => s < 4).length;
```

<div class="grid grid-cols-4">
  <div class="metric-card">
    <div class="metric-value">${avgScore}</div>
    <div class="metric-label">Avg Score</div>
  </div>
  <div class="metric-card highlight-high">
    <div class="metric-value">${highRelevance}</div>
    <div class="metric-label">High (7-10)</div>
  </div>
  <div class="metric-card highlight-med">
    <div class="metric-value">${medRelevance}</div>
    <div class="metric-label">Medium (4-6)</div>
  </div>
  <div class="metric-card highlight-low">
    <div class="metric-value">${lowRelevance}</div>
    <div class="metric-label">Low (0-3)</div>
  </div>
</div>

## System Status

<div class="card">

| Metric | Value |
|--------|-------|
| Last Updated | ${new Date(papers.summary.lastUpdated).toLocaleString()} |
| Processed Papers | ${papers.summary.processedCount} |
| Review Coverage | ${((papers.summary.totalReviews / Math.max(papers.summary.totalPapers, 1)) * 100).toFixed(1)}% |
| YRSN Coverage | ${((papers.byType.yrsn / Math.max(papers.summary.totalReviews, 1)) * 100).toFixed(1)}% |

</div>

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

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Grid Layouts */
.grid {
  display: grid;
  gap: 1.25rem;
  margin: 1.5rem 0;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* Metric Cards with Enhanced Styling */
.metric-card {
  background: linear-gradient(135deg, var(--theme-background-alt) 0%, var(--theme-background) 100%);
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.metric-card:hover .metric-value {
  animation: pulse 1s ease-in-out;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--theme-foreground-focus);
  transition: all 0.3s ease;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
  margin-top: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

/* Color Highlights */
.highlight-high {
  border-left: 4px solid #2E86AB;
}

.highlight-high .metric-value {
  color: #2E86AB;
}

.highlight-med {
  border-left: 4px solid #7CB518;
}

.highlight-med .metric-value {
  color: #7CB518;
}

.highlight-low {
  border-left: 4px solid #F39237;
}

.highlight-low .metric-value {
  color: #F39237;
}

/* Card Styling */
.card {
  background: linear-gradient(135deg, var(--theme-background-alt) 0%, var(--theme-background) 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card table {
  width: 100%;
  border-collapse: collapse;
}

.card th,
.card td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--theme-foreground-faint);
}

.card th {
  font-weight: 600;
  color: var(--theme-foreground-muted);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.card tr:last-child td {
  border-bottom: none;
}

.card tr:hover {
  background: rgba(46, 134, 171, 0.05);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .metric-card {
    padding: 1.5rem 1rem;
  }

  .metric-value {
    font-size: 2rem;
  }

  .metric-label {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }

  .metric-value {
    font-size: 1.75rem;
  }

  .card {
    padding: 1rem;
  }

  .card th,
  .card td {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}
</style>
