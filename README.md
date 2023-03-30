# auditai-cli

### setup

include file "auditai.yaml" in your project with contents:
```
prize_pool: 164000
contracts:
- ./src/testProject/contracts/contract1.sol
- ./src/testProject/contracts/vaults/**
```

### run locally

- cd $your_solidity_project
- add auditai.txt file with glob pattern similarly to `auditai.txt`
- run `npx ts-node $auditai-cli/src/app.ts --help`

### publish
update version and
`yarn build && yarn publish`
