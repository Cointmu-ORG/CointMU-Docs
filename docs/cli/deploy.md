# cmu deploy

`cmu deploy` compiles and sequentially executes every deployment script in the `deploy/` directory against the configured CointMU network.

## Usage

```bash
cmu deploy [options]
```

## Requirements

`cmu deploy` must be executed from the root of a CointMU project.

- The `deploy/` directory must exist and contain at least one `.ts` or `.js` script.
- A signing key must be resolvable — from `PRIVATE_KEY`, from an encrypted session, or from `cmu.config.ts`. See [Resolving the Signing Key](#resolving-the-signing-key).

::: warning

- If the `deploy/` directory does not exist, the command exits with an error.
- If no signing key can be resolved, or the resolved key is invalid, the command exits before executing any script.
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

| Priority | Source                              | Notes                                                        |
| -------- | ----------------------------------- | ------------------------------------------------------------ |
| 1        | `PRIVATE_KEY` environment variable  | Read from `.env` in the project root, or the ambient env.    |
| 2        | `wallet.privateKey` in `cmu.config` | Typically wired to `process.env.PRIVATE_KEY`.                |
| 3        | Encrypted `.cmu-session`            | Prompts once for the session password, then caches in memory. |

If none yields a key:

```bash
error: deploy failed
no private key available for signing.
hint: run `cmu wallet login`, or set PRIVATE_KEY in .env or cmu.config.ts.
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
4. **Resolve network** — resolves the active or `--network` target from `cmu.config`.
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

## Supported Script Extensions

| Extension | Runtime       |
| --------- | ------------- |
| `.ts`     | `npx ts-node` |
| `.js`     | `node`        |

Scripts are sorted lexicographically before execution, so naming conventions like `01_init.ts` → `02_deploy.ts` work as expected.

## Execution Model

Each deployment script is executed using `execFileSync` in a separate child process with inherited standard I/O. The correct runtime is selected automatically based on the script extension.

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
- The failure is reported through the standard error envelope as `error: deploy failed`, followed by the child process error.

::: info
The script's own output is inherited straight to your terminal, so whatever it printed before failing is already above the error. Pass `-v` for the full error object, including the exit status and the argument list of the failed child process.
:::

This makes the deployment pipeline deterministic and suitable for multi-step contract initialization.

## Connectivity Check

Use `--ping` to verify RPC connectivity before committing to a full deployment run:

```bash
cmu deploy --ping
```

The command opens a JSON-RPC provider connection and waits up to **3 seconds** for a response. On success it prints the connected network name and chain ID, then exits. On failure:

```bash
error: deploy failed
RPC endpoint http://127.0.0.1:8585 is unreachable (timed out after 3000ms).
hint: check the node is running and the endpoint is correct - `cmu network list`.
```

## Success Output

When all scripts complete successfully:

```bash
All deploy scripts completed.
```
