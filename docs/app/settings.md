# Settings

Settings is opened from the sidebar (**Settings**) or from **Preferences** on the Mining page. It has eleven panels. This page describes what each option does today. Some options are saved and shown but have no effect yet; they are marked, with the issue that tracks them.

**Reset to defaults** at the top reverts all settings to their defaults. It does not touch your wallet.

The panels and their options were checked on running Linux builds (1.7.3 and 1.7.4). Whether an option takes effect was read from the source, and confirmed on Linux where the linked issue says so. Nothing on this page was run on Windows or macOS.

## General

| Option                  | What it does                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Launch CointMU at login | No effect yet: the app never registers itself to start at login ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)).             |
| Open in background      | No effect yet ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)).                                                               |
| Language                | Interface language: English, Bahasa Indonesia, Español, 中文, Русский, Deutsch, 日本語.                                                                 |
| Default currency        | No effect yet: USD and EUR are offered, but amounts are always shown in CMU ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)). |

## Appearance

| Option                      | What it does                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| Theme                       | Light, Dark, or Auto (follows the system).                                                |
| Accent color                | Color of buttons and highlights.                                                          |
| Density                     | No effect yet ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)). |
| Show sidebar icons in color | No effect yet ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)). |
| Animated transitions        | No effect yet ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)). |

## Notifications

**Global notifications** turns all notifications on or off. **Desktop / OS notifications** also shows them as system notifications outside the app window, and **Notification sound** plays a tone. The event categories choose which events notify you:

- **Transaction events:** a transaction you sent was confirmed, or could not be confirmed.
- **Mining events:** you sealed a block.
- **Security events:** no effect yet; the app sends no security notifications ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)).

The notification settings were read from the source; no notification was triggered for these docs.

## Network

| Option          | What it does                                                                                                                                                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Network         | The chain CointMU is connected to: CointMU Mainnet, chain ID `1912`. Read-only.                                                                                                                                                                                         |
| Block time      | The network's target block time (30 s). Read-only.                                                                                                                                                                                                                      |
| Max peers       | No effect yet: the node uses Geth's default ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)).                                                                                                                                                 |
| Discovery       | No effect yet: discovery is always on ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)).                                                                                                                                                       |
| Listen port     | The node's P2P port (`30303`, or the next free port). Shown only; it cannot be edited here ([CointMU-App#106](https://github.com/Cointmu-ORG/CointMU-App/issues/106)).                                                                                                  |
| Connected peers | How many peers the node has. On 1.7.3 and older it always reads 14 ([CointMU-App#98](https://github.com/Cointmu-ORG/CointMU-App/issues/98), fixed in 1.7.4). **View list** does nothing yet ([CointMU-App#106](https://github.com/Cointmu-ORG/CointMU-App/issues/106)). |
| Sync mode       | No effect yet: shows *Snap (recommended)*, but the node always runs a full sync ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)).                                                                                                             |
| Prune old state | No effect yet ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)).                                                                                                                                                                               |

### Bootnodes

**Active bootnodes** lists the enodes the node contacts first to find peers, and whether they are the built-in default or your own. To use other bootnodes, enter them under **Custom bootnodes**, one per line or comma-separated, up to 10, in the form `enode://<128 hex characters>@<host>:<port>`. **Save and restart** checks every entry, saves them and restarts the node; nothing is saved if any entry is invalid. **Reset to default** goes back to the built-in bootnode.

::: warning
Only enter enodes you received from the CointMU admins. A bootnode from anyone else can connect you to fake peers and show you a false view of the network.
:::

## Mining

| Option                 | What it does                                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Enable Mining          | Starts or stops the miner, like **Start mining** on the [Mining](/docs/app/mining) page.                                                 |
| Start mining at launch | No effect yet ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)).                                                |
| CPU threads            | Number of threads the miner uses (default 4, up to the number of cores). Changing it while mining restarts the miner with the new count. |
| Intensity              | `Eco`, `Balanced`, `Turbo`. No effect yet ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)).                    |
| Pause on battery       | Stops the miner on battery power and resumes it on AC power (on by default). Not tested on a laptop for these docs.                      |
| Reward address         | Where block rewards go: your main wallet by default, another of your accounts, or a custom address.                                      |

## Security

| Option             | What it does                                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auto-lock wallet   | Locks the wallet after 5 minutes without activity, so you have to enter your password again. It does not lock while mining.                                |
| Recovery phrase    | Shows your 12-word recovery phrase after you enter your password, and hides it again after a few seconds.                                                  |
| Export keystore    | Saves the active account as an encrypted JSON keystore. It is protected by your wallet password, and other wallets can import it with that password.       |
| Reveal private key | Shows one account's raw private key after you enter your password, and hides it again after a few seconds.                                                 |
| Ledger / Trezor    | Placeholder: there is no hardware wallet support, and **Connect** does nothing ([CointMU-App#106](https://github.com/Cointmu-ORG/CointMU-App/issues/106)). |
| Reset wallet       | Removes all accounts and keys from this computer, after you type the confirmation word and your password. This cannot be undone.                           |

On macOS and Windows, where the system offers it, a **Require Touch ID / Windows Hello to sign** option also appears. It has no effect yet: signing never asks for biometrics ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)). This comes from the source and was not seen on those systems.

::: danger
Back up your recovery phrase before you use **Reset wallet**. CointMU cannot recover your funds without it.
:::

## Connected Sites

Shows whether the [browser extension](/docs/app/extension) is linked (**Actively Connected** or **Disconnected**), and lists the sites that have been granted read-only access to your address and chain data, with the date each was connected. **Revoke** removes a site's access.

## External Sources

**Download ZIP** is meant to save the bundled [browser extension](/docs/app/extension) as `CointMU-Extension.zip`. In installed builds it does nothing ([CointMU-App#103](https://github.com/Cointmu-ORG/CointMU-App/issues/103)).

## Advanced

| Option                    | What it does                                                                                                                                                                                                                                                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enable JSON-RPC over HTTP | Starts the node's HTTP RPC on `127.0.0.1:8585` (on by default, applied the next time the node starts). The panel says `8545`; that is wrong ([CointMU-App#105](https://github.com/Cointmu-ORG/CointMU-App/issues/105)). The app reads the node through this endpoint, so turning it off also empties the Dashboard, Mining and Explorer pages. |
| Enable WebSocket RPC      | No effect: there is no WebSocket endpoint, on `8546` or anywhere else ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104), [CointMU-App#105](https://github.com/Cointmu-ORG/CointMU-App/issues/105)).                                                                                                                    |
| CORS allowed origins      | No effect ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)). Browsers get no CORS access to the node.                                                                                                                                                                                                                 |
| Datadir                   | The chain data folder, `<userData>/cointmu-chaindata/1912`, and its size on disk. **Reveal** opens it in your file manager.                                                                                                                                                                                                                    |
| Log level                 | No effect: the node log stays at Geth's default level ([CointMU-App#104](https://github.com/Cointmu-ORG/CointMU-App/issues/104)).                                                                                                                                                                                                              |
| Remove secondary accounts | Deletes every account except the main one from this computer, after a confirmation.                                                                                                                                                                                                                                                            |

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

CointMU always writes two logs to `<userData>/logs/`, with secrets, addresses, IP addresses and user names removed: `main.log` (the app, up to 1 MB) and `geth.log` (the node, up to 5 MB). When a log reaches its limit, it is moved to one `.old` file. Logs are never sent automatically. **Open logs folder** shows them, and **Copy recent logs** copies the latest lines for a bug report.

## About

Shows the app version and build, the node version, chain ID, connected peers and uptime. **Check for Updates** looks for a newer release on GitHub; see [Updates](/docs/app/installation#updates). The links open the release notes, these docs, the GitHub repository, and a new GitHub issue.
