import yaml from "js-yaml"
import fs from "fs"
import Logger from "js-logger";
import glob from "glob"
import { maxAuditAiProjectContracts } from "./config";

export type Config = {
  prize_pool: number
  contracts: string[]
}

export type FilesRead = {
  files: { path: string, data: Buffer }[]
  fileMetaBuilder: FileWithLength[]
}

export const readYamlFile = (): Config => {
  let input = yaml.load(fs.readFileSync("./auditai.yaml").toString())
  return input as Config
}

export type FileWithLength = {
  file: string,
  length: number
}

export const readContracts = (config: Config) => {
  var files: { path: string, data: Buffer }[] = []
  let fileMetaBuilder: FileWithLength[] = []
  let fileCount = 0

  // get all files from contracts. get files from folders recursively
  config.contracts.forEach((it) => {
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
        Logger.info(`Skipping ${file} because the maximum number of contracts is ${maxAuditAiProjectContracts}`)
      }
    })
  })

  return { files, fileMetaBuilder, fileCount }
}