# Semantic Scholar Citation Integration

This document describes the citation data integration with the Semantic Scholar API.

## Overview

The dashboard now automatically fetches citation counts from Semantic Scholar for all reviewed papers. Citation data is cached locally to avoid repeated API calls and respect rate limits.

## Implementation Details

### Files Modified

- **`src/data/papers.json.js`**: Main data loader that fetches and processes paper reviews
  - Added Semantic Scholar API integration
  - Implemented caching mechanism
  - Added rate limiting (1.1 seconds between requests)
  - Graceful error handling for API failures

### New Files

- **`.citation_cache.json`**: Local cache file storing citation counts (gitignored)
- **`update_citations.js`**: Helper script to update null citations in the cache
- **`CITATIONS_README.md`**: This documentation file

## How It Works

1. **Citation Fetching**:
   - For each review file, the script extracts the arXiv ID
   - It checks the cache first to avoid redundant API calls
   - If not cached, it fetches from: `https://api.semanticscholar.org/graph/v1/paper/arXiv:{arxiv_id}?fields=citationCount`
   - Results are stored in the cache (including `null` for failed requests)

2. **Rate Limiting**:
   - Enforces 1.1 second delay between API calls
   - Processes reviews sequentially to avoid overwhelming the API
   - Semantic Scholar's public API limit: ~1 request/second

3. **Caching**:
   - Cache file: `.citation_cache.json`
   - Format: `{ "arxiv_id": citation_count }`
   - `null` values indicate failed fetches (rate limiting, paper not found, etc.)
   - Cache persists between runs to minimize API calls

4. **Error Handling**:
   - Network errors: Returns `null`, logged to stderr
   - HTTP errors (404, 429, etc.): Returns `null`, logged to stderr
   - Parse errors: Returns `null`, logged to stderr
   - Script continues processing even if individual fetches fail

## Usage

### Normal Operation

The citation fetching happens automatically when running the data loader:

```bash
node src/data/papers.json.js
```

The first run will take longer (154 reviews × 1.1s ≈ 3 minutes) but subsequent runs are instant due to caching.

### Updating Null Citations

If some citations failed to fetch (due to rate limiting), you can retry them later using the helper script:

```bash
# Update all null citations
node update_citations.js

# Update only 10 null citations
node update_citations.js --limit 10
```

### Clearing the Cache

To force a complete re-fetch (not recommended):

```bash
rm .citation_cache.json
node src/data/papers.json.js
```

## API Rate Limits

Semantic Scholar's public API has the following limits:
- **Rate**: 1 request per second (100 requests per 100 seconds)
- **Daily limit**: Not publicly documented, but conservative usage recommended

If you encounter persistent 429 errors:
1. Wait 10-15 minutes before retrying
2. Use `update_citations.js --limit N` to update gradually
3. Consider requesting an API key from Semantic Scholar for higher limits

## Data Format

Citation data is included in the review objects:

```json
{
  "filename": "2601_18777v1_techreview.md",
  "arxivId": "2601_18777v1",
  "title": "Paper Title",
  "citations": 42,  // Number from Semantic Scholar (or null if failed)
  ...
}
```

## Troubleshooting

### All citations are null

This usually means rate limiting is active. Solutions:
- Wait 15-30 minutes and try again
- Use `update_citations.js --limit 5` to update gradually
- Check network connectivity

### Script is slow

This is expected on first run. The script enforces 1.1s delays between API calls to respect rate limits. With 154 reviews, expect ~3 minutes for a complete refresh.

### Cache is corrupted

If the cache file is malformed:
```bash
rm .citation_cache.json
# Wait 30 minutes to avoid rate limits
node src/data/papers.json.js
```

## Future Improvements

Potential enhancements:
1. Use Semantic Scholar API key for higher rate limits
2. Add retry logic with exponential backoff for 429 errors
3. Fetch additional metadata (publication venue, abstract, etc.)
4. Add citation trend analysis over time
5. Integrate with other citation services (Google Scholar, arXiv stats)

## References

- [Semantic Scholar API Documentation](https://api.semanticscholar.org/)
- [API Rate Limits](https://www.semanticscholar.org/product/api#api-limits)
