// Smart text chunking and deduplication utility for AI Document Processing

/**
 * Splits raw text into manageable chunks respecting sentence boundaries.
 * @param {string} text - Raw input text
 * @param {number} maxChunkSize - Target maximum characters per chunk (default: 2000)
 * @param {number} overlapSize - Overlap characters between chunks (default: 150)
 * @returns {Array<string>} List of chunked text segments
 */
export function chunkText(text, maxChunkSize = 2000, overlapSize = 150) {
  if (!text || typeof text !== 'string') return [];
  const trimmed = text.trim();
  if (trimmed.length <= maxChunkSize) return [trimmed];

  const chunks = [];
  // Split on sentence boundaries
  const sentences = trimmed.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [trimmed];

  let currentChunk = '';

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];

    if ((currentChunk + sentence).length <= maxChunkSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      // Add overlap from the tail of current chunk if possible
      const tail = currentChunk.slice(-overlapSize);
      currentChunk = tail + sentence;
    }
  }

  if (currentChunk.trim() && !chunks.includes(currentChunk.trim())) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Normalizes an English phrase for deduplication.
 */
export function normalizePhrase(phrase) {
  if (!phrase) return '';
  return phrase.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Merges and deduplicates lists of extracted learning items.
 * @param {Array<object>} items - List of items with english, vietnamese, etc.
 * @returns {Array<object>} Deduplicated items
 */
export function deduplicateItems(items) {
  if (!Array.isArray(items)) return [];
  const seen = new Map();

  items.forEach(item => {
    if (!item || !item.english) return;
    const key = normalizePhrase(item.english);
    if (!key) return;

    if (!seen.has(key)) {
      seen.set(key, item);
    } else {
      // Merge: prefer item with more comprehensive explanation or example
      const existing = seen.get(key);
      const existingLen = (existing.explanationVi || '').length + (existing.exampleEn || '').length;
      const currentLen = (item.explanationVi || '').length + (item.exampleEn || '').length;
      if (currentLen > existingLen) {
        seen.set(key, { ...existing, ...item });
      }
    }
  });

  return Array.from(seen.values());
}
