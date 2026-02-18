# Review Templates

Interactive templates for conducting different types of paper reviews. Fill in the forms below to generate structured review documents.

---

## 1. Foundational Comparison Template (RSCT vs X)

Use this template when comparing RSCT (Rotor Simplex Control Theory) against another foundational approach or system.

```js
const rsctFormData = view(Inputs.form({
  paperTitle: Inputs.text({label: "Paper Title", placeholder: "Enter the paper title"}),
  arxivId: Inputs.text({label: "ArXiv ID", placeholder: "e.g., 2401.12345"}),
  comparisonSystem: Inputs.text({label: "System Being Compared", placeholder: "e.g., Traditional MPC, Transformer-based Control"}),

  // Core Comparison Dimensions
  stateRepresentation: Inputs.textarea({
    label: "State Representation",
    placeholder: "How does X represent system state vs RSCT's R+S+N simplex?",
    rows: 3
  }),

  controlMechanism: Inputs.textarea({
    label: "Control Mechanism",
    placeholder: "What is X's control approach vs RSCT's rotor dynamics?",
    rows: 3
  }),

  stabilityGuarantees: Inputs.textarea({
    label: "Stability Guarantees",
    placeholder: "What formal guarantees does X provide vs RSCT's Lyapunov-based proofs?",
    rows: 3
  }),

  computationalComplexity: Inputs.textarea({
    label: "Computational Complexity",
    placeholder: "Compare computational requirements (time/space complexity)",
    rows: 2
  }),

  // Key Advantages
  rsctAdvantages: Inputs.textarea({
    label: "RSCT Advantages",
    placeholder: "Where does RSCT outperform X? (geometric interpretability, simplex constraints, etc.)",
    rows: 3
  }),

  xAdvantages: Inputs.textarea({
    label: "Comparison System Advantages",
    placeholder: "Where does X outperform RSCT? (maturity, tooling, specific domains, etc.)",
    rows: 3
  }),

  // Integration Potential
  integrationOpportunities: Inputs.textarea({
    label: "Integration Opportunities",
    placeholder: "Can RSCT and X be combined? Hybrid approaches?",
    rows: 3
  }),

  relevanceScore: Inputs.range([0, 10], {label: "Relevance Score", step: 1, value: 5}),
  priority: Inputs.select(["HIGH", "MEDIUM", "LOW"], {label: "Priority"}),

  additionalNotes: Inputs.textarea({
    label: "Additional Notes",
    placeholder: "Any other observations or context",
    rows: 3
  })
}));
```

```js
function generateRSCTComparison(data) {
  if (!data.paperTitle) return "";

  return `# RSCT Foundational Comparison: ${data.paperTitle}

## Paper Metadata
- **ArXiv ID**: ${data.arxivId || "N/A"}
- **Comparison System**: ${data.comparisonSystem || "N/A"}
- **Relevance Score**: ${data.relevanceScore}/10
- **Priority**: ${data.priority}

---

## Core Comparison Dimensions

### State Representation

**RSCT Approach**: Barycentric simplex coordinates (R+S+N=1) providing geometric constraints and interpretability.

**${data.comparisonSystem} Approach**:
${data.stateRepresentation || "[To be filled]"}

### Control Mechanism

**RSCT Approach**: Rotor dynamics with geometric flows on the simplex manifold.

**${data.comparisonSystem} Approach**:
${data.controlMechanism || "[To be filled]"}

### Stability Guarantees

**RSCT Approach**: Lyapunov-based stability proofs with simplex invariance guarantees.

**${data.comparisonSystem} Approach**:
${data.stabilityGuarantees || "[To be filled]"}

### Computational Complexity

${data.computationalComplexity || "[To be filled]"}

---

## Comparative Analysis

### RSCT Advantages

${data.rsctAdvantages || "[To be filled]"}

### ${data.comparisonSystem} Advantages

${data.xAdvantages || "[To be filled]"}

---

## Integration Opportunities

${data.integrationOpportunities || "[To be filled]"}

---

## Priority Assessment: ${data.priority}

${data.additionalNotes || "[Additional context to be added]"}

---

**Generated**: ${new Date().toISOString()}
`;
}
```

<div class="template-output">

### Generated RSCT Comparison Document

```js
display(html`<pre style="background: var(--theme-background-alt); padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.875rem;">${generateRSCTComparison(rsctFormData)}</pre>`);
```

```js
display(Inputs.button("Copy to Clipboard", {
  value: null,
  reduce: () => {
    navigator.clipboard.writeText(generateRSCTComparison(rsctFormData));
    return "Copied!";
  }
}));
```

</div>

---

## 2. Patent/Prior Art Template

Use this template when analyzing papers for patent prior art or IP considerations.

```js
const patentFormData = view(Inputs.form({
  paperTitle: Inputs.text({label: "Paper Title", placeholder: "Enter the paper title"}),
  arxivId: Inputs.text({label: "ArXiv ID", placeholder: "e.g., 2401.12345"}),
  publicationDate: Inputs.date({label: "Publication Date"}),
  authors: Inputs.text({label: "Authors", placeholder: "Comma-separated list"}),

  // Patent Claims Analysis
  relevantClaims: Inputs.textarea({
    label: "Relevant Patent Claims",
    placeholder: "Which YRSN/RSCT patent claims does this paper relate to?",
    rows: 3
  }),

  priorArtStatus: Inputs.select(
    ["Blocking Prior Art", "Related Prior Art", "Non-blocking", "Novel Extension"],
    {label: "Prior Art Status"}
  ),

  // Technical Overlap
  technicalOverlap: Inputs.textarea({
    label: "Technical Overlap",
    placeholder: "Specific techniques, methods, or claims that overlap with YRSN IP",
    rows: 4
  }),

  noveltyAnalysis: Inputs.textarea({
    label: "Novelty Analysis",
    placeholder: "What is novel in the paper vs existing YRSN work?",
    rows: 3
  }),

  // Differentiation
  yrsnDifferentiators: Inputs.textarea({
    label: "YRSN Differentiators",
    placeholder: "How does YRSN's approach differ from this paper? Key distinguishing features.",
    rows: 4
  }),

  // Action Items
  patentAction: Inputs.select(
    ["File new claims", "Update existing patents", "Monitor for infringement", "No action needed"],
    {label: "Recommended Patent Action"}
  ),

  legalReviewNeeded: Inputs.toggle({label: "Legal Review Recommended", value: false}),

  citationRecommendation: Inputs.textarea({
    label: "Citation Recommendation",
    placeholder: "Should this be cited in patents? How?",
    rows: 2
  }),

  riskLevel: Inputs.select(["HIGH", "MEDIUM", "LOW"], {label: "IP Risk Level"}),

  notes: Inputs.textarea({
    label: "Additional Notes",
    placeholder: "Legal considerations, timeline concerns, etc.",
    rows: 3
  })
}));
```

```js
function generatePatentReview(data) {
  if (!data.paperTitle) return "";

  return `# Patent/Prior Art Analysis: ${data.paperTitle}

## Document Metadata
- **ArXiv ID**: ${data.arxivId || "N/A"}
- **Publication Date**: ${data.publicationDate ? new Date(data.publicationDate).toLocaleDateString() : "N/A"}
- **Authors**: ${data.authors || "N/A"}
- **Analysis Date**: ${new Date().toLocaleDateString()}

---

## Prior Art Assessment

### Status: ${data.priorArtStatus || "To be determined"}

**IP Risk Level**: ${data.riskLevel || "MEDIUM"}

${data.legalReviewNeeded ? "⚠️ **LEGAL REVIEW RECOMMENDED**" : ""}

---

## Relevant Patent Claims

${data.relevantClaims || "[Identify specific YRSN/RSCT patent claims affected]"}

---

## Technical Overlap Analysis

${data.technicalOverlap || "[Describe specific overlaps with YRSN IP]"}

---

## Novelty Analysis

**What's Novel in This Paper**:
${data.noveltyAnalysis || "[Describe novel contributions not covered by YRSN patents]"}

**YRSN Differentiators**:
${data.yrsnDifferentiators || "[Explain how YRSN's approach is distinct]"}

---

## Patent Strategy Recommendations

### Recommended Action: ${data.patentAction || "To be determined"}

### Citation Recommendation

${data.citationRecommendation || "[Guidance on whether/how to cite this work in patent applications]"}

---

## Additional Considerations

${data.notes || "[Legal, timing, or strategic notes]"}

---

## Review Checklist

- [ ] Technical overlap documented
- [ ] Patent claims mapped
- [ ] Novelty differentiation clear
- [ ] Legal team notified (if applicable)
- [ ] Citation strategy defined
- [ ] Risk mitigation plan in place

---

**Reviewer**: [Name]
**Review Date**: ${new Date().toISOString()}
**Next Review**: [Date if monitoring required]
`;
}
```

<div class="template-output">

### Generated Patent Review Document

```js
display(html`<pre style="background: var(--theme-background-alt); padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.875rem;">${generatePatentReview(patentFormData)}</pre>`);
```

```js
display(Inputs.button("Copy to Clipboard", {
  value: null,
  reduce: () => {
    navigator.clipboard.writeText(generatePatentReview(patentFormData));
    return "Copied!";
  }
}));
```

</div>

---

## 3. Implementation Review Template

Use this template when evaluating papers for concrete implementation in YRSN codebase.

```js
const implFormData = view(Inputs.form({
  paperTitle: Inputs.text({label: "Paper Title", placeholder: "Enter the paper title"}),
  arxivId: Inputs.text({label: "ArXiv ID", placeholder: "e.g., 2401.12345"}),

  // Implementation Scope
  targetComponent: Inputs.select(
    ["HybridSimplexRotor", "ModelRouter", "LieDetector", "Enforcement Engine", "Training Pipeline", "Other"],
    {label: "Target Component"}
  ),

  implementationScope: Inputs.select(
    ["Drop-in replacement", "New module", "Enhancement to existing", "Experimental prototype"],
    {label: "Implementation Scope"}
  ),

  // Technical Requirements
  dependencies: Inputs.textarea({
    label: "Dependencies Required",
    placeholder: "New libraries, models, or infrastructure needed",
    rows: 2
  }),

  codeChanges: Inputs.textarea({
    label: "Code Changes Required",
    placeholder: "Which files/modules need modification? Estimated LOC?",
    rows: 3
  }),

  // Design Considerations
  architectureImpact: Inputs.textarea({
    label: "Architecture Impact",
    placeholder: "How does this affect system architecture? Breaking changes?",
    rows: 3
  }),

  p15Compliance: Inputs.select(
    ["Fully compliant (uses HybridSimplexRotor)", "Prototype exception", "Non-compliant (needs refactor)", "N/A"],
    {label: "P15 Compliance Status"}
  ),

  // Testing Strategy
  testingStrategy: Inputs.textarea({
    label: "Testing Strategy",
    placeholder: "Unit tests, integration tests, validation experiments needed",
    rows: 3
  }),

  validationMetrics: Inputs.textarea({
    label: "Validation Metrics",
    placeholder: "How will we measure success? Performance benchmarks?",
    rows: 2
  }),

  // Effort Estimation
  effortEstimate: Inputs.select(
    ["1-2 days", "1 week", "2-4 weeks", "1-2 months", "3+ months"],
    {label: "Effort Estimate"}
  ),

  developerSkills: Inputs.textarea({
    label: "Required Skills",
    placeholder: "PyTorch, geometric ML, control theory, etc.",
    rows: 2
  }),

  // Risks and Blockers
  technicalRisks: Inputs.textarea({
    label: "Technical Risks",
    placeholder: "What could go wrong? Numerical stability, scalability concerns, etc.",
    rows: 3
  }),

  blockers: Inputs.textarea({
    label: "Known Blockers",
    placeholder: "Missing data, unclear paper details, infrastructure limitations",
    rows: 2
  }),

  // Prioritization
  implementationPriority: Inputs.select(["HIGH", "MEDIUM", "LOW"], {label: "Priority"}),

  expectedImpact: Inputs.textarea({
    label: "Expected Impact",
    placeholder: "Performance gains, new capabilities, research value",
    rows: 2
  }),

  notes: Inputs.textarea({
    label: "Implementation Notes",
    placeholder: "Additional context, alternatives considered, etc.",
    rows: 3
  })
}));
```

```js
function generateImplementationReview(data) {
  if (!data.paperTitle) return "";

  return `# Implementation Review: ${data.paperTitle}

## Paper Metadata
- **ArXiv ID**: ${data.arxivId || "N/A"}
- **Target Component**: ${data.targetComponent}
- **Implementation Scope**: ${data.implementationScope}
- **Priority**: ${data.implementationPriority || "MEDIUM"}

---

## Implementation Scope

### Component Integration

**Target**: ${data.targetComponent}

**Type**: ${data.implementationScope}

**P15 Compliance**: ${data.p15Compliance || "To be determined"}

${data.p15Compliance === "Non-compliant (needs refactor)" ? "⚠️ **WARNING**: Non-compliant implementation requires refactoring to use HybridSimplexRotor before production deployment." : ""}

---

## Technical Requirements

### Dependencies

${data.dependencies || "[List required libraries, models, or infrastructure]"}

### Code Changes

${data.codeChanges || "[Specify files/modules and estimated LOC]"}

### Architecture Impact

${data.architectureImpact || "[Describe system architecture changes]"}

---

## Testing and Validation

### Testing Strategy

${data.testingStrategy || "[Outline unit, integration, and validation tests]"}

### Validation Metrics

${data.validationMetrics || "[Define success criteria and benchmarks]"}

---

## Effort Estimation

**Estimated Effort**: ${data.effortEstimate || "To be estimated"}

**Required Skills**:
${data.developerSkills || "[Specify technical expertise needed]"}

---

## Risk Assessment

### Technical Risks

${data.technicalRisks || "[Identify potential technical challenges]"}

### Known Blockers

${data.blockers || "[List any blocking issues]"}

---

## Impact Analysis

### Expected Impact: ${data.implementationPriority || "MEDIUM"}

${data.expectedImpact || "[Describe anticipated performance, capability, or research benefits]"}

---

## Implementation Plan

1. **Preparation**
   - [ ] Review paper implementation details
   - [ ] Set up development branch
   - [ ] Install dependencies

2. **Core Implementation**
   - [ ] Implement base functionality
   - [ ] Ensure P15 compliance (if applicable)
   - [ ] Write unit tests

3. **Integration**
   - [ ] Integrate with existing components
   - [ ] Update architecture documentation
   - [ ] Run integration tests

4. **Validation**
   - [ ] Execute validation experiments
   - [ ] Compare against baselines
   - [ ] Document results

5. **Deployment**
   - [ ] Code review
   - [ ] Merge to main
   - [ ] Update production checkpoints (if applicable)

---

## Additional Notes

${data.notes || "[Implementation context, alternatives, or considerations]"}

---

**Reviewer**: [Name]
**Review Date**: ${new Date().toISOString()}
**Next Steps**: [Action items]
`;
}
```

<div class="template-output">

### Generated Implementation Review Document

```js
display(html`<pre style="background: var(--theme-background-alt); padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.875rem;">${generateImplementationReview(implFormData)}</pre>`);
```

```js
display(Inputs.button("Copy to Clipboard", {
  value: null,
  reduce: () => {
    navigator.clipboard.writeText(generateImplementationReview(implFormData));
    return "Copied!";
  }
}));
```

</div>

---

## 4. Quick Scan Template

Use this template for rapid triage of papers (5-minute review).

```js
const quickScanFormData = view(Inputs.form({
  paperTitle: Inputs.text({label: "Paper Title", placeholder: "Enter the paper title"}),
  arxivId: Inputs.text({label: "ArXiv ID", placeholder: "e.g., 2401.12345"}),

  // Quick Assessment
  oneLineSummary: Inputs.text({
    label: "One-Line Summary",
    placeholder: "What does this paper do in one sentence?"
  }),

  yrsnRelevance: Inputs.select(
    ["Highly Relevant", "Moderately Relevant", "Tangentially Relevant", "Not Relevant"],
    {label: "YRSN Relevance"}
  ),

  keyTopics: Inputs.checkbox(
    ["R+S+N Decomposition", "Model Routing", "Simplex Geometry", "Control Theory",
     "Reinforcement Learning", "Graph Methods", "RAG/Retrieval", "Hallucination Detection",
     "Temperature Calibration", "Multimodal", "Robotics/VLA"],
    {label: "Key Topics (select all that apply)"}
  ),

  // Quick Notes
  interestingTechniques: Inputs.textarea({
    label: "Interesting Techniques (bullet points)",
    placeholder: "- Novel decomposition method\n- Geometric constraint approach\n- etc.",
    rows: 3
  }),

  potentialValue: Inputs.textarea({
    label: "Potential Value to YRSN",
    placeholder: "Why might this be useful? Quick assessment.",
    rows: 2
  }),

  redFlags: Inputs.textarea({
    label: "Red Flags",
    placeholder: "Missing baselines, unclear methods, prior art concerns, etc.",
    rows: 2
  }),

  // Decision
  recommendation: Inputs.select(
    ["Deep dive recommended", "Monitor for follow-ups", "Archive for reference", "Discard"],
    {label: "Recommendation"}
  ),

  nextSteps: Inputs.textarea({
    label: "Next Steps",
    placeholder: "What should we do with this paper?",
    rows: 2
  })
}));
```

```js
function generateQuickScan(data) {
  if (!data.paperTitle) return "";

  return `# Quick Scan: ${data.paperTitle}

**ArXiv ID**: ${data.arxivId || "N/A"}
**Scanned**: ${new Date().toLocaleDateString()}
**Relevance**: ${data.yrsnRelevance || "N/A"}

---

## Summary

${data.oneLineSummary || "[One-sentence description]"}

---

## Topics

${data.keyTopics && data.keyTopics.length > 0 ? data.keyTopics.map(t => `- ${t}`).join('\n') : "[No topics selected]"}

---

## Quick Notes

### Interesting Techniques

${data.interestingTechniques || "[Bullet points of notable methods]"}

### Potential Value

${data.potentialValue || "[Quick value assessment]"}

### Red Flags

${data.redFlags || "[Any concerns or issues]"}

---

## Decision: ${data.recommendation || "To be determined"}

**Next Steps**:
${data.nextSteps || "[Action items]"}

---

**Reviewer**: [Name]
**Time Spent**: ~5 minutes
`;
}
```

<div class="template-output">

### Generated Quick Scan Document

```js
display(html`<pre style="background: var(--theme-background-alt); padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.875rem;">${generateQuickScan(quickScanFormData)}</pre>`);
```

```js
display(Inputs.button("Copy to Clipboard", {
  value: null,
  reduce: () => {
    navigator.clipboard.writeText(generateQuickScan(quickScanFormData));
    return "Copied!";
  }
}));
```

</div>

---

## Template Usage Guidelines

### When to Use Each Template

| Template | Use Case | Time Investment | Output |
|----------|----------|-----------------|--------|
| **RSCT Comparison** | Comparing foundational approaches | 2-4 hours | Deep comparative analysis |
| **Patent/Prior Art** | IP protection and patent strategy | 1-3 hours | Legal-oriented assessment |
| **Implementation** | Planning actual code integration | 1-2 hours | Technical implementation plan |
| **Quick Scan** | Rapid triage and prioritization | 5-10 minutes | Go/no-go decision |

### Workflow Recommendations

1. **Start with Quick Scan** for all new papers
2. **Escalate to Implementation Review** if marked "Deep dive recommended"
3. **Use Patent Template** when IP concerns identified
4. **Use RSCT Comparison** for foundational/theoretical papers

### Best Practices

- **Be Specific**: Use concrete examples and code snippets where applicable
- **Link to Evidence**: Reference specific sections, equations, or figures from the paper
- **Consider P15**: Always assess compliance with YRSN architectural principles
- **Think Implementation**: Even for theoretical papers, consider practical integration
- **Document Decisions**: Capture why you made specific recommendations

---

<style>
.template-output {
  background: var(--theme-background);
  border: 1px solid var(--theme-foreground-faint);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0 2rem 0;
}

.template-output h3 {
  margin-top: 0;
  color: var(--theme-foreground-focus);
}

form {
  background: var(--theme-background-alt);
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1rem 0;
}

pre {
  max-height: 500px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

button {
  background: var(--theme-foreground-focus);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

button:hover {
  opacity: 0.9;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--theme-foreground-faint);
}

th {
  background: var(--theme-background-alt);
  font-weight: 600;
}

tr:hover {
  background: var(--theme-background-alt);
}
</style>
