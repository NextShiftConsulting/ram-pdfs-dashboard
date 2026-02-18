# Research Paper Monitor Dashboard

```js
// Loading indicator while data is being fetched
const loadingDiv = html`<div class="loading-container">
  <div class="spinner"></div>
  <p>Loading dashboard data...</p>
</div>`;

const papers = await FileAttachment("data/papers.json").json();
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Total Papers</h2>
    <span class="big">${papers.summary.totalPapers}</span>
  </div>
  <div class="card">
    <h2>Reviews Generated</h2>
    <span class="big">${papers.summary.totalReviews}</span>
  </div>
  <div class="card">
    <h2>YRSN Analyses</h2>
    <span class="big">${papers.summary.yrsnReviews}</span>
  </div>
  <div class="card">
    <h2>Tech Reviews</h2>
    <span class="big">${papers.summary.techReviews}</span>
  </div>
</div>

## Review Distribution

```js
import * as Plot from "npm:@observablehq/plot";

const typeData = [
  {type: "YRSN Analysis", count: papers.byType.yrsn},
  {type: "Tech Review", count: papers.byType.tech},
  {type: "Other", count: papers.byType.other},
];
```

```js
Plot.plot({
  title: "Reviews by Type",
  width: 600,
  height: 300,
  x: {label: "Type"},
  y: {label: "Count", grid: true},
  marks: [
    Plot.barY(typeData, {
      x: "type",
      y: "count",
      fill: "type",
      tip: true,
    }),
    Plot.ruleY([0]),
  ],
  color: {
    domain: ["YRSN Analysis", "Tech Review", "Other"],
    range: ["#2E86AB", "#7CB518", "#F39237"],
  },
})
```

## YRSN Relevance Scores

```js
const relevanceData = Object.entries(papers.relevanceDistribution || {})
  .map(([score, count]) => ({score: +score, count}))
  .sort((a, b) => a.score - b.score);
```

```js
relevanceData.length > 0 ? Plot.plot({
  title: "YRSN Relevance Score Distribution",
  width: 600,
  height: 300,
  x: {label: "Score (0-10)", domain: [0, 10]},
  y: {label: "Papers", grid: true},
  marks: [
    Plot.barY(relevanceData, {
      x: "score",
      y: "count",
      fill: d => d.score >= 7 ? "#2E86AB" : d.score >= 4 ? "#7CB518" : "#F39237",
      tip: true,
    }),
    Plot.ruleY([0]),
  ],
}) : html`<p class="note">No relevance scores available yet.</p>`
```

## Recent Reviews

```js
const recentReviews = papers.reviews.slice(0, 10);
```

<div class="card">

```js
display(html`
  <table>
    <thead>
      <tr>
        <th>Paper ID</th>
        <th>Title</th>
        <th>Type</th>
        <th>Relevance</th>
      </tr>
    </thead>
    <tbody>
      ${recentReviews.map(r => html`
        <tr>
          <td><a href="${r.arxivUrl}" target="_blank">${r.arxivIdClean}</a></td>
          <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.title}</td>
          <td><span style="text-transform: uppercase; font-weight: 500; color: ${r.type === 'yrsn' ? '#2E86AB' : '#7CB518'}">${r.type}</span></td>
          <td>${r.relevanceScore !== null ? r.relevanceScore + '/10' : "N/A"}</td>
        </tr>
      `)}
    </tbody>
  </table>
`);
```

</div>

---

<p class="note">Last updated: ${new Date(papers.summary.lastUpdated).toLocaleString()}</p>

<style>
/* Loading Indicator */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
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

/* Card Styles with Animations */
.big {
  font-size: 3rem;
  font-weight: bold;
  color: var(--theme-foreground-focus);
  animation: fadeInUp 0.6s ease-out;
}

.card {
  background: var(--theme-background-alt);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card h2 {
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

/* Grid Layouts */
.grid {
  display: grid;
  gap: 1.25rem;
  margin: 1rem 0;
}

.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* Typography */
.note {
  color: var(--theme-foreground-muted);
  font-size: 0.875rem;
  font-style: italic;
}

/* Table Styles */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  animation: fadeIn 0.8s ease-out;
}

table th {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 2px solid var(--theme-foreground-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.8rem;
}

table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--theme-foreground-faint);
  transition: all 0.2s ease;
}

table tr {
  transition: background 0.2s ease;
}

table tr:hover {
  background: var(--theme-background-alt);
  transform: scale(1.01);
}

/* Animations */
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .big {
    font-size: 2rem;
  }

  .card {
    padding: 1rem;
  }

  table {
    font-size: 0.75rem;
  }

  table th,
  table td {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }

  .big {
    font-size: 1.75rem;
  }
}
</style>
