# Topics - Zoomable Treemap

Research topics monitored by the YRSN Research Monitor.

<div class="info-banner">
  <strong>How to use:</strong> Click on any topic category (the labeled areas) to drill down into subtopics and papers. Use the breadcrumb trail above the visualization to navigate back up. Colors represent relevance scores (orange = low, blue = high).
</div>

```js
const papers = await FileAttachment("data/papers.json").json();
import * as d3 from "npm:d3";
```

```js
// Build hierarchical topic structure with keyword-based classification
const topicKeywords = {
  "Core YRSN": {
    keywords: [],
    children: {
      "RAG/Retrieval": ["rag", "retrieval", "context", "augment"],
      "Hallucination Detection": ["hallucination", "factual", "grounding", "truthful"],
      "Quality Metrics": ["quality", "metric", "evaluation", "benchmark"],
    }
  },
  "Model Routing": {
    keywords: [],
    children: {
      "Adaptive Routing": ["routing", "adaptive", "dynamic"],
      "Mixture of Experts": ["moe", "expert", "mixture"],
      "Temperature Calibration": ["temperature", "calibration", "confidence"],
    }
  },
  "Reinforcement Learning": {
    keywords: [],
    children: {
      "GRPO": ["grpo", "reward", "shaping"],
      "RLHF": ["rlhf", "preference", "optimization", "human"],
      "Policy Learning": ["policy", "learning", "agent"],
    }
  },
  "Graph Methods": {
    keywords: [],
    children: {
      "Graph Neural Networks": ["gnn", "graph neural"],
      "Knowledge Graphs": ["knowledge graph", "reasoning"],
      "Hierarchical": ["hierarchical", "hierarchy", "tree"],
    }
  },
  "VLA Robotics": {
    keywords: [],
    children: {
      "Vision-Language-Action": ["vla", "vision language action"],
      "Robot Manipulation": ["robot", "manipulation", "grasp"],
      "Multimodal Policies": ["multimodal", "policy", "action"],
    }
  },
  "Signal Processing": {
    keywords: [],
    children: {
      "Noise Decomposition": ["noise", "decomposition"],
      "Robust PCA": ["pca", "robust", "principal"],
      "Attention Filtering": ["attention", "filter"],
    }
  },
};

// Classify each paper into topics
function classifyPaper(review) {
  const text = (review.filename + " " + (review.arxivId || "")).toLowerCase();
  const matches = [];

  for (const [topicName, topicData] of Object.entries(topicKeywords)) {
    for (const [subtopicName, keywords] of Object.entries(topicData.children)) {
      if (keywords.some(kw => text.includes(kw))) {
        matches.push({ topic: topicName, subtopic: subtopicName });
      }
    }
  }

  // If no match, assign to "Other"
  if (matches.length === 0) {
    matches.push({ topic: "Other", subtopic: "Uncategorized" });
  }

  return matches;
}

// Build hierarchical data structure
function buildHierarchy() {
  const root = {
    name: "All Topics",
    children: []
  };

  const topicMap = new Map();

  // Process each review
  papers.reviews.forEach(review => {
    const classifications = classifyPaper(review);

    classifications.forEach(({topic, subtopic}) => {
      // Get or create topic
      let topicNode = topicMap.get(topic);
      if (!topicNode) {
        topicNode = { name: topic, children: [] };
        topicMap.set(topic, topicNode);
        root.children.push(topicNode);
      }

      // Get or create subtopic
      let subtopicNode = topicNode.children.find(c => c.name === subtopic);
      if (!subtopicNode) {
        subtopicNode = { name: subtopic, children: [] };
        topicNode.children.push(subtopicNode);
      }

      // Add paper
      subtopicNode.children.push({
        name: review.arxivId || review.filename,
        value: 1,
        relevance: review.relevanceScore || 0,
        type: review.type,
        filename: review.filename,
      });
    });
  });

  return root;
}

const hierarchyData = buildHierarchy();
```

```js
// Mutable state for zoom navigation
const currentPath = Mutable([]);
```

```js
// Compute current view based on zoom path
function getCurrentData() {
  let node = hierarchyData;
  for (const step of currentPath) {
    node = node.children.find(c => c.name === step);
    if (!node) return hierarchyData;
  }
  return node;
}

const currentData = getCurrentData();
```

<div class="breadcrumb-container">
  <div class="breadcrumbs">
    ${currentPath.length === 0
      ? html`<span class="breadcrumb active">All Topics</span>`
      : html`
        <a href="#" class="breadcrumb" onclick=${() => currentPath.value = []}>All Topics</a>
        ${currentPath.map((step, i) => html`
          <span class="separator">›</span>
          ${i === currentPath.length - 1
            ? html`<span class="breadcrumb active">${step}</span>`
            : html`<a href="#" class="breadcrumb" onclick=${() => currentPath.value = currentPath.slice(0, i + 1)}>${step}</a>`
          }
        `)}
      `}
  </div>
</div>

```js
// Treemap visualization with Canvas for performance
{
  const width = 1000;
  const height = 600;

  // Create hierarchy and compute layout
  const root = d3.hierarchy(currentData)
    .sum(d => d.value || 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const treemap = d3.treemap()
    .size([width, height])
    .padding(2)
    .round(true);

  treemap(root);

  // Color scale based on relevance
  const colorScale = d3.scaleSequential()
    .domain([0, 10])
    .interpolator(d3.interpolateRgb("#F39237", "#2E86AB"));

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.cursor = "pointer";
  const ctx = canvas.getContext("2d");

  // Store rectangles for hit detection
  const rectangles = [];

  // Draw treemap
  function draw() {
    ctx.clearRect(0, 0, width, height);
    rectangles.length = 0;

    root.leaves().forEach(d => {
      const x = d.x0;
      const y = d.y0;
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;

      // Only draw if visible
      if (w > 1 && h > 1) {
        // Color based on relevance score or default
        const relevance = d.data.relevance || 5;
        ctx.fillStyle = colorScale(relevance);
        ctx.fillRect(x, y, w, h);

        // Border
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        // Text label if space allows
        if (w > 60 && h > 30) {
          ctx.fillStyle = "#fff";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const text = d.data.name.substring(0, 20);
          ctx.fillText(text, x + w/2, y + h/2);

          // Show relevance if scored
          if (d.data.relevance > 0 && h > 50) {
            ctx.font = "10px sans-serif";
            ctx.fillText(`Score: ${d.data.relevance}`, x + w/2, y + h/2 + 15);
          }
        }

        // Store for click detection
        rectangles.push({
          x, y, w, h,
          data: d.data,
          parent: d.parent.data
        });
      }
    });

    // Draw group labels for non-leaf nodes (with semi-transparent background)
    root.descendants().forEach(d => {
      if (d.children && d.depth < 2) {
        const x = d.x0;
        const y = d.y0;
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;

        if (w > 100 && h > 40) {
          // Semi-transparent header background
          ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
          ctx.fillRect(x, y, w, Math.min(40, h));

          // Title
          ctx.fillStyle = "#fff";
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          const title = d.data.name.length > 30 ? d.data.name.substring(0, 27) + "..." : d.data.name;
          ctx.fillText(title, x + 5, y + 5);

          // Count
          const count = d.leaves().length;
          ctx.font = "11px sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillText(`${count} paper${count !== 1 ? 's' : ''} • Click to explore`, x + 5, y + 23);
        }
      }
    });
  }

  draw();

  // Click handler for zooming
  canvas.onclick = (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check for group clicks first (for drilling down)
    let clicked = false;
    root.descendants().forEach(d => {
      if (d.children && d.depth >= 0 && !clicked) {
        const x0 = d.x0;
        const y0 = d.y0;
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;

        // Check if click is in the header area (top 40px of group)
        if (x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + 40 && h > 40) {
          if (d.data.name !== currentData.name) {
            currentPath.value = [...currentPath, d.data.name];
            clicked = true;
          }
        }
      }
    });
  };

  // Tooltip on hover
  canvas.onmousemove = (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let found = false;
    for (let i = rectangles.length - 1; i >= 0; i--) {
      const r = rectangles[i];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        canvas.title = `${r.data.name}\nRelevance: ${r.data.relevance || 'N/A'}\nType: ${r.data.type || 'N/A'}`;
        found = true;
        break;
      }
    }
    if (!found) canvas.title = "";
  };

  return canvas;
}
```

## Current View Statistics

<div class="stats-grid">
  <div class="stat-card">
    <h3>Total Papers</h3>
    <div class="stat-value">${d3.hierarchy(currentData).leaves().length}</div>
  </div>
  <div class="stat-card">
    <h3>Average Relevance</h3>
    <div class="stat-value">${(() => {
      const leaves = d3.hierarchy(currentData).leaves();
      const scored = leaves.filter(d => d.data.relevance > 0);
      if (scored.length === 0) return "N/A";
      const avg = d3.mean(scored, d => d.data.relevance);
      return avg.toFixed(1);
    })()}</div>
  </div>
  <div class="stat-card">
    <h3>High Relevance (≥7)</h3>
    <div class="stat-value">${d3.hierarchy(currentData).leaves().filter(d => d.data.relevance >= 7).length}</div>
  </div>
  <div class="stat-card">
    <h3>Categories</h3>
    <div class="stat-value">${currentData.children ? currentData.children.length : 0}</div>
  </div>
</div>

## Legend

<div class="legend-container">
  <div class="legend-title">Relevance Score:</div>
  <div class="legend-gradient">
    <div class="gradient-bar"></div>
    <div class="gradient-labels">
      <span>0 (Low)</span>
      <span>5 (Medium)</span>
      <span>10 (High)</span>
    </div>
  </div>
</div>

## High-Value Papers in Current View

```js
const highValuePapers = d3.hierarchy(currentData)
  .leaves()
  .filter(d => d.data.relevance >= 7)
  .sort((a, b) => b.data.relevance - a.data.relevance)
  .slice(0, 10)
  .map(d => d.data);
```

${highValuePapers.length > 0 ? html`
<div class="card">
  <table>
    <thead>
      <tr>
        <th>Paper</th>
        <th>Score</th>
        <th>Type</th>
      </tr>
    </thead>
    <tbody>
      ${highValuePapers.map(p => html`
        <tr>
          <td>${p.name}</td>
          <td>${p.relevance}/10</td>
          <td>${p.type === 'yrsn' ? '🎯 YRSN' : p.type === 'tech' ? '📋 Tech' : '📄 Other'}</td>
        </tr>
      `)}
    </tbody>
  </table>
</div>
` : html`<p class="note">No high-relevance papers in current view.</p>`}

<style>
.breadcrumb-container {
  background: var(--theme-background-alt);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.breadcrumb {
  color: var(--theme-foreground-focus);
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.breadcrumb:hover:not(.active) {
  background: var(--theme-background);
  text-decoration: underline;
}

.breadcrumb.active {
  font-weight: bold;
  color: var(--theme-foreground);
}

.separator {
  color: var(--theme-foreground-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: var(--theme-background-alt);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.stat-card h3 {
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
  margin: 0 0 0.5rem 0;
  font-weight: normal;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--theme-foreground-focus);
}

.legend-container {
  background: var(--theme-background-alt);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--theme-foreground);
}

.legend-gradient {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gradient-bar {
  height: 30px;
  border-radius: 4px;
  background: linear-gradient(to right, #F39237, #7CB518, #2E86AB);
}

.gradient-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
}

.card {
  background: var(--theme-background-alt);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

.card table {
  width: 100%;
  border-collapse: collapse;
}

.card th {
  text-align: left;
  padding: 0.5rem;
  border-bottom: 2px solid var(--theme-background);
  color: var(--theme-foreground-muted);
  font-weight: 600;
}

.card td {
  padding: 0.5rem;
  border-bottom: 1px solid var(--theme-background);
}

.card tr:last-child td {
  border-bottom: none;
}

.note {
  color: var(--theme-foreground-muted);
  font-style: italic;
  padding: 1rem;
  text-align: center;
}

canvas {
  border: 1px solid var(--theme-background-alt);
  border-radius: 8px;
  margin: 1rem 0;
}

.info-banner {
  background: linear-gradient(135deg, #2E86AB 0%, #7CB518 100%);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
