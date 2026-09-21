# Supported Libraries

This page documents the Solidity and JavaScript/TypeScript libraries that are verified compatible with the CointMU stack. Compatibility is constrained by the specific capabilities of **Geth `1.10.26`** running a private Proof-of-Work chain — a pre-merge client with a fixed EVM feature set.

::: warning IMPORTANT — Read Before Installing Any Library
CointMU runs on **Geth `1.10.26`**, released October 2022. This version predates the Paris hard fork (The Merge) and does not support any post-London EIPs. The most critical implication is:

**`solc 0.8.20` and above default to EVM target `shanghai`, which emits the `PUSH0` opcode. This opcode does not exist in Geth `1.10.26` and will cause an `invalid opcode` error at runtime.**

Always use `solc ≤ 0.8.19` or explicitly set `evmVersion: "paris"` in `cmu.config.ts`.
:::

---

## Stack Compatibility Matrix

| Layer      | Component     | Supported Version | Notes                                          |
| ---------- | ------------- | ----------------- | ---------------------------------------------- |
| Network    | Geth (PoW)    | `1.10.26`         | Pre-merge. Supports up to London hard fork.    |
| EVM Forks  | Berlin        | Supported         | EIP-2929, EIP-2930, EIP-2718, EIP-2565.        |
| EVM Forks  | London        | Supported         | EIP-1559, EIP-3198, EIP-3529, EIP-3541.        |
| EVM Forks  | Paris (Merge) | **Not supported** | No PoS, no `PREVRANDAO`, no `PUSH0`.           |
| EVM Forks  | Shanghai      | **Not supported** | `PUSH0` opcode unavailable.                    |
| EVM Forks  | Cancun        | **Not supported** | No `TSTORE`, `TLOAD`, `MCOPY`, blob txs.       |
| Compiler   | solc          | `≤ 0.8.19`        | `0.8.20+` defaults to `shanghai` EVM target.   |
| EVM Target | evmVersion    | `paris` (default) | Set in `cmu.config.ts`. Never use `shanghai+`. |
| CLI        | cmu           | `1.x`             | —                                              |
| Runtime    | ethers.js     | `6.x`             | Used internally by the `cmu` CLI.              |

---

## Solidity Libraries

### OpenZeppelin Contracts

| Package                               | Safe Version | Unsafe Version | Reason                                            |
| ------------------------------------- | ------------ | -------------- | ------------------------------------------------- |
| `@openzeppelin/contracts`             | `^4.9.x`     | `^5.x`         | v5.x requires `solc 0.8.20+` which emits `PUSH0`. |
| `@openzeppelin/contracts-upgradeable` | `^4.9.x`     | `^5.x`         | Same constraint as above.                         |

::: danger
**Do not install `@openzeppelin/contracts@5.x`** on CointMU. Version 5 sets `pragma solidity ^0.8.20` which forces `PUSH0` bytecode output. Deployment will fail with `invalid opcode`.

Use `4.9.x` instead:

```bash
npm install @openzeppelin/contracts@4.9.6
```

:::

**Supported modules in `4.9.x`:**

| Module               | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `ERC20`              | Standard fungible token.                                 |
| `ERC721`             | Standard non-fungible token.                             |
| `ERC1155`            | Multi-token standard.                                    |
| `Ownable`            | Single-account ownership and access control.             |
| `AccessControl`      | Role-based access control.                               |
| `ReentrancyGuard`    | Mutex guard against reentrancy attacks.                  |
| `Pausable`           | Emergency pause mechanism.                               |
| `MerkleProof`        | On-chain Merkle proof verification.                      |
| `TimelockController` | Delayed execution controller for vault and DAO patterns. |

**Import example:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
```

---

### Solmate

| Package   | Safe Version | Notes                                                        |
| --------- | ------------ | ------------------------------------------------------------ |
| `solmate` | `^6.x`       | Compatible with `solc 0.8.x` and EVM `paris`. Gas-optimized. |

::: warning
Solmate does not include input validation by default for performance reasons. Pair it with explicit input checks in your contract logic.
:::

```bash
npm install solmate
```

```solidity
import "solmate/src/tokens/ERC20.sol";
```

---

### Solady

| Package  | Safe Version | Notes                                                                |
| -------- | ------------ | -------------------------------------------------------------------- |
| `solady` | `^0.x`       | Assembly-level optimizations. Audit carefully before production use. |

```bash
npm install solady
```

---

## JavaScript / TypeScript Libraries

### ethers.js

| Package  | Supported Version | Notes                                                        |
| -------- | ----------------- | ------------------------------------------------------------ |
| `ethers` | `^6.x`            | Used internally by `cmu deploy`, `cmu node`, and `cmu mine`. |

```bash
npm install ethers
```

```ts
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const balance = await provider.getBalance(wallet.address);
console.log(ethers.formatEther(balance));
```

---

### viem

| Package | Supported Version | Notes                                                                    |
| ------- | ----------------- | ------------------------------------------------------------------------ |
| `viem`  | `^2.x`            | Not used by `cmu` internally, but compatible with the JSON-RPC endpoint. |

```bash
npm install viem
```

```ts
import { createPublicClient, http, defineChain } from "viem";

const cointmu = defineChain({
  id: 1912,
  name: "CointMU",
  nativeCurrency: { name: "CointMU", symbol: "CMU", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
  },
});

const client = createPublicClient({ chain: cointmu, transport: http() });
const blockNumber = await client.getBlockNumber();
```

---

### web3.js

| Package | Supported Version | Notes                                                                                   |
| ------- | ----------------- | --------------------------------------------------------------------------------------- |
| `web3`  | `^4.x`            | Compatible with the JSON-RPC endpoint. ethers.js `6.x` is recommended for new projects. |

```bash
npm install web3
```

---

## Unsupported and Incompatible Libraries

| Library / Feature                                  | Reason                                                                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `@openzeppelin/contracts@^5.x`                     | Requires `solc 0.8.20+` which emits `PUSH0`. Fails with `invalid opcode` on Geth `1.10.26`.              |
| `solc >= 0.8.20` (default target)                  | Defaults to `shanghai` EVM. Emits `PUSH0` opcode. Must pin to `≤ 0.8.19` or force `evmVersion: "paris"`. |
| EVM `shanghai` features (`PUSH0`)                  | Not available in Geth `1.10.26`. Any contract emitting `PUSH0` will revert at runtime.                   |
| EVM `cancun` features (`TSTORE`, `TLOAD`, `MCOPY`) | Not available. Requires Geth `1.13+`.                                                                    |
| `PREVRANDAO` opcode                                | Introduced in Paris (post-merge). Not available on a PoW chain.                                          |
| Hardhat Runtime Environment (`hre`)                | Not part of the `cmu` toolchain. Use `cmu deploy` and `cmu test` instead.                                |
| Foundry (`forge`, `cast`)                          | Not integrated with the `cmu` CLI workflow.                                                              |
| Truffle                                            | Deprecated. Not compatible with the CointMU toolchain.                                                   |
| EIP-4844 blob transactions                         | Requires Cancun. Not available in Geth `1.10.26`.                                                        |

---

## Safe Solidity Pragma Guide

| Target                     | Safe Pragma                | Notes                                                                             |
| -------------------------- | -------------------------- | --------------------------------------------------------------------------------- |
| Maximum compatibility      | `pragma solidity ^0.8.0;`  | Works across all `0.8.x` versions.                                                |
| Pinned safe ceiling        | `pragma solidity ^0.8.19;` | Highest version that never emits `PUSH0`, whatever the EVM target.                |
| Default for `cmu compile`  | `pragma solidity ^0.8.20;` | Safe through `cmu compile`, which pins `evmVersion: "paris"`. Used by every built-in template. |

::: warning
The pragma alone does not determine whether `PUSH0` is emitted — the **EVM target** does. A `^0.8.20` contract is safe when compiled with `evmVersion: "paris"` and unsafe under the compiler's default `shanghai` target. Pin the pragma to `^0.8.19` only when the contract may be compiled outside `cmu compile`, where that guarantee does not apply.
:::

---

## Built-in Template Compatibility

All templates scaffolded by `cmu create` are **zero-dependency** — they do not import any external Solidity library. Each contract is written from scratch using only native Solidity primitives and minimal inline interfaces, making them fully compatible with Geth `1.10.26` out of the box.

| Template      | External Dependencies | EVM Compatibility | Notes                                                                                              |
| ------------- | --------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| `blank`       | None                  | Full              | Empty skeleton, no contracts.                                                                      |
| `erc20`       | None                  | Full              | Standalone ERC20 implementation without OpenZeppelin.                                              |
| `erc721`      | None                  | Full              | Standalone ERC721 implementation without OpenZeppelin.                                             |
| `erc1155`     | None                  | Full              | Standalone ERC1155 implementation without OpenZeppelin.                                            |
| `dao`         | None                  | Full              | Minimal DAO with proposals and voting. No governance token required.                               |
| `marketplace` | None                  | Full              | NFT marketplace stub. Token transfers are not enforced in the template.                            |
| `staking`     | None                  | Full              | ERC20 staking with linear reward accrual via inline `IERC20` interface.                            |
| `airdrop`     | None                  | Full              | Merkle tree airdrop with self-contained proof verification. No OZ `MerkleProof` dependency.        |
| `vault`       | None                  | Full              | Multisig timelock treasury. No OZ `TimelockController` dependency.                                 |
| `kyberion`    | None                  | Full              | Post-quantum cryptography research prototype. All PQC logic is placeholder — not production ready. |

::: warning PRAGMA NOTE
All built-in templates use `pragma solidity ^0.8.20`. While the contracts themselves are EVM `paris` compatible, `cmu compile` enforces `evmVersion: "paris"` by default which overrides the compiler's default `shanghai` target. No manual config change is required as long as you compile via `cmu compile`.

If you compile templates outside of `cmu compile` (e.g. via `solc` directly or Remix), you **must** manually set `evmVersion` to `paris` to avoid `PUSH0` bytecode output.
:::

::: info KYBERION
The `kyberion` template is a **research prototype only**. The EVM has no native support for NIST PQC standards ML-KEM (FIPS 203) and ML-DSA (FIPS 204). All verification routines in the template are structural placeholders and must be replaced with a precompile, verifier contract, or zk proof before any production use.
:::

### Extending Templates with External Libraries

If you extend a built-in template with an external Solidity library, ensure the library meets the CointMU compatibility requirements:

| Requirement                      | Detail                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `pragma solidity`                | Must not require `^0.8.20` or higher as minimum.                             |
| No `PUSH0` dependency            | Library must not emit `PUSH0` opcode when compiled with `evmVersion: paris`. |
| No post-London EVM features      | No `PREVRANDAO`, `TSTORE`, `TLOAD`, `MCOPY`, or blob transactions.           |
| Recommended OpenZeppelin version | `4.9.x` — do not use `5.x`.                                                  |

---

## Adding a Library

Any Solidity library installable via npm is supported by `cmu compile` as long as it:

- Is compatible with `solc ≤ 0.8.19`, **or** explicitly sets `pragma solidity ^0.8.x` without requiring `0.8.20+`.
- Does not depend on post-London EVM opcodes (`PUSH0`, `TSTORE`, `TLOAD`, `PREVRANDAO`).

```bash
npm install <library>
```

To verify a library will not emit unsafe opcodes, check its `pragma` statement and confirm it does not require `solc 0.8.20+`.
