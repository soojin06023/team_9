const playwright = require ("playwright");
const chromium = playwright.chromium;

const axeBuilder = require("@axe-core/playwright").default;

const fileSystem = require("fs");

async function runScan() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  //FILL WITH OUR URL LATER WHEN SOOJN GIVES ACCESS TO REPO SETTINGS
  const url = "https://broken-workshop.dequelabs.com/";
  await page.goto(url);

  const results = await new axeBuilder({page}).analyze();
  
  const report = {
  scannedAt: new Date().toISOString(),
  url,
  violations: results.violations.map(v=> ({
    id: v.id,
    impact : v.impact,
    description: v.description,
    help: v.help,
    helpUrl: v.helpUrl,
    nodes: v.nodes.map(n=> ({
      target: n.target,
      html: n.html,
      failureSummary: n.failureSummary
    }))
  }))
  };

  fileSystem.mkdirSync("reports", {recursive: true});
  fileSystem.writeFileSync("reports/report.json", JSON.stringify(report, null, 2));

  console.log(`Scan is complete. Found ${report.violations.length} violations.`);
  await browser.close();
}

runScan();