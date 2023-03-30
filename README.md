# auditai-cli

### setup

include file "auditai.yaml" in your project with contents:
```
prize_pool: 164000
contracts:
- ./src/testProject/contracts/contract1.sol
- ./src/testProject/contracts/vaults/**
```

## options

```
  .option("-md", "store the contracts by sorted LOC in a markdown file. Useful for creating a checklist about which contracts need to be audited.")
  .option("-scm", "store the sorted contracts with solidity-code-metrics. Get useful information about the contracts")
  .option("-v", "output extra debugging")
```

### run locally

- cd $your_solidity_project
- add auditai.txt file with glob pattern similarly to `auditai.txt`
- run `npx ts-node $auditai-cli/src/app.ts --help`

### publish
update version and
`yarn build && yarn publish`
