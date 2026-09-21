# cmu compile

`cmu compile` reads Solidity sources from the `contracts/` directory, resolves imports, and compiles contracts into JSON artifacts under `artifacts/`.

## Usage

```bash
cmu compile [options]
```

## Options

| Flag        | Description                                                 |
| ----------- | ----------------------------------------------------------- |
| `-y, --yes` | Skip the confirmation prompt before executing project code. |

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

## Executing Project Code

`cmu.config.ts/js` is `require()`d from the working directory, which makes it arbitrary code. Before it is loaded, `cmu compile` lists it and asks for confirmation:

```bash
warning: the following project files will be executed as code:
      cmu.config.ts  ->  /home/you/my-token/cmu.config.ts
```

Pass `-y, --yes` to skip the prompt. In a non-interactive session the command refuses rather than continuing. The full behavior is documented under [the trust model](/docs/cli/deploy#trust-model).

::: info
A project with no `cmu.config.ts/js` has nothing to execute, so no prompt appears and compilation starts immediately.
:::

## Required Project Layout

```text
<project>/
├─ contracts/
│  └─ *.sol
├─ artifacts/
├─ cmu.config.ts   # optional
└─ cmu.config.js   # optional
```

::: warning
The `contracts/` directory **must exist**. If it is missing, the command exits with an error and does not continue.
:::

::: info
Only `.sol` files at the **top level** of `contracts/` are compiled. Sources placed in subdirectories are not discovered, although they can still be pulled into a compilation unit through an `import` statement.
:::

## Configuration Loading

`cmu compile` looks for compiler settings in the following priority order:

1. `cmu.config.ts`
2. `cmu.config.js`

If a configuration file is found, the command confirms trust, loads `compiler.settings` from the exported config object, and merges it into the compiler input before compilation.

```ts
// cmu.config.ts
export default {
  compiler: {
    settings: {
      evmVersion: "paris",
    },
  },
};
```

::: info
When a `.ts` config file is detected, the command loads it using `ts-node` in transpile-only mode. No full type checking is performed at this stage.
:::

**Default values when no config is provided:**

| Setting           | Default                                     |
| ----------------- | ------------------------------------------- |
| `evmVersion`      | `paris`                                     |
| `outputSelection` | ABI + `evm.bytecode.object` always emitted. |

If the config file cannot be loaded, the command prints a warning and continues with defaults:

```bash
warning: could not load cmu.config.ts; using default compiler settings.
```

::: warning
`outputSelection` is applied **after** your settings are merged, so a custom value in `cmu.config` is always overridden. Every other key in `compiler.settings`, including `evmVersion` and `optimizer`, is honored.
:::

::: info
Only `compiler.settings` is read from the configuration. The `compiler.version` key written by `cmu create` is not consulted — the compiler version is determined by the `solc` build bundled with the CLI, which `cmu version` reports.
:::

## Import Resolution

The compiler uses a custom import callback to resolve Solidity dependencies:

- **Local imports** — resolved relative to the current working directory. The resolved path is validated to remain within the project root before the file is read.
- **Package imports** — resolved from `node_modules`. The resolved path is validated to remain within the `node_modules` directory before the file is read.

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
```

::: info
Imports that resolve outside the project root or `node_modules` boundary are rejected with a `File not found or access denied` error. This prevents path traversal during compilation.
:::

## Compilation Behavior

| Condition                                  | Result                                                    |
| ------------------------------------------ | --------------------------------------------------------- |
| No `.sol` files found in `contracts/`      | Prints a notice and exits successfully.                   |
| Compiler error reported (severity `error`) | Prints all errors, stops the process, exits with failure. |
| Non-fatal warning                          | Prints the warning and continues compilation.             |
| Compilation succeeds                       | Writes artifact to `artifacts/<ContractName>.json`.       |

## Output Artifacts

Each generated artifact is written as a formatted JSON file containing the compiled contract output from `solc`:

| Field                 | Description                                    |
| --------------------- | ---------------------------------------------- |
| `abi`                 | Interface definition for contract interaction. |
| `evm.bytecode.object` | Compiled contract binary for deployment.       |

These artifacts are consumed by deployment scripts and other build-time tooling in the pipeline.

## Output

```bash
Compiling 3 Solidity file(s)...
Compiled StandardERC20
Compiled IERC20
Compiled Ownable
```

A Solidity error stops the run:

```bash
error: compile failed
compilation aborted on Solidity errors.
hint: fix the errors reported above, then run `cmu compile` again.
```

Run from outside a project root:

```bash
error: compile failed
contracts/ directory not found.
hint: run `cmu compile` from the root of your CointMU project.
```
