const fs = require("fs");

const baselinePath = "reports/baseline.json";
const currentPath = "reports/report.json";

if (!fs.existsSync(baselinePath)) {
  console.log("No baseline found. Creating baseline from current report.");
  fs.copyFileSync(currentPath, baselinePath);
  process.exit(0);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf-8"));
const current = JSON.parse(fs.readFileSync(currentPath, "utf-8"));

function makeKey(pageFile, violation, node) {
  return `${pageFile}|${violation.id}|${node.target.join(",")}`;
}

const oldIssues = new Set();

for (const page of baseline.pages) {
  for (const violation of page.violations) {
    for (const node of violation.nodes) {
      oldIssues.add(makeKey(page.file, violation, node));
    }
  }
}

const newIssues = [];

for (const page of current.pages) {
  for (const violation of page.violations) {
    for (const node of violation.nodes) {
      const key = makeKey(page.file, violation, node);

      if (!oldIssues.has(key)) {
        newIssues.push({
          file: page.file,
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          helpUrl: violation.helpUrl,
          target: node.target,
          html: node.html,
          failureSummary: node.failureSummary
        });
      }
    }
  }
}

if (newIssues.length > 0) {
  console.log(`Accessibility regression found: ${newIssues.length} new issue(s).`);

  for (const issue of newIssues) {
    console.log("\n---");
    console.log(`File: ${issue.file}`);
    console.log(`Rule: ${issue.id}`);
    console.log(`Impact: ${issue.impact}`);
    console.log(`Problem: ${issue.help}`);
    console.log(`Element: ${issue.html}`);
    console.log(`Fix: ${issue.failureSummary}`);
  }

  process.exit(1);
}

console.log("No new accessibility violations found.");
process.exit(0);