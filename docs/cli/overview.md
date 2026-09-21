# CointMU CLI Reference

`cmu` is an all-in-one CLI toolkit for building, compiling, deploying, and auditing Web3 applications on the CointMU private network ecosystem. It abstracts the complexity of blockchain execution into instant terminal commands.

## Command Overview

| Command       | Purpose                                                               |
| ------------- | --------------------------------------------------------------------- |
| `cmu create`  | Scaffold a new CointMU project from a selectable template.            |
| `cmu compile` | Compile Solidity contracts and generate contract artifacts.           |
| `cmu deploy`  | Execute deployment scripts sequentially from the `deploy/` directory. |
| `cmu test`    | Run the contract test suite against an ephemeral local DevNet.        |
| `cmu audit`   | Run dependency checks and Solidity static analysis.                   |
| `cmu wallet`  | Generate wallets and manage the encrypted local session.              |
| `cmu network` | Save, list, switch, and ping the RPC networks available to the CLI.   |
| `cmu node`    | Test RPC connectivity or start a local development network.           |
| `cmu mine`    | Start and stop block mining on the active network.                    |
| `cmu version` | Print CLI, runtime, and dependency versions.                          |
| `cmu update`  | Upgrade the CLI to the latest release from the npm registry.          |

::: tip
Run `cmu <command> -h` to see the detailed options for any individual command.
:::

## Global Options

| Flag            | Description                                |
| --------------- | ------------------------------------------ |
| `-v, --verbose` | Print full stack traces on failure.        |
| `-V, --version` | Print the full version report and exit.    |
| `-h, --help`    | Display help for a command.                |

`-v, --verbose` is declared once on `cmu` itself rather than on each command, so it is accepted anywhere on the line:

```bash
cmu -v network list
cmu network -v list
cmu network list -v
```

## Error Output

Every command reports a failure the same way: the command that failed, the message, and — where the CLI can suggest something useful — a hint.

```bash
error: network save failed
--name is required.
hint: e.g. `cmu network save http://127.0.0.1:8585 --name local`.
```

Failures exit with code `1`. Pass `-v` to print the full error object with stack frames instead of the message alone.

::: info
Paths printed in errors have your home directory replaced with `~`, both in plain messages and in `-v` stack traces.
:::

## Runtime Requirements

| Scope                              | Minimum Node.js |
| ---------------------------------- | --------------- |
| The CLI itself                     | `20.12.0`       |
| `cmu test` and `cmu node start`    | `22`            |

The DevNet commands need a newer runtime than the rest of the CLI because they run on EDR, whose native binary npm skips without warning on older Node. See [Installation](/docs/cli/installation).

## Executing Project Code

`cmu compile`, `cmu deploy`, and `cmu test` execute files from your project directory — `cmu.config.ts/js` is `require()`d, and every script in `deploy/` runs with your decrypted `PRIVATE_KEY` in its environment. The CLI lists those files and asks for confirmation before any of them run.

Pass `-y, --yes` to skip the prompt in a pipeline you trust. See [the trust model](/docs/cli/deploy#trust-model) on the `cmu deploy` page.

## Typical Workflow

Most CointMU projects follow this sequence:

```bash
cmu create <project> [options]
cd <project>
cmu compile
cmu deploy
```

After deployment, use the remaining commands to validate and operate the project environment:

| Command             | When to use                                           |
| ------------------- | ----------------------------------------------------- |
| `cmu test`          | Run contract tests against a throwaway local chain.   |
| `cmu audit`         | Security review for dependencies and smart contracts. |
| `cmu node connect`  | Verify RPC endpoint connectivity.                     |
| `cmu network list`  | Review which networks are saved and which is active.  |
| `cmu wallet create` | Generate wallets for local development.               |

## Command Reference

Use the linked pages for full command-specific behavior, options, and validation rules.

- [cmu create](/docs/cli/create)
- [cmu compile](/docs/cli/compile)
- [cmu deploy](/docs/cli/deploy)
- [cmu audit](/docs/cli/audit)
- [cmu test](/docs/cli/test)
- [cmu mine](/docs/cli/mine)
- [cmu wallet](/docs/cli/wallet)
- [cmu network](/docs/cli/network)
- [cmu node](/docs/cli/node)
- [cmu version](/docs/cli/version)
- [cmu update](/docs/cli/update)
