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
version      : 1.7.3
codename     : Monsun
build        : 3d43084
architecture : x64
node         : v24.22.0
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
| `solidity`     | Bundled at build time        | The full version string of the bundled Solidity compiler.                                    |
| `ethers`       | Bundled at build time        | The version of the bundled ethers.js library.                                                |

::: info
The build identifier is stamped into the bundle at build time by resolving `git rev-parse --short HEAD` in the build tree. It is baked in, so it identifies the commit the binary was built from even when the installed package has no `.git` directory. When the CLI runs unbundled — from source via `ts-node`, for example — nothing was stamped and the field displays `unknown`.
:::

::: info
Since 1.7.2 the `solidity` and `ethers` versions are also recorded at build time, so the report no longer loads either package: it takes about 0.1 s instead of about 1 s. If the installed `solc` or `ethers` is not the version the build recorded, that package is loaded and asked directly, so the report always names what is installed.
:::
