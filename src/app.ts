#! /usr/bin/env node

const { Command } = require("commander"); // add this line
import * as fs from "fs";
const maxAuditAiProjectContracts = 100
import glob from "glob"
import Logger from "js-logger";

let configFileDesc = `"auditai.txt" file needs to contain contracts with format:
./src/contracts/contract1.sol
./src/contracts/vaults/**/**
`
const program = new Command();
program
  .version(require('../package.json').version)
  .description(`Audit Hero project parser. Parses files included in "auditai.txt" file into a .zip file that can be uploaded to AuditAI.

${configFileDesc}
`)
  .option("-md", "store the contracts by sorted LOC in a markdown file")
  .option("-v", "output extra debugging")
  .parse(process.argv)

Logger.useDefaults();

if (program.opts().v) {
  Logger.setLevel(Logger.DEBUG);
} else {
  Logger.setLevel(Logger.INFO);
}

const options = program.opts();

type Config = {
  lines: string[];
}

const parseContracts = (config: Config) => {
  type FileWithLength = {
    file: string,
    length: number
  }

  let fileMetaBuilder: FileWithLength[] = []

  var zip = new (require('node-zip'))();
  var files: { path: string, data: Buffer }[] = []
  let fileCount = 0

  // get all files from contracts. get files from folders recursively
  config.lines.forEach((it) => {
    let globFiles = glob.sync(it)
    fileCount += globFiles.length

    globFiles.forEach((file) => {
      if (file.endsWith(".sol") === false) {
        Logger.debug(`Skipping ${file} because it is not a .sol file`)
        return
      }

      let fileContent = fs.readFileSync(file)
      fileMetaBuilder.push({
        file: file,
        length: fileContent.toString().split("\n").length
      })

      if (fileMetaBuilder.length < maxAuditAiProjectContracts) {
        files.push({ path: file, data: fileContent })
      }
      else {
        Logger.debug(`Skipping ${file} because the maximum number of contracts is ${maxAuditAiProjectContracts}`)
      }
    })
  })

  let fileContent = ""
  let linesLength = 0
  let sorted = fileMetaBuilder.sort((it, next) => next.length - it.length)
  sorted.forEach(it => {
    fileContent += `- ${it.file}: ${it.length}\n\n`
    linesLength += it.length
  })

  Logger.info("\nSummary:")
  Logger.info(`Files parsed: ${fileCount}`);
  Logger.info(`Files ignored: ${fileCount - fileMetaBuilder.length}`);
  Logger.info(`Solidity files added: ${fileMetaBuilder.length}`);
  Logger.info(`Total solidity LOC: ${linesLength}\n`);

  if (options.Md) {
    let fileName = "audit-hero-contracts-sorted.md"
    fs.writeFileSync(fileName, fileContent)
    Logger.info(`Saved sorted contracts to ${fileName}`)
  }

  // find the upmost directory with no files in it

  // make a list of paths from all of the files
  removeEmptyPath(files, zip);

  var data = zip.generate({ base64: false, compression: 'DEFLATE' });
  fs.writeFileSync('audit-ai.zip', data, 'binary');
  Logger.info("Saved AuditAI zip file to audit-ai.zip")
}

// get the js file and parse+zip the contracts
let config: Config
try {
  let contracts = fs.readFileSync("./auditai.txt").toString()
  let lines = contracts.split("\n").reduce((acc, it) => {
    if (it.trim() !== "") acc.push(it.trim())
    return acc
  }, [] as string[])

  if (lines.length === 0) {
    Logger.info(`auditait.txt lines length 0\n${contracts}\n${configFileDesc}`);
    process.exit(1);
  }
  config = {
    lines: lines
  }
} catch (e) {
  Logger.info(`error ${JSON.stringify(e)}\n\n${configFileDesc}`);
  process.exit(1);
}

parseContracts(config)

function removeEmptyPath(files: { path: string; data: Buffer; }[], zip: any) {
  let paths = files.map(it => it.path.split("/"));

  // find the path parts that all of the files have in common
  let notCommonPathFound = false;
  let commonPath = [];
  while (notCommonPathFound === false) {
    let firstPath = paths[0];
    let common = true;
    for (let i = 0; i < paths.length; i++) {
      if (paths[i][0] !== firstPath[0]) {
        common = false;
        break;
      }
    }

    if (common) {
      commonPath.push(firstPath[0]);
      paths.forEach(it => it.splice(0, 1));
    } else {
      notCommonPathFound = true;
    }
  }

  // remove that common part from all of the files
  let commonPathLength = commonPath.length;
  files.forEach(it => {
    let path = it.path.split("/");
    path.splice(0, commonPathLength);
    it.path = path.join("/");
    zip.file(it.path, it.data);
  });
}

