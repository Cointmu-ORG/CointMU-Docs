# Deploying Your First Token

This guide walks through creating and deploying a basic ERC20 token on CointMU using OpenZeppelin `4.9.x` and the `cmu` CLI.

## Prerequisites

| Requirement             | Details                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| Running CointMU node    | Geth `1.10.26` running on Chain ID `1912`.                                  |
| Nginx proxy             | Available at `http://10.64.24.101:8585`.                                    |
| Funded deployer account | Its private key, and enough CMU for gas. `cmu` signs locally.               |
| Active miner            | At least one miner running so transactions are included in blocks.          |
| CointMU project         | A project scaffolded with `cmu create` or an existing compatible structure. |

## 1. Scaffold the Project

If you don't have an existing project, create one using the `erc20` template:

```bash
cmu create my-token --template erc20 --language typescript
cd my-token
```

This generates the full project structure including `contracts/`, `deploy/`, and `artifacts/`.

The `erc20` template already contains `contracts/StandardERC20.sol` and `deploy/01_standarderc20.ts`. Delete both if you only want the token below; otherwise `cmu deploy` runs that script too.

## 2. Install Dependencies

```bash
npm install
npm install @openzeppelin/contracts@4.9.6
```

::: warning
Do not install `@openzeppelin/contracts@5.x`. Version 5 requires `solc 0.8.20+` which emits the `PUSH0` opcode, causing an `invalid opcode` error on Geth `1.10.26`. Always use `4.9.x`.

See [Supported Libraries](/docs/guide/supported-libraries) for the full compatibility reference.
:::

## 3. Write the Token Contract

Create the token contract in `contracts/CMUS.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CMUS is ERC20, Ownable {
    constructor() ERC20("CointMU Token", "CMUS") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}
```

::: info
The pragma matches the `^0.8.20` used by every built-in template. Compatibility with Geth `1.10.26` comes from the EVM target rather than the pragma: `cmu compile` sets `evmVersion: "paris"`, which suppresses the `PUSH0` opcode that the compiler would otherwise emit under its default `shanghai` target. See [Supported Libraries](/docs/guide/supported-libraries).
:::

## 4. Add the Deployment Script

Create `deploy/01_deploy_cmus.ts` and point it at the Nginx proxy URL:

```typescript
import { ethers } from "ethers";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const rpcUrl = process.env.CMU_RPC_URL ?? "http://10.64.24.101:8585";
  const provider = new ethers.JsonRpcProvider(rpcUrl, 1912);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

  const artifactPath = path.resolve("artifacts", "CMUS.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.evm.bytecode.object,
    wallet,
  );

  console.log("Deploying CMUS token...");
  const token = await factory.deploy();
  await token.waitForDeployment();

  console.log("CMUS deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

::: tip
The script reads `CMU_RPC_URL` and `PRIVATE_KEY` from environment variables. These are injected automatically by `cmu deploy` — no manual `.env` configuration is needed when running through the CLI.
:::

## 5. Point the Project at the Server

`cmu deploy` and `cmu mine` choose their network in different places, so both need to point at the server. See [Which Network a Command Uses](/docs/cli/network#which-network-a-command-uses).

In `cmu.config.ts`, give the scaffolded `mainnet` entry the server's URL — it ships with an empty `url` — and make it the default:

```typescript
  defaultNetwork: "mainnet",
  networks: {
    // ...
    mainnet: {
      url: "http://10.64.24.101:8585",
      chainId: 1912,
      symbol: "CMU",
    },
  },
```

`symbol: "CMU"` is already there in projects created by `cmu create` 1.7.0 or later; in an older project, add it so [`cmu explorer`](/docs/cli/explorer#coin-symbol) labels balances `CMU` instead of `ETH`.

Then save the deployer key as a wallet, activate it in the project, and point the session at the same server:

```bash
cmu wallet save deployer
cmu wallet use deployer
cmu network save http://10.64.24.101:8585 --name cointmu --symbol CMU
cmu network use cointmu
```

`cmu wallet save` prompts for the private key and a new password; `cmu wallet use` makes it the key `cmu deploy` signs with. See [cmu wallet](/docs/cli/wallet).

`--symbol CMU` makes `cmu wallet balance`, `cmu wallet transfer` and `cmu mine` show amounts on this network in `CMU` instead of `ETH`. Since 1.7.0; see [Coin Symbol](/docs/cli/network#coin-symbol).

## 6. Start the Miner

Before deploying, ensure the network is actively producing blocks. Open the Geth console and start the miner:

```bash
geth attach ./data/geth.ipc
```

```js
miner.start(1);
```

Or use the `cmu` CLI, which mines to the session wallet on the session's network:

```bash
cmu mine status
cmu mine start
```

`cmu mine start` moves the node's mining rewards to your wallet for everyone mining on it. Check `cmu mine status` first on a shared server. See [cmu mine](/docs/cli/mine).

If no miner is running, the deployment transaction remains pending and the contract will never be mined into a block.

## 7. Compile

```bash
cmu compile
```

`cmu compile` resolves OpenZeppelin imports from `node_modules` automatically. Compiled artifacts are written to `artifacts/CMUS.json`.

## 8. Deploy

```bash
cmu deploy
```

`cmu deploy` triggers a recompile, resolves the network from `defaultNetwork` in `cmu.config.ts`, prompts once for the session password, and executes `deploy/01_deploy_cmus.ts` sequentially.

**Expected output:**

```bash
warning: the following project files will be executed as code:
      cmu.config.ts       ->  /home/you/my-token/cmu.config.ts
      01_deploy_cmus.ts   ->  /home/you/my-token/deploy/01_deploy_cmus.ts

? Execute these files? Yes

Compiling contracts...
Compiling 1 Solidity file(s)...
Compiled CMUS
? Session password for 0x...: *************

--- Deploy configuration ---
Network      : mainnet
RPC endpoint : http://10.64.24.101:8585
Chain ID     : 1912
Deployer     : 0x...
----------------------------

Found 1 deploy script(s); running them in order...

========================================
Running 01_deploy_cmus.ts
========================================

Deploying CMUS token...
CMUS deployed to: 0x...

All deploy scripts completed.

--- Deployed on 'mainnet' (chain 1912) ---
CMUS  0x...  block <n>  -> deployments/mainnet/CMUS.json
----------------------------------------
```

The last block is the [deployment record](/docs/cli/deploy#deployment-records): the address is saved in `deployments/mainnet/CMUS.json`, which is meant to be committed.

::: info
The first prompt is the trust gate: deploy scripts run with your decrypted `PRIVATE_KEY` in their environment, so the CLI lists every project file it is about to execute and asks before running any of it. Pass `-y, --yes` in a pipeline. See [the trust model](/docs/cli/deploy#trust-model).
:::

## 9. Verify the Deployment

After deployment, confirm the contract is live by checking the deployed address in the Explorer or querying it directly:

```typescript
const token = new ethers.Contract(
  "0x<deployed_address>",
  artifact.abi,
  provider,
);

console.log("Name:", await token.name());
console.log("Symbol:", await token.symbol());
console.log("Total Supply:", ethers.formatEther(await token.totalSupply()));
```

Or confirm it from the CLI. `cmu explorer --contract` shows the code at the address and checks it against the record, and `getDeployed` in `cmu console` loads the recorded contract:

```bash
cmu explorer --contract 0x<deployed_address>
cmu console
```

```bash
cmu> const token = await getDeployed("CMUS")
cmu> await token.symbol()
'CMUS'
```
