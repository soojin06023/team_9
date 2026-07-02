const fs = require("fs-extra");

async function saveReport(results) {
  await fs.ensureDir("reports");

  await fs.writeJson("reports/latest.json", results, {
    spaces: 2,
  });
}

module.exports = {saveReport};
