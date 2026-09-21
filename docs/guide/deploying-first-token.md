# Deploying Your First Token

This guide walks through creating and deploying a basic ERC20 token on CointMU using OpenZeppelin `4.9.x` and the `cmu` CLI.

## Prerequisites

| Requirement             | Details                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| Running CointMU node    | Geth `1.10.26` running on Chain ID `1912`.                                  |
| Nginx proxy             | Available at `http://10.64.24.248:8585`.                                    |
| Funded deployer account | Unlocked in the local node with sufficient CMU for gas.                     |
| Active miner            | At least one miner running so transactions are included in blocks.          |
| CointMU project         | A project scaffolded with `cmu create` or an existing compatible structure. |

## 1. Scaffold the Project

If you don't have an existing project, create one using the `erc20` template:

```bash
cmu create my-token --template erc20 --language typescript
cd my-token
```

This generates the full project structure including `contracts/`, `deploy/`, and `artifacts/`.

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
  const rpcUrl = process.env.CMU_RPC_URL ?? "http://10.64.24.248:8585";
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

## 5. Start the Miner

Before deploying, ensure the network is actively producing blocks. Open the Geth console and start the miner:

```bash
geth attach ./data/geth.ipc
```

```js
miner.start(1);
```

Or use the `cmu` CLI if you have a session active:

```bash
cmu mine start
```

If no miner is running, the deployment transaction remains pending and the contract will never be mined into a block.

## 6. Compile

```bash
cmu compile
```

`cmu compile` resolves OpenZeppelin imports from `node_modules` automatically. Compiled artifacts are written to `artifacts/CMUS.json`.

## 7. Deploy

```bash
cmu deploy
```

`cmu deploy` triggers a recompile, loads network configuration from the active session, and executes `deploy/01_deploy_cmus.ts` sequentially.

**Expected output:**

```bash
warning: the following project files will be executed as code:
      cmu.config.ts       ->  /home/you/my-token/cmu.config.ts
      01_deploy_cmus.ts   ->  /home/you/my-token/deploy/01_deploy_cmus.ts

? Execute these files? Yes

Compiling contracts...
Compiled CMUS

--- Deploy configuration ---
Network      : mainnet
RPC endpoint : http://10.64.24.248:8585
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
```

::: info
The first prompt is the trust gate: deploy scripts run with your decrypted `PRIVATE_KEY` in their environment, so the CLI lists every project file it is about to execute and asks before running any of it. Pass `-y, --yes` in a pipeline. See [the trust model](/docs/cli/deploy#trust-model).
:::

## 8. Verify the Deployment

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

Or confirm the on-chain state from the CLI:

```bash
cmu network ping
cmu wallet balance
```
