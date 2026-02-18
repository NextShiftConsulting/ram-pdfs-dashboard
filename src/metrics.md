# Metrics

System performance and processing metrics.

```js
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
.grid {
  display: grid;
  gap: 1rem;
  margin: 1rem 0;
}
.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}
.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}
.metric-card {
  background: var(--theme-background-alt);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}
.metric-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--theme-foreground-focus);
}
.metric-label {
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
  margin-top: 0.5rem;
}
.highlight-high .metric-value { color: #2E86AB; }
.highlight-med .metric-value { color: #7CB518; }
.highlight-low .metric-value { color: #F39237; }
.card {
  background: var(--theme-background-alt);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}
</style>
