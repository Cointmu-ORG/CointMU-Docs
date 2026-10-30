# Changelog

<!--
Updating this page for a new desktop release (tag vX.Y.Z on Cointmu-ORG/CointMU-App):
1. Check the release: gh release view vX.Y.Z --repo Cointmu-ORG/CointMU-App
   (title, publish date in UTC, and which platforms have assets).
2. List what changed for users:
   - git log --no-merges --format=%s vPREV..vX.Y.Z (skip ci, test, refactor, chore)
   - git diff vPREV vX.Y.Z -- src/renderer/src/locales/en extension/locales/en.json
   Check each line against the source at the tag, not the commit title.
3. Run the Linux .deb with a fresh profile and cache:
   XDG_CONFIG_HOME=<empty dir> XDG_CACHE_HOME=<empty dir> <extracted>/opt/CointMU/cointmu-desktop
   Note the Electron version (window user agent), the bundled geth version
   (resources/bin/linux/geth version) and whether the node starts.
4. Read the bundled extension version from the release itself:
   manifest.json inside resources/app.asar.unpacked/resources/extension.zip.
   If it changed, add a Browser Extension entry and update its Latest table.
5. Write the entry above the previous newest desktop version. Mark lines you
   could only check in the source with *(source-only)*. Windows and macOS
   behavior stays source-only unless it was run on that system.
6. Update the desktop Latest table, add a row to Platforms and Bundled
   Components, and add rows to Breaking Changes and Removals or Building
   from Source if the release has any.
-->

Every release of the CointMU desktop app, and of the browser extension that ships inside it, newest first. Dates are GitHub release dates (UTC); versions with a tag but no release show the tag date.

::: info Version numbers
The desktop app, its browser extension and the [CointMU CLI](/docs/cli/changelog) are versioned separately, and their version numbers are unrelated: desktop 1.7.x and CLI 1.7.x are different releases with different codenames.
:::

::: details How these entries were checked
Every version with a Linux build was downloaded from its GitHub release and started on Linux with an empty profile and cache: the **Ran on Linux** column in [Platforms and Bundled Components](#desktop-platforms) says what happened. The bundled extension version was read from the `extension.zip` inside each release, not from the repository.

Each change below was checked against the app source at that version's tag. Changes that also show up in the app's English interface text, or that were seen in the running app, are listed as they are. Changes that could only be checked in the source end with *(source-only)*. Nothing was run on Windows or macOS, so behavior specific to those systems is always source-only, and no browser was available to run the extension.
:::

## Desktop Wallet

## Desktop: Latest {#desktop-latest}

| Version | Codename | Released   |
| ------- | -------- | ---------- |
| 1.7.4   | Obsidian | 2026-10-30 |

Installed apps download new releases from GitHub on their own and install them on restart; see [Updates](/docs/app/installation#updates). To install from scratch, see [Install a Release](/docs/app/installation#install-a-release).

::: danger Known issues in every release
- **macOS:** the node never starts, because the macOS builds do not include `geth` where the app looks for it. Every macOS release since 1.5.3 is affected. See [CointMU-App#102](https://github.com/Cointmu-ORG/CointMU-App/issues/102).
- **Browser extension:** **Settings → External Sources → Download ZIP** does nothing in installed builds, on every release since 1.6.4. See [CointMU-App#103](https://github.com/Cointmu-ORG/CointMU-App/issues/103).
:::

This table is updated by hand with each release. To see the newest release right now, run `gh release view --repo Cointmu-ORG/CointMU-App` or open the [releases page](https://github.com/Cointmu-ORG/CointMU-App/releases); to see what you have installed, open **Settings → About**.

## Desktop: Breaking Changes and Removals {#desktop-breaking}

| Version | Change                                                                                                                                                                                              | What to do                                                                                                                                                                   |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.7.3   | Network selection removed: custom networks (**Add Network**), the RPC endpoint field and editing the chain ID. **Settings → Network** shows CointMU Mainnet, read-only.                             | Nothing; the app only connects to CointMU Mainnet.                                                                                                                           |
| 1.7.0   | The mining **Mode** setting (solo or pool) removed from **Settings → Mining**. It had no effect.                                                                                                    | Nothing.                                                                                                                                                                     |
| 1.6.18  | The network moved to a new bootnode. 1.6.17 and older still look for the old one and find no peers: run for two minutes, 1.6.17 had 0 peers and 1.6.18 had 5.                                       | Update to 1.6.18 or newer.                                                                                                                                                   |
| 1.6.18  | **Send anonymous analytics** removed from **Settings → Advanced**. Error reports are sent unless you turn them off.                                                                                 | To turn error reporting off, see [Privacy & Diagnostics](/docs/app/settings#privacy-diagnostics).                                                                            |
| 1.6.17  | The node's HTTP RPC on `127.0.0.1:8585` serves only `eth`, `net` and `web3`. Before, it also served `admin`, `miner` and `personal`, and accepted calls from any website (CORS `*`, *source-only*). | Mine from the app's Mining page. Scripts that called `miner_*`, `admin_*` or `personal_*` over HTTP no longer work.                                                          |
| 1.6.17  | The app accepts the browser extension only after you approve it once (pairing). An extension linked before 1.6.17 is not paired. *(source-only)*                                                    | In the extension, choose **Link to Desktop App** again and approve the request in the app. See [Linking to the Desktop App](/docs/app/extension#linking-to-the-desktop-app). |
| 1.6.2   | Chain ID changed from `7012` to `1912`, with a new genesis block. 1.6.1 and older run a different chain.                                                                                            | Update to 1.6.2 or newer.                                                                                                                                                    |

## Desktop: Platforms and Bundled Components {#desktop-platforms}

Platforms come from each release's assets: Windows is an NSIS installer (x64), macOS a `.dmg` and `.zip` for Apple silicon, Linux an AppImage and a `.deb` (x64) unless noted. Electron and the extension version were read from the running app and from the release's own `extension.zip`.

Every release from 1.5.0 on bundles the same Geth 1.10.26 build for Linux and Windows, and from 1.5.3 also for macOS, where the app cannot find it ([CointMU-App#102](https://github.com/Cointmu-ORG/CointMU-App/issues/102)). 1.3.0 and 1.4.0 bundle no geth, so their node never starts.

| Version                    | Released         | Platforms                             | Electron               | Extension              | Ran on Linux                             |
| -------------------------- | ---------------- | ------------------------------------- | ---------------------- | ---------------------- | ---------------------------------------- |
| [1.7.4](#desktop-v1-7-4)   | 2026-10-30       | Windows, macOS (Apple silicon), Linux | 44.9.1                 | 1.0.17                 | Node runs, finds peers                   |
| [1.7.3](#desktop-v1-7-3)   | 2026-10-29       | Windows, macOS (Apple silicon), Linux | 44.9.1                 | 1.0.17                 | Node runs                                |
| [1.7.2](#desktop-v1-7-2)   | 2026-10-29       | Windows, macOS (Apple silicon), Linux | 44.9.1                 | 1.0.17                 | Node runs                                |
| [1.7.1](#desktop-v1-7-1)   | 2026-10-28       | Windows, macOS (Apple silicon), Linux | 44.9.1                 | 1.0.17                 | Node runs                                |
| [1.7.0](#desktop-v1-7-0)   | 2026-10-28       | Windows, macOS (Apple silicon)        | 44.9.1 *(source-only)* | 1.0.17 *(source-only)* | Not run: no Linux build                  |
| [1.6.18](#desktop-v1-6-18) | 2026-10-23       | Windows, macOS (Apple silicon), Linux | 44.9.1                 | 1.0.17                 | Node runs, finds peers                   |
| [1.6.17](#desktop-v1-6-17) | 2026-10-20       | Windows, macOS (Apple silicon), Linux | 44.8.0                 | 1.0.17                 | Node runs, finds no peers (old bootnode) |
| [1.6.16](#desktop-v1-6-16) | 2026-10-12       | Windows, macOS (Apple silicon), Linux | 44.5.1                 | 1.0.14                 | Node runs                                |
| [1.6.13](#desktop-v1-6-13) | 2026-07-19       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | 1.0.14                 | Node fails: geth not executable          |
| [1.6.12](#desktop-v1-6-12) | 2026-07-18       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | 1.0.14                 | Node fails: geth not executable          |
| [1.6.11](#desktop-v1-6-11) | 2026-07-17       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | 1.0.11                 | Node fails: geth not executable          |
| [1.6.10](#desktop-v1-6-10) | 2026-07-11       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | 1.0.11                 | Node fails: geth not executable          |
| [1.6.9](#desktop-v1-6-9)   | 2026-07-10       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | 1.0.1                  | Node fails: geth not executable          |
| [1.6.8](#desktop-v1-6-8)   | 2026-07-10       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | 1.0.1                  | Node fails: geth not executable          |
| [1.6.7](#desktop-v1-6-7)   | 2026-07-09       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | 1.0.1                  | Node fails: geth not executable          |
| [1.6.6](#desktop-v1-6-6)   | 2026-07-08       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | 1.0.1                  | Node fails: geth not executable          |
| [1.6.5](#desktop-v1-6-5)   | 2026-07-08       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | 1.0.1                  | Node fails: geth not executable          |
| [1.6.4](#desktop-v1-6-4)   | 2026-07-08       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | 1.0.1                  | Node fails: geth not executable          |
| [1.6.3](#desktop-v1-6-3)   | 2026-06-25       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | —                      | Node fails: geth not executable          |
| [1.6.2](#desktop-v1-6-2)   | 2026-06-12       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | —                      | Node fails: geth not executable          |
| [1.6.1](#desktop-v1-6-1)   | 2026-06-03       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | —                      | Node fails: geth not executable          |
| [1.6.0](#desktop-v1-6-0)   | 2026-06-01       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | —                      | Node fails: geth not executable          |
| [1.5.6](#desktop-v1-5-6)   | 2026-06-01       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | —                      | Node fails: geth not executable          |
| [1.5.5](#desktop-v1-5-5)   | 2026-06-01       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | —                      | Node fails: geth not executable          |
| 1.5.4                      | 2026-06-01 (tag) | None: tag only; shipped in 1.5.5      | —                      | —                      | Not run: no release                      |
| [1.5.3](#desktop-v1-5-3)   | 2026-05-31       | Windows, macOS (Apple silicon), Linux | 42.3.0                 | —                      | Node fails: geth not executable          |
| [1.5.2](#desktop-v1-5-2)   | 2026-05-31       | Linux (AppImage only)                 | 42.3.0                 | —                      | Node fails: geth not executable          |
| [1.5.1](#desktop-v1-5-1)   | 2026-05-31       | Windows, Linux                        | 42.3.0                 | —                      | Node fails: geth not executable          |
| [1.5.0](#desktop-v1-5-0)   | 2026-05-31       | Linux (AppImage only)                 | 42.3.0                 | —                      | Node fails: geth not executable          |
| [1.4.0](#desktop-v1-4-0)   | 2026-05-30       | Windows, Linux                        | 42.3.0                 | —                      | App starts; no geth bundled              |
| [1.3.0](#desktop-v1-3-0)   | 2026-05-30       | Windows, Linux                        | 42.3.0                 | —                      | App starts; no geth bundled              |
| [1.2.0](#desktop-v1-2-0)   | 2026-05-28 (tag) | None: tag only                        | —                      | —                      | Not run: no release                      |

::: warning Linux, 1.5.0 to 1.6.13
In these releases the bundled Linux `geth` is not marked executable, so the node never starts on Linux: the app logs `spawn … geth EACCES`. Fixed in [1.6.16](#desktop-v1-6-16). Every Linux build from 1.5.0 to 1.6.13 was run for this page and failed the same way.
:::

## Desktop: Building from Source {#desktop-building}

| From   | Requirement                                                                                                                                                                             |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.7.4  | Building the Windows installer also needs Go, for the helper that stops geth cleanly on Windows. *(source-only)*                                                                        |
| 1.6.17 | Node.js 24.15 or newer (`.nvmrc` pins 24); Node.js 22.22.2 or newer works with a warning. npm 12.2 or newer, through Corepack. See [Requirements](/docs/app/installation#requirements). |
| 1.2.0  | No Node.js or npm version is declared.                                                                                                                                                  |

## Desktop 1.7.4 — Obsidian {#desktop-v1-7-4}

Released 2026-10-30.

- **Fixed** **Settings → Network → Connected peers** shows the node's real peer count. Before, it always read 14 ([CointMU-App#98](https://github.com/Cointmu-ORG/CointMU-App/issues/98)).
- **Fixed** on Windows, geth is stopped cleanly when CointMU quits, when the app process dies, and before an update is installed, so the chain database is not left damaged or locked ([CointMU-App#97](https://github.com/Cointmu-ORG/CointMU-App/issues/97)). *(source-only)*

## Desktop 1.7.3 — Garnet {#desktop-v1-7-3}

Released 2026-10-29.

- **Removed** network selection: custom networks, the RPC endpoint field in **Settings → Network**, and editing the chain ID in **Settings → About**. **Settings → Network** shows CointMU Mainnet as a read-only network.
- **Removed** the "testnet" label next to the version in the sidebar.
- **Changed** updates are downloaded from [Cointmu-ORG/CointMU-App](https://github.com/Cointmu-ORG/CointMU-App/releases). Older installs still reach it through GitHub's redirect from the old repository. *(source-only)*
- **Fixed** more kinds of chain database damage (legacy receipts, freezer inconsistencies) start [self-healing](/docs/app/node#self-healing). *(source-only)*
- **Fixed** the danger zone card in Settings in dark mode. *(source-only)*

## Desktop 1.7.2 — Jade {#desktop-v1-7-2}

Released 2026-10-29.

- **Changed** the Linux AppImage runs geth from a copy in `<userData>/geth-bin/`, outside the AppImage's mount, so geth can still shut down cleanly if the app process dies. *(source-only)*
- **Changed** on Linux and macOS, the watcher that stops geth when the app process dies runs as a shell script. *(source-only)*

## Desktop 1.7.1 — Onyx {#desktop-v1-7-1}

Released 2026-10-28.

- First Linux release of the 1.7.0 changes. No app changes since 1.7.0; only the release process was fixed.

## Desktop 1.7.0 — Quartz {#desktop-v1-7-0}

Released 2026-10-28, titled "1.7.0-rc1" on GitHub, for Windows and macOS only. There is no Linux build of 1.7.0; Linux users got these changes in 1.7.1.

- **Added** **Settings → Network → Bootnodes**: see the active bootnodes, enter up to 10 of your own, or reset to the default. See [Bootnodes](/docs/app/settings#bootnodes).
- **Added** the Explorer says when the node is offline, and suggests starting it or enabling RPC.
- **Changed** the rest of the interface is translated: security and wallet dialogs, the Explorer, mining logs, notifications and dashboard activity. Native dialogs follow the interface language.
- **Changed** error reports wait on your computer until you close the error reporting notice, and the panel shows what is and is not sent.
- **Changed** geth is stopped when the app process dies, and a geth left running by an earlier app process is stopped at startup. *(source-only)*
- **Removed** the mining **Mode** setting (solo or pool), which nothing read.

## Desktop 1.6.18 — Medusa {#desktop-v1-6-18}

Released 2026-10-23.

- **Breaking** the network moved to a new bootnode. 1.6.17 and older look for the old one and find no peers.
- **Added** **Settings → Privacy & Diagnostics**: error reports, on by default, with a first-run notice, a list of reports waiting to be sent, and a switch to turn them off. Logs are saved on your computer with secrets, addresses, IP addresses and user names removed; **Open logs folder** and **Copy recent logs** help with bug reports. See [Privacy & Diagnostics](/docs/app/settings#privacy-diagnostics).
- **Added** when the node has no peers, the Mining page says whether the bootnode is unreachable (connect to the campus network or VPN) or reachable without peers.
- **Added** when automatic recovery stops, the banner names the kind of failure and shows the node's last error. On Windows it explains access-denied and reserved-port failures (Windows part *source-only*).
- **Removed** **Send anonymous analytics** from **Settings → Advanced**. It did nothing (*source-only*).
- **Fixed** the node picks a P2P port that is free on both TCP and UDP. *(source-only)*

## Desktop 1.6.17 — Siren {#desktop-v1-6-17}

Released 2026-10-20.

- **Added** the Mining page shows sync progress: the block being synced, the highest block, the percentage and the time left.
- **Added** [self-healing](/docs/app/node#self-healing): when the chain database is damaged, the node is restarted up to three times, then the damaged data is moved aside and the chain resynced, with each stage shown in a banner and a **Retry** button when it stops.
- **Added** only one CointMU can run at a time; starting it again brings the open window to the front. *(source-only)*
- **Changed** the node's HTTP RPC serves only `eth`, `net` and `web3` (1.6.16 also served `admin`, `miner` and `personal`), and no longer accepts calls from websites (*source-only*). The app reaches the node's other APIs over a private local connection (*source-only*).
- **Changed** the browser extension must be paired: the app asks you to approve it, then accepts requests only from that extension. Bundles extension 1.0.17. *(source-only)*
- **Fixed** when the P2P port 30303 or Geth's engine API port is taken, the node uses the next free port. *(source-only)*
- Building from source needs Node.js 24.15 or newer and npm 12.2 or newer; see [Building from Source](#desktop-building).

## Desktop 1.6.16 — Kitsune {#desktop-v1-6-16}

Released 2026-10-12. There is no 1.6.14 or 1.6.15 release.

- **Added** **Reset to defaults** in Settings asks for confirmation first.
- **Changed** **Max** in the send dialog keeps 1 CMU for the network fee, instead of 1% of the balance. *(source-only)*
- **Changed** Electron 42 to 44.
- **Fixed** on Linux, the bundled geth is executable, so the node starts; see [Platforms and Bundled Components](#desktop-platforms).
- **Fixed** resetting settings also clears old notifications, and the Reveal, Export and Reset dialogs in Security follow dark mode. *(source-only)*

## Desktop 1.6.13 — Rhea {#desktop-v1-6-13}

Released 2026-07-19.

- **Added** Japanese (日本語) as an interface language.
- **Added** dark mode across the whole app, including the sign-in screens and notifications. *(source-only)*
- **Added** deleting a hidden account asks for confirmation, and warns when the account still holds a small balance.

## Desktop 1.6.12 — Mnemosyne {#desktop-v1-6-12}

Released 2026-07-18.

- Bundles extension 1.0.14; see [Browser Extension 1.0.14](#extension-v1-0-14). No other user-facing changes.

## Desktop 1.6.11 — Nike {#desktop-v1-6-11}

Released 2026-07-17.

- No user-facing changes; the app's code was reorganized.

## Desktop 1.6.10 — Hera {#desktop-v1-6-10}

Released 2026-07-11.

- Bundles extension 1.0.11, the first with a standalone mode; see [Browser Extension 1.0.11](#extension-v1-0-11).

## Desktop 1.6.9 — Hecate {#desktop-v1-6-9}

Released 2026-07-10.

- **Changed** the version number no longer contains the codename (1.6.9, not 1.6.9-Hecate).
- **Changed** **Settings → About** groups update checks under **Software updates**. *(source-only)*

## Desktop 1.6.8 — Aphrodite {#desktop-v1-6-8}

Released 2026-07-10.

- No user-facing changes; the update changes only affect development builds. *(source-only)*

## Desktop 1.6.7 — Persephone {#desktop-v1-6-7}

Released 2026-07-09.

- **Added** **Settings → Connected Sites**: whether the browser extension is linked, and the sites it has connected, with **Revoke**.
- **Added** the app asks before the browser extension links to your wallet (*Extension Link Request*).
- **Added** custom networks in **Settings → Network** (**Add Custom Network**). Removed again in 1.7.3.
- **Added** **Settings → Advanced → Remove secondary accounts**.
- **Added** the app's own title bar, with minimize and close buttons.
- The bundled extension is still 1.0.1.

## Desktop 1.6.6 — Demeter {#desktop-v1-6-6}

Released 2026-07-08.

- **Changed** automatic updates include prereleases. *(source-only)*

## Desktop 1.6.5 — Hestia {#desktop-v1-6-5}

Released 2026-07-08.

- **Added** interface languages: English, Bahasa Indonesia, Español, 中文, Русский and Deutsch, chosen in **Settings → General → Language**.

## Desktop 1.6.4 — nemesis {#desktop-v1-6-4}

Released 2026-07-08.

- **Added** the companion browser extension (1.0.1), bundled with the app and exported from **Settings → External Sources → Download ZIP**. In installed builds the button does nothing ([CointMU-App#103](https://github.com/Cointmu-ORG/CointMU-App/issues/103)); reproduced on 1.7.3 and 1.7.4, *source-only* for 1.6.4.
- **Added** websites connected through the extension can ask for your address, with an approval dialog in the app. *(source-only)*
- **Added** an NFTs tab in the wallet, for ERC-721 and ERC-1155 tokens. *(source-only)*
- **Added** mining activity: a 30-day contribution heat map and the blocks you mined. *(source-only)*
- **Changed** updates download automatically again, and install on restart. *(source-only)*

## Desktop 1.6.3 — selene {#desktop-v1-6-3}

Released 2026-06-25.

- **Added** sending ERC-20 tokens, and importing a token by contract address. *(source-only)*
- **Added** an address page in the Explorer, and generated avatars for accounts. *(source-only)*
- **Changed** the Dashboard shows network health, your recent activity and the latest blocks. *(source-only)*

## Desktop 1.6.2 — nyx {#desktop-v1-6-2}

Released 2026-06-12.

- **Breaking** the chain ID changed from `7012` to `1912`, with a new genesis block. *(source-only)*

## Desktop 1.6.1 — artemis {#desktop-v1-6-1}

Released 2026-06-03.

- **Added** importing an account from a keystore JSON file, at first start or as an extra account. *(source-only)*
- **Added** Settings panels for Advanced, Security (auto-lock, recovery phrase, hardware wallet placeholders) and Notifications. *(source-only)*
- **Fixed** a quick second press on **Send** could send twice. Sent transactions show as pending in the history until they are confirmed. *(source-only)*

## Desktop 1.6.0 — Athena {#desktop-v1-6-0}

Released 2026-06-01.

- **Added** revealing an account's private key after entering your password. *(source-only)*
- **Changed** updates no longer download on their own: **Settings → About → Check for Updates** checks, and you choose to download. *(source-only)*

## Desktop 1.5.6 — Lynx {#desktop-v1-5-6}

Released 2026-06-01.

- **Added** Explorer pages for blocks, transactions and addresses, reached from one search box. *(source-only)*
- **Added** the Mining log shows geth's own output as it runs. *(source-only)*
- **Added** **Settings → About**, with the app version, chain settings and project links. *(source-only)*

## Desktop 1.5.5 — WhiteSpruce {#desktop-v1-5-5}

Released 2026-06-01. Includes the changes of the 1.5.4 tag, which was never released.

- **Added** wallet history across all your accounts, with paging. *(source-only)*
- **Changed** installer file names start with the platform: `linux-cointmu-desktop-<version>-installer.deb`, `macos-…`, `windows-…`.

## Desktop 1.5.3 — pouch {#desktop-v1-5-3}

Released 2026-05-31.

- **Added** macOS builds for Apple silicon (`.dmg` and `.zip`, not notarized). The node does not start on them ([CointMU-App#102](https://github.com/Cointmu-ORG/CointMU-App/issues/102)). *(source-only)*

## Desktop 1.5.2 — gcsa {#desktop-v1-5-2}

Released 2026-05-31, as a Linux AppImage only.

- **Added** mining statistics: session timer, hashrate chart and found blocks. *(source-only)*
- **Added** the Dashboard's network health panel and latest blocks. *(source-only)*
- **Fixed** the mining session timer survives switching pages. *(source-only)*

## Desktop 1.5.1 — grizzly {#desktop-v1-5-1}

Released 2026-05-31.

- **Added** the CointMU app icon. *(source-only)*
- Windows installer and `.deb` package are back.

## Desktop 1.5.0 — alaska {#desktop-v1-5-0}

Released 2026-05-31, as a Linux AppImage only.

- **Added** a bundled geth (1.10.26) for Linux and Windows, so the app can run its own node. On Linux it is not executable and the node fails to start, until 1.6.16; the Windows build is *source-only*.
- **Added** wallet tabs for activity and ERC-20 token balances. *(source-only)*
- **Added** the Explorer's chain timeline, network statistics and search. *(source-only)*
- **Changed** first start is a step-by-step setup to create or import a wallet. *(source-only)*

## Desktop 1.4.0 — dino {#desktop-v1-4-0}

Released 2026-05-30.

- **Added** the Windows installer lets you choose the install folder, and shows a license. *(source-only)*
- **Added** automatic updates from GitHub Releases. *(source-only)*
- The node still does not start: no geth is bundled.

## Desktop 1.3.0 — nebula {#desktop-v1-3-0}

Released 2026-05-30. The first release with installers: Windows (NSIS), Linux AppImage and `.deb`.

- Dashboard, Wallet, Mining, Explorer and Settings pages *(source-only)*, and a first-start screen to create or import a wallet.
- The node does not start: no geth is bundled, and the app reports *Geth binary not found*.
- Chain ID `7012`. *(source-only)*

## Desktop 1.2.0 — tvrstsp {#desktop-v1-2-0}

Tagged 2026-05-28. A tag only, with no GitHub release and no installers.

## Desktop: Before 1.2.0 {#desktop-before-1-2-0}

Versions 1.0.0 and 1.1.0-aries exist only as untagged commits from 2026-05-28, with no releases, so they are not listed here.

## Browser Extension

The extension is not published on the Chrome Web Store or as its own GitHub release. Each desktop release bundles one extension version; versions that were never bundled in a release are not listed.

## Extension: Latest {#extension-latest}

| Version | Bundled with desktop |
| ------- | -------------------- |
| 1.0.17  | 1.6.17 to 1.7.4      |

::: danger
**Download ZIP**, the only way the desktop app hands out the extension, does nothing in installed builds. See [CointMU-App#103](https://github.com/Cointmu-ORG/CointMU-App/issues/103) and [Getting the Extension](/docs/app/extension#getting-the-extension).
:::

## Extension: Breaking Changes and Removals {#extension-breaking}

| Version | Change                                                                                                             | What to do                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| 1.0.17  | In linked (desktop) mode, websites can no longer sign or send transactions; the extension refuses. *(source-only)* | Use standalone mode to sign. See [Standalone Mode](/docs/app/extension#standalone-mode). |
| 1.0.17  | Desktop 1.6.17 and newer accept the extension only after you approve it once (pairing). *(source-only)*            | Choose **Link to Desktop App** and approve the request in the desktop app.               |

## Extension: Requirements {#extension-requirements}

| From   | Requirement                                                                                                                                               |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.11 | Standalone mode needs no desktop app: an imported private key and a network you add.                                                                      |
| 1.0.1  | A Chrome or Chromium browser that loads Manifest V3 extensions unpacked (developer mode). Linked mode needs the desktop app running on the same computer. |

## Extension 1.0.17 {#extension-v1-0-17}

Bundled with desktop 1.6.17 to 1.7.4.

- **Changed** the extension pairs with the desktop app once, after you approve it there. *(source-only)*
- **Changed** websites get your address and can ask you to sign only after you connect them, and every signing request needs your approval. *(source-only)*
- **Changed** messages between a page and the extension stay within that page's origin. *(source-only)*
- **Removed** signing in linked (desktop) mode. *(source-only)*
- **Changed** from desktop 1.7.0, the popup is shown in the browser's language. The version number did not change. *(source-only)*

The stored keys in standalone mode are not encrypted ([CointMU-App#107](https://github.com/Cointmu-ORG/CointMU-App/issues/107)), and the background sends them to any part of the extension that asks ([CointMU-App#109](https://github.com/Cointmu-ORG/CointMU-App/issues/109)). Both are open in 1.0.17.

## Extension 1.0.14 {#extension-v1-0-14}

Bundled with desktop 1.6.12 to 1.6.16.

- **Added** **Edit** and **Delete** for networks you added, and a check that the chain ID is a number. *(source-only)*
- **Changed** a network whose RPC does not answer shows as offline instead of an error. *(source-only)*
- **Changed** an RPC URL of `http://localhost` without a port is sent to port 8545. The desktop node listens on 8585, so enter `http://127.0.0.1:8585` instead ([CointMU-App#105](https://github.com/Cointmu-ORG/CointMU-App/issues/105)). *(source-only)*

## Extension 1.0.11 {#extension-v1-0-11}

Bundled with desktop 1.6.10 and 1.6.11.

- **Added** standalone mode: import a private key, add your own networks, and sign in the extension, with an approval window for each request. *(source-only)*

## Extension 1.0.1 {#extension-v1-0-1}

Bundled with desktop 1.6.4 to 1.6.9.

- First bundled version. Adds an Ethereum provider (`window.ethereum`) to web pages and forwards requests to the desktop app over a local connection. *(source-only)*

## Codenames

Every desktop release has a codename. Up to 1.6.8 it was part of the version number (1.6.8-Aphrodite); from 1.6.9 it is separate (1.6.9, codename Hecate). The extension has no codenames.
