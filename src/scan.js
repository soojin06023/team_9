const { globSync } = require("glob");
const path = require("path");
const playwright = require("playwright");
const chromium = playwright.chromium;
const AxeBuilder = require("@axe-core/playwright").default;
const fileSystem = require("fs");

async function runScan() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const htmlFiles = globSync("test-pages/**/*.html");

  const report = {
    scannedAt: new Date().toISOString(),
    pages: []
  };

  for (const file of htmlFiles) {
    const url = `file://${path.resolve(file)}`;

    await page.goto(url);

    const results = await new AxeBuilder({ page }).analyze();

    report.pages.push({
      file,
      url,
      violations: results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map(n => ({
          target: n.target,
          html: n.html,
          failureSummary: n.failureSummary
        }))
      }))
    });

    console.log(`Scanned ${file}: ${results.violations.length} violations`);
  }

  fileSystem.mkdirSync("reports", { recursive: true });
  fileSystem.writeFileSync("reports/report.json", JSON.stringify(report, null, 2));

  console.log("Scan complete. Report saved to reports/report.json");

  await browser.close();
}

runScan();