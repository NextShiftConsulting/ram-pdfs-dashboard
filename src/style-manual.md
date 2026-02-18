# Editorial Style Manual

## Purpose

This style manual defines the standards and framework for reviewing research papers in the YRSN Research Monitor system. It guides both human reviewers and LLM-powered agents in producing consistent, high-quality technical reviews and YRSN relevance analyses.

---

## Review Structure

The YRSN Research Monitor generates **two complementary documents** for each paper:

### 1. Technical Review (`{arxiv_id}_techreview.md`)

**Purpose**: Objective summary of the paper's scientific contributions, independent of YRSN relevance.

**Template Structure**:
```markdown
# Technical Review: [Paper Title]

## Paper Metadata
- ArXiv ID
- Authors
- Published Date
- Categories
- PDF Link

## Abstract
[Full abstract text]

## Key Contributions
1. [Contribution 1]
2. [Contribution 2]
3. [Contribution 3]

## Methodology
[High-level description of approach]

## Results
[Main findings and performance metrics]

## Paper Excerpt
[First ~500 words of paper text for reference]
```

### 2. YRSN Comparison (`{arxiv_id}_vs_yrsn.md`)

**Purpose**: Analyze relevance to YRSN concepts and identify integration opportunities.

**Template Structure** (see detailed sections below):
```markdown
# YRSN Comparison: [Paper Title]

## Relevance Score: X/10 (PRIORITY LEVEL)

## Concept Mapping
[Table of YRSN concepts vs paper's approach]

## Direct Overlaps
[Specific connections to YRSN components]

## Novel Ideas for YRSN
[Concrete integration proposals with code examples]

## Integration Plan
[Phased implementation roadmap]

## Priority: HIGH/MEDIUM/LOW
[Justification and expected impact]
```

---

## YRSN Comparison Framework

### Core YRSN Concepts

When reviewing papers, map findings to these fundamental YRSN concepts:

| Concept | Description | What to Look For |
|---------|-------------|------------------|
| **α (Quality)** | Context quality metric (0-1) | Quality assessment, scoring methods, confidence estimation |
| **R (Relevant)** | Signal component of context | Information extraction, retrieval accuracy, signal detection |
| **S (Superfluous)** | Non-harmful but unnecessary content | Redundancy detection, compression, efficiency optimization |
| **N (Noise)** | Harmful/incorrect content | Error detection, hallucination prevention, adversarial robustness |
| **Model Routing** | Adaptive model selection | Router architectures, mixture of experts, adaptive computation |
| **Temperature Calibration** | Confidence-aware sampling | Calibration methods, temperature tuning, uncertainty quantification |
| **HybridSimplexRotor** | R+S+N decomposition mechanism | Decomposition methods, geometric representations, barycentric coordinates |

### Secondary Topics

Also consider relevance to:

- **Reinforcement Learning**: GRPO, RLHF, reward shaping, policy optimization
- **Graph Methods**: GNNs, knowledge graphs, hierarchical representations
- **VLA/Robotics**: Vision-Language-Action models, multimodal policies
- **RAG/Retrieval**: Context quality, retrieval noise, ranking methods
- **Signal Processing**: Noise decomposition, robust PCA, filtering

---

## Scoring Rubric

### Relevance Score (0-10)

Use this rubric to assign an overall relevance score:

| Score | Category | Criteria |
|-------|----------|----------|
| **9-10** | Directly Applicable | Paper explicitly addresses YRSN core concepts (R/S/N decomposition, quality metrics, routing). Can be integrated with minimal adaptation. |
| **7-8** | Highly Relevant | Strong methodological overlap with YRSN principles. Requires moderate adaptation but clear integration path. |
| **5-6** | Moderately Relevant | Addresses adjacent problems (hallucination, calibration, retrieval) with transferable techniques. |
| **3-4** | Tangentially Relevant | Contains useful ideas but requires significant reframing for YRSN context. |
| **1-2** | Minimally Relevant | Peripheral overlap (e.g., uses similar keywords but different domain/approach). |
| **0** | Not Relevant | No meaningful connection to YRSN objectives. |

### Priority Classification

Based on relevance score and implementation feasibility:

| Priority | Score Range | Action |
|----------|-------------|--------|
| **HIGH** | 7-10 | Deep dive analysis, create integration plan, assign to research team |
| **MEDIUM** | 4-6 | Monitor for follow-up work, bookmark for future reference |
| **LOW** | 0-3 | Archive, no immediate action |

---

## What to Look For

### High-Priority Signals

When reviewing papers, prioritize these elements that indicate strong YRSN relevance:

#### 1. Quality/Confidence Metrics
- Novel methods for measuring output quality
- Confidence calibration techniques
- Uncertainty quantification approaches
- Self-evaluation mechanisms

**Example keywords**: quality score, confidence estimation, calibration, uncertainty, reliability

#### 2. Decomposition Methods
- Signal vs. noise separation
- Component-wise analysis
- Geometric decompositions (simplex, barycentric, rotors)
- Attention mechanism analysis

**Example keywords**: decomposition, factorization, component analysis, signal separation

#### 3. Routing/Selection Mechanisms
- Adaptive model selection
- Mixture of experts
- Dynamic compute allocation
- Multi-tier architectures

**Example keywords**: routing, mixture of experts, model selection, adaptive, gating

#### 4. Hallucination Prevention
- Detection methods
- Mitigation strategies
- Grounding techniques
- Factuality verification

**Example keywords**: hallucination, factuality, grounding, faithfulness, attribution

#### 5. Context Optimization
- Retrieval improvement
- Noise filtering
- Relevance ranking
- Context compression

**Example keywords**: RAG, retrieval, context window, ranking, filtering

### Red Flags (Lower Priority)

These indicate the paper may be less relevant:

- Pure theoretical work without implementation considerations
- Domain-specific solutions that don't generalize (e.g., medical imaging only)
- Incremental improvements to existing methods without novel insights
- Focus on efficiency/speed without quality considerations
- Benchmark-chasing without methodological contributions

---

## Writing Guidelines

### Concept Mapping Table

For each YRSN concept, provide:

1. **Relevance** (HIGH/MEDIUM/LOW)
2. **Paper's Approach**: Specific technique/method from the paper
3. **Integration Potential**: How it could enhance YRSN

**Example** (from 2601.19859v1):
```markdown
| YRSN Concept | Relevance | Paper's Approach | Integration Potential |
|--------------|-----------|------------------|----------------------|
| α (Quality) | **HIGH** | Two-scale distribution modeling with smooth peak and powerlaw decay | Quality distributions likely follow BRF patterns; α itself may exhibit two-scale behavior |
| Model Routing | **HIGH** | Two-step generative process (powerlaw → redistribution) | Route models based on two-scale quality patterns; tier-based redistribution of processing resources |
```

### Direct Overlaps Section

Identify **3-5 specific connections** between the paper and YRSN. For each:

1. **Title**: Clear description of the overlap
2. **Paper**: Direct quote or paraphrase from the paper
3. **YRSN**: How this relates to YRSN concepts
4. **Mechanism**: Technical explanation of the connection

**Example**:
```markdown
### 1. **Two-Scale Quality Dynamics**
- **Paper**: BRF captures "smooth peak and double powerlaw decay" in rank distributions
- **YRSN**: Context quality α likely exhibits similar two-scale behavior
- **Mechanism**: Quality distributions may follow BRF patterns across different domains/tasks
```

### Novel Ideas for YRSN

Provide **concrete, actionable integration proposals**. Each idea should include:

1. **Title**: Descriptive name for the integration
2. **Description**: 2-3 sentence explanation
3. **Code Example**: Pseudo-code or Python sketch showing implementation
4. **Expected Impact**: Quantitative or qualitative benefit

**Example**:
```markdown
### 1. **BRF-Based Quality Modeling**
```python
def brf_quality_distribution(contexts, alpha_threshold):
    """Model context quality using Beta Rank Function"""
    # Step 1: Generate initial powerlaw quality distribution
    initial_quality = powerlaw_quality_assignment(contexts)

    # Step 2: Apply regressive redistribution
    redistributed_quality = regressive_redistribution(
        initial_quality,
        redistribution_rate=0.3
    )

    return redistributed_quality
```
```

### Integration Plan

For **HIGH priority papers only**, provide a phased implementation roadmap:

1. **Phase 1**: Initial investigation (1-2 weeks)
   - Empirical analysis
   - Data collection
   - Feasibility assessment

2. **Phase 2**: Prototype development (2-3 weeks)
   - Core implementation
   - Unit tests
   - Initial validation

3. **Phase 3**: Integration & testing (2-3 weeks)
   - System integration
   - A/B testing
   - Performance evaluation

4. **Phase 4**: Optimization & deployment (1-2 weeks)
   - Parameter tuning
   - Production deployment
   - Monitoring setup

Each phase should include specific deliverables and success criteria.

### Priority Justification

End each YRSN comparison with:

1. **Priority**: HIGH/MEDIUM/LOW
2. **Justification**: 2-3 sentences explaining the priority level
3. **Expected Impact**: Quantitative estimates where possible

**Example**:
```markdown
## Priority: HIGH

**Justification**: This paper provides a mathematically rigorous framework for modeling two-scale quality dynamics observed in YRSN systems. The regressive redistribution mechanism directly maps to attention/resource allocation patterns.

**Expected Impact**:
- 15-25% improvement in context quality optimization
- More principled model routing based on BRF quality tiers
- Reduced hallucinations through better understanding of quality distribution dynamics
```

---

## Code Examples Standards

When providing code examples in Novel Ideas sections:

### Style Requirements

1. **Use Python** unless another language is clearly superior for the concept
2. **Include docstrings** for all functions
3. **Use type hints** where appropriate
4. **Keep examples concise** (10-30 lines maximum)
5. **Focus on clarity** over completeness

### Example Template

```python
def yrsn_integration_method(input_data: List[Context], threshold: float) -> Result:
    """
    Brief description of what this integration does.

    Args:
        input_data: Description of input
        threshold: Description of parameter

    Returns:
        Description of output
    """
    # Step 1: Core logic
    processed = core_operation(input_data)

    # Step 2: YRSN-specific enhancement
    enhanced = apply_yrsn_concept(processed, threshold)

    return enhanced
```

### Class-Based Examples

For more complex integrations:

```python
class YRSNEnhancedComponent:
    """Component that integrates [Paper Concept] with YRSN."""

    def __init__(self, config: YRSNConfig):
        self.config = config
        self.paper_method = initialize_paper_method()

    def process_context(self, context: Context) -> RSNDecomposition:
        """Apply paper's method to decompose context into R/S/N."""
        # Implementation sketch
        return decomposition
```

---

## LLM Backend Considerations

The system supports multiple LLM backends for review generation:

### Backend Types

| Backend | Use Case | Output Quality |
|---------|----------|----------------|
| **Sonnet 4 (deep)** | High-priority papers, complex technical content | Highest quality, detailed analysis |
| **Sonnet 4 (standard)** | Medium-priority papers, standard reviews | Good balance of quality and speed |
| **keyword** | Low-priority papers, batch processing | Basic keyword matching, minimal analysis |

### Backend-Specific Expectations

#### Deep Analysis Mode (Sonnet 4 Deep)
- Full PDF text extraction and analysis
- Detailed concept mapping with specific paper quotes
- 3-5 novel integration ideas with code examples
- Phased integration plan for HIGH priority papers
- Quantitative impact estimates

#### Standard Mode (Sonnet 4 Standard)
- Abstract and key sections analysis
- Concept mapping table
- 1-3 integration ideas (text only, no code)
- Brief priority justification

#### Keyword Mode
- Automated keyword matching
- Simple relevance categories (LOW/MEDIUM/HIGH)
- No detailed analysis
- Minimal manual review required

---

## Review Quality Checklist

Before finalizing any YRSN comparison, verify:

### Content Requirements
- [ ] Relevance score assigned (0-10)
- [ ] Priority classification (HIGH/MEDIUM/LOW)
- [ ] Concept mapping table completed
- [ ] At least 2 direct overlaps identified (for score ≥ 5)
- [ ] At least 1 novel idea proposed (for score ≥ 7)
- [ ] Priority justification provided
- [ ] Expected impact statement included

### Technical Requirements
- [ ] Code examples are syntactically valid Python
- [ ] All YRSN concepts correctly referenced (α, R, S, N, routing, etc.)
- [ ] No hallucinated paper content (all quotes/claims verifiable)
- [ ] Integration ideas are technically feasible
- [ ] Implementation estimates are realistic

### Style Requirements
- [ ] Markdown formatting is correct
- [ ] Tables are properly formatted
- [ ] Headers follow template structure
- [ ] Code blocks use proper syntax highlighting
- [ ] No placeholder text remains (e.g., "[TODO]", "[Paper's method]")

---

## Common Pitfalls to Avoid

### 1. Over-Claiming Relevance
**Problem**: Assigning high scores to papers with superficial keyword overlap.

**Example**: A paper on "graph neural networks for protein folding" gets 8/10 because YRSN uses "graph methods," despite zero overlap in application domain.

**Solution**: Require **methodological** overlap, not just keyword matching. Ask: "Can we directly apply this technique to YRSN problems?"

### 2. Vague Integration Proposals
**Problem**: Suggesting integrations without concrete mechanisms.

**Bad Example**: "This paper's approach could improve YRSN quality metrics."

**Good Example**: "Use this paper's calibration method to adjust α scores by comparing model confidence against historical accuracy: `α_calibrated = calibrate_quality(α_raw, historical_accuracy)`"

### 3. Ignoring Implementation Complexity
**Problem**: Proposing integrations that would require months of research to implement.

**Solution**: Distinguish between:
- **Direct integrations** (1-2 weeks): Adapt existing code/method
- **Moderate adaptations** (1-2 months): Require significant modification
- **Research projects** (3-6 months): Need novel theoretical work

### 4. Missing Domain-Specific Context
**Problem**: Generic analysis that could apply to any paper.

**Solution**: Always reference:
- Specific YRSN components (HybridSimplexRotor, quality metrics, routing logic)
- Concrete use cases (hallucination detection, context optimization)
- Existing YRSN validation results (expS4_053, expS4_159)

### 5. Inconsistent Scoring
**Problem**: Different reviewers assign different scores to similar papers.

**Solution**: Use the rubric strictly:
- 9-10: Direct R/S/N decomposition methods
- 7-8: Quality/routing/calibration techniques
- 5-6: Hallucination/retrieval adjacent work
- 3-4: Peripheral ML/NLP methods
- 1-2: Keyword overlap only

---

## Comparison Examples

### Example 1: High Relevance (9/10)

**Paper**: "Simplicial Decomposition of Language Model Outputs"

**Why High**:
- Directly addresses R/S/N decomposition using simplicial geometry
- Proposes barycentric coordinate mapping (matches HybridSimplexRotor)
- Validates on hallucination detection benchmark
- Code available, can integrate within 2 weeks

**Concept Mapping**:
- α (Quality): **HIGH** - proposes novel quality score based on simplex distance
- HybridSimplexRotor: **HIGH** - uses same geometric framework
- Model Routing: **MEDIUM** - could route based on simplex region

**Novel Ideas**:
1. Replace current rotor with paper's simplicial method
2. Use simplex distance as calibrated α score
3. Implement paper's hallucination detection module

### Example 2: Medium Relevance (5/10)

**Paper**: "Uncertainty-Aware Neural Text Generation"

**Why Medium**:
- Addresses uncertainty quantification (related to α quality)
- Proposes Bayesian confidence estimation
- Not specific to R/S/N decomposition or routing
- Would require adaptation for YRSN context

**Concept Mapping**:
- α (Quality): **MEDIUM** - uncertainty could inform quality scores
- Model Routing: **LOW** - no routing mechanism proposed
- Temperature Calibration: **HIGH** - Bayesian approach to temperature tuning

**Novel Ideas**:
1. Use Bayesian uncertainty as input to α calculation
2. Calibrate routing thresholds based on uncertainty bands

### Example 3: Low Relevance (2/10)

**Paper**: "Glueball Mass from RGZ-inspired Infrared Gluodynamics"

**Why Low**:
- Theoretical physics paper
- Keyword "graph" appears but refers to Feynman diagrams
- No connection to NLP, quality metrics, or ML routing
- Zero integration potential

**Concept Mapping**:
- All concepts: **LOW**
- Graph Methods: **LOW** (different domain)

**Priority**: LOW - Archive only

---

## Metadata Standards

All reviews should include footer metadata:

```markdown
---
*Generated: YYYY-MM-DD HH:MM | Model: [Sonnet 4 (deep)|Sonnet 4 (standard)|keyword]*
```

For LLM-generated reviews, also include:

```markdown
*Backend: [bedrock|anthropic|rule-based]*
```

---

## Maintenance and Updates

This style manual is a living document. Update when:

1. **New YRSN concepts emerge**: Add to concept mapping framework
2. **Scoring rubric needs refinement**: Based on review quality analysis
3. **Integration patterns evolve**: Update code example templates
4. **New LLM backends added**: Document capabilities and expectations

**Last Updated**: 2026-02-17
**Version**: 1.0
**Maintainer**: YRSN Research Team

---

## Quick Reference Card

### For Rapid Triage

1. **Read abstract** - does it mention quality, routing, decomposition, hallucination, or calibration?
2. **Check methodology** - does it propose novel metrics, architectures, or decomposition methods?
3. **Scan results** - are there quantitative improvements we could replicate?
4. **Assign initial score**:
   - 8-10: Clear R/S/N or quality metric focus
   - 5-7: Hallucination, routing, or calibration work
   - 2-4: General ML/NLP with keyword overlap
   - 0-1: No connection to YRSN

### For Deep Analysis (Score ≥ 7)

1. **Extract specific methods** - what is the core technical contribution?
2. **Map to YRSN concepts** - fill out concept mapping table
3. **Identify integration points** - where does this fit in YRSN pipeline?
4. **Draft code examples** - show concrete integration
5. **Estimate implementation** - create phased plan with time estimates
6. **Justify priority** - why should we implement this?

### For Writing Reviews

1. **Start with score and priority** - set expectations upfront
2. **Be specific** - cite paper sections, quote key claims
3. **Show, don't tell** - use code examples and concrete proposals
4. **Quantify impact** - provide estimates where possible
5. **Stay grounded** - only claim what's verifiable from the paper

---

## Resources

### YRSN Core Documentation
- `/docs/principles/FIRST_PRINCIPLES.md` - P15 (Universal Rotor requirement)
- `/docs/analysis/RSCT_CONTROL.tex` - RSCT theoretical foundations
- `HybridSimplexRotor` - Core decomposition implementation

### Review Examples
- High-quality LLM review: `reviews/2601_19859v1_vs_yrsn.md`
- Keyword-based review: `reviews/2601_19727v1_vs_yrsn.md`
- Technical review template: `reviews/*_techreview.md`

### Dashboard Integration
- Papers view: `/papers` - Browse all reviews with filtering
- Metrics view: `/metrics` - Analyze score distributions
- Topics view: `/topics` - Track YRSN concept coverage

---

<style>
table {
  font-size: 0.9em;
}

code {
  background: var(--theme-background-alt);
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

.card {
  background: var(--theme-background-alt);
  border-left: 4px solid var(--theme-foreground-focus);
  padding: 1rem;
  margin: 1rem 0;
}
</style>
