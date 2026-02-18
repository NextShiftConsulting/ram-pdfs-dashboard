# Topics - Zoomable Treemap

Research topics monitored by the YRSN Research Monitor.

<div class="info-banner">
  <strong>Interactive Treemap Navigation:</strong>
  <ul style="margin: 0.5rem 0 0 1.5rem; padding: 0;">
    <li><strong>Click category headers</strong> to drill down into subtopics and papers</li>
    <li><strong>Use breadcrumbs</strong> above to navigate back up the hierarchy (or press <kbd>ESC</kbd>)</li>
    <li><strong>Hover over papers</strong> to see relevance scores and details</li>
    <li><strong>Colors:</strong> Orange (low relevance) → Green (medium) → Blue (high relevance)</li>
  </ul>
</div>

```js
const papers = await FileAttachment("data/papers.json").json();
import * as d3 from "npm:d3";

// Performance stats for debugging large datasets
const perfStats = {
  totalPapers: papers.summary.totalPapers,
  totalReviews: papers.reviews.length,
  loadTime: Date.now()
};
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

// Build hierarchical data structure (optimized for thousands of papers)
function buildHierarchy() {
  const root = {
    name: "All Topics",
    children: []
  };

  const topicMap = new Map();
  const subtopicCache = new Map();

  // Process each review with optimized lookups
  papers.reviews.forEach(review => {
    const classifications = classifyPaper(review);

    classifications.forEach(({topic, subtopic}) => {
      const cacheKey = `${topic}::${subtopic}`;

      // Check cache first
      let subtopicNode = subtopicCache.get(cacheKey);

      if (!subtopicNode) {
        // Get or create topic
        let topicNode = topicMap.get(topic);
        if (!topicNode) {
          topicNode = { name: topic, children: [] };
          topicMap.set(topic, topicNode);
          root.children.push(topicNode);
        }

        // Get or create subtopic
        subtopicNode = topicNode.children.find(c => c.name === subtopic);
        if (!subtopicNode) {
          subtopicNode = { name: subtopic, children: [] };
          topicNode.children.push(subtopicNode);
        }

        subtopicCache.set(cacheKey, subtopicNode);
      }

      // Add paper with shortened display name for better rendering
      const displayName = review.arxivId
        ? review.arxivId.replace(/^(\d{4})\.(\d+)v.*$/, '$1.$2')
        : review.filename.substring(0, 15);

      subtopicNode.children.push({
        name: displayName,
        value: 1,
        relevance: review.relevanceScore,
        type: review.type,
        filename: review.filename,
        arxivId: review.arxivId,
      });
    });
  });

  // Sort children by relevance and count for better layout
  root.children.forEach(topic => {
    topic.children.forEach(subtopic => {
      subtopic.children.sort((a, b) => {
        const relA = a.relevance || 0;
        const relB = b.relevance || 0;
        return relB - relA; // Highest relevance first
      });
    });
    topic.children.sort((a, b) => b.children.length - a.children.length);
  });
  root.children.sort((a, b) => {
    const countA = a.children.reduce((sum, c) => sum + c.children.length, 0);
    const countB = b.children.reduce((sum, c) => sum + c.children.length, 0);
    return countB - countA;
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
// Treemap visualization with Canvas for performance (optimized for 1000s of papers)
{
  const width = 1200;
  const height = 700;

  // Create hierarchy and compute layout
  const root = d3.hierarchy(currentData)
    .sum(d => d.value || 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const treemap = d3.treemap()
    .size([width, height])
    .paddingOuter(3)
    .paddingInner(2)
    .paddingTop(35)  // Make room for category headers
    .round(true);

  treemap(root);

  // Enhanced color scale with better visual distinction
  const colorScale = d3.scaleSequential()
    .domain([0, 10])
    .interpolator(d3.interpolateRgb("#F39237", "#2E86AB"));

  // Create container with canvas
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.cursor = "pointer";
  canvas.style.display = "block";
  const ctx = canvas.getContext("2d");

  // Store clickable areas for hit detection
  const clickableAreas = [];
  const paperRects = [];

  // Optimized draw function
  function draw() {
    ctx.clearRect(0, 0, width, height);
    clickableAreas.length = 0;
    paperRects.length = 0;

    // Draw leaf nodes (papers) first
    root.leaves().forEach(d => {
      const x = d.x0;
      const y = d.y0;
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;

      // Only draw if visible (minimum 2px)
      if (w > 2 && h > 2) {
        // Color based on relevance score with fallback
        const relevance = d.data.relevance !== null && d.data.relevance !== undefined
          ? d.data.relevance
          : 5;
        ctx.fillStyle = colorScale(relevance);
        ctx.fillRect(x, y, w, h);

        // Border - thinner for better visibility at scale
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, w, h);

        // Store for hover detection
        paperRects.push({
          x, y, w, h,
          data: d.data,
          parent: d.parent?.data
        });
      }
    });

    // Draw group headers with enhanced visibility
    root.descendants().forEach(d => {
      if (d.children && d.depth >= 0) {
        const x = d.x0;
        const y = d.y0;
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        const headerHeight = 30;

        if (w > 80 && h > headerHeight) {
          // Gradient header background
          const gradient = ctx.createLinearGradient(x, y, x, y + headerHeight);
          gradient.addColorStop(0, "rgba(0, 0, 0, 0.85)");
          gradient.addColorStop(1, "rgba(0, 0, 0, 0.65)");
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, w, headerHeight);

          // Title text
          ctx.fillStyle = "#fff";
          ctx.font = "bold 13px -apple-system, system-ui, sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "top";

          const maxTitleWidth = w - 45;
          let title = d.data.name;

          // Smart truncation
          ctx.font = "bold 13px -apple-system, system-ui, sans-serif";
          let titleWidth = ctx.measureText(title).width;
          while (titleWidth > maxTitleWidth && title.length > 3) {
            title = title.substring(0, title.length - 1);
            titleWidth = ctx.measureText(title + "...").width;
          }
          if (titleWidth > maxTitleWidth) {
            title = title.substring(0, title.length - 3) + "...";
          }

          ctx.fillText(title, x + 8, y + 5);

          // Count badge
          const count = d.leaves().length;
          const countText = count.toString();
          ctx.font = "11px -apple-system, system-ui, sans-serif";
          const countWidth = ctx.measureText(countText).width;

          // Badge background
          const badgeX = x + w - countWidth - 20;
          const badgeY = y + 4;
          ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, countWidth + 12, 20, 10);
          ctx.fill();

          // Badge text
          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          ctx.fillText(countText, badgeX + (countWidth + 12) / 2, badgeY + 5);

          // Click indicator
          if (w > 150) {
            ctx.font = "10px -apple-system, system-ui, sans-serif";
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.textAlign = "left";
            ctx.fillText("Click to drill down →", x + 8, y + 18);
          }

          // Store clickable area
          if (d.data.name !== currentData.name) {
            clickableAreas.push({
              x, y, w, h: headerHeight,
              name: d.data.name,
              type: 'category'
            });
          }
        }
      }
    });
  }

  draw();

  // Track mouse movement to prevent accidental clicks while dragging
  let mouseDownPos = null;
  canvas.onmousedown = (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseDownPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  // Enhanced click handler with drag detection
  canvas.onclick = (event) => {
    const rect = canvas.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    // Prevent click if mouse moved more than 5px (likely a drag)
    if (mouseDownPos) {
      const dx = Math.abs(mx - mouseDownPos.x);
      const dy = Math.abs(my - mouseDownPos.y);
      if (dx > 5 || dy > 5) {
        mouseDownPos = null;
        return;
      }
    }
    mouseDownPos = null;

    // Check clickable category headers first
    for (const area of clickableAreas) {
      if (mx >= area.x && mx <= area.x + area.w &&
          my >= area.y && my <= area.y + area.h) {
        currentPath.value = [...currentPath, area.name];
        return;
      }
    }
  };

  // Enhanced tooltip
  let tooltip = null;
  canvas.onmousemove = (event) => {
    const rect = canvas.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    // Check for category headers first
    let found = false;
    for (const area of clickableAreas) {
      if (mx >= area.x && mx <= area.x + area.w &&
          my >= area.y && my <= area.y + area.h) {
        canvas.style.cursor = "pointer";
        canvas.title = `Click to explore ${area.name}`;
        found = true;
        break;
      }
    }

    if (!found) {
      // Check for papers
      for (let i = paperRects.length - 1; i >= 0; i--) {
        const r = paperRects[i];
        if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
          canvas.style.cursor = "default";
          const relevanceText = r.data.relevance !== null && r.data.relevance !== undefined
            ? r.data.relevance + "/10"
            : "Not scored";
          canvas.title = `${r.data.name}\nRelevance: ${relevanceText}\nType: ${r.data.type || 'N/A'}`;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      canvas.style.cursor = "default";
      canvas.title = "";
    }
  };

  container.appendChild(canvas);

  // Keyboard navigation (Escape to go back)
  const handleKeyPress = (event) => {
    if (event.key === 'Escape' && currentPath.length > 0) {
      currentPath.value = currentPath.slice(0, -1);
    }
  };

  // Add keyboard listener when canvas is visible
  window.addEventListener('keydown', handleKeyPress);

  // Cleanup on component removal
  const cleanup = () => {
    window.removeEventListener('keydown', handleKeyPress);
  };

  // Store cleanup for potential future use
  container._cleanup = cleanup;

  return container;
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

## Dataset Information

<div class="dataset-info">
  <p><strong>Dataset Size:</strong> ${papers.summary.totalPapers} total papers | ${papers.reviews.length} reviews processed</p>
  <p><strong>Last Updated:</strong> ${new Date(papers.summary.lastUpdated).toLocaleString()}</p>
  <p><strong>Visualization:</strong> Built with d3.treemap() - optimized for thousands of papers with Canvas rendering</p>
</div>

<style>
.dataset-info {
  background: var(--theme-background-alt);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 2rem 0;
  border-left: 4px solid #2E86AB;
  font-size: 0.9rem;
  color: var(--theme-foreground-muted);
}

.dataset-info p {
  margin: 0.5rem 0;
}

.dataset-info strong {
  color: var(--theme-foreground);
  font-weight: 600;
}
</style>

<style>
.breadcrumb-container {
  background: linear-gradient(135deg, var(--theme-background-alt) 0%, var(--theme-background) 100%);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.95rem;
}

.breadcrumb {
  color: var(--theme-foreground-focus);
  text-decoration: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  background: transparent;
}

.breadcrumb:hover:not(.active) {
  background: rgba(46, 134, 171, 0.1);
  transform: translateY(-1px);
  text-decoration: none;
  color: #2E86AB;
}

.breadcrumb.active {
  font-weight: 600;
  color: var(--theme-foreground);
  background: rgba(124, 181, 24, 0.15);
  padding: 0.4rem 0.8rem;
}

.separator {
  color: var(--theme-foreground-muted);
  font-weight: 300;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin: 2rem 0;
}

.stat-card {
  background: linear-gradient(135deg, var(--theme-background-alt) 0%, var(--theme-background) 100%);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
  margin: 0 0 0.75rem 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--theme-foreground-focus);
  background: linear-gradient(135deg, #2E86AB, #7CB518);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.legend-container {
  background: linear-gradient(135deg, var(--theme-background-alt) 0%, var(--theme-background) 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.legend-title {
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--theme-foreground);
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.legend-gradient {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.gradient-bar {
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(to right, #F39237, #7CB518, #2E86AB);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.gradient-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--theme-foreground-muted);
  font-weight: 500;
}

.card {
  background: linear-gradient(135deg, var(--theme-background-alt) 0%, var(--theme-background) 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  overflow-x: auto;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card table {
  width: 100%;
  border-collapse: collapse;
}

.card th {
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid var(--theme-background);
  color: var(--theme-foreground-muted);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.card td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease;
}

.card tr:hover td {
  background: rgba(46, 134, 171, 0.05);
}

.card tr:last-child td {
  border-bottom: none;
}

.note {
  color: var(--theme-foreground-muted);
  font-style: italic;
  padding: 2rem;
  text-align: center;
  background: var(--theme-background-alt);
  border-radius: 8px;
  margin: 1rem 0;
}

canvas {
  border: 2px solid var(--theme-background-alt);
  border-radius: 12px;
  margin: 1rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

canvas:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.info-banner {
  background: linear-gradient(135deg, #2E86AB 0%, #7CB518 100%);
  color: white;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  margin: 1rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-banner strong {
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
