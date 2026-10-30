# CointMU App Overview

CointMU is a desktop application that provides a unified interface for interacting with a custom Proof-of-Work blockchain network. Instead of relying on an external RPC provider, CointMU ships with an embedded Geth node that runs on the user's machine. The node finds its peers through the CointMU bootnode on the campus network, so off campus it needs the VPN. See [Network Access](/docs/app/installation#network-access).

::: info Version numbers
The desktop app and the [CointMU CLI](/docs/cli/overview) are versioned separately, and their version numbers are unrelated: desktop 1.7.x and CLI 1.7.x are different releases with different codenames. The app shows its version in **Settings → About**.
:::

## Core Features

### Embedded Geth Node

CointMU runs a background Proof-of-Work node managed by the Electron Main process. Startup, shutdown, and recovery after a crash are handled by the app, with no manual configuration. On macOS the node does not start today ([CointMU-App#102](https://github.com/Cointmu-ORG/CointMU-App/issues/102)).

### Self-Healing Node

When the node's chain database is damaged, CointMU restarts the node up to three times. If that does not help, it moves the damaged chain data aside as a backup and resyncs from the network. It does this at most once per session; after that it stops and asks you to retry. Your wallet keys are never touched. See [Self-Healing Embedded Node](/docs/app/node#self-healing).

### Multi-Asset Wallet

The built-in wallet holds native CMU and ERC-20 tokens, and lists ERC-721 and ERC-1155 NFTs. Accounts come from a 12-word recovery phrase or an imported key, and are stored encrypted with your password. See [Wallet](/docs/app/wallet).

### Integrated Mining

CointMU includes a mining interface for the local CPU miner:

| Control            | Description                                                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Worker threads     | Number of CPU threads the miner uses, set in Settings → Mining.                                                                                       |
| Intensity presets  | `Eco`, `Balanced` and `Turbo` are shown and saved, but have no effect yet ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)). |
| Pause on battery   | Stops the miner while a laptop runs on battery, and resumes it on AC power.                                                                           |
| Miner distribution | Share of blocks mined by each address over the past 24 hours, on the Explorer page.                                                                   |

### Real-Time Dashboard

The dashboard aggregates live network data through background polling:

- Network hashrate across all active miners.
- Smart contracts deployed from your address.
- Paginated transaction history for your wallets, with CSV export.

All data is fetched in the background to keep the UI responsive at all times.

### Browser Extension

A companion Chrome extension connects dApps to the desktop wallet. It is bundled with the app; see [Browser Extension](/docs/app/extension).

### Settings, Updates and Error Reports

The app updates itself from GitHub Releases, sends sanitized error reports unless you turn them off, and offers 7 interface languages. See [Settings](/docs/app/settings).

## Architecture Overview

CointMU is structured around three tightly coupled layers:

```text
┌─────────────────────────────────────────┐
│              Electron Shell             │
│   (Main Process — Node Lifecycle,       │
│    IPC Bridge, System Integration)      │
├─────────────────────────────────────────┤
│         React + Vite Renderer           │
│   (UI Layer — Wallet, Dashboard,        │
│    Mining Controls, Token Management)   │
├─────────────────────────────────────────┤
│           Geth Child Process            │
│   (Embedded PoW Node — JSON-RPC API,   │
│    LevelDB State, Mining Engine)        │
└─────────────────────────────────────────┘
```

**Electron** serves as the application shell, managing the Geth child process lifecycle and exposing a secure IPC bridge between the Main process and the renderer.

**React and Vite** power the renderer layer, providing a fast, component-driven UI for wallet management, mining controls, and real-time network data visualization.

**Geth** runs as a managed child process under Electron, exposing a local JSON-RPC API that the renderer consumes through the IPC bridge. All chain state, including account balances, contract deployments, and transaction history, is stored locally in a LevelDB database managed by the Geth process.

## Key Design Principles

| Principle            | Implementation                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| No third-party RPC   | Blockchain operations run against the local node. Only peer discovery needs the campus network or VPN.                              |
| Recovers on its own  | The node is restarted, and damaged chain data rebuilt, without user action, once per session. After that the app asks you to retry. |
| Performance-first UI | Background polling keeps the interface current without blocking it.                                                                 |
| Developer-accessible | The node's JSON-RPC API (`eth`, `net`, `web3`) listens on `127.0.0.1:8585` and works with standard Ethereum tooling.                |
