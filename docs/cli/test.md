# cmu test

`cmu test` compiles smart contracts and executes the automated test suite against an ephemeral local DevNet. The network is spun up automatically before tests run and shut down immediately after, leaving no persistent state.

## Usage

```bash
cmu test [options]
```

::: danger NODE.JS 22 REQUIRED
The test DevNet needs **Node.js 22 or newer**, even though the CLI itself runs on Node 20.12+. The check runs before the compile, so a too-old runtime fails immediately rather than after spending a build:

```bash
error: test failed
the local DevNet needs Node.js 22 or newer, but this is Node v20.12.0.
    npm skips EDR's native binary on older Node without reporting it, so no chain can start.
hint: upgrade Node.js, or install a version manager such as nvm or fnm.
```
:::

## Options

| Flag           | Description                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--gas`        | Report gas used by transactions during the run.                                                                  |
| `--allow-cors` | Allow cross-origin browser access to the test RPC proxy. Off by default to prevent DNS rebinding.                |
| `-y, --yes`    | Skip the confirmation prompt before executing project code.                                                      |

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

## Requirements

- A `test/` directory must exist in the project root containing `.ts` or `.js` test files.
- Test files are executed using **Mocha** as the test runner.
- TypeScript test files are loaded via `ts-node/register` automatically.

::: warning
If the `test/` directory does not exist, the command exits with an error before starting the DevNet.
:::

## Executing Project Code

`cmu test` compiles first, and the compile loads `cmu.config.ts/js` as code. The CLI lists the file and asks for confirmation before it runs. Pass `-y, --yes` to skip the prompt; in a non-interactive session the command refuses rather than continuing. See [the trust model](/docs/cli/deploy#trust-model).

## Pre-Test Steps

Before running any test file, the command performs the following steps automatically:

1. **Check the runtime** — refuses immediately on Node older than 22.
2. **Compile** — triggers `cmu compile` to ensure all contract artifacts are up to date.
3. **Start ephemeral DevNet** — starts an in-process Hardhat 3 network and fronts it with a local JSON-RPC proxy on port `8555` with Chain ID `1912`.
4. **Inject environment** — passes network credentials to the test process via environment variables.

## Ephemeral DevNet

The test DevNet is created fresh for every `cmu test` run and destroyed immediately after all tests complete.

| Parameter       | Value                   |
| --------------- | ----------------------- |
| RPC endpoint    | `http://127.0.0.1:8555` |
| Chain ID        | `1912`                  |
| Accounts        | 10 pre-funded accounts  |
| Default balance | `100 ETH` each          |
| Logging         | Quiet (suppressed)      |

The chain is an in-process Hardhat 3 network running on EDR, created with a config override and served through the CLI's own JSON-RPC proxy rather than Hardhat's `node` task.

The first generated account's private key is automatically used as the deployer for test transactions. Accounts are derived from a random mnemonic on every run, so the deployer address differs between invocations.

::: warning
Port `8555` is never freed on your behalf. If something already holds it, the run stops rather than killing the process that owns it:

```bash
error: test failed
port 8555 is already in use.
hint: stop the process using it, then run `cmu test` again.
```

Free the port yourself and re-run. This applies identically on every platform.
:::

## RPC Access Control

The test RPC proxy listens only on `127.0.0.1` and additionally rejects requests that look like they originate from a web page. A request is refused when it carries an `Origin` header, or when its `Host` header is not one of `127.0.0.1:8555`, `localhost:8555`, or `[::1]:8555`.

Refused requests receive HTTP `403` with a JSON-RPC error of code `-32600`:

```bash
Forbidden: cross-origin or non-local request rejected. Pass --allow-cors to cmu test to allow browser access.
```

This protects the unlocked test accounts from DNS-rebinding attacks, where a malicious page resolves its own hostname to `127.0.0.1` and issues signed transactions against the local node.

::: danger WARNING
`--allow-cors` disables that protection and responds with `Access-Control-Allow-Origin: *`, letting **any** website reach the test RPC and its pre-funded accounts while `cmu test` is running. Use it only when a browser-based test harness genuinely requires it. The command prints a warning at startup when the flag is active.
:::

## Environment Injection

The following variables are injected into the test process at runtime:

| Variable       | Value                        |
| -------------- | ---------------------------- |
| `CMU_RPC_URL`  | `http://127.0.0.1:8555`      |
| `CMU_CHAIN_ID` | `1912`                       |
| `PRIVATE_KEY`  | Private key of account `#0`  |

These variables are available inside test files for constructing providers and signers.

## Test Runner

Test files are detected and executed based on extension:

| File Type | Runner Command                               |
| --------- | -------------------------------------------- |
| `.ts`     | `npx mocha -r ts-node/register test/**/*.ts` |
| `.js`     | `npx mocha test/**/*.js`                     |

If the `test/` directory contains `.ts` files, the TypeScript runner is used for the entire suite.

## Gas Profiler

When `--gas` is provided, the command generates a gas usage report after all tests complete by iterating over every block mined during the test session.

```bash
=========================================================================================
Gas profile
=========================================================================================
| Block | Transaction Hash                                                   | Gas Used |
-----------------------------------------------------------------------------------------
| 1     | 0x...                                                              | 21000    |
| 2     | 0x...                                                              | 84123    |
-----------------------------------------------------------------------------------------
Total gas used: 105123
```

::: info
Reporting is a convenience, not part of the run. If the profiler fails it prints a warning and the already-decided test result stands:

```bash
warning: could not produce the gas report; the tests themselves were unaffected.
```

Pass `-v` to see the underlying error. The DevNet is still closed cleanly either way.
:::

## Shutdown

After all tests and the gas profiler complete, the ephemeral DevNet is closed automatically:

```bash
CointMU DevNet stopped.
```

The shutdown runs in a `finally` block, ensuring the DevNet is always stopped even if the test suite fails.

## Success Output

```bash
Compiling contracts...
Compiled StandardERC20
Starting the CointMU DevNet...

========================================
Running tests with Mocha
========================================

[test output]

All tests passed.
CointMU DevNet stopped.
```

If any test fails, the command exits with code `1`:

```bash
error: test failed
test run exited with code 1
```
