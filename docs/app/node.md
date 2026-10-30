# Self-Healing Embedded Node

CointMU runs a full Geth node directly inside the application as a managed child process. There is no external node to configure, no RPC provider to connect to, and no separate daemon to keep alive — the application handles the node lifecycle itself.

The bundled node is Geth 1.10.26 (the last Geth release with Proof of Work), run with `--syncmode full`.

::: danger macOS
macOS builds do not include the `geth` binary where the app looks for it, so the node never starts there. See [CointMU-App#102](https://github.com/Cointmu-ORG/CointMU-App/issues/102).
:::

## How It Works

The Geth node is spawned by the Electron Main process at application startup and stopped when the application closes. All communication between the UI and the node happens through the local JSON-RPC API exposed by the embedded Geth instance.

```text
Electron Main Process
  └─ Spawns Geth as a child process
       │
       ▼
Geth Node (127.0.0.1:8585)
  └─ Exposes JSON-RPC API
       │
       ▼
React Renderer (via IPC Bridge)
  └─ Wallet, Dashboard, Explorer, Mining UI
```

## Node Lifecycle

| Phase    | Behavior                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Startup  | Geth is spawned automatically when the application launches. On first start, the chain is initialized from the built-in genesis block.                |
| Running  | The node syncs with the CointMU network and serves JSON-RPC requests.                                                                                 |
| Shutdown | Geth is asked to stop cleanly when the application closes.                                                                                            |
| Crash    | After an unexpected exit the node is restarted. More than 5 unrecognized crashes within 10 minutes stops the restarts, and the app asks you to retry. |
| Blocked  | If Geth cannot start because of a port or lock conflict, it is not restarted. The app shows the cause and a **Retry** button (see below).             |

## Self-Healing

When Geth reports a damaged chain database, CointMU recovers in stages and shows each stage in a banner:

1. **Retry.** The node is restarted up to three times, after 3, 10 and 30 seconds (*Restarting the node (attempt 1 of 3)...*). After each restart the app waits 15 seconds and checks that Geth is still running and answers RPC.
2. **Move the damaged data aside.** If the retries fail, the chain data folder is renamed to `chaindata.corrupt-<timestamp>` (*Damaged chain data was moved aside as a backup*). Only the newest backup is kept; older ones are deleted.
3. **Resync.** Geth is re-initialized from the genesis block and resyncs from the network (*Rebuilding chain data and resyncing from the network...*).
4. **Done, or stop.** On success the banner says *The node has recovered.* Steps 2 and 3 run at most once per session. If they have already run, or they fail, the banner says *Automatic recovery stopped. The node needs your attention.*, with the last Geth error and a **Retry** button.

Your wallet keystore is never touched by recovery.

::: warning
Moving the chain data aside means a full chain resync from the network, which needs peers (the campus network or VPN). Blocks you mined stay on the network; only the local copy is rebuilt.
:::

## Network Configuration

The embedded node connects to the CointMU network using the following defaults:

| Parameter  | Value                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Network    | CointMU Mainnet                                                                                                                        |
| Chain ID   | `1912`                                                                                                                                 |
| RPC URL    | `http://127.0.0.1:8585`, or the next free port if 8585 is taken                                                                        |
| RPC APIs   | `eth`, `net`, `web3`                                                                                                                   |
| P2P port   | `30303` (TCP and UDP), or the next free port if 30303 is taken. Shown, read-only, in [Settings → Network](/docs/app/settings#network). |
| Consensus  | Proof of Work (PoW)                                                                                                                    |
| Block Time | ~30 seconds                                                                                                                            |
| Data       | `<userData>/cointmu-chaindata/1912` (see [Where Data Is Stored](/docs/app/installation#where-data-is-stored))                          |

These values are bundled with the application and do not require manual configuration. The node also opens Geth's engine API on `127.0.0.1:8551` (or the next free port).

::: warning RPC port in Settings
Settings → Advanced says the node listens on `127.0.0.1:8545`, and offers WebSocket RPC on `8546`. Both are wrong: HTTP RPC is on `8585`, and there is no WebSocket endpoint. See [CointMU-App#105](https://github.com/Cointmu-ORG/CointMU-App/issues/105).
:::

## Bootnodes

The node finds peers through a bootnode on the campus network. The active bootnodes are listed in [Settings → Network → Bootnodes](/docs/app/settings#bootnodes), where you can also enter your own (up to 10). Saving restarts the node.

## Troubleshooting

When the node cannot start, or has no peers, the Mining page shows a hint:

| Message                                                                            | What to do                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *Bootnode unreachable — make sure you are connected to the campus network or VPN.* | Connect to the campus network or VPN.                                                                                                                                                                                                         |
| *The bootnode is reachable, but no peers have connected.*                          | The network ID or bootnode may not match the network, or UDP discovery may be blocked. If it persists, report an issue with the logs.                                                                                                         |
| *Another program is using the node's network port.*                                | Close that program, then click **Retry**. The hint also suggests changing the Listen port in Settings → Network, but that field cannot be edited ([CointMU-App#106](https://github.com/Cointmu-ORG/CointMU-App/issues/106)).                  |
| *Windows has reserved port …*                                                      | Hyper-V and WSL reserve port ranges on Windows. Restart CointMU so it picks other ports, then click **Retry**. The Listen port the hint mentions cannot be edited ([CointMU-App#106](https://github.com/Cointmu-ORG/CointMU-App/issues/106)). |
| *Windows denied the node access to its IPC pipe or data files*                     | A `geth.exe` from an earlier session is still running. End it in Task Manager (Details tab) or restart the computer, then click **Retry**.                                                                                                    |
| *The node database is in use by another process*                                   | Another CointMU or Geth instance is using the data folder. Close it, then click **Retry**.                                                                                                                                                    |
| *Automatic recovery stopped. The node needs your attention.*                       | Click **Retry**, or restart the app. If it keeps failing, report an issue and attach the logs (Settings → Privacy & Diagnostics → **Copy recent logs**).                                                                                      |

The Windows rows come from the source and were not reproduced on Windows for these docs. Off campus, the *Bootnode unreachable* hint was seen on Linux.
