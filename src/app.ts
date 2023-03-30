#! /usr/bin/env node

const { Command } = require("commander"); // add this line
import * as fs from "fs";
import { removeEmptyPathAndAddToZip } from "./pathParser"
import { exec } from "child_process"
import Logger from "js-logger";
import { Config, readContracts, readYamlFile } from "./files";

let configFileDesc = `"auditai.yaml" file needs to contain contracts with format:
contracts:
- ./src/contracts/contract1.sol
- ./src/contracts/vaults/**/**
`
const program = new Command();
program
  .version(require('../package.json').version)
  .description(`Audit Hero project parser. Parses files included in "auditai.yaml" file into a .zip file that can be uploaded to AuditAI.

${configFileDesc}
`)
  .option("-md", "store the contracts by sorted LOC in a markdown file. Useful for creating a checklist about which contracts need to be audited.")
  .option("-scm", "store the sorted contracts with solidity-code-metrics. Get useful information about the contracts")
  .option("-v", "output extra debugging")
  .parse(process.argv)

Logger.useDefaults();
Logger.setLevel(Logger.INFO);

if (program.opts().v) {
  Logger.setLevel(Logger.DEBUG);
  Logger.debug("Debugging enabled");
}

const options = program.opts();

export const parseContracts = (config: Config) => {
  let fileContent = ""
  let linesLength = 0
  var zip = new (require('node-zip'))();

  let { fileCount, fileMetaBuilder, files } = readContracts(config)

  let sorted = fileMetaBuilder.sort((it, next) => next.length - it.length)
  sorted.forEach(it => {
    fileContent += `- [ ] ${it.file}: ${it.length}\n\n`
    linesLength += it.length
  })

  if (files.length === 0) {
    throw Error("No files found. Check your auditai.yaml")
  }

  Logger.info("\nSummary:")
  Logger.info(`Files parsed: ${fileCount}`);
  Logger.info(`Files ignored: ${fileCount - fileMetaBuilder.length}`);
  Logger.info(`Solidity files added: ${fileMetaBuilder.length}`);
  Logger.info(`Total SLOC: ${linesLength}`);
  Logger.info(`Price per SLOC: ${Math.round((config.prize_pool / linesLength) * 100) / 100}`)

  Logger.info(`\n`)
  
  if (options.Md) {
    let fileName = "audit-hero-contracts-sorted.md"
    fs.writeFileSync(fileName, fileContent)
    Logger.info(`Saved sorted contracts to ${fileName}`)
  }

  // make a list of paths from all of the files
  removeEmptyPathAndAddToZip(files, zip);

  var data = zip.generate({ base64: false, compression: 'DEFLATE' });
  fs.writeFileSync('audit-ai.zip', data, 'binary');
  Logger.info("Saved AuditAI zip file to audit-ai.zip")

  if (options.Scm) {
    let fileName = "solidity-code-metrics.md"
    Logger.info("Running solidity-code-metrics. This may take a while...")

    exec(`solidity-code-metrics ${sorted.map(it => it.file).join(" ")}`, (error, stdout, stderr) => {
      if (error) {
        Logger.error(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        Logger.error(`stderr: ${stderr}`);
        return;
      }

      fs.writeFileSync(fileName, stdout)

      Logger.info(`Saved solidity-code-metrics to ${fileName}`)
    })
  }
}

// get the js file and parse+zip the contracts
let config = readYamlFile()
parseContracts(config)