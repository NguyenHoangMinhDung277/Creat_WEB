// 100% Vietnamese Translation Rule Validator
// Automatically verifies that every English word, phrase, example, and explanation has its Vietnamese translation.

export function validateLearningItem(item, context = 'Unknown') {
  const issues = [];

  if (!item.vietnamese || typeof item.vietnamese !== 'string' || !item.vietnamese.trim()) {
    issues.push(`Missing 'vietnamese' meaning for "${item.english || item.id}"`);
  }
  if (!item.exampleVi || typeof item.exampleVi !== 'string' || !item.exampleVi.trim()) {
    issues.push(`Missing 'exampleVi' (Vietnamese example translation) for "${item.english || item.id}"`);
  }
  if (!item.explanationVi || typeof item.explanationVi !== 'string' || !item.explanationVi.trim()) {
    issues.push(`Missing 'explanationVi' (Vietnamese usage explanation) for "${item.english || item.id}"`);
  }

  if (issues.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn(`[AuraLingua 100% Rule Audit] [${context}]:`, issues);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

export function validateAllContent(items, context = 'Seed Content') {
  let totalIssues = 0;
  const failureLog = [];

  items.forEach(item => {
    const res = validateLearningItem(item, context);
    if (!res.isValid) {
      totalIssues += res.issues.length;
      failureLog.push({ id: item.id, english: item.english, issues: res.issues });
    }
  });

  if (totalIssues === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`%c[AuraLingua 100% Rule] ✓ All ${items.length} items have complete Vietnamese translations!`, 'color: #10b981; font-weight: bold;');
    }
  } else {
    console.error(`[AuraLingua 100% Rule Alert] Found ${totalIssues} missing Vietnamese translation fields across ${failureLog.length} items!`, failureLog);
  }

  return { totalChecked: items.length, totalIssues, failureLog };
}
