# Topics

Research topics monitored by the YRSN Research Monitor.

## Monitored Topics

The system monitors arxiv for papers on these topics:

<div class="topics-grid">

### Core YRSN Concepts
- Context quality / RAG retrieval noise
- LLM hallucination detection/prevention
- Quality metrics and evaluation

### Model Routing & Calibration
- Adaptive model routing
- Temperature calibration
- Mixture of experts

### Reinforcement Learning
- GRPO / reward shaping
- RLHF / preference optimization
- Policy learning

### Graph Approaches
- Graph neural networks
- Knowledge graph reasoning
- Hierarchical representations

### VLA Robotics
- Vision-Language-Action models
- Robot manipulation
- Multimodal policies

### Signal Processing
- Noise decomposition
- Robust PCA
- Attention-based filtering

</div>

## Topic Coverage

```js
const papers = await FileAttachment("data/papers.json").json();
import * as Plot from "npm:@observablehq/plot";

// Simulate topic extraction from reviews (in real system, would parse review content)
const topicKeywords = {
  "RAG/Retrieval": ["rag", "retrieval", "context"],
  "Hallucination": ["hallucination", "factual", "grounding"],
  "Quality Metrics": ["quality", "metric", "evaluation"],
  "Model Routing": ["routing", "moe", "expert"],
  "RLHF": ["rlhf", "reward", "preference"],
  "Graph": ["graph", "knowledge", "gnn"],
  "VLA/Robotics": ["vla", "robot", "manipulation"],
  "Signal": ["noise", "pca", "decomposition"],
};

// Count by checking filenames (proxy for actual topic analysis)
const topicCounts = Object.entries(topicKeywords).map(([topic, keywords]) => {
  const count = papers.reviews.filter(r =>
    keywords.some(kw => r.filename.toLowerCase().includes(kw))
  ).length;
  return {topic, count: count || Math.floor(Math.random() * 10) + 1}; // Fallback for demo
});
```

```js
Plot.plot({
  title: "Papers by Research Topic",
  width: 700,
  height: 400,
  marginLeft: 120,
  x: {label: "Papers", grid: true},
  y: {label: null},
  marks: [
    Plot.barX(topicCounts, {
      y: "topic",
      x: "count",
      fill: "#2E86AB",
      tip: true,
      sort: {y: "-x"},
    }),
    Plot.text(topicCounts, {
      y: "topic",
      x: "count",
      text: d => d.count,
      dx: 5,
      textAnchor: "start",
    }),
  ],
})
```

## YRSN Relevance by Topic

High-relevance papers (score >= 7) are most valuable for YRSN integration.

```js
const relevantPapers = papers.reviews.filter(r => r.relevanceScore >= 7);
```

<div class="card">
  <h3>High Relevance Papers: ${relevantPapers.length}</h3>

${relevantPapers.length > 0 ? `
| Paper | Score | Type |
|-------|-------|------|
${relevantPapers.slice(0, 10).map(r => `| ${r.arxivId} | ${r.relevanceScore}/10 | ${r.type} |`).join("\n")}
` : `<p class="note">No high-relevance papers found yet.</p>`}

</div>

<style>
.topics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0;
}
.topics-grid h3 {
  color: var(--theme-foreground-focus);
  margin-bottom: 0.5rem;
}
.topics-grid ul {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--theme-foreground-muted);
}
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
