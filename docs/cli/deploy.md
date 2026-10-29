# cmu deploy

`cmu deploy` compiles and sequentially executes every deployment script in the `deploy/` directory against the configured CointMU network.

## Usage

```bash
cmu deploy [options]
```

## Requirements

`cmu deploy` must be executed from the root of a CointMU project.

- The `deploy/` directory must exist and contain at least one `.ts` or `.js` script.
- A signing key must be resolvable — from `cmu.config.ts`, from `PRIVATE_KEY`, or from an encrypted session. See [Resolving the Signing Key](#resolving-the-signing-key).

::: warning

- If the `deploy/` directory does not exist, the command exits with an error.
- If no signing key can be resolved, or the resolved key is invalid, the command exits before executing any script. `--config` is the exception for a missing key: it reports the key as unavailable instead.
- If no matching scripts are found, the command prints a notice and exits successfully.
  :::

## Options

| Flag                   | Description                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| `-c, --config`         | Show the resolved deploy configuration and exit without deploying.       |
| `-p, --ping`           | Ping the configured RPC endpoint and exit.                               |
| `-n, --network <name>` | Specify the target network to deploy to.                                 |
| `-y, --yes`            | Skip the confirmation prompt before executing project code.              |

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

## Trust Model

Deploy scripts are arbitrary code. They run with your full environment, receive your decrypted `PRIVATE_KEY`, and can do anything your user account can. `cmu.config.ts/js` is `require()`d from the working directory and is equally arbitrary.

This is the same trust model as Hardhat, Foundry, and Truffle — but it never happens silently. Before any project file executes, the CLI lists every one of them and asks:

```bash
warning: the following project files will be executed as code:
      cmu.config.ts  ->  /home/you/my-token/cmu.config.ts
      01_deploy.ts   ->  /home/you/my-token/deploy/01_deploy.ts

    They run with your full environment, including the PRIVATE_KEY decrypted from
    your session and injected for deploy scripts, and can do anything your user
    account can. This is the same trust model as Hardhat, Foundry and Truffle;
    see the 'Trust Model' section of the README.

? Execute these files? (y/N)
```

The prompt defaults to **no**. Declining exits with `aborted: no project code was executed`.

### Skipping the Prompt

`-y, --yes` continues without asking, and says so:

```bash
    --yes: continuing without confirmation
```

### Non-Interactive Sessions

When stdin is not a TTY there is nobody to answer, so the command **refuses** rather than continuing:

```bash
error: deploy failed
refusing to execute project code without confirmation in a non-interactive session.
hint: re-run with --yes if you trust the files listed above.
```

::: info
Silently bypassing the gate wherever stdin is not a TTY would make it meaningless in exactly the environments — CI, scripts — where a hostile project is least likely to be noticed. Pass `--yes` explicitly in a pipeline.
:::

### Scope of the Confirmation

| Invocation                      | Files listed                            |
| ------------------------------- | --------------------------------------- |
| `cmu deploy`                    | `cmu.config.*` and every script in `deploy/` |
| `cmu deploy --config`           | `cmu.config.*` only                     |
| `cmu deploy --ping`             | `cmu.config.*` only                     |
| `cmu compile`                   | `cmu.config.*` only                     |

`--config` and `--ping` exit before any deploy script runs, so only the project config is listed.

You are asked **once per CLI process**. `cmu deploy` triggers a compile internally, and that compile does not ask again.

## Resolving the Signing Key

The key is resolved from the first source that has one:

| Priority | Source                              | Notes                                                         |
| -------- | ----------------------------------- | ------------------------------------------------------------- |
| 1        | `wallet.privateKey` in `cmu.config` | Typically wired to `process.env.PRIVATE_KEY`.                 |
| 2        | `PRIVATE_KEY` environment variable  | Read from `.env` in the project root, or the ambient env.     |
| 3        | Encrypted `.cmu-session`            | Prompts once for the session password, then caches in memory. |

A config that sets `wallet.privateKey` to a literal key therefore wins over `PRIVATE_KEY`. The scaffolded config sets it to `process.env.PRIVATE_KEY`, so there the two are the same key. Without a `cmu.config.ts/js`, `PRIVATE_KEY` comes first.

If none yields a key:

```bash
error: deploy failed
no private key available for signing.
hint: run `cmu wallet use <name>`, or set PRIVATE_KEY in .env or cmu.config.ts.
```

The session password can only be typed in a terminal. Since 1.7.1, when it would be needed and stdin is not a terminal — a pipe, CI — the command exits `1` instead of waiting forever:

```bash
error: deploy failed
cannot prompt for the session password in a non-interactive session.
hint: run this in a terminal, or set PRIVATE_KEY.
```

::: info
`--config` and `--ping` never trigger the session password prompt. A dry run reports the configuration it can resolve without unlocking anything.
:::

::: warning
`PRIVATE_KEY` is removed from the parent process environment after it is captured, then injected explicitly into each deploy script. This prevents accidental leakage to unrelated child processes.
:::

## Pre-Deployment Steps

Before executing any deployment script, the command performs the following steps automatically:

1. **Load environment** — reads `.env` from the project root. A missing `.env` is not an error.
2. **Confirm trust** — lists the project files that will execute and asks for confirmation.
3. **Compile** — triggers `cmu compile` to ensure all contract artifacts are up to date.
4. **Resolve network** — resolves `--network`, else `defaultNetwork`, from `cmu.config`. The session's active network is not consulted; see [Which Network a Command Uses](/docs/cli/network#which-network-a-command-uses).
5. **Resolve and validate the key** — verifies it produces a valid wallet address.
6. **Print deploy configuration** — outputs a summary before any script is executed.

```bash
--- Deploy configuration ---
Network      : local
RPC endpoint : http://127.0.0.1:8585
Chain ID     : 1912
Deployer     : 0x...
----------------------------
```

::: info
When `--config` is provided, an extra `Private key  : 0xabc...ef01` line is printed in masked form, and the command exits without deploying.
:::

`--config` never signs, so it does not need a key. In a project whose only key sits in a locked `.cmu-session`, or that has no key at all, it still prints the configuration and exits `0`:

```bash
--- Deploy configuration ---
Network      : local
RPC endpoint : http://127.0.0.1:8585
Chain ID     : 1912
Deployer     : unavailable (no key)
Private key  : unavailable (no key)
----------------------------
```

## Supported Script Extensions

| Extension | Runtime                                       |
| --------- | --------------------------------------------- |
| `.ts`     | `npx ts-node`                                 |
| `.js`     | The same Node.js binary that is running `cmu` |

Scripts are sorted lexicographically before execution, so naming conventions like `01_init.ts` → `02_deploy.ts` work as expected.

## Execution Model

Each deployment script runs in a separate child process with inherited standard I/O, spawned directly with an argument list rather than through a shell. The correct runtime is selected automatically based on the script extension.

::: info
A `.js` script runs on the exact Node.js binary that is executing `cmu`, not on whichever `node` comes first on `PATH`. A version manager that switches `node` per directory therefore cannot hand a deploy script a different runtime from the CLI's.
:::

The following environment variables are injected into each script at runtime:

| Variable       | Description                                        |
| -------------- | -------------------------------------------------- |
| `CMU_RPC_URL`  | The resolved RPC endpoint of the active network.   |
| `CMU_CHAIN_ID` | The chain ID of the active network as a string.    |
| `PRIVATE_KEY`  | The deployer private key for signing transactions. |

Each script is announced before it runs:

```bash
========================================
Running 01_deploy.ts
========================================
```

::: tip
Do not invoke individual deployment scripts directly. Always use `cmu deploy` to ensure correct environment injection, runtime resolution, and sequential ordering.
:::

## Sequential Behavior

- The command waits for each script to finish before starting the next one.
- If any script exits with a non-zero exit code, deployment **stops immediately** and the remaining scripts do not run.
- The failure is reported through the standard error envelope, naming the script and its exit code:

```bash
error: deploy failed
02_fail.js exited with code 3
```

::: info
The script's own output is inherited straight to your terminal, so whatever it printed before failing is already above the error. Pass `-v` to add the stack trace.
:::

::: tip
Deploy scripts generated by `cmu create` set a non-zero exit code when `main()` rejects, so a failed transaction in a scaffolded script stops the run. A hand-written script must do the same — a script that catches its own error and exits `0` counts as a success, and the next script runs.
:::

This makes the deployment pipeline deterministic and suitable for multi-step contract initialization.

## Deployment Records

After the scripts have run, `cmu deploy` reads the chain to find the contracts the deployer created during the run, and records each one in `deployments/<network>/<Contract>.json`. The scripts do not need to cooperate: hand-written scripts are recorded too.

```bash
All deploy scripts completed.

--- Deployed on 'local' (chain 1912) ---
StandardERC20  0x0e7f183193856290E9B5C294AdEAc9974Eb7ea70  block 1  -> deployments/local/StandardERC20.json
----------------------------------------
```

```json
{
  "format": 1,
  "contract": "StandardERC20",
  "network": "local",
  "chainId": 1912,
  "address": "0x0e7f183193856290E9B5C294AdEAc9974Eb7ea70",
  "deployer": "0xD0094609EE354f75244A417875E53E8951f948e1",
  "txHash": "0x08d36984d43bb92831a55bcb0f83f3d5d6e9388917472aef4bf4a2b9cde4ed9c",
  "blockNumber": 1,
  "timestamp": "2026-10-14T03:15:09.000Z",
  "codeHash": "0xa6f8e8caa1443c080a6396f97f396fc588ca2a32b3307e2c5c5543699e9f9ef9"
}
```

| Field         | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| `format`      | Record format version. Currently `1`.                              |
| `contract`    | The artifact name the creation code matched.                       |
| `network`     | The `cmu.config` network name. Also the directory name.            |
| `chainId`     | The chain ID the node reported.                                    |
| `address`     | The deployed contract.                                             |
| `deployer`    | The address of the injected `PRIVATE_KEY`.                         |
| `txHash`      | The creation transaction.                                          |
| `blockNumber` | The block it was mined in.                                         |
| `timestamp`   | That block's time, ISO 8601.                                       |
| `codeHash`    | `keccak256` of the runtime code at `address` when it was recorded. |

Records are read back by [`getDeployed(name)` in `cmu console`](/docs/cli/console#loading-a-deployed-contract) and shown next to an address by [`cmu explorer --contract`](/docs/cli/explorer#looking-up-an-address).

How a creation is found and named:

- Only blocks produced during the run are scanned, and only transactions sent by the deployer. Other traffic on a shared chain is ignored.
- Each creation is named by matching its creation code against `artifacts/*.json`. The longest match wins.
- A contract deployed twice in one run keeps only its last address, with a warning.
- A redeploy overwrites the previous record for that contract on that network.

| Line in the summary                                                       | Meaning                                                                     |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `<Contract>  0x...  block <n>  -> deployments/<network>/<Contract>.json`  | Recorded.                                                                   |
| `(unrecognised)  0x...  block <n>  no artifact matches its creation code` | No artifact matched, e.g. a contract with unlinked libraries. Not recorded. |
| `(ambiguous)  0x...  block <n>  creation code matches A, B; not recorded` | Two artifacts matched equally. Not recorded.                                |
| `No contract creations from 0x... detected.`                              | The run created nothing the deployer sent itself.                           |

Not seen at all: contracts created by another contract (a factory), and anything deployed with a key other than the injected `PRIVATE_KEY`.

Recording never stops a deploy. Anything that prevents it is a warning, and the run goes ahead:

| Warning                                                                            | Cause                                                                                                                                  |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `deployment records are off for this run: ...`                                     | The node did not answer within 3 seconds, its chain ID differs from the config's `chainId`, or the network name cannot be a directory. |
| `the deploy spanned <n> blocks, more than the 1000 scanned; nothing was recorded.` | A long run on a busy chain.                                                                                                            |
| `could not record the deployments: ...`                                            | The scan or a write failed.                                                                                                            |

Records are written even when a script fails, because whatever it deployed before failing is on-chain.

The network name must be usable as a directory name: letters, digits, `-` and `_`, starting with a letter or digit, and not a Windows device name such as `con` or `nul`. Two networks whose names differ only in case are refused, since they would share a directory on a case-insensitive filesystem.

::: info
Projects from `cmu create` ignore `deployments/local/` in `.gitignore`, since a DevNet's records are stale after every restart. Records for other networks are meant to be committed, so everyone on the project resolves the same addresses.
:::

## Connectivity Check

Use `--ping` to verify RPC connectivity before committing to a full deployment run:

```bash
cmu deploy --ping
```

The command opens a JSON-RPC provider connection and waits up to **3 seconds** for a response. On success it prints the resolved network name and chain ID, then exits:

```bash
Pinging http://127.0.0.1:8585...
Connected to 'local' (chain ID 1912).
```

On failure:

```bash
error: deploy failed
RPC endpoint http://127.0.0.1:8585 is unreachable (timed out after 3000ms).
hint: check the node is running and the endpoint is correct - `cmu network list`.
```

A network with an empty `url` — as the scaffolded `mainnet` entry ships — fails immediately instead of waiting out the timeout:

```bash
error: deploy failed
network 'mainnet' has no url.
hint: set networks.mainnet.url in cmu.config.js.
```

The hint names the config file that was actually loaded, `cmu.config.ts` or `cmu.config.js`.

## Success Output

When all scripts complete successfully:

```bash
All deploy scripts completed.
```
