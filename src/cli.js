const {Command} = require("commander");
const {scan}= require("./scan");

const program = new Command();

program
.command("scan")
.argument("<curl>")
.action(async(url) => {
    await scan(url);
});

program.parse();