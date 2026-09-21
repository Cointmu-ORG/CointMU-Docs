# Installation

`cmu` is distributed as an npm package and can be installed globally or built from source for local development.

## Requirements

| Requirement | Version                                                  |
| ----------- | -------------------------------------------------------- |
| Node.js     | `20.12.0` minimum; **`22` or newer for the local DevNet** |
| npm         | Bundled with Node.js                                     |
| Git         | Required for source builds                               |

::: warning
There are **two** Node.js floors, and they are both enforced at runtime.

| Scope                              | Minimum  | Why                                                        |
| ---------------------------------- | -------- | ---------------------------------------------------------- |
| The CLI itself                     | `20.12.0`| `process.loadEnvFile()`, which replaced dotenv, landed there. |
| `cmu test` and `cmu node start`    | `22`     | The DevNet runs on EDR, which requires Node 22.            |

Below `20.12.0` the CLI refuses before any command runs:

```bash
error: cmu requires Node.js 20.12 or newer, but this is Node v20.9.0.
hint: upgrade Node.js, or install a version manager such as nvm or fnm.
```

On Node 20 or 21 the CLI works, but the DevNet commands refuse:

```bash
error: node start failed
the local DevNet needs Node.js 22 or newer, but this is Node v20.12.0.
    npm skips EDR's native binary on older Node without reporting it, so no chain can start.
hint: upgrade Node.js, or install a version manager such as nvm or fnm.
```

npm skips EDR's native binary on older Node without an error or a non-zero exit, so the install looks clean and the failure would otherwise surface much later as a module-resolution error that never mentions Node at all. The explicit check exists to make that legible.

Releases are tested against Node 20, 22, and 24.
:::

::: tip
Run Node 22 or newer unless you have a reason not to. It is the only version range where every `cmu` command works.
:::

## Install via npm (recommended)

Install the CLI globally to make the `cmu` command available system-wide:

```bash
npm install -g cointmu-cli
```

Verify the installation:

```bash
cmu --version
cmu --help
```

## Build from Source

Use this method to contribute to the CLI or test unreleased changes.

```bash
git clone https://github.com/kakonoomoidee/CointMU-CLI.git
cd CointMU-CLI
npm install
npm run build
npm install -g .
```

### npm Scripts

| Command         | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `npm run build` | Bundle the TypeScript source to `dist/` with tsup.          |
| `npm test`      | Run the unit test suite with Vitest.                        |

::: info
`npm run build` stamps the current Git short hash into the bundle as the build identifier reported by [`cmu version`](/docs/cli/version).
:::

## Updating

The CLI can update itself from the npm registry:

```bash
cmu update
```

To pin a specific published version instead of the latest release:

```bash
cmu update --to 1.3.2
```

Reinstalling manually achieves the same result:

```bash
npm install -g cointmu-cli@latest
```

See [cmu update](/docs/cli/update) for version pinning rules and validation behavior.

## Uninstalling

```bash
npm uninstall -g cointmu-cli
```

## Next Steps

Continue to the [CLI Reference](/docs/cli/overview) for a full command overview, or jump directly to [cmu create](/docs/cli/create) to scaffold your first project.
