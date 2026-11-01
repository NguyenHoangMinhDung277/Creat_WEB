// Advanced Pronunciation & Character-Level Scoring Engine with Levenshtein Alignment
// Tailored specifically for Vietnamese learners of English (detecting dropped final consonants, vowel shifts, and stress).

/**
 * Computes Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(s1, s2) {
  const str1 = (s1 || '').toLowerCase().trim();
  const str2 = (s2 || '').toLowerCase().trim();

  const m = str1.length;
  const n = str2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Calculates string similarity ratio between 0.0 and 1.0.
 */
export function stringSimilarity(s1, s2) {
  const clean1 = (s1 || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const clean2 = (s2 || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean1 && !clean2) return 1.0;
  if (!clean1 || !clean2) return 0.0;
  if (clean1 === clean2) return 1.0;

  const dist = levenshteinDistance(clean1, clean2);
  const maxLen = Math.max(clean1.length, clean2.length);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Character-by-character alignment using Levenshtein traceback matrix.
 * Returns an array of character tokens:
 * [{ char: 'b', status: 'correct', expected: 'b' }, ...]
 */
export function alignCharacters(targetWord, spokenWord) {
  const cleanTarget = (targetWord || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanSpoken = (spokenWord || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  if (!cleanSpoken) {
    return cleanTarget.split('').map(char => ({
      char,
      status: 'missing',
      spokenChar: ''
    }));
  }

  const m = cleanTarget.length;
  const n = cleanSpoken.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = cleanTarget[i - 1] === cleanSpoken[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  // Traceback to align characters
  let i = m;
  let j = n;
  const alignedChars = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && cleanTarget[i - 1] === cleanSpoken[j - 1]) {
      alignedChars.unshift({
        char: cleanTarget[i - 1],
        status: 'correct',
        spokenChar: cleanSpoken[j - 1]
      });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      alignedChars.unshift({
        char: cleanTarget[i - 1],
        status: 'wrong',
        spokenChar: cleanSpoken[j - 1]
      });
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      alignedChars.unshift({
        char: cleanTarget[i - 1],
        status: 'missing',
        spokenChar: ''
      });
      i--;
    } else {
      // Extra character in spoken word
      alignedChars.unshift({
        char: cleanSpoken[j - 1],
        status: 'extra',
        spokenChar: cleanSpoken[j - 1]
      });
      j--;
    }
  }

  return alignedChars;
}

/**
 * Detects common pronunciation issues frequent among Vietnamese native speakers.
 */
export function analyzeVietnamesePronunciationHabits(targetWord, spokenWord) {
  const cleanTarget = (targetWord || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanSpoken = (spokenWord || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const tips = [];

  // 1. Dropped final consonants: -s, -es, -ed, -t, -d, -k, -p, -ce
  const endings = ['s', 'ed', 't', 'd', 'k', 'p', 'ce', 'ts'];
  for (const ending of endings) {
    if (cleanTarget.endsWith(ending) && !cleanSpoken.endsWith(ending)) {
      tips.push(`Chú ý âm đuôi (ending sound) "/${ending}/": Hãy bật rõ âm cuối thay vì ngắt âm sớm.`);
      break;
    }
  }

  // 2. /s/ vs /ʃ/ (s vs sh)
  if (cleanTarget.includes('sh') && !cleanSpoken.includes('sh')) {
    tips.push('Lưu ý âm "sh" (/ʃ/): Hãy chu môi và bật hơi dày hơn âm "s" thông thường.');
  }

  // 3. /θ/ or /ð/ (th sound)
  if (cleanTarget.includes('th') && !cleanSpoken.includes('th')) {
    tips.push('Lưu ý âm "th" (/θ/, /ð/): Đặt đầu lưỡi giữa hai hàm răng và đẩy nhẹ hơi ra.');
  }

  // 4. /l/ vs /n/
  if (cleanTarget.startsWith('l') && cleanSpoken.startsWith('n')) {
    tips.push('Tránh nhầm lẫn âm /l/ với /n/: Đặt đầu lưỡi lên vòm họng trên khi phát âm "l".');
  }

  return tips;
}

/**
 * Aligns target sentence with spoken/typed sentence at the word level AND character level.
 * @param {string} targetSentence - The expected English sentence
 * @param {string} spokenSentence - The transcript recorded from speech or typed
 * @returns {object} Detailed score breakdown
 */
export function scorePronunciation(targetSentence, spokenSentence) {
  if (!targetSentence) return { score: 0, words: [], rawSpoken: '', vietnameseTips: [] };

  const rawSpoken = (spokenSentence || '').trim();
  const targetTokens = targetSentence.trim().split(/\s+/);
  const spokenTokens = rawSpoken.split(/\s+/).filter(Boolean);

  if (spokenTokens.length === 0) {
    return {
      score: 0,
      words: targetTokens.map(word => ({
        word,
        status: 'wrong',
        ratio: 0,
        matchedWith: '',
        chars: alignCharacters(word, ''),
        tips: []
      })),
      rawSpoken: '',
      vietnameseTips: ['Chưa phát hiện được giọng nói. Hãy kiểm tra micro và phát âm to, rõ ràng hơn.']
    };
  }

  const scoredWords = [];
  let totalScoreWeighted = 0;
  let totalWeight = 0;
  let spokenIndex = 0;
  const allTips = new Set();

  targetTokens.forEach((rawWord) => {
    const cleanTarget = rawWord.toLowerCase().replace(/[^a-z0-9]/g, '');
    const weight = Math.max(1, cleanTarget.length);
    totalWeight += weight;

    let bestRatio = 0;
    let bestSpokenMatch = '';
    let bestSpokenIdx = -1;

    // Search within a window around current spokenIndex
    const searchStart = Math.max(0, spokenIndex - 2);
    const searchEnd = Math.min(spokenTokens.length, spokenIndex + 4);

    for (let j = searchStart; j < searchEnd; j++) {
      const cleanSpoken = (spokenTokens[j] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const sim = stringSimilarity(cleanTarget, cleanSpoken);
      if (sim > bestRatio) {
        bestRatio = sim;
        bestSpokenMatch = spokenTokens[j];
        bestSpokenIdx = j;
      }
    }

    let status = 'wrong';
    if (bestRatio >= 0.82) {
      status = 'correct';
      if (bestSpokenIdx !== -1) spokenIndex = bestSpokenIdx + 1;
    } else if (bestRatio >= 0.55) {
      status = 'close';
      if (bestSpokenIdx !== -1) spokenIndex = bestSpokenIdx + 1;
    }

    totalScoreWeighted += bestRatio * weight;

    // Character-level breakdown
    const charAlignment = alignCharacters(cleanTarget, bestSpokenMatch);
    const wordTips = analyzeVietnamesePronunciationHabits(cleanTarget, bestSpokenMatch);
    wordTips.forEach(tip => allTips.add(tip));

    scoredWords.push({
      word: rawWord,
      status,
      ratio: Math.round(bestRatio * 100),
      matchedWith: bestSpokenMatch,
      chars: charAlignment,
      tips: wordTips
    });
  });

  const finalScore = totalWeight > 0 ? Math.round((totalScoreWeighted / totalWeight) * 100) : 0;

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    words: scoredWords,
    rawSpoken,
    vietnameseTips: Array.from(allTips)
  };
}
