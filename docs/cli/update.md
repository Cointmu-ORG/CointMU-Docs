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
Checking the npm registry...

error: update failed
Version "9.9.9" is not available on the npm registry for cointmu-cli.
hint: list the published versions with `npm view cointmu-cli versions`.
```

::: warning
The `--to` value is validated before it reaches npm. Values containing shell metacharacters, or beginning with `-`, are rejected outright. The `Checking the npm registry...` line is printed first, but the registry is not asked:

```bash
Checking the npm registry...

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
current version : 1.7.3
target version  : 1.7.4

Running: npm install -g cointmu-cli@1.7.4

added 53 packages, removed 2 packages, and changed 122 packages in 19s

Updated cointmu-cli to 1.7.4.
```

The `added ... packages` line is npm's own output, so its wording and counts depend on your npm and on what was installed before.

When the installed version already matches the target:

```bash
Checking the npm registry...
current version : 1.7.4
target version  : 1.7.4

Already on the target version. Nothing to do.
```

If the registry is unreachable, the version is invalid, or the global install fails, the command prints an error message and exits with code `1`.

If npm itself cannot be started — not installed, or not on `PATH` — the command says so instead of reporting a registry problem. Since 1.7.3; before, it printed only the bare `spawnSync npm ENOENT`:

```bash
Checking the npm registry...

error: update failed
npm could not be started: spawnSync npm ENOENT
hint: make sure Node.js and its npm are installed and on PATH, then run `cmu update` again.
```

::: warning NOT VERIFIED ON WINDOWS
On Windows, `cmu update` used to start `npm.cmd`, which current Node.js refuses to run without a shell (`spawn EINVAL`). Since 1.7.3 it runs npm's `npm-cli.js` with the Node.js running `cmu` instead. This has not been verified on Windows for these docs. If `cmu update` fails there, run `npm install -g cointmu-cli@latest` directly.
:::

## Update Notice

Since 1.7.4, `cmu create`, `cmu compile` and `cmu test` print a notice on stderr after they succeed, when a newer `cointmu-cli` is on the npm registry, patch releases included:

```bash
   ╭────────────────────────────────────╮
   │                                    │
   │   Update available 1.7.4 → 1.7.5   │
   │      Run cmu update to update      │
   │                                    │
   ╰────────────────────────────────────╯
```

The versions above are an example: 1.7.5 has not been released. The notice does not install anything; run `cmu update` to upgrade.

The check uses the [update-notifier](https://github.com/sindresorhus/update-notifier) package. At most once a day, a background process asks the registry for the latest version and stores the answer, and the next of those three commands shows it once. The first check happens a day after the first such command, so a fresh install shows nothing at first.

| The notice is not shown                                    | Notes                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| After any other command, `--version` and `--help` included | They do not load the checker at all.                     |
| When the command fails                                     |                                                          |
| When stdout or stderr is not a terminal                    | For example when the output is piped or redirected.      |
| When `CMU_NO_UPDATE_CHECK=1` is set                        | Only the value `1` counts; `true` or `yes` do not.       |
| When `NO_UPDATE_NOTIFIER` is set, to any value             | Set but empty counts too.                                |
| In CI, or when run through `npm run`, `npx` or yarn        | Detected by update-notifier itself. *(source-only)*      |

The stored answer lives in `~/.config/configstore/update-notifier-cointmu-cli.json`, or under `$XDG_CONFIG_HOME/configstore/` when that is set. *(source-only for Windows, where it is under `%USERPROFILE%\.config\`.)*

::: details How the notice was checked
On Linux with the published 1.7.4, in a pseudo-terminal: a seeded registry answer naming 1.7.5 produced the box above after `cmu compile -y`; `CMU_NO_UPDATE_CHECK=1`, an empty `NO_UPDATE_NOTIFIER`, piped output, `cmu version` and a failing `cmu compile` showed nothing; `CMU_NO_UPDATE_CHECK=true` still showed it. With `NO_COLOR=1` the box has no color codes. The daily background check, CI detection and the `npm run`/`npx` rule were read from update-notifier 7.3.1, the version 1.7.4 installs.
:::

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

A release that was published moments ago can resolve on the registry before its tarball is downloadable. npm then fails with an `E404` for the tarball URL, which the command explains as a delay rather than a missing version:

```bash
version 1.4.0 resolves on the registry but its tarball has not finished propagating yet.
hint: wait a minute or two, then run `cmu update` again.
```

Any other install failure reports `npm install failed; see the npm output above.`

::: info
`cmu update` only manages installations made through npm. If the CLI was installed from source with `npm install -g .`, pull the repository and rebuild instead. See [Installation](/docs/cli/installation).
:::

## Verifying the Update

Confirm the new version after the install completes:

```bash
cmu version
```
