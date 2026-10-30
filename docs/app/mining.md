# Mining

The Mining page is the dedicated control center for participating in CointMU network consensus. It shows the local miner's state, hashrate and rewards, and the worker configuration set in [Settings → Mining](/docs/app/settings#mining).

![CointMU Mining](/images/mining-page.png)

## Consensus Control

The main banner displays the current mining state and provides the primary start/stop control.

| Element           | Description                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| Status            | `Mining`, `Stopped`, or `Paused (Battery)` in the header; the banner shows `Idle`, `Initializing` or the hashrate. |
| Hashrate          | Real-time computational output in MH/s.                                                                            |
| Target Difficulty | Current network difficulty target (e.g., `0x123957`).                                                              |
| Block Reward      | Fixed reward per block found (e.g., `2 CMU` per block).                                                            |
| Rewards Today     | Total CMU earned in the current session.                                                                           |
| Start Mining      | Primary action button to join or leave the network consensus.                                                      |

When mining starts, Geth may first need to generate its DAG; meanwhile the banner shows *Generating Directed Acyclic Graph (DAG) for verification...* until it is done. While the node is still syncing, the banner shows the sync progress and an estimate of the time left. With no peers, it shows a hint instead, such as *Bootnode unreachable — make sure you are connected to the campus network or VPN.* See [Troubleshooting](/docs/app/node#troubleshooting).

## Performance Metrics

Four telemetry cards track historical and current mining performance.

| Metric           | Description                                                                             |
| ---------------- | --------------------------------------------------------------------------------------- |
| Session Time     | Duration of the current active mining session.                                          |
| Blocks Found     | Total valid blocks mined in the past 24 hours.                                          |
| Total Earned     | Aggregate CMU rewards accumulated across the lifetime of the connected wallet.          |
| Hashrate - 5 Min | Five-minute moving average of computational output, used to monitor hardware stability. |

## Worker Configuration

The Worker Configuration panel shows how the local machine allocates hardware to mining. It is read-only here; change the values in [Settings → Mining](/docs/app/settings#mining).

| Setting        | Description                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Worker Threads | Number of CPU threads the miner uses (e.g., `4 of 12 cores`). The default is 4.                                                                                                        |
| Intensity      | `Eco`, `Balanced` or `Turbo`. The choice is saved and shown, but it does not change how the miner runs yet ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)). |
| Reward Address | The wallet address where block rewards are credited upon a successful solve. It defaults to your main wallet.                                                                          |

To reduce heat and CPU load, lower the number of worker threads.

## Pause on Battery

With **Pause on battery** on (the default), the miner stops when a laptop switches to battery power and the header shows `Paused (Battery)`. It resumes when the laptop is plugged in again, if mining was on. This comes from the source; it was not tested on a laptop for these docs.

## Mining Activity

The Mining Activity panel provides a detailed ledger of consensus participation and block rewards.

| Tab      | Description                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------- |
| Found    | Blocks successfully found by the local miner, with block height, hash, timestamp, and CMU reward. |
| Log      | Node activity as it happens: blocks synced from the network and blocks you sealed.                |
| Activity | Heatmap of accepted shares over the past 30 days.                                                 |

Use the **All Wallets** dropdown to filter the activity ledger by a specific account.

When you seal a block, CointMU also sends a *Block mined* notification, unless mining events are turned off in [Settings → Notifications](/docs/app/settings#notifications).
