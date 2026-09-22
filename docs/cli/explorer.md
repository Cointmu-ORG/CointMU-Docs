# cmu explorer

`cmu explorer` queries a CointMU node over JSON-RPC and prints a report for a single block or a single address, without opening a REPL or leaving the terminal.

::: info
This is the CLI command. For the graphical block explorer in the CointMU desktop app — search, telemetry, transaction history — see [Blockchain Explorer](/docs/app/explorer). The two are unrelated; `cmu explorer` neither opens nor requires the app.
:::

## Usage

```bash
cmu explorer --block <number>
cmu explorer --contract <address>
```

## Options

| Flag                       | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| `-b, --block <number>`     | Block number to look up, in decimal.                        |
| `-c, --contract <address>` | Address to look up.                                         |
| `-n, --network <name>`     | Network to query, by name from `cmu.config.ts`.             |
| `-y, --yes`                | Skip the confirmation prompt before executing project code. |

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

::: warning
Exactly one of `--block` or `--contract` is required. Passing both, or neither, is an error:

```bash
error: explorer failed
exactly one of --block <number> or --contract <address> is required.
hint: `cmu explorer --block 42` or `cmu explorer --contract 0x...`.
```

:::

## Read-Only Behavior

The explorer never signs anything and never unlocks your wallet session. It issues only `eth_getBlockByNumber`, `eth_getCode`, `eth_getBalance`, and `eth_blockNumber`.

| Behavior                         | `cmu explorer`                        |
| -------------------------------- | ------------------------------------- |
| Prompts for the session password | Never                                 |
| Decrypts `.cmu-session`          | Never                                 |
| Sends a transaction              | Never                                 |
| Executes `cmu.config.ts`         | Yes — see [Trust Model](#trust-model) |

## Network Resolution

Like [`cmu console`](/docs/cli/console) and [`cmu deploy`](/docs/cli/deploy), the explorer resolves its target from `cmu.config.ts`, **not** from the saved-network list:

| Source                              | Effect on `cmu explorer`                |
| ----------------------------------- | --------------------------------------- |
| `defaultNetwork` in `cmu.config.ts` | The network queried by default          |
| `-n, --network <name>`              | Overrides `defaultNetwork` for this run |
| `cmu network use <name>`            | **Not** consulted                       |

Run outside a project, with no `cmu.config.ts` to read, the explorer targets the local devnet at `http://127.0.0.1:8585` (chain ID `1912`).

::: warning
A network defined in `cmu.config.ts` with an empty `url` — as the scaffolded `mainnet` entry ships — is not caught as a configuration error. The command waits out the RPC timeout and reports the endpoint as unreachable with the URL missing from the message:

```bash
Pinging ...
error: explorer failed
RPC endpoint  is unreachable (timed out after 3000ms).
```

Set `networks.<name>.url` before querying that network. Tracked as [CointMU-CLI#136](https://github.com/kakonoomoidee/CointMU-CLI/issues/136).
:::

## Trust Model

Resolving the network means `require()`ing `cmu.config.ts/js` from the working directory, which is arbitrary project code. The explorer therefore passes through the same confirmation gate as the other commands that read the config, listing it before it runs:

```bash
warning: the following project files will be executed as code:
      cmu.config.ts  ->  /home/you/my-token/cmu.config.ts

? Execute these files? (y/N)
```

`-y, --yes` skips the prompt; a non-interactive session without `--yes` refuses rather than continuing. See [the full rules](/docs/cli/deploy#trust-model).

::: info
Outside a project there is no config to execute, so no prompt appears and the command runs straight against the local devnet.

The warning text shown at the prompt is shared with `cmu deploy` and mentions an injected `PRIVATE_KEY`. That part does not apply here — the explorer resolves no key at all. Tracked as [CointMU-CLI#137](https://github.com/kakonoomoidee/CointMU-CLI/issues/137).
:::

## Looking Up a Block

```bash
cmu explorer --block 1
```

```bash
Pinging http://127.0.0.1:8585...
Connected to 'unknown' (chain ID 1912).

--- Block 1 on 'local' ---
Hash         : 0xcaa982dc649b2f6c4e338944b26e3a005d07205bd298d8ab64a7a68807303a84
Parent       : 0xab883a51ee916e264cd0371fe6cf41ce070b3c24c7e24bf46f1941d5f3ff532d
Timestamp    : 2026-09-22T00:34:57.000Z (1790037297)
Transactions : 1
Gas used     : 968733 / 60000000 (1.61%)
Validator    : 0xC014BA5EC014ba5ec014Ba5EC014ba5Ec014bA5E
```

| Field          | Description                                                       |
| -------------- | ----------------------------------------------------------------- |
| `Hash`         | The block hash.                                                   |
| `Parent`       | The parent block hash. All zeroes for the genesis block.          |
| `Timestamp`    | ISO 8601, with the raw Unix value in parentheses.                 |
| `Transactions` | The number of transactions in the block.                          |
| `Gas used`     | Gas used against the block limit, with the ratio as a percentage. |
| `Validator`    | The block's `miner` field. All zeroes for the genesis block.      |

::: info
Only transaction hashes are fetched, not full transaction objects — a count is all the report needs. The percentage is omitted when the block reports a zero gas limit, rather than printing `NaN%`.
:::

### Block Number Validation

`--block` accepts a non-negative whole number in decimal. Anything else is rejected before the command connects to anything:

| Input  | Result                          |
| ------ | ------------------------------- |
| `42`   | Accepted.                       |
| `0`    | Accepted — the genesis block.   |
| `-1`   | Rejected.                       |
| `1.5`  | Rejected.                       |
| `0x2a` | Rejected — hex is not accepted. |
| `1e3`  | Rejected.                       |

```bash
error: explorer failed
'0x2a' is not a valid block number.
hint: pass a non-negative whole number in decimal, e.g. `cmu explorer --block 42`.
```

### Blocks That Do Not Exist

A well-formed number past the chain tip is an error, and the message names the tip so you can see how far ahead you asked:

```bash
error: explorer failed
block 999 does not exist on 'local'.
hint: the chain is at block 1.
```

## Looking Up an Address

```bash
cmu explorer --contract 0x43862ad4C579a04B0D6F6d057Da16Ac317b9454F
```

```bash
--- Address on 'local' ---
Address      : 0x43862ad4C579a04B0D6F6d057Da16Ac317b9454F
Bytecode     : 3548 bytes
Balance      : 0.0 (0 wei)
```

| Field      | Description                                                    |
| ---------- | -------------------------------------------------------------- |
| `Address`  | The address as you passed it.                                  |
| `Bytecode` | The deployed code size in bytes, or a note that there is none. |
| `Balance`  | The balance in CMU, with the raw wei value in parentheses.     |

An address holding no code is a **result, not a failure** — the command reports it and exits `0`:

```bash
--- Address on 'local' ---
Address      : 0x9A201a7Bf68758C43187c3fB0c2280dCfedF3f98
Bytecode     : none - not a contract (an ordinary account, or an unused address)
Balance      : 100.0 (100000000000000000000 wei)
```

::: tip
Despite the flag name, `--contract` works on any address. Use it to check an ordinary account's balance, or to confirm whether a deployment actually landed — a fresh deployment that reports `none` did not take.
:::

Only the address format is validated locally:

```bash
error: explorer failed
'notanaddress' is not a valid contract address.
hint: expected a 0x-prefixed 20-byte address.
```

::: info
The address is validated before any network call because ethers would otherwise treat a non-address string as a possible ENS name and try to resolve it, surfacing the typo as an unrelated connection error.
:::

## Exit Codes

| Code | Meaning                                                                                |
| ---- | -------------------------------------------------------------------------------------- |
| `0`  | The query succeeded, including an address that holds no contract.                      |
| `1`  | Bad flags, untrusted or unresolvable config, unreachable endpoint, or a missing block. |

This keeps "the address is empty" distinguishable from "the lookup failed" by exit code as well as by wording, which makes the command usable in a script.

## Related Commands

- [cmu console](/docs/cli/console) — an interactive REPL when one lookup is not enough.
- [cmu node](/docs/cli/node) — start a local devnet to query, or test RPC connectivity.
- [cmu network](/docs/cli/network) — manage saved networks for the commands that use them.
