# cmu version

`cmu version` prints detailed version information about the CLI, its runtime environment, and its core dependencies.

## Usage

```bash
cmu version [options]
```

The same report is printed by the global version flags:

```bash
cmu --version
cmu -V
```

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

## Overview

The command reads version metadata from the local `package.json` and the build identifier baked into the CLI, queries the active runtime environment, and resolves the current Git commit hash of the CLI installation.

## Output

```bash
cmu
version      : 1.3.8
codename     : Ryu
build        : 38a52f0
architecture : x64
node         : v24.19.0
solidity     : 0.8.37+commit.f401782d.Emscripten.clang
ethers       : 6.17.0
git commit   : 38a52f0
```

## Output Fields

| Field          | Source                       | Description                                                                                  |
| -------------- | ---------------------------- | -------------------------------------------------------------------------------------------- |
| `version`      | `package.json`               | The current semantic version of the `cmu` CLI.                                               |
| `codename`     | `package.json`               | The release codename of the current version.                                                 |
| `build`        | Bundled build identifier     | The short Git hash of the commit the CLI was built from.                                     |
| `architecture` | `process.arch`               | The CPU architecture of the current runtime (e.g., `x64`, `arm64`).                          |
| `node`         | `process.version`            | The active Node.js runtime version.                                                          |
| `solidity`     | `solc` package               | The full version string of the bundled Solidity compiler.                                    |
| `ethers`       | `ethers` package             | The version of the bundled ethers.js library.                                                |
| `git commit`   | `git rev-parse --short HEAD` | The short Git commit hash of the current CLI build. Returns `unknown` if Git is unavailable. |

::: info
`git commit` is resolved by running `git rev-parse --short HEAD` from the CLI installation directory. If Git is not available or the directory is not a Git repository, the field displays `unknown`.
:::

::: info
The build identifier is stamped into the bundle at build time by resolving `git rev-parse --short HEAD` in the build tree. It is baked in, so it identifies the commit the binary was built from even when the installed package has no `.git` directory. When the CLI runs unbundled — from source via `ts-node`, for example — nothing was stamped and the field displays `unknown`.
:::

::: info
`build` and `git commit` come from different places and can legitimately disagree. `build` is fixed at build time; `git commit` is resolved at runtime from the CLI's install directory. For a published npm install, there is no repository to read, so `git commit` reads `unknown` while `build` still names the release commit.
:::
