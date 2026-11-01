import { scorePronunciation, alignCharacters } from './scoring.js';
import { calculateSM2 } from './srs.js';
import { chunkText, deduplicateItems } from './chunkText.js';

console.log('--- Testing scoring.js with Character Alignment ---');
const score1 = scorePronunciation('Nice to meet you', 'Nice to meet you');
console.log('Exact match score:', score1.score, 'Expected ~100');
if (score1.score < 95) process.exit(1);

const score2 = scorePronunciation('Nice to meet you', 'Nice to meet yu');
console.log('Close match score:', score2.score, 'Expected 70-95');

// Test character alignment
const chars = alignCharacters('breakfast', 'brekfas');
console.log('Character alignment tokens count for "breakfast" vs "brekfas":', chars.length);
const missingChars = chars.filter(c => c.status === 'missing');
console.log('Missing chars identified:', missingChars.map(c => c.char));
if (missingChars.length === 0) {
  console.error('Failed to identify missing characters in "brekfas"');
  process.exit(1);
}

console.log('\n--- Testing srs.js ---');
const srs1 = calculateSM2({}, true);
console.log('First review success - interval:', srs1.interval, 'repetitions:', srs1.repetitions);
if (srs1.interval !== 1 || srs1.repetitions !== 1) process.exit(1);

const srs2 = calculateSM2(srs1, true);
console.log('Second review success - interval:', srs2.interval, 'repetitions:', srs2.repetitions);
if (srs2.interval !== 6 || srs2.repetitions !== 2) process.exit(1);

console.log('\n--- Testing chunkText.js ---');
const chunks = chunkText('Sentence one. Sentence two! Sentence three? Sentence four.', 30, 10);
console.log('Chunk count:', chunks.length);
if (chunks.length < 2) process.exit(1);

const dedupe = deduplicateItems([
  { english: 'Wake up', vietnamese: 'Thức dậy' },
  { english: 'wake up', vietnamese: 'Thức dậy, mở mắt' }
]);
console.log('Deduplicated count:', dedupe.length, 'Expected 1');
if (dedupe.length !== 1) process.exit(1);

console.log('\nALL UPGRADED UNIT TESTS PASSED SUCCESSFULLY!');
