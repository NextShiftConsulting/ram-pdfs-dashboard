# Papers Page Testing Report

## Testing Date: 2026-02-17

## Overview
Testing the papers page at `/Users/rudy/GitHub/ram_pdfs/dashboard/src/papers.md`

## Test Environment
- Dashboard running at: http://127.0.0.1:3002/
- Data source: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/data/papers.json.js`
- Reviews directory: `/Users/rudy/GitHub/ram_pdfs/reviews`
- Total reviews: 153 (76 YRSN, 76 Tech)

---

## BUGS FOUND

### BUG 1: Inconsistent Relevance Score Extraction ⚠️ CRITICAL
**Location**: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/data/papers.json.js` (lines 33-37)

**Issue**: The regex pattern doesn't capture all score formats used in review files.

**Current Code**:
```javascript
const scoreMatch = content.match(/relevance.*?(\d+)\/10/i) || content.match(/score.*?(\d+)/i);
```

**Problem**: Review files use multiple formats:
- `### Relevance Score: 1/10` ✅ Works
- `### Overall Relevance Score: 3/18` ❌ Fails (extracts 3 but expects /10)
- `## Relevance Score: 6/10 (HIGH PRIORITY)` ✅ Works
- `relevance.*?(\d+)\/10` - doesn't match `/18` scores

**Impact**: Papers with `/18` scores incorrectly show scores like 3 instead of being normalized or marked differently.

**Example Files Affected**:
- `/Users/rudy/GitHub/ram_pdfs/reviews/2601_19260v1_vs_yrsn.md` - "3/18" extracted as 3
- `/Users/rudy/GitHub/ram_pdfs/reviews/2601_19839v1_vs_yrsn.md` - "5/18" extracted as 5
- `/Users/rudy/GitHub/ram_pdfs/reviews/2601_18886v1_vs_yrsn.md` - "3/18" extracted as 3

**Recommended Fix**:
```javascript
// Extract relevance score with proper normalization
let relevanceScore = null;
const scoreMatch = content.match(/relevance.*?score.*?(\d+)\/(\d+)/i);
if (scoreMatch) {
  const score = parseInt(scoreMatch[1]);
  const maxScore = parseInt(scoreMatch[2]);
  // Normalize to 10-point scale
  relevanceScore = maxScore === 18 ? Math.round((score / 18) * 10) : score;
}
```

---

### BUG 2: ArXiv URL Format Issues ⚠️ MEDIUM
**Location**: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/data/papers.json.js` (lines 68-69)

**Issue**: ArXiv IDs with version numbers (e.g., "2601.18777v1") create incorrect URLs.

**Current Code**:
```javascript
arxivUrl: `https://arxiv.org/abs/${arxivIdClean}`,
pdfUrl: `https://arxiv.org/pdf/${arxivIdClean}`,
```

**Problem**:
- arxivIdClean is "2601.18777v1"
- URLs become: `https://arxiv.org/abs/2601.18777v1`
- ArXiv typically uses format without 'v1': `https://arxiv.org/abs/2601.18777`

**Impact**: Links may work but are non-standard. ArXiv auto-redirects but this is not ideal.

**Recommended Fix**:
```javascript
const arxivIdForUrl = arxivIdClean.replace(/v\d+$/, ''); // Remove version suffix
arxivUrl: `https://arxiv.org/abs/${arxivIdForUrl}`,
pdfUrl: `https://arxiv.org/pdf/${arxivIdForUrl}.pdf`,
```

---

### BUG 3: Missing Title/Author Extraction Patterns ⚠️ MEDIUM
**Location**: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/data/papers.json.js` (lines 45-49)

**Issue**: Title extraction pattern only matches specific formats.

**Current Code**:
```javascript
const titleMatch = content.match(/# (?:Technical Review|YRSN Comparison): (.+)/);
const title = titleMatch ? titleMatch[1] : `Paper ${arxivId}`;

const authorsMatch = content.match(/\*\*Authors\*\*: (.+)/);
const authors = authorsMatch ? authorsMatch[1] : "Unknown";
```

**Problem**:
- Title pattern requires exact "Technical Review" or "YRSN Comparison" prefix
- If format changes slightly, falls back to "Paper 2601_18777v1"
- Authors pattern requires exact "**Authors**: " format
- Some reviews use "**ArXiv**: " line but no separate "**Authors**: " line

**Example**:
- File: `2601_19895v1_vs_yrsn.md` has authors on line 5 under "## Paper Reference"
- Pattern expects: `**Authors**: Chen Chen, Lai Wei`
- Actual format: `- **Authors**: Chen Chen, Lai Wei`

**Recommended Fix**:
```javascript
// More flexible title matching
const titleMatch = content.match(/# (?:Technical Review|YRSN Comparison|Review):\s*(.+)/) ||
                   content.match(/# (.+)/);
const title = titleMatch ? titleMatch[1].trim() : `Paper ${arxivId}`;

// More flexible author matching
const authorsMatch = content.match(/[-*]*\s*\*\*Authors?\*\*:\s*(.+)/);
const authors = authorsMatch ? authorsMatch[1].trim() : "Unknown";
```

---

### BUG 4: Topic Filter Not Searching Full Content ⚠️ LOW
**Location**: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/papers.md` (lines 64-68)

**Issue**: Topic filter only searches filename and arxivId, not title or authors.

**Current Code**:
```javascript
if (topicFilter && topicFilter.trim() !== "") {
  filteredReviews = filteredReviews.filter(r =>
    r.filename.toLowerCase().includes(topicFilter.toLowerCase()) ||
    r.arxivId.toLowerCase().includes(topicFilter.toLowerCase())
  );
}
```

**Problem**: Users expect to search by paper title, author names, or keywords, not just filenames.

**Recommended Fix**:
```javascript
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

---

### BUG 5: Citation Count is Random ⚠️ LOW (By Design)
**Location**: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/data/papers.json.js` (line 55)

**Issue**: Citation counts are randomly generated placeholders.

**Current Code**:
```javascript
// Placeholder citation count (in real implementation, fetch from Semantic Scholar or arXiv API)
const citationCount = Math.floor(Math.random() * 150);
```

**Problem**: Not actually a bug per the comment, but misleading to users.

**Recommended Fix**: Either:
1. Remove citation column entirely
2. Fetch real data from Semantic Scholar API
3. Set to `null` or "—" to indicate unavailable data
4. Add visual indicator that this is placeholder data

---

### BUG 6: BibTeX Export Missing Data Validation ⚠️ LOW
**Location**: `/Users/rudy/GitHub/ram_pdfs/dashboard/src/papers.md` (lines 167-186)

**Issue**: BibTeX generation doesn't validate or escape special characters.

**Current Code**:
```javascript
return `@article{${bibtexKey},
  title = {{${title}}},
  author = {${authors}},
  ...
```

**Problem**:
- Titles/authors with special LaTeX characters (e.g., `$`, `_`, `&`, `%`) will break BibTeX
- Multiple authors not properly formatted (should be "Author1 and Author2 and Author3")

**Recommended Fix**:
```javascript
// Escape LaTeX special characters
function escapeLaTeX(str) {
  return str.replace(/([&%$#_{}~^\\])/g, '\\$1');
}

// Format authors properly for BibTeX
const authorList = authors.split(/,|and/).map(a => a.trim()).join(' and ');

return `@article{${bibtexKey},
  title = {{${escapeLaTeX(title)}}},
  author = {${escapeLaTeX(authorList)}},
  ...
```

---

## FEATURES TESTED

### ✅ Filter: Review Type (Working)
- Dropdown with options: All, yrsn, tech, other
- Successfully filters reviews by type
- Counter updates correctly

### ✅ Filter: Relevance (Working with caveats)
- Dropdown with options: All, High (7-10), Medium (4-6), Low (0-3)
- Logic appears correct
- **Caveat**: Some scores may be incorrectly classified due to BUG 1

### ✅ Filter: Sort By (Working)
- Options: relevance, date, arxivId
- Sorting logic is correct
- Date sort uses arxivId as proxy (newest first)

### ⚠️ Filter: Topic/Keywords (Limited - see BUG 4)
- Text input for filtering
- Works but only searches filename and arxivId
- Should search title and authors too

### ✅ BibTeX Export (Working with caveats)
- Button triggers download
- Filename includes date: `papers_export_YYYY-MM-DD.bib`
- Generates BibTeX for filtered results
- **Caveat**: See BUG 6 for validation issues

### ✅ Reviews Table (Working)
- Displays all columns correctly
- Formatting looks good
- Paper titles bold, authors in gray
- ArXiv links properly formatted as hyperlinks
- PDF links with icon

### ✅ Score Analysis Chart (Working)
- Bar chart displays relevance scores
- Color coding: High (blue), Medium (green), Low (orange)
- Horizontal reference lines at 7 and 4
- Tooltips on hover
- Handles empty dataset gracefully

---

## RECOMMENDATIONS

### High Priority
1. **Fix BUG 1**: Normalize relevance scores from /18 scale to /10 scale
2. **Fix BUG 2**: Use standard ArXiv URL format without version suffixes

### Medium Priority
3. **Fix BUG 3**: Improve title/author extraction with flexible regex
4. **Fix BUG 4**: Expand topic filter to search title and authors

### Low Priority
5. **Address BUG 5**: Either remove citations or mark as placeholder
6. **Fix BUG 6**: Add BibTeX escaping and proper author formatting

### Enhancements
7. Add loading indicator when data is being fetched
8. Add "Clear all filters" button
9. Add ability to click on a paper to view full review
10. Add export to CSV functionality
11. Consider adding a "favoriting" system

---

## CONCLUSION

The papers page is **mostly functional** but has several bugs that impact data accuracy:
- Critical: Relevance scores from /18 scale are misrepresented
- Medium: ArXiv links and metadata extraction could be more robust
- Low: Search and export features could be enhanced

**Overall Status**: 🟡 Functional with known issues

**Recommended Action**: Fix BUG 1 and BUG 2 before production use.
