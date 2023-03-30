import { removeEmptyPathAndAddToZip } from "./pathParser"

describe("cli", () => {
  it("removes common path", () => {
    let paths = [
      `./src/testProject/contracts/contract1.sol`,
      `./src/testProject/contracts/vaults/contract2.sol`,
      `./src/testProject/contracts/vaults/contract3.sol`
    ]

    // these should parse to contract1.sol and vaults/contract2.sol

    jest.mock("node-zip", () => ({
      file: jest.fn()
    }))

    let zip = require("node-zip")
    let data = Buffer.from("")

    let files = paths.map(it => {
      return { path: it, data: data }
    })

    removeEmptyPathAndAddToZip(files, zip)

    expect(zip.file).toBeCalledWith("contract1.sol", data)
    expect(zip.file).toBeCalledWith("vaults/contract2.sol", data)
    expect(zip.file).toBeCalledWith("vaults/contract3.sol", data)
  })

  it("removes common path from single file", () => {
    let paths = [
      `./src/testProject/contracts/contract1.sol`,
    ]

    // these should parse to contract1.sol and vaults/contract2.sol
    jest.mock("node-zip", () => ({
      file: jest.fn()
    }))

    let zip = require("node-zip")
    let data = Buffer.from("")

    let files = paths.map(it => {
      return { path: it, data: data }
    })

    removeEmptyPathAndAddToZip(files, zip)

    expect(zip.file).toBeCalledWith("contract1.sol", data)
  })

  it("handles single file", () => {
    let paths = [
      `contract1.sol`,
    ]

    jest.mock("node-zip", () => ({
      file: jest.fn()
    }))

    let zip = require("node-zip")
    let data = Buffer.from("")

    let files = paths.map(it => {
      return { path: it, data: data }
    })

    removeEmptyPathAndAddToZip(files, zip)

    expect(zip.file).toBeCalledWith("contract1.sol", data)
  })
})
