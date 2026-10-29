# Changelog

<!--
Updating this page for a new CLI release:
1. Draft the entry: node scripts/draft-changelog.mjs <path-to-CointMU-CLI>
   (or set CMU_CLI_REPO). It prints a draft and writes nothing.
2. Rewrite the draft for users: what changed in commands, flags, output and
   requirements. Check each line against the tagged build, not the commit title.
3. Paste it above the previous newest version.
4. Update the Latest table (version, codename, date).
5. Add rows to Breaking Changes, Deprecations or Node.js Requirements if the
   release has any.
-->

Every release of the CointMU CLI published to npm as [`cointmu-cli`](https://www.npmjs.com/package/cointmu-cli), newest first. Dates are npm publish dates (UTC).

## Latest

| Version | Codename | Released   |
| ------- | -------- | ---------- |
| 1.7.3   | Monsun   | 2026-10-19 |

Upgrade an existing install:

```bash
cmu update
```

Install, or repair an install that `cmu update` cannot fix:

```bash
npm install -g cointmu-cli@latest
```

::: warning
Install `cointmu-cli` only. The unscoped `cmu-cli` package on npm belongs to an unrelated project and is not this CLI. Both install a `cmu` command, so check with `cmu version` that the codename and version match this page.
:::

::: info
On 1.3.2 or older, `cmu update` installs from git, which npm 12 refuses with `EALLOWGIT`. Run `npm install -g cointmu-cli@latest` once; from then on `cmu update` installs from the registry. See [Install Failures](/docs/cli/update#install-failures).
:::

This table is updated by hand with each release. To see what the registry holds right now, run `npm view cointmu-cli version`; to see what you have installed, run [`cmu version`](/docs/cli/version).

## Breaking Changes and Removals

| Version | Change                                                                                                                | What to do                                                                                                                |
| ------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1.6.0   | `cmu wallet login` and `cmu wallet create --login` removed. Both exit `1` before any prompt.                          | `cmu wallet save <name>` then `cmu wallet use <name>`, or `cmu wallet create --save <name>` then `cmu wallet use <name>`. |
| 1.3.8   | `cmu explorer` returns as a different command: read-only block and contract lookups over RPC.                         | `cmu explorer --block <number>` or `cmu explorer --contract <address>`. See [cmu explorer](/docs/cli/explorer).           |
| 1.3.7   | `cmu create -t nft` no longer resolves.                                                                               | Use `cmu create -t erc721`.                                                                                               |
| 1.3.7   | `cmu explorer open` removed. It always opened `http://localhost:3000`, whatever the project configured.               | Open your explorer URL directly.                                                                                          |
| 1.3.6   | `cmu deploy`, `cmu compile` and `cmu test` ask before running project code. Without a terminal they exit `1`.         | Pass `-y, --yes` in CI and other non-interactive runs.                                                                    |
| 1.3.5   | Node.js 18 is no longer supported.                                                                                    | Upgrade Node.js. See [Node.js Requirements](#node-js-requirements).                                                       |
| 1.3.3   | New session passwords must be at least 12 characters (was 6) and pass a strength check. Existing sessions still open. | Choose a longer password the next time you create a session.                                                              |
| 1.3.2   | Sessions are encrypted with AES-256-GCM. A `.cmu-session` written by 1.3.1 cannot be opened.                          | Create the session again. On 1.6.0 that is `cmu wallet save <name>` then `cmu wallet use <name>`.                         |

## Deprecations

| Deprecated in | Feature                                                   | Replacement                                                      | Removal           |
| ------------- | --------------------------------------------------------- | ---------------------------------------------------------------- | ----------------- |
| 1.5.0         | `cmu wallet login`, `cmu wallet create --login`           | `cmu wallet save` + `cmu wallet use`, `cmu wallet create --save` | Removed in 1.6.0  |
| 1.3.6         | `cmu network --save`, `--use`, `--list`, `--delete` flags | `cmu network save`, `use`, `list`, `delete` subcommands          | Not scheduled     |

The network flags still work and print a deprecation warning naming the replacement. Until 1.7.1 the warning said they would be removed in 2.0.0; since [1.7.2](#v1-7-2) it names no removal release. See [Deprecated Flags](/docs/cli/network#deprecated-flags).

## Node.js Requirements

| From  | Requirement                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------- |
| 1.3.7 | Node.js 20.12.0 or newer. `cmu node start` and `cmu test` need Node.js 22 or newer.             |
| 1.3.5 | Node.js 20 or newer, checked at startup with a readable error instead of a failure mid-command. |
| 1.3.1 | Node.js 18 or newer.                                                                            |

## 1.7.3 — Monsun {#v1-7-3}

Released 2026-10-19.

- **Fixed** on Windows, `cmu create`, `cmu test`, `cmu deploy` with TypeScript scripts, `cmu audit` and `cmu update` failed with `spawn EINVAL` or `ENOENT`, because current Node.js refuses to start npm's `.cmd` shims without a shell. They now run npm's own `npm-cli.js` / `npx-cli.js` with the Node.js running `cmu`, still without a shell. **Not verified on Windows** for these docs; checked on Linux only.
- **Fixed** `cmu audit` exits `1` with `npm could not be started: ...` when npm or npx cannot start, instead of printing both `reported issues` warnings, `Audit complete.` and exiting `0`. See [cmu audit](/docs/cli/audit#output).
- **Fixed** `cmu update` says `npm could not be started: ...` with a hint when npm cannot start, instead of the bare spawn error.

## 1.7.2 — Halo {#v1-7-2}

Released 2026-10-18.

- **Changed** `cmu network ping`, `cmu wallet balance` and `cmu mine start`, `stop` and `status` check the endpoint first, like `cmu deploy --ping`: they print `Pinging <url>...` and `Connected to '<name>' (chain ID <id>).`, and an unreachable node fails within 3 seconds with `RPC endpoint <url> is unreachable (timed out after 3000ms).` instead of ethers' retry notice and raw error. `cmu wallet balance` no longer prints `Connecting to <name> (<url>)...`.
- **Changed** RPC URLs are masked wherever they are printed, errors and `-v` output included: the password, a lone username and every query value become `***`. A key in the URL path is not masked. See [Credentials in RPC URLs](/docs/cli/network#credentials-in-rpc-urls).
- **Changed** `~/.cmu-networks.json` is written with `0600` permissions and replaced atomically. A file written `0644` by an older `cmu` is tightened on its next write.
- **Changed** `cmu network delete local` is refused: `network 'local' is the built-in fallback and cannot be deleted.` `cmu wallet use` warns when it falls back to a `local` that is not saved.
- **Changed** `cmu mine status` shows `Etherbase : n/a` on a node without the miner API, such as the DevNet, instead of its placeholder address marked `rewards go there`. Block ages over a day are shown in days (`d`).
- **Changed** `Ctrl+C` or `Ctrl+D` at a prompt of `cmu wallet save`, `create --save`, `use` or `delete` exits with what was left alone, such as `aborted: nothing was saved.`, instead of inquirer's `User force closed the prompt with SIGINT`. See [cmu wallet](/docs/cli/wallet).
- **Changed** the `cmu network --save`, `--use`, `--list` and `--delete` deprecation warning no longer says the flags will be removed in 2.0.0. No removal release is scheduled.
- **Changed** `cmu version` and `cmu --version` take about 0.1 s instead of about 1 s: the solc and ethers versions are recorded at build time.
- **Fixed** color codes follow `NO_COLOR` and `FORCE_COLOR`, and are no longer written to pipes and files. See [Color Output](/docs/cli/overview#color-output).

## 1.7.1 — Lightning {#v1-7-1}

Released 2026-10-15.

- **Changed** `cmu wallet use` asks before replacing a `.cmu-session` it cannot open (written by cmu 1.3.1 or older) or parse, and on yes keeps a copy as `.cmu-session.bak-<time>`. Before, it replaced such a file without asking. `cmu wallet save --session` explains such a file instead of saying it holds no key. See [Sessions cmu Cannot Open](/docs/cli/wallet#sessions-cmu-cannot-open).
- **Changed** projects from `cmu create` also ignore `.cmu-session.*.tmp` and `.cmu-session.bak-*`.
- **Fixed** `cmu deploy` and `cmu console` exit `1` with `cannot prompt for the session password in a non-interactive session.` when they need the session password and stdin is not a terminal, instead of waiting forever.
- **Fixed** `cmu mine start` and `cmu mine status` work on a geth node with no etherbase set; `status` shows `Etherbase : none set`. Before, both failed with a raw `could not coalesce error`.

## 1.7.0 — Rainbow {#v1-7-0}

Released 2026-10-15.

- **Added** a coin symbol per saved network: `cmu network save <url> --name <name> --symbol <SYMBOL>`, 1-11 letters or digits, stored as typed. Saving again without `--symbol` keeps it, and the output says `symbol <SYMBOL> kept`. See [Coin Symbol](/docs/cli/network#coin-symbol).
- **Changed** `cmu wallet balance`, `cmu wallet transfer`, `cmu mine status` and the `cmu mine start --watch` status line label amounts with the active network's symbol instead of always `ETH`. `cmu network info` gains a `Symbol` line.
- **Changed** a new `~/.cmu-networks.json` labels `local` as `CMU`. Existing files are not migrated: networks saved without a symbol, including an older `local`, still show `ETH`. Run `cmu network save http://127.0.0.1:8585 --name local --symbol CMU` to switch.
- **Changed** `cmu explorer --contract` prints the balance with a unit: `networks.<name>.symbol` from `cmu.config`, `ETH` if unset, `CMU` without a config. Projects from `cmu create` get `symbol: "CMU"` on both networks. An invalid `symbol` in `cmu.config` stops `cmu explorer`, `cmu console` and `cmu deploy`, like a missing `url`. See [Coin Symbol in cmu explorer](/docs/cli/explorer#coin-symbol).
- **Changed** `cmu node start` lists its accounts as `100 CMU each`.
- **Changed** the `cmu wallet transfer` amount errors no longer name a coin, since the amount is checked before the network is known, and its help reads `Send the network's native coin from the session wallet`.

The symbol is only a label: amounts keep 18 decimals and no value changes.

## 1.6.0 — Cirrus {#v1-6-0}

Released 2026-10-13.

- **Removed** `cmu wallet login` and `cmu wallet create --login`, deprecated since 1.5.0. Both exit `1` and print `removed; use wallet save + wallet use (or wallet create --save)`. A `.cmu-session` written by `login` keeps working with its password. See [Removed: wallet login](/docs/cli/wallet#removed-wallet-login).

## 1.5.3 — Sagu {#v1-5-3}

Released 2026-10-13.

- **Changed** `cmu test` asks for confirmation up front and lists every file in `test/` it is about to run, not just the config file.
- **Changed** `cmu console --no-signer` uses the read-only trust prompt, and its `Signer` line reads `none (--no-signer)`.
- **Changed** after a transfer that was not confirmed in time, `cmu wallet transfer` gives a hint that depends on whether the node has a miner API and is mining, instead of always suggesting `cmu mine start`.
- **Changed** a wrong session password now points at checking the password or `cmu wallet use <name>`, not `cmu wallet login`.
- **Changed** without a terminal, wallet prompts say `run this in a terminal.`; only `wallet login` still suggests `PRIVATE_KEY`.
- **Fixed** `cmu node connect` prints the saved network name instead of `unknown`.
- **Fixed** the error for a network with no `url` names the network and the config file that was loaded.
- **Fixed** the no-miner-API error from `cmu mine` names the network.

## 1.5.2 — Papeda {#v1-5-2}

Released 2026-10-13.

- **Added** `cmu wallet save <name> --session` copies this project's encrypted session key into `~/.cmu-wallets.json` without decrypting it. It is the only way to keep a key made by `create --login`, which was never printed. See [Saving the Session Key](/docs/cli/wallet#saving-the-session-key).
- **Changed** `cmu wallet login`, `cmu wallet create --login` and `cmu wallet use` ask before replacing a session key that is not saved as a named wallet. The default is no; without a terminal they refuse.
- **Fixed** `.cmu-session` is written atomically, so an interrupted write no longer leaves a truncated file.

## 1.5.1 — Rawon {#v1-5-1}

Released 2026-10-13.

- **Added** `cmu deploy` records the contracts its scripts created in `deployments/<network>/<Contract>.json`, and prints a summary. Factory-created contracts and contracts deployed with another key are not seen. See [Deployment Records](/docs/cli/deploy#deployment-records).
- **Added** `getDeployed(name)` in `cmu console` loads a recorded contract after checking the chain still matches the record. See [Loading a Deployed Contract](/docs/cli/console#loading-a-deployed-contract).
- **Added** `cmu explorer --contract` labels an address that a deployment record names.
- **Changed** `cmu compile` also writes `deployedBytecode` to its artifacts. Recompile older artifacts before using `getDeployed`.
- **Changed** projects from `cmu create` no longer have deploy scripts that write `deployments/<Contract>.json`, and their `.gitignore` ignores only `deployments/local/`.

## 1.5.0 — Gudeg {#v1-5-0}

Released 2026-10-13.

- **Added** `cmu wallet create --save <name>` generates a wallet straight into `~/.cmu-wallets.json`. It prints the address and mnemonic once and never prints the private key.
- **Deprecated** `cmu wallet login` and `cmu wallet create --login`. They still work, print a deprecation notice to stderr and are marked deprecated in `--help`. Removed in 1.6.0.
- **Fixed** dependency updates for `adm-zip`, `brace-expansion` and `source-map-js`, which had high-severity advisories.

## 1.4.1 — Titan {#v1-4-1}

Released 2026-10-13.

- **Added** `cmu mine status`: mining state, hashrate, etherbase, latest block, difficulty and the session wallet's balance. It never asks for a password.
- **Added** `cmu mine start --watch` keeps reporting blocks mined by the session wallet and balance changes until Ctrl-C. Mining keeps running after you leave.
- **Changed** `cmu mine start` warns before taking over an etherbase another account is mining to.
- **Changed** `cmu mine start` and `stop` explain a node without the miner API, such as the local DevNet, instead of printing the raw RPC error.

## 1.4.0 — Orion {#v1-4-0}

Released 2026-10-12.

- **Added** named wallets, stored encrypted in `~/.cmu-wallets.json`: `cmu wallet save <name>` (alias `add`), `use <name>`, `list` and `delete <name>`. See [cmu wallet](/docs/cli/wallet).
- **Added** `cmu wallet transfer <to> <amount>` (alias `tf`) sends ETH from the session wallet, with a summary and confirmation. `-y` skips the confirmation. See [cmu wallet transfer](/docs/cli/wallet#cmu-wallet-transfer).

## 1.3.13 — Baku {#v1-3-13}

Released 2026-09-24.

- **Fixed** `cmu node start` rejects an invalid `--port` such as `abc`, `80abc` or `1.5`, instead of quietly binding to 8585 or to a prefix of the value.

## 1.3.12 — Shisa {#v1-3-12}

Released 2026-09-23.

Includes the changes tagged as 1.3.11, which was never published:

- **Changed** `cmu wallet login` and `cmu wallet create --login` keep the active network chosen with `cmu network use`, and print the network they end on. Before, they reset it to `local`.
- **Changed** `cmu version` no longer prints a git commit line. It duplicated `build`.
- **Changed** package links point to the `Cointmu-ORG` GitHub organization.
- **Fixed** `cmu update` explains a tarball `E404` right after a release as a propagation delay and says to retry.

## 1.3.11 — Nue {#v1-3-11}

Tagged 2026-09-23, never published to npm or as a GitHub Release. `cmu update --to 1.3.11` reports it as unavailable. Its changes first shipped in [1.3.12](#v1-3-12).

## 1.3.10 — Komainu {#v1-3-10}

Released 2026-09-22.

- **Fixed** `cmu node start` and `cmu test` work on npm installs. Every earlier npm release failed with `HHE4: Config file .../hardhat.config.js not found`.
- **Fixed** deploy scripts generated by `cmu create` exit non-zero on failure, so `cmu deploy` stops at the failing script instead of reporting success. Applies to newly created projects.
- **Fixed** `cmu console --no-signer` is read-only whatever the key source. A key in `.env`, the environment or `cmu.config.ts` no longer gets a signer attached.
- **Fixed** `cmu deploy --config` prints `Deployer : unavailable (no key)` instead of failing when the only key is in a locked session.
- **Fixed** `cmu deploy` rejects a network with an empty URL before pinging it, and `--ping` reports the resolved network name.
- **Changed** `cmu compile` and `cmu explorer` use a trust prompt that no longer claims a `PRIVATE_KEY` is injected.

## 1.3.9 — Kirin {#v1-3-9}

Released 2026-09-22.

- **Fixed** `cmu create` aborted with `Prompt type "list" is not registered` at its first menu on every earlier npm release.

## 1.3.8 — Ryu {#v1-3-8}

Released 2026-09-21.

- **Added** `cmu console`, an interactive REPL against the configured network with `provider`, `signer`, `ethers` and `getContract(name, address)` preloaded. `--no-signer` starts read-only. See [cmu console](/docs/cli/console).
- **Added** `cmu explorer --block <number>` and `cmu explorer --contract <address>`, read-only lookups over RPC. This replaces the `cmu explorer open` removed in 1.3.7. See [cmu explorer](/docs/cli/explorer).

## 1.3.7 — Argus {#v1-3-7}

Released 2026-09-21.

- **Removed** `cmu explorer open`. See [1.3.8](#v1-3-8) for its replacement.
- **Removed** the `nft` template alias. `cmu create -t nft` no longer resolves; use `cmu create -t erc721`, which it pointed at.
- **Changed** requires Node.js 20.12.0 or newer. `cmu node start` and `cmu test` require Node.js 22 or newer and say so, instead of failing on a missing native module.
- **Changed** `-v, --verbose` is a program-level option. `cmu -v <command>` and `cmu <command> -v` both work.
- **Added** `cmu node start --allow-cors`. Without it the DevNet RPC rejects browser requests.
- **Changed** `cmu node start` reports a busy port as an error instead of trying to kill the process holding it. It no longer serves `ws://`.
- **Changed** `cmu node start` serves the ten accounts it prints, on chain ID 1912, and `cmu test` runs on chain ID 1912 with its `PRIVATE_KEY` account funded. On npm installs both commands only start working in [1.3.10](#v1-3-10).
- **Fixed** `cmu test` and `cmu node start` no longer hide module-resolution errors, such as a missing `ethers` or a bad import.

## 1.3.6 — Hydra {#v1-3-6}

Released 2026-09-15.

- **Added** `cmu deploy`, `cmu compile` and `cmu test` list the project files they are about to execute and ask for confirmation. `-y, --yes` skips the prompt; without a terminal and without `--yes` they exit `1`.
- **Added** `cmu network save`, `list`, `use` and `delete` subcommands.
- **Deprecated** the `cmu network --save`, `--use`, `--list` and `--delete` flags. They print a warning and are planned for removal in 2.0.0.
- Since [1.7.2](#v1-7-2) the warning names no removal release, and none is scheduled.
- **Added** `cmu wallet create --login` generates a wallet straight into an encrypted session without printing the key or mnemonic. Removed in 1.6.0.
- **Changed** `cmu network --save` only accepts `http://` and `https://` URLs.
- **Changed** `cmu node start` warns before binding to a non-loopback `--host`.
- **Changed** `cmu create` leaves the mainnet RPC URL empty for you to fill in, instead of a plain-HTTP endpoint.
- **Changed** messages use `error:`, `warning:` and `hint:` labels, and printed errors show your home directory as `~`.

## 1.3.5 — Cerberus {#v1-3-5}

Released 2026-09-15.

- **Changed** requires Node.js 20 or newer, checked at startup.
- **Fixed** `cmu update` explains npm's `EALLOWGIT` refusal and prints the one-time `npm install -g cointmu-cli@latest` that gets past it.

## 1.3.4 — Griffin {#v1-3-4}

Released 2026-09-15.

No user-facing changes. A re-release of 1.3.3 with the same code.

## 1.3.3 — Griffin {#v1-3-3}

Released 2026-09-15.

- **Changed** `cmu update` installs from the npm registry instead of the GitHub repository, prints the current and target versions, and takes `--to <version>` to pin a published version. See [cmu update](/docs/cli/update).
- **Added** `cmu test --allow-cors`. Without it the test RPC proxy rejects browser requests.
- **Changed** session passwords must be at least 12 characters and pass a strength check. `.cmu-session` is written with mode `0600`.
- **Changed** projects from `cmu create` add `.cmu-session` and `.cmu-networks.json` to `.gitignore`.
- **Fixed** `cmu deploy` in TypeScript projects failed with `Cannot find module 'typescript@5'`.
- **Fixed** `cmu version` showed `build: unknown` on npm installs.

## 1.3.2 — Kitsune {#v1-3-2}

Released 2026-09-02.

- **Added** `cmu deploy` uses the key in `.cmu-session` when no `PRIVATE_KEY` or config key is set, asking for the session password once per run.
- **Changed** sessions are encrypted with AES-256-GCM. A `.cmu-session` written by 1.3.1 cannot be opened; log in again.
- **Fixed** `cmu compile` no longer resolves imports from sibling directories whose names start with the project's directory name.

## 1.3.1 — Phoenix {#v1-3-1}

Released 2026-09-02.

- First release on npm, as `cointmu-cli`. Requires Node.js 18 or newer.
- Known issues, fixed later: `cmu create` aborts at its first menu (fixed in [1.3.9](#v1-3-9)), and `cmu node start` and `cmu test` fail with `HHE4` (fixed in [1.3.10](#v1-3-10)).

## Before 1.3.1

Tags `v1.1.0-aries` through `v1.3.0` were built from source under the package name `cmu-cli` and never published to npm, so they are not listed here.

::: warning
The `cmu-cli` package on npm is an unrelated project, not an early release of this CLI. Install `cointmu-cli` only.
:::

## Codenames

Each release has a codename, printed by [`cmu version`](/docs/cli/version). Griffin was used three times: on the unpublished 1.3.0, and on 1.3.3 and its same-code re-release 1.3.4. Every other release has its own name.
