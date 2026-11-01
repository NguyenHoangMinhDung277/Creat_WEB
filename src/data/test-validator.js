import { SEED_ITEMS } from './seedContent.js';
import { validateAllContent } from '../utils/devValidator.js';

const res = validateAllContent(SEED_ITEMS, 'Seed Content Node Test');
console.log(`TOTAL CHECKED: ${res.totalChecked}`);
console.log(`TOTAL ISSUES: ${res.totalIssues}`);
if (res.totalIssues > 0) {
  process.exit(1);
} else {
  console.log('SUCCESS: All seed items comply 100% with Vietnamese translation rule.');
}
