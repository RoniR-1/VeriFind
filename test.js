const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🧪 Running Node.js game data integrity tests...');

// Mock browser window object for loading case and glossary JS files
const sandbox = { window: {} };
vm.createContext(sandbox);

// Read and execute glossary and outbreak cases
const glossaryCode = fs.readFileSync(path.join(__dirname, 'js', 'glossary.js'), 'utf8');
const outbreakCode = fs.readFileSync(path.join(__dirname, 'js', 'cases', 'outbreak.js'), 'utf8');
const casesCode = fs.readFileSync(path.join(__dirname, 'js', 'cases', 'cases.js'), 'utf8');

vm.runInContext(glossaryCode, sandbox);
vm.runInContext(outbreakCode, sandbox);
vm.runInContext(casesCode, sandbox);

const cases = sandbox.window.SN_CASES || {};
const glossary = sandbox.window.SN_GLOSSARY || {};

let passes = 0;
let failures = 0;

function assert(condition, message) {
  if (condition) {
    passes++;
  } else {
    failures++;
    console.error(`❌ FAIL: ${message}`);
  }
}

// 1. Check Glossary
assert(Object.keys(glossary).length > 0, 'Glossary should contain entries');

// 2. Check Cases
assert(Object.keys(cases).length >= 15, `Cases registry should contain cases for all tracks & difficulties (found ${Object.keys(cases).length})`);

let totalQuestions = 0;
let totalPosts = 0;

Object.entries(cases).forEach(([caseKey, caseData]) => {
  assert(caseData.accounts && Object.keys(caseData.accounts).length > 0, `Case '${caseKey}' must have accounts`);
  assert(Array.isArray(caseData.phases) && caseData.phases.length >= 3, `Case '${caseKey}' must have at least 3 phases`);

  const accounts = caseData.accounts;

  caseData.phases.forEach((phase, phaseIdx) => {
    assert(phase.id && phase.label && phase.news, `Case '${caseKey}' Phase ${phaseIdx + 1} must have id, label, and news`);
    assert(Array.isArray(phase.feed) && phase.feed.length > 0, `Case '${caseKey}' Phase ${phaseIdx + 1} feed must contain items`);

    phase.feed.forEach((item) => {
      if (item.kind === 'question') {
        totalQuestions++;
        assert(['true', 'unsure', 'false'].includes(item.answer), `Question ${item.id} must have valid answer`);
        assert(item.claim && item.explanation, `Question ${item.id} must have claim and explanation`);
      } else {
        totalPosts++;
        assert(accounts[item.author] !== undefined, `Post ${item.id} author '${item.author}' must exist in accounts`);
      }
    });
  });
});

console.log(`📊 Validated ${totalPosts} posts and ${totalQuestions} questions across ${Object.keys(cases).length} registered cases.`);

console.log(`\nResults: ${passes} passed, ${failures} failed.`);

if (failures > 0) {
  process.exit(1);
} else {
  console.log('✅ All Node.js data integrity tests passed clean!\n');
}

