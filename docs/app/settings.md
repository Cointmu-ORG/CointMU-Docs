# Settings

Settings is opened from the sidebar (**Settings**) or from **Preferences** on the Mining page. It has eleven panels. This page describes what each option does in 1.8.0.

**Reset to defaults** at the top reverts all settings to their defaults. It does not touch your wallet, and it does not move the chain data back.

The panels and their options were checked on the running Linux 1.8.0 build with a fresh profile. What an option does was read from the source, and confirmed on Linux where the text says so. Nothing on this page was run on Windows or macOS.

::: info Options removed in 1.8.0
Options that were saved but had no effect are hidden since 1.8.0: Default currency, Sync mode, Prune old state, Discovery, Enable WebSocket RPC, CORS allowed origins, mining Intensity, Security events notifications, and Require Touch ID / Windows Hello to sign. Their stored values are kept but not used. Launch at login, Open in background, Max peers, Listen port, Log level, Density, Animated transitions and Start mining at launch now take effect ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104), closed).
:::

## General

| Option                          | What it does                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Launch CointMU at login         | Windows and macOS only, in installed builds: starts CointMU when you sign in. Hidden on Linux. *(source-only)*                                                                                                                                                                                                                                                                   |
| Open in background              | Windows only: a launch at login starts minimized, so mining can run without a window. *(source-only)*                                                                                                                                                                                                                                                                            |
| Close button                    | **Quit** (default) or **Hide to tray**. Hidden to tray, CointMU keeps running; the tray menu shows sync, mining and peer status and has **Open CointMU**, **Start mining**, **Stop mining** and **Quit CointMU**. Shown only where a tray icon is possible: always on Windows, never on macOS, and on Linux only with a tray host (StatusNotifierWatcher). *(source-only)*       |
| Ask before quitting             | On by default. Quitting while the node mines or syncs asks first, with **Don't ask again**. Never asked when an update installs or the computer shuts down.                                                                                                                                                                                                                      |
| Chain data location             | The chain data folder, `<userData>/cointmu-chaindata`, and its size. **Open** shows it; **Move…** copies it to another folder. See [Moving the Chain Data](#moving-the-chain-data).                                                                                                                                                                                              |
| Check for updates automatically | On by default. Off skips the check at startup; **Settings → About → Check for Updates** still works.                                                                                                                                                                                                                                                                             |
| When an update is ready         | **Install when I quit** (default) or **Ask me**. See [Updates](/docs/app/installation#updates).                                                                                                                                                                                                                                                                                  |
| Logs                            | **Open folder** opens `<userData>/logs/`.                                                                                                                                                                                                                                                                                                                                        |
| Diagnostic bundle               | **Export…** saves a ZIP for a bug report: the log files, the app, Electron, Chrome, Node.js and geth versions, the network ID, the OS, and the general, appearance, network, mining, security, advanced and notification settings. Keys, keystores, the recovery phrase, accounts and connected sites are never read, and every file is sanitized like the logs. *(source-only)* |
| Explorer cache                  | **Reset…** deletes the local block index behind the Explorer's [miner chart](/docs/app/explorer#miner-distribution) and rebuilds it from your node in the background. Your wallet and chain data are not touched.                                                                                                                                                                |
| Language                        | Interface language: English, Bahasa Indonesia, Español, 中文, Русский, Deutsch, 日本語.                                                                                                                                                                                                                                                                                          |

The Default currency option was removed in 1.8.0; amounts were always shown in CMU.

On the Linux test system there was no tray host, so **Close button** did not appear. **Ask before quitting**, **Chain data location** with its size, the update options, **Explorer cache → Reset…** and its confirmation were seen there. Launch at login and Open in background never appear on Linux.

### Moving the Chain Data

**Move…** asks for a folder and checks it before you confirm: it must not be the current folder or inside it, must be empty or new, writable, and have room for the data plus 256 MB. CointMU then stops the node and mining, copies the data, checks the copy, and starts the node from the new folder. If anything fails, the copy is removed and the node starts from the old folder again; the old data is never changed. Only afterwards does it offer to delete the old copy (**Delete old copy** or **Keep it**).

The block index (`<userData>/explorer-index`) stays where it is. If the new folder later goes missing, for example on an unplugged drive, the node falls back to the default folder and logs an error. *(source-only: the folder picker could not be shown on the Linux test system.)*

## Appearance

| Option                | What it does                                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme                 | Light, Dark, or Auto (follows the system).                                                                                                                      |
| Accent color          | Color of buttons and highlights.                                                                                                                                |
| Density               | **Compact**, **Comfortable** (default) or **Spacious**: scales the text size and spacing. Since 1.8.0.                                                          |
| Animated transitions  | **Automatic** (default), **On** or **Off**. Automatic turns animations off while the system asks for reduced motion. Off removes them, except loading spinners. |
| Colored sidebar icons | Gives each sidebar item its own icon color; the open page stays highlighted. Off by default.                                                                    |
| Zoom                  | Size of text and controls in the window: 90, 100 (default), 110 or 125 percent.                                                                                 |
| Time format           | **Automatic** (default), **12-hour** or **24-hour**, for times in history, the Explorer and logs.                                                               |
| Balance decimals      | Decimal places of CMU balances: 2 (default), 4, 6 or **Full**, the exact amount.                                                                                |
| Privacy mode          | Shows `••••` instead of your balances and amounts, for example while you share your screen. The eye button in the title bar does the same. Display only.        |

Zoom, Time format, Balance decimals and Privacy mode are new in 1.8.0. Privacy mode masks your own balances and amounts everywhere they are shown, including your own addresses in the Explorer; other addresses are never masked. The options were seen on the Linux 1.8.0 build, and Privacy mode was switched on there with the eye button.

The old **Show sidebar icons in color** switch, which did nothing, became **Colored sidebar icons** in 1.8.0. Its stored value is not carried over, so it starts off.

## Notifications

**Global notifications** turns all notifications on or off. **Desktop / OS notifications** also shows them as system notifications outside the app window, and **Notification sound** plays a tone. The event categories choose which events notify you:

- **Transaction events:** a transaction you sent was confirmed, or could not be confirmed.
- **Mining events:** a block was mined to your reward address or one of your accounts, on any page of the app since 1.8.0.

The **Security events** category, which never sent anything, was removed in 1.8.0. The notification settings were read from the source; no notification was triggered for these docs.

## Network

| Option          | What it does                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Network         | The chain CointMU is connected to: CointMU Mainnet, chain ID `1912`. Read-only.                                                                              |
| Block time      | The network's target block time (30 s). Read-only.                                                                                                           |
| Max peers       | 10, 14 (recommended, the default), 25 or 50. Passed to the node as `--maxpeers`; saving restarts the node.                                                   |
| Listen port     | The node's P2P port, `30303` by default. Since 1.8.0 it can be edited: 1024 to 65535. Saving restarts the node.                                              |
| Connected peers | How many peers the node has. On 1.7.3 and older it always reads 14 ([CointMU-App#98](https://github.com/Cointmu-ORG/CointMU-App/issues/98), fixed in 1.7.4). |

Sync mode, Prune old state and Discovery were removed in 1.8.0; they never had an effect, and the node always runs a full sync with discovery on. The **View list** button next to the peer count, which did nothing, is gone too.

On the Linux 1.8.0 build, Max peers offered those four values and the node was started with `--maxpeers 14`. The Listen port field showed `30303`. Saving a new value was not tried.

### CointMU Nodes {#bootnodes}

Since 1.8.0, **CointMU nodes** lists the nodes your node connects to. The three campus nodes are built in: **Node 1 · 10.64.24.101**, **Node 2 · 10.64.24.106** and **Node 3 · 10.64.24.113**, marked **Default**. Your node connects to every node that is on, keeps reconnecting to it, and also uses it as a bootnode to find more peers, so each node backs up the others. Up to 1.7.4 only 10.64.24.101 was built in.

Each row shows two statuses: whether the node can be reached, with the latency (*Reachable · 5 ms*, *Unreachable*), and whether your node is peered with it (*Peer connected*, *Not a peer*). They are checked every 15 seconds while the page is open; **Check connection** checks one node and **Check all** checks every node.

| Action           | What it does                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a node       | Enter an **Enode** (`enode://<128 hex characters>@<host>:<port>`) and an optional **Label** of up to 40 characters, then **Add node**. It is connected right away, without a restart. |
| Turn a node off  | Default nodes cannot be removed, only switched off. At least one node must stay on.                                                                                                   |
| Remove           | Removes a node you added.                                                                                                                                                             |
| Reset to default | Goes back to the three built-in nodes.                                                                                                                                                |

The list holds at most 10 nodes, and the same node cannot be added twice. A node you remove or switch off stays a bootnode until the node restarts. Custom bootnodes saved by 1.7.x are kept, as custom nodes next to the defaults.

On the Linux 1.8.0 build all three default nodes showed *Reachable* and *Peer connected*, and the node was started with all three in `--bootnodes`. Adding, removing and switching off nodes come from the source.

::: warning
Only enter enodes you received from the CointMU admins. A node from anyone else can connect you to fake peers and show you a false view of the network.
:::

## Mining

| Option                 | What it does                                                                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enable Mining          | Allows this client to mine. Since 1.8.0, switching it on does not start the miner; start it on the [Mining](/docs/app/mining) page or from the tray. Switching it off stops mining. *(source-only)* |
| Start mining at launch | Shown only while Enable Mining is on; off by default. Starts mining 30 seconds after the node is ready, once per session. See [Start Mining at Launch](/docs/app/mining#start-mining-at-launch).    |
| CPU threads            | Number of threads the miner uses (default 4, up to the number of cores). Changing it while mining restarts the miner with the new count.                                                            |
| Pause on battery       | Pauses mining on battery power and resumes it on AC power (on by default).                                                                                                                          |
| Mine only when idle    | Off by default. Pauses mining while you use the computer; **Idle after** (1, 2, 5, 10 or 15 minutes, default 2) sets how long it must be idle before mining resumes.                                |
| Mine on a schedule     | Off by default. Pauses mining outside **Hours** (local time, default 22:00 to 07:00). The end may be after midnight.                                                                                |
| Low priority           | Off by default. Runs the node at below-normal CPU priority (nice 10 on Linux and macOS) so other programs stay responsive. Turning it off restarts the node on Linux and macOS.                     |
| Reward address         | Where block rewards go: your main wallet by default, another of your accounts, or a custom address.                                                                                                 |

Mine only when idle, Mine on a schedule, Low priority and the working Start mining at launch are new in 1.8.0. How the pauses work together is described in [When Mining Runs](/docs/app/mining#when-mining-runs). The **Intensity** option was removed in 1.8.0; it never had an effect.

The options, their choices and their defaults were seen on the Linux 1.8.0 build. Enable Mining and Low priority were not switched on, so mining was never started; what they do comes from the source.

## Security

| Option                          | What it does                                                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auto-lock wallet                | Locks the wallet after **Never**, 5, 15, 30 or 60 minutes without activity; you then enter your password again. Mining and the node keep running.                                           |
| Ask for password to send        | On by default. Every send needs your wallet password, typed in the Send dialog. It is checked on this computer and never stored.                                                            |
| Clear copied addresses and keys | **Never**, 15, 30 (default), 60 or 120 seconds. A copied address, private key or recovery phrase is removed from the clipboard after this long, unless you copied something else meanwhile. |
| Recovery phrase                 | Shows your 12-word recovery phrase after you enter your password, and hides it again after a few seconds.                                                                                   |
| Export keystore                 | Saves the active account as an encrypted JSON keystore. It is protected by your wallet password, and other wallets can import it with that password.                                        |
| Reveal private key              | Shows one account's raw private key after you enter your password, and hides it again after a few seconds.                                                                                  |
| Ledger / Trezor                 | Disabled and marked **Coming soon**: there is no hardware wallet support.                                                                                                                   |
| Reset wallet                    | Removes all accounts and keys from this computer, after you type the confirmation word and your password. This cannot be undone.                                                            |

Auto-lock is a choice of minutes since 1.8.0. A new install starts at 15 minutes; an install that had the old switch on keeps 5 minutes, and one that had it off gets **Never**. Up to 1.7.4 the wallet did not lock while mining; since 1.8.0 it does, and locking also forgets the password kept in memory. *(The upgrade mapping is source-only.)*

**Ask for password to send** and **Clear copied addresses and keys** are new in 1.8.0. The options and their choices were seen on the Linux 1.8.0 build, and the Send dialog showed the password field. Clearing the clipboard comes from the source.

The **Require Touch ID / Windows Hello to sign** option, which never had an effect and appeared only on macOS and Windows, was removed in 1.8.0.

::: danger
Back up your recovery phrase before you use **Reset wallet**. CointMU cannot recover your funds without it.
:::

## Connected Sites

Shows whether the [browser extension](/docs/app/extension) is linked (**Actively Connected** or **Disconnected**), and lists the sites that have been granted read-only access to your address and chain data, with the date each was connected. **Revoke** removes a site's access.

## External Sources

**Download ZIP** saves the bundled [browser extension](/docs/app/extension) as `CointMU-Extension.zip` where you choose. If the ZIP cannot be found or saved, an error appears under the button. Up to 1.7.4 it did nothing in installed builds ([CointMU-App#103](https://github.com/Cointmu-ORG/CointMU-App/issues/103), fixed in 1.8.0).

On the Linux 1.8.0 build the button found the ZIP and switched to *Saving...*, and nothing was logged about a missing ZIP. The save dialog itself did not appear on the test system, so saving was not completed.

## Advanced

| Option                    | What it does                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enable JSON-RPC over HTTP | Starts the node's HTTP RPC (on by default, applied the next time the node starts). Since 1.8.0 the panel shows the port the node really uses, `127.0.0.1:8585` unless that port was taken; up to 1.7.4 it always said `8545` ([CointMU-App#105](https://github.com/Cointmu-ORG/CointMU-App/issues/105), fixed). The app reads the node through this endpoint, so turning it off also empties the Dashboard, Mining and Explorer pages. |
| Datadir                   | The node's data folder, `<userData>/cointmu-chaindata/1912` unless [moved](#moving-the-chain-data), and its size on disk. **Reveal** opens it in your file manager.                                                                                                                                                                                                                                                                    |
| Log level                 | **Info** (default) or **Debug**, passed to the node as `--verbosity 3` or `4`. Saving restarts the node. Warning and Error are no longer offered; a stored Warning or Error runs at Info.                                                                                                                                                                                                                                              |
| Remove secondary accounts | Deletes every account except the main one from this computer, after a confirmation.                                                                                                                                                                                                                                                                                                                                                    |

Enable WebSocket RPC and CORS allowed origins were removed in 1.8.0; neither ever had an effect. The node has no WebSocket endpoint, and browsers get no CORS access to it. On the Linux 1.8.0 build the panel read `127.0.0.1:8585`, Log level offered Info and Debug, and the node was started with `--verbosity 3`.

## Privacy & Diagnostics

### Error Reporting

Error reports are on by default. When something goes wrong, CointMU saves a report and sends it to the CointMU error server. The panel names the server's address. It is reachable only on the campus network; off campus, reports wait on your computer and are sent later.

Nothing is sent before you dismiss the first-run notice with **Got it** or **Turn off**. Until then, reports wait on your computer.

**What a report contains:**

- The error type and message, and the stack trace (file names, function names, line and column).
- The app version and architecture, the operating system name and version, and the Electron runtime version.
- Which process failed, and for node problems the failure category and recovery stage.
- Up to 30 recent node error lines (at most 500 characters each) and recovery steps, so the report shows what Geth printed before it failed.
- For a native crash: the crashed process, the reason, and the exit code.

**Never sent:**

- Recovery phrases (including ones with a typo or two), private keys, signed transactions, and any other long hex string.
- Wallet addresses, IP addresses, your user name, and your computer's name. They are replaced in every text field, file paths included, before a report is saved.
- Crash dumps, log files, and anything outside the list above. Reports are rebuilt from a fixed list of fields, so anything else the error-reporting library collects is dropped.

Reports go over HTTPS, and only to the server whose key is built into the app; a server with any other key is refused. Builds made without a server configured send nothing; the panel then says *Error reporting is not configured in this build*.

**Reports waiting to be sent** are listed in the panel (**Refresh**, **Delete all**). They are kept in `<userData>/telemetry-queue/`, at most 5 MB and 30 days; when the limit is reached, the oldest go first.

**To turn error reporting off,** switch off **Send error reports** in this panel, or choose **Turn off** in the first-run notice. Turning it off also deletes every report that has not been sent yet.

These details come from the source; the notice, the panel, and turning reporting off were also checked on a running Linux build.

### Logs

CointMU always writes two logs to `<userData>/logs/`, with secrets, addresses, IP addresses and user names removed: `main.log` (the app, up to 1 MB) and `geth.log` (the node, up to 5 MB). When a log reaches its limit, it is moved to one `.old` file. Logs are never sent automatically. **Open logs folder** shows them, and **Copy recent logs** copies the latest lines for a bug report. For a fuller report, export a **Diagnostic bundle** from [General](#general).

## About

Shows the app version and build, the node version, chain ID, connected peers and uptime. **Check for Updates** looks for a newer release on GitHub; see [Updates](/docs/app/installation#updates). The links open the release notes, these docs, the GitHub repository, and a new GitHub issue.
