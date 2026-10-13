# Installation

CointMU is a desktop application built with Electron, packaging a Proof-of-Work node together with a dashboard, wallet, and mining interface. It runs on Windows, Linux, and macOS.

Prebuilt installers are not yet published as releases; the application is currently installed by building from source.

## Requirements

| Requirement | Version / Notes                                                    |
| ----------- | ------------------------------------------------------------------- |
| Node.js     | v22 or later                                                         |
| npm         | Bundled with Node.js                                                 |
| Git         | Required to clone the repository                                     |
| `geth`      | Platform-appropriate binary, placed manually in `resources/bin/`     |

## Install from Source

1. Clone the repository:

   ```bash
   git clone https://github.com/Cointmu-ORG/CointMU-App.git
   cd CointMU-App
   ```

2. Place the `geth` binary for your platform in `resources/bin/` (`geth.exe` on Windows, `geth` on Linux and macOS). On Linux and macOS, make it executable:

   ```bash
   chmod +x resources/bin/geth
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the application in development mode:

   ```bash
   npm run dev
   ```

## Building Distributables

The application is packaged with `electron-builder`. Each platform must be built on a matching host OS — build Windows artifacts on Windows, Linux artifacts on Linux, and macOS artifacts on macOS.

| Platform | Command             | Output                                  |
| -------- | -------------------- | ---------------------------------------- |
| Windows  | `npm run build:win`   | Installer in `dist/`                    |
| Linux    | `npm run build:linux` | AppImage / deb package in `dist/`       |
| macOS    | `npm run build:mac`   | Application bundle and DMG in `dist/`   |

Continuous integration builds all three platforms automatically via the GitHub Actions release workflow (`.github/workflows/release.yml`) whenever a `v*` tag is pushed.

## Development Workflow

The repository also provides a `Makefile` for common tasks:

| Command       | Description                                                        |
| ------------- | -------------------------------------------------------------------- |
| `make dev`     | Start the development server with hot-module reloading.             |
| `make build:win` | Compile and package the application as a Windows executable.      |
| `make clean`   | Remove build artifacts (`out`, `dist`, `build`).                    |

## Next Steps

Continue to the [App Overview](/docs/app/overview) to understand the application architecture, or see [Self-Healing Embedded Node](/docs/app/node) for details on the embedded Geth process.
