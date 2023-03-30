// mock js-logger
let logger = {
  info: jest.fn(),
  debug: jest.fn(),
  useDefaults: jest.fn(),
  setLevel: jest.fn()
}

import { parseContracts } from "./app"
import { readYamlFile } from "./files"

jest.mock("js-logger", () => logger)

describe("cli", () => {
  it("reads auditai.yaml file", () => {
    let config = readYamlFile()
    parseContracts(config)
    // check jest mock for logged info
    expect(logger.info).toBeCalledWith("Price per SLOC: 3037.04")
  })
})
