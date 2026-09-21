# cmu update

`cmu update` upgrades the globally installed CointMU CLI to the latest release published on the npm registry, or to a specific version you pin.

## Usage

```bash
cmu update [options]
```

## Options

| Flag             | Description                                                 |
| ---------------- | ----------------------------------------------------------- |
| `--to <version>` | Install a specific published version instead of the latest. |

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

## Update Workflow

The command performs the following steps in order:

1. Reads the version of the currently installed CLI from its own `package.json`. If the file cannot be read, the current version is reported as `unknown`.
2. Queries the npm registry with `npm view cointmu-cli version` to resolve the target version. With `--to`, the spec becomes `cointmu-cli@<version>`.
3. Prints the current and target versions for comparison.
4. Exits without changes if the two are identical.
5. Otherwise runs `npm install -g cointmu-cli@<target>` and streams the installer output directly to the terminal.

## Pinning a Version

`--to` accepts an exact version, a semver range, or an npm dist-tag:

```bash
cmu update --to 1.3.2
cmu update --to ">=1.3.0"
cmu update --to latest
```

When a range matches several published versions, the highest match is selected and installed as an exact version.

If the requested version is not published, the command exits with:

```bash
error: update failed
Version "9.9.9" is not available on the npm registry for cointmu-cli.
hint: list the published versions with `npm view cointmu-cli versions`.
```

::: warning
The `--to` value is validated before it reaches npm. Values containing shell metacharacters, or beginning with `-`, are rejected outright:

```bash
error: update failed
Invalid --to value "<value>".
hint: expected a semver version, range, or npm dist-tag (e.g. "1.3.2", ">=1.3.0", "latest").
```

This is a defense-in-depth check. The command never invokes a shell — both the registry query and the install run through a direct process call with an explicit argument list.
:::

## Output

When an update is available:

```bash
Checking the npm registry...
current version : 1.3.6
target version  : 1.3.7

Running: npm install -g cointmu-cli@1.3.7

Updated cointmu-cli to 1.3.7.
```

When the installed version already matches the target:

```bash
Checking the npm registry...
current version : 1.3.7
target version  : 1.3.7

Already on the target version. Nothing to do.
```

If the registry is unreachable, the version is invalid, or the global install fails, the command prints an error message and exits with code `1`.

## Install Failures

npm's own output is never swallowed — it is written straight back out. One failure mode gets a dedicated explanation, because npm's raw error does not say what to do about it:

```bash
npm refused to install from a git source (EALLOWGIT).
npm 12+ blocks git sources by default. This CLI installs from the npm
registry, so an older CointMU build is most likely still running.
Escape it once with:
  npm install -g cointmu-cli@latest
```

::: info
This affects CLI builds at `1.3.2` and older, which updated themselves from git rather than the registry. Running the `npm install -g cointmu-cli@latest` line once moves the install onto the registry, after which `cmu update` works normally.
:::

Any other install failure reports `npm install failed; see the npm output above.`

::: info
`cmu update` only manages installations made through npm. If the CLI was installed from source with `npm install -g .`, pull the repository and rebuild instead. See [Installation](/docs/cli/installation).
:::

## Verifying the Update

Confirm the new version after the install completes:

```bash
cmu version
```
