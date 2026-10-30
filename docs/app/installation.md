# Installation

CointMU is a desktop application built with Electron, packaging a Proof-of-Work node together with a dashboard, wallet, and mining interface. It runs on Windows, Linux, and macOS.

Installers for each release are published on [GitHub Releases](https://github.com/Cointmu-ORG/CointMU-App/releases/latest). You can also build the application from source.

The app's version numbers are its own and unrelated to the [CointMU CLI](/docs/cli/overview)'s: desktop 1.7.x is not CLI 1.7.x.

## Install a Release

Download the installer for your platform from the latest release:

| Platform | File                                                      | Architecture          |
| -------- | --------------------------------------------------------- | --------------------- |
| Windows  | `windows-cointmu-desktop-<version>-installer.exe`         | x64                   |
| Linux    | `linux-cointmu-desktop-<version>-installer.AppImage`      | x64                   |
| Linux    | `linux-cointmu-desktop-<version>-installer.deb`           | x64                   |
| macOS    | `macos-cointmu-desktop-<version>-installer.dmg` or `.zip` | Apple Silicon (arm64) |

- **Linux (deb):** `sudo apt install ./linux-cointmu-desktop-<version>-installer.deb`. The app installs to `/opt/CointMU`.
- **Linux (AppImage):** `chmod +x` the file and run it.
- **Windows:** run the installer. It lets you choose the install folder and creates a desktop shortcut.
- **macOS:** open the `.dmg` and drag CointMU to Applications. The build is not notarized (`notarize: false` in `electron-builder.yml`), so macOS asks for confirmation the first time you open it.

::: danger macOS: the node does not start
macOS builds do not include the `geth` binary where the app looks for it, so the embedded node never starts. The wallet, dashboard and explorer then have no chain data. See [CointMU-App#102](https://github.com/Cointmu-ORG/CointMU-App/issues/102).
:::

::: info Verified on
The `.deb` was extracted and run on Linux (x64) for these docs. The Windows and macOS steps above come from the build configuration and the published files, and were not run on those systems.
:::

### Updates

When it starts, an installed build checks GitHub Releases for a newer version. If it finds one, it downloads it in the background and restarts into it as soon as the download finishes. Prereleases are included. You can also check by hand in **Settings → About → Check for Updates**. The startup check was seen on Linux; the download and restart come from the source and were not exercised for these docs.

## Network Access

The node finds peers through the CointMU bootnode on the campus network. Off campus, connect through the VPN. Without it the node starts but stays at 0 peers, and the Mining page says *Bootnode unreachable — make sure you are connected to the campus network or VPN.* The active bootnode is listed under [Settings → Network](/docs/app/settings#network).

## Where Data Is Stored

CointMU keeps everything in its user data folder (`<userData>`):

| Platform | `<userData>`                            |
| -------- | --------------------------------------- |
| Linux    | `~/.config/CointMU`                     |
| Windows  | `%APPDATA%\CointMU`                     |
| macOS    | `~/Library/Application Support/CointMU` |

| What                                                        | Where                               |
| ----------------------------------------------------------- | ----------------------------------- |
| Chain data                                                  | `<userData>/cointmu-chaindata/1912` |
| Settings and wallet (accounts encrypted with your password) | `<userData>/config.json`            |
| Logs (`main.log`, `geth.log`)                               | `<userData>/logs/`                  |
| Error reports waiting to be sent                            | `<userData>/telemetry-queue/`       |

The Linux paths were checked on a running build. The Windows and macOS folders are Electron's defaults for an app named `CointMU`, and were not checked on those systems.

## Requirements

To build CointMU from source you need:

| Requirement | Version / Notes                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Node.js     | 24.15 or later, pinned in `.nvmrc`. Node.js 22.22.2 or later also works, but npm prints an `EBADDEVENGINES` warning on every install.                              |
| npm         | 12.2 or later, through Corepack. `package.json` pins `npm@12.2.0`, and any older npm stops with `EBADDEVENGINES`, including the npm 10 that ships with Node.js 22. |
| Git         | Required to clone the repository                                                                                                                                   |
| Go          | Windows builds only (`npm run build:win`, from 1.7.4): builds `geth-supervisor.exe`. Use the version in `native/geth-supervisor/go.mod`.                           |

The `geth` binaries are committed to the repository under `resources/bin/linux/`, `resources/bin/mac/` and `resources/bin/win/`, so there is nothing to download or place by hand.

## Install from Source

1. Clone the repository:

   ```bash
   git clone https://github.com/Cointmu-ORG/CointMU-App.git
   cd CointMU-App
   ```

2. Switch to the pinned Node.js version and let Corepack provide the pinned npm:

   ```bash
   nvm use
   corepack enable npm   # after nvm use, so the shim lands in that Node.js
   npm -v                # 12.2.0
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

   npm 12 runs dependency install scripts only for the packages listed under `allowScripts` in `package.json`. If your `~/.npmrc` has a global `allow-scripts=...` line, remove it: npm ignores it in this project and warns on every install.

4. Optionally, copy the environment file. It is read in development only, and its values are the defaults the code already uses:

   ```bash
   cp .env.example .env
   ```

5. Start the application in development mode:

   ```bash
   npm run dev
   ```

::: details How the Node.js and npm versions were checked
On the `main` branch (1.7.4) on Linux: with Node.js 22.23.2 and its bundled npm 10.9.9, `npm ci` stops with `EBADDEVENGINES`. With Node.js 22.23.2 and npm 12.2.0, from Corepack or installed directly, `npm ci` and `npm run build` succeed after one `devEngines.runtime` warning, and all tests pass. Corepack resolves npm 12.2.0 under Node.js 22.23.2 and 24.x. The 22.22.2 lower bound is npm 12's own `engines` range, and was not run.
:::

## Building Distributables

The application is packaged with `electron-builder`. Each platform must be built on a matching host OS — build Windows artifacts on Windows, Linux artifacts on Linux, and macOS artifacts on macOS.

| Platform | Command             | Output                                  |
| -------- | -------------------- | ---------------------------------------- |
| Windows  | `npm run build:win`   | Installer in `dist/`                    |
| Linux    | `npm run build:linux` | AppImage / deb package in `dist/`       |
| macOS    | `npm run build:mac`   | Application bundle and DMG in `dist/`   |

From 1.7.4, `npm run build:win` also needs Go, to build `geth-supervisor.exe`. On Linux or macOS you can build only the supervisor with `GOOS=windows GOARCH=amd64 npm run build:geth-supervisor`.

Continuous integration builds all three platforms automatically via the GitHub Actions release workflow (`.github/workflows/release.yml`) whenever a `v*` tag is pushed.

## Development Workflow

The repository also provides a `Makefile` for common tasks:

| Command            | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| `make dev`         | Start the development server with hot-module reloading.                 |
| `make build:win`   | Compile and package the application as a Windows installer.             |
| `make build:linux` | Compile and package the application as Linux AppImage and deb packages. |
| `make build:mac`   | Compile and package the application as a macOS DMG.                     |
| `make clean`       | Remove build artifacts (`out`, `dist`, `build`).                        |
| `make help`        | List the available commands (the default target).                       |

## Next Steps

Continue to the [App Overview](/docs/app/overview) to understand the application architecture, or see [Self-Healing Embedded Node](/docs/app/node) for details on the embedded Geth process.
