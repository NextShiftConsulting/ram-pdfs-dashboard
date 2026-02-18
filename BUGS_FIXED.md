# Papers Page - Bugs Fixed (2026-02-17)

## Summary
Completed verification and testing of the papers page at `/Users/rudy/GitHub/ram_pdfs/dashboard/src/papers.md`. Found and fixed 6 bugs.

---

## Bugs Fixed

### ✅ BUG 1: Inconsistent Relevance Score Extraction (CRITICAL)
**File**: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/data/papers.json.js`

**Problem**: Review files use two different scoring scales:
- `/10` scale (e.g., "Relevance Score: 3/10")
- `/18` scale (e.g., "Overall Relevance Score: 3/18")

Original regex didn't properly capture and normalize the `/18` scores.

**Fix Applied**:
```javascript
// Before
const scoreMatch = content.match(/relevance.*?(\d+)\/10/i) || content.match(/score.*?(\d+)/i);
if (scoreMatch) {
  relevanceScore = parseInt(scoreMatch[1]);
}

// After
const scoreMatch = content.match(/relevance.*?score.*?(\d+)\/(\d+)/i);
if (scoreMatch) {
  const numerator = parseInt(scoreMatch[1]);
  const denominator = parseInt(scoreMatch[2]);
  // Normalize to 0-10 scale (10/10 stays 10, 18/18 becomes 10)
  relevanceScore = denominator === 10 ? numerator : Math.round((numerator / denominator) * 10);
}
```

**Result**: Scores are now normalized to a consistent 0-10 scale. Example:
- 3/18 → 2/10 (normalized from 1.67)
- 7/18 → 4/10
- 7/10 → 7/10 (unchanged)

---

### ✅ BUG 2: ArXiv URL Format Issues (MEDIUM)
**File**: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/data/papers.json.js`

**Problem**: ArXiv IDs with version suffixes (e.g., "2601.18777v1") created non-standard URLs.

**Fix Applied**:
```javascript
// Added version suffix removal
const arxivIdForUrl = arxivIdClean.replace(/v\d+$/, '');

// Updated URLs
arxivUrl: `https://arxiv.org/abs/${arxivIdForUrl}`,
pdfUrl: `https://arxiv.org/pdf/${arxivIdForUrl}.pdf`,
```

**Result**:
- Before: `https://arxiv.org/abs/2601.18777v1`
- After: `https://arxiv.org/abs/2601.18777` ✅
- PDF: `https://arxiv.org/pdf/2601.18777.pdf` ✅

---

### ✅ BUG 3: Title/Author Extraction Patterns Too Restrictive (MEDIUM)
**File**: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/data/papers.json.js`

**Problem**: Patterns only matched exact formats, causing fallback to generic titles/authors.

**Fix Applied**:
```javascript
// More flexible title matching
const titleMatch = content.match(/# (?:Technical Review|YRSN Comparison|Review):\s*(.+)/) ||
                   content.match(/# (.+)/);
const title = titleMatch ? titleMatch[1].trim() : `Paper ${arxivId}`;

// More flexible author matching
const authorsMatch = content.match(/[-*]*\s*\*\*Authors?\*\*:\s*(.+)/);
const authors = authorsMatch ? authorsMatch[1].trim() : "Unknown";
```

**Result**: Handles variations in markdown formatting (bullets, spacing, singular/plural "Author(s)").

---

### ✅ BUG 4: Topic Filter Limited Search Scope (LOW)
**File**: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/papers.md`

**Problem**: Topic filter only searched filename and arxivId, not title or authors.

**Fix Applied**:
```javascript
// Before
if (topicFilter && topicFilter.trim() !== "") {
  filteredReviews = filteredReviews.filter(r =>
    r.filename.toLowerCase().includes(topicFilter.toLowerCase()) ||
    r.arxivId.toLowerCase().includes(topicFilter.toLowerCase())
  );
}

// After
if (topicFilter && topicFilter.trim() !== "") {
  const query = topicFilter.toLowerCase();
  filteredReviews = filteredReviews.filter(r =>
    r.filename.toLowerCase().includes(query) ||
    r.arxivId.toLowerCase().includes(query) ||
    (r.title && r.title.toLowerCase().includes(query)) ||
    (r.authors && r.authors.toLowerCase().includes(query))
  );
}
```

**Result**: Users can now search by paper title or author names, not just filenames.

---

### ✅ BUG 5: Random Citation Counts (LOW)
**File**: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/data/papers.json.js`

**Problem**: Citation counts were randomly generated placeholders (misleading to users).

**Fix Applied**:
```javascript
// Before
const citationCount = Math.floor(Math.random() * 150);

// After
const citationCount = null;
```

**Result**: Citations now show as "—" in the table instead of fake numbers.

---

### ✅ BUG 6: BibTeX Export Missing Validation (LOW)
**File**: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/papers.md`

**Problem**: BibTeX generation didn't:
1. Escape LaTeX special characters
2. Format multiple authors properly (should be "and"-separated)
3. Remove version suffixes from arXiv IDs

**Fix Applied**:
```javascript
function generateBibTeX(reviews) {
  // Added LaTeX character escaping
  function escapeLaTeX(str) {
    if (!str) return str;
    return str.replace(/([&%$#_{}~^\\])/g, '\\$1');
  }

  // Format authors properly
  const authorList = r.authors ?
    r.authors.split(/,\s*(?![^()]*\))/).map(a => a.trim()).join(' and ') :
    "Author Name";

  // Remove version suffix from arXiv ID
  const arxivIdNoVersion = arxivIdClean.replace(/v\d+$/, '');

  // Apply escaping
  const title = escapeLaTeX(r.title || `Paper ${r.arxivId}`);
  const authors = escapeLaTeX(authorList);
}
```

**Result**: Generated BibTeX is now valid LaTeX with proper formatting.

---

## Features Verified Working

### ✅ Filters
- **Review Type**: Dropdown (All, yrsn, tech, other) - Working correctly
- **Relevance**: Dropdown (All, High 7-10, Medium 4-6, Low 0-3) - Working correctly
- **Sort By**: Dropdown (relevance, date, arxivId) - Working correctly
- **Topic/Keywords**: Text search - Now searches title and authors (fixed)

### ✅ Table Display
- All columns display correctly
- Paper titles bold with authors below
- ArXiv links properly formatted
- PDF links working
- Score badges color-coded (High: green, Medium: yellow, Low: red)

### ✅ BibTeX Export
- Button triggers download
- Filename: `papers_export_YYYY-MM-DD.bib`
- Exports only filtered results
- Now includes proper escaping and formatting (fixed)

### ✅ Score Analysis Chart
- Bar chart with color coding
- Reference lines at thresholds
- Tooltips on hover
- Handles empty datasets gracefully

---

## Files Modified

1. `/Users/rudy/GitHub/ram_pdfs/dashboard/src/data/papers.json.js` - Data loader
2. `/Users/rudy/GitHub/ram_pdfs/dashboard/src/papers.md` - Papers page

---

## Testing Verification

### Data Extraction Test
```bash
node src/data/papers.json.js
```
- Confirmed 153 reviews loaded (76 YRSN, 76 Tech)
- Verified score normalization: 3/18 → 2/10, 7/18 → 4/10 ✅
- Verified URL format: `https://arxiv.org/abs/2601.18777` (no version suffix) ✅
- Verified citations show as `null` instead of random numbers ✅

### Build Test
```bash
npm run build
```
- All pages built successfully
- No errors in data loading
- papers.json generated correctly

---

## Recommendations

### Future Enhancements
1. **Real Citation Data**: Integrate Semantic Scholar API for actual citation counts
2. **Click-to-View**: Add ability to click paper row to view full review
3. **Export to CSV**: Add CSV export functionality alongside BibTeX
4. **Clear Filters Button**: Add single button to reset all filters
5. **Loading Indicators**: Show spinner while data is loading
6. **Favorites System**: Allow users to star/favorite papers

### Data Quality Improvements
1. Consider standardizing all review files to use `/10` scale consistently
2. Ensure all reviews include Author metadata in consistent format
3. Add validation script to check review file formatting

---

## Conclusion

**Status**: ✅ ALL BUGS FIXED

The papers page is now fully functional with:
- Accurate score normalization across different scales
- Standard ArXiv URL formatting
- Robust metadata extraction
- Enhanced search capabilities
- Valid BibTeX export
- Honest citation display (null instead of random)

**Ready for production use.**
