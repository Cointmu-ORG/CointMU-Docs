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

The command reads version metadata from the CLI's own `package.json` and the build identifier baked into the CLI, and queries the active runtime environment.

## Output

```bash
cmu
version      : 1.7.0
codename     : Rainbow
build        : 6d2fc9e
architecture : x64
node         : v24.19.0
solidity     : 0.8.37+commit.f401782d.Emscripten.clang
ethers       : 6.17.0
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

::: info
The build identifier is stamped into the bundle at build time by resolving `git rev-parse --short HEAD` in the build tree. It is baked in, so it identifies the commit the binary was built from even when the installed package has no `.git` directory. When the CLI runs unbundled — from source via `ts-node`, for example — nothing was stamped and the field displays `unknown`.
:::
