# cmu audit

`cmu audit` runs security checks and static analysis across both Node.js dependencies and Solidity smart contracts.

## Usage

```bash
cmu audit [options]
```

## Options

| Flag    | Description                                                                                     |
| ------- | ----------------------------------------------------------------------------------------------- |
| `--fix` | Automatically applies safe patches where the underlying tools support non-breaking remediation. |

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

## Audit Workflow

`cmu audit` performs two sequential checks. Both steps always run to completion — a finding in Step 1 does not abort Step 2.

### Step 1: Dependency Audit

The command executes `npm audit` to scan the current Node.js dependency tree for known vulnerabilities.

```bash
npm audit
npm audit fix  # when --fix is provided
```

If `--fix` is provided, the command appends `fix` and attempts to remediate safe dependency issues automatically.

If the dependency audit reports issues, a warning is printed and the command continues to Step 2 without exiting.

::: tip
If you only need to inspect package dependencies directly, you can still run `npm audit` outside of the `cmu` workflow.
:::

### Step 2: Static Analysis

The command executes `npx solhint` to analyze Solidity contracts under the `contracts/` directory.

```bash
npx solhint "contracts/**/*.sol"
npx solhint "contracts/**/*.sol" --fix  # when --fix is provided
```

If `--fix` is provided, the command appends `--fix` and applies safe linting corrections where supported.

If static analysis finds vulnerabilities or formatting issues, a warning is printed and the audit is marked as completed.

## Output

The command prints a step indicator for each phase during execution:

```bash
[1/2] Auditing Node.js dependencies
> npm audit
[2/2] Analysing Solidity contracts
> npx solhint contracts/**/*.sol
Audit complete.
```

Each child process is echoed before it runs, prefixed with `>`. A tool reporting findings is downgraded to a warning so a dirty dependency tree does not mask the Solidity pass that follows it:

```bash
warning: npm audit reported issues in the dependency tree.
warning: solhint reported issues in the Solidity sources.
```

If an unexpected error prevents the audit from running entirely, the command prints an error message and exits with code `1`.

::: warning
A completed audit does not mean the project is free of issues. Review all warnings printed during each step before proceeding to deployment.
:::

## Audit Summary

| Step             | Tool                               | Scope                             |
| ---------------- | ---------------------------------- | --------------------------------- |
| Dependency audit | `npm audit`                        | Node.js dependency tree.          |
| Static analysis  | `npx solhint "contracts/**/*.sol"` | Solidity sources in `contracts/`. |

## Cross-Platform Compatibility

The command uses a cross-platform child process wrapper so execution works reliably across operating systems.

::: info
On Windows, the command safely resolves command entry points such as `.cmd` binaries before spawning the process.
:::
