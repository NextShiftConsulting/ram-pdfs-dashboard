# Papers

Browse all processed research papers and their reviews.

```js
const papers = await FileAttachment("data/papers.json").json();
```

## Filter Reviews

```js
const typeFilter = view(Inputs.select(["All", "yrsn", "tech", "other"], {
  label: "Review Type",
  value: "All"
}));
```

```js
const filteredReviews = typeFilter === "All"
  ? papers.reviews
  : papers.reviews.filter(r => r.type === typeFilter);
```

<div class="card">
  <p>Showing <strong>${filteredReviews.length}</strong> of ${papers.reviews.length} reviews</p>
</div>

## Reviews Table

```js
Inputs.table(filteredReviews, {
  columns: ["arxivId", "type", "relevanceScore", "filename"],
  header: {
    arxivId: "ArXiv ID",
    type: "Type",
    relevanceScore: "Score",
    filename: "File"
  },
  format: {
    relevanceScore: d => d ?? "—",
    type: d => d === "yrsn" ? "🎯 YRSN" : d === "tech" ? "📋 Tech" : "📄 Other"
  },
  sort: "relevanceScore",
  reverse: true,
  rows: 20
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

<style>
.card {
  background: var(--theme-background-alt);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}
.note {
  color: var(--theme-foreground-muted);
}
</style>
