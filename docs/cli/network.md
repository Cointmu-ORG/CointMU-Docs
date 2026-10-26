# cmu network

`cmu network` manages the RPC networks saved on the machine and controls which one the active wallet session points at.

## Usage

```bash
cmu network <subcommand> [options]
```

## Subcommands

| Subcommand                          | Description                                        |
| ----------------------------------- | -------------------------------------------------- |
| `cmu network save <url> --name <n>` | Save a new network or update an existing one. `--symbol` sets its [coin symbol](#coin-symbol). |
| `cmu network list`                  | List all saved networks.                           |
| `cmu network use <name>`            | Switch the active network.                         |
| `cmu network delete <name>`         | Delete a saved network.                            |
| `cmu network info`                  | Show the active network.                           |
| `cmu network ping [name]`           | Ping a network to check connectivity and latency.  |

Running `cmu network` with no subcommand lists the saved networks, exactly as `cmu network list` does.

::: tip
`-v, --verbose` is a global flag declared on `cmu` itself, so it works anywhere on the line — `cmu -v network list`, `cmu network -v list` and `cmu network list -v` are equivalent.
:::

## Which Network a Command Uses

There are two independent ways a command picks its network. The saved networks managed on this page, with the active one recorded in the project's `.cmu-session`, are one. The `networks` and `defaultNetwork` of the project's `cmu.config.ts/js` are the other.

| Command                                                        | Network comes from                                          | `-n` names                      |
| -------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------- |
| `cmu wallet balance`, `cmu wallet info`, `cmu wallet transfer` | The session's `activeNetwork`                               | —                               |
| `cmu mine start`, `cmu mine stop`, `cmu mine status`           | The session's `activeNetwork`                               | —                               |
| `cmu network info`, `cmu network ping`                         | The session's `activeNetwork`, or the name passed to `ping` | —                               |
| `cmu node connect`                                             | `-n`, else the session's `activeNetwork`, else `local`      | A saved network                 |
| `cmu deploy`, `cmu console`, `cmu explorer`                    | `-n`, else `defaultNetwork` in `cmu.config.ts/js`           | A network in `cmu.config.ts/js` |

`cmu network use` therefore has no effect on `cmu deploy`, `cmu console` or `cmu explorer`, and `defaultNetwork` has no effect on `cmu wallet` or `cmu mine`. The [coin symbol](#coin-symbol) that amounts are labelled with comes from the same place as the network. To deploy to a server and mine on it, point both at it: set `defaultNetwork` (or pass `-n`) in the config, and run `cmu network use <name>`.

The same `-n` flag means different things. With a saved network called `geth` that `cmu.config.ts` does not define, `cmu node connect -n geth` connects, while `cmu deploy -n geth` fails:

```bash
error: deploy failed
network 'geth' is not defined in cmu.config.js.
hint: add it under `networks`, or pick one that is already defined.
```

Outside a project, with no `cmu.config.ts/js`, `cmu deploy`, `cmu console` and `cmu explorer` target `http://127.0.0.1:8585` (chain ID `1912`) directly. They do not read the saved `local` entry, so re-saving `local` with another URL does not move them.

---

## cmu network save

Saves a network to the local network store, or overwrites the RPC endpoint of an existing entry with the same name.

### Usage

```bash
cmu network save http://10.64.24.101:8585 --name mainnet
```

### Options

| Flag                | Description                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-n, --name <name>` | Name to save the network under. Required.                                                                                                                  |
| `--symbol <symbol>` | Coin symbol that amounts on this network are labelled with: 1-11 letters or digits, stored as typed. No short form. Since 1.7.0. See [Coin Symbol](#coin-symbol). |

### Behavior

`--name` is required. Omitting it exits with:

```bash
error: network save failed
--name is required.
hint: e.g. `cmu network save http://127.0.0.1:8585 --name local`.
```

The endpoint is validated before anything is written. Only `http:` and `https:` are accepted, because every provider in the CLI is an ethers `JsonRpcProvider` and cannot speak another scheme:

```bash
error: network save failed
invalid RPC endpoint 'ftp://node.example'.
hint: pass a full http:// or https:// URL, e.g. `cmu network save http://127.0.0.1:8585 --name local`.
```

| Endpoint                               | Result                                    |
| -------------------------------------- | ----------------------------------------- |
| `http://127.0.0.1:8585`                | Accepted.                                 |
| `https://user:pw@node.example/rpc?k=1` | Accepted, credentials and query included. |
| `localhost:8545`                       | Rejected — no scheme.                     |
| `http://`                              | Rejected — no host.                       |
| `http://bad host`                      | Rejected.                                 |
| `ftp://node.example`                   | Rejected — only `http:` and `https:`.     |

The endpoint is not contacted when saving, so an unreachable node is accepted. The name is not validated either: any string works, including spaces and `/`.

Saving does not change the active network. Use `cmu network use` to switch to it afterwards.

### Output

```bash
Saved network 'mainnet' (http://10.64.24.101:8585)
```

Since 1.7.0 the line also names the coin symbol: the one passed with `--symbol`, or the one an update kept. A network without a symbol prints the line above, unchanged.

```bash
Saved network 'kampus' (http://127.0.0.1:8585, symbol tCMU)
Saved network 'local' (http://127.0.0.1:8585, symbol CMU kept)
```

### Coin Symbol

Since 1.7.0, each saved network can carry a coin symbol. [`cmu wallet balance`](/docs/cli/wallet#cmu-wallet-balance), [`cmu wallet transfer`](/docs/cli/wallet#cmu-wallet-transfer), [`cmu mine status`](/docs/cli/mine#cmu-mine-status), the [`cmu mine start --watch`](/docs/cli/mine#watching-progress) status line and [`cmu network info`](#cmu-network-info) label amounts with the symbol of the session's active network. Before 1.7.0 every amount said `ETH`.

```bash
cmu network save http://127.0.0.1:8585 --name kampus --symbol tCMU
```

| Saved network                                       | Amounts are labelled                 |
| --------------------------------------------------- | ------------------------------------ |
| Saved with `--symbol`                               | With that symbol, e.g. `100.0 CMU`.  |
| Saved without one, or saved before 1.7.0            | `ETH`, as before.                    |
| `local` in a `~/.cmu-networks.json` created by 1.7.0 | `CMU` — the file is seeded with it. |

The symbol is only a label. Amounts are still read and written with 18 decimals, and `wei` values are unchanged.

- The symbol is stored exactly as typed, so `tCMU` stays `tCMU` and `cmu` is not uppercased.
- Saving an existing network again without `--symbol` keeps its symbol, and the output says `kept`.
- A symbol cannot be removed with `--symbol`. Edit `~/.cmu-networks.json` and delete the `symbol` key to go back to `ETH`.

`--symbol` is checked before anything is written. Anything other than 1-11 ASCII letters or digits is refused, and the file is left untouched:

```bash
error: network save failed
invalid symbol 'C-M' - expected 1-11 letters or digits, e.g. CMU.
hint: e.g. `cmu network save http://127.0.0.1:8585 --name bad --symbol CMU`.
```

::: tip Labelling an existing local network CMU
1.7.0 does not migrate existing files. A `local` entry saved by an older `cmu` keeps showing `ETH` until you give it a symbol:

```bash
cmu network save http://127.0.0.1:8585 --name local --symbol CMU
```

```bash
Saved network 'local' (http://127.0.0.1:8585, symbol CMU)
```

Use the URL already saved for `local` (see `cmu network list`), since `save` also overwrites the endpoint.
:::

`cmu deploy`, `cmu console` and `cmu explorer` do not read this file; they take the network, and its symbol, from `cmu.config.ts/js`. See [Coin Symbol in cmu explorer](/docs/cli/explorer#coin-symbol).

---

## cmu network list

Prints every saved network and marks the active one with `[*]`.

### Usage

```bash
cmu network
cmu network list
```

### Output

```bash

Saved networks
==========================================================================
| Active | Name                 | RPC endpoint
--------------------------------------------------------------------------
| [*]    | local                | http://127.0.0.1:8585
|        | mainnet              | http://10.64.24.101:8585
==========================================================================

```

::: info
If no session file exists, the listing falls back to marking `local` as active. The list itself is still printed in full.
:::

---

## cmu network use

Switches the active network recorded in the current wallet session.

### Usage

```bash
cmu network use mainnet
```

### Requirements

An active wallet session must exist. Without one the command exits with:

```bash
error: network use failed
no active session.
hint: run `cmu wallet use <name>` first, or `cmu wallet create --save <name>` and then `cmu wallet use <name>`.
```

The target network must already be saved. An unknown name exits with:

```bash
error: network use failed
network 'mainnet' is not saved.
hint: list saved networks with `cmu network list`, or add one with `cmu network save <url> --name <name>`.
```

### Behavior

The command rewrites the `activeNetwork` field inside `.cmu-session` in the current working directory and leaves the rest of the session untouched. Every command that reads the session's network — see [Which Network a Command Uses](#which-network-a-command-uses) — uses the new selection immediately.

Because the selection lives in the session, a project needs a session before it can pick a network: run `cmu wallet use <name>` first, then `cmu network use <network>`. The name is checked before the session, so an unknown name is reported even in a project without one.

### Output

```bash
Active network is now mainnet
```

::: info
The selection survives a later [`cmu wallet use`](/docs/cli/wallet#active-network). It carries the session's active network over, and only falls back to `local` if the selected network has since been deleted.
:::

---

## cmu network delete

Removes a network from the saved network store.

### Usage

```bash
cmu network delete staging
```

### Behavior

The command refuses to delete the network currently selected in the session:

```bash
error: network delete failed
network 'local' is currently active and cannot be deleted.
hint: switch away first with `cmu network use <name>`.
```

Switch to a different network with `cmu network use` before deleting. Deleting a name that was never saved exits with `network '<name>' is not saved.`

Only the session in the **current** directory is checked. The saved list is shared by every project on the machine, so deleting a network from one project can remove the network another project's session still points at. That project's commands then fail until it picks another one:

| Command in the other project                        | Message                                       |
| --------------------------------------------------- | --------------------------------------------- |
| `cmu network info`, `cmu network ping`              | `active network '<name>' is no longer saved.` |
| `cmu wallet info`, `cmu wallet balance`, `cmu mine` | `network '<name>' is not saved.`              |

::: warning
In a directory without a session, nothing counts as active for `delete`, so `cmu network delete local` succeeds — even though `cmu network list` marks `local` as active there. `local` is not re-created afterwards, and every fallback to it then fails, including the network a later `cmu wallet use` records. Restore it with `cmu network save http://127.0.0.1:8585 --name local`. Tracked as [CointMU-CLI#212](https://github.com/Cointmu-ORG/CointMU-CLI/issues/212).
:::

### Output

```bash
Deleted network 'staging'
```

---

## cmu network info

Displays the active network name and RPC endpoint resolved from the current session.

### Usage

```bash
cmu network info
```

### Requirements

An active wallet session with a selected network must exist. Each way of not having one is reported separately:

| Condition                              | Message                                             |
| -------------------------------------- | --------------------------------------------------- |
| No `.cmu-session`                      | `no active session.`                                |
| Session has no `activeNetwork`         | `no active network in the session.`                 |
| Selected network no longer saved       | `active network '<name>' is no longer saved.`       |

### Output

```bash
--- Active network ---
Network      : local
RPC endpoint : http://127.0.0.1:8585
Symbol       : CMU
----------------------
```

The `Symbol` line is new in 1.7.0. It shows the network's [coin symbol](#coin-symbol), or `ETH` for a network saved without one.

---

## cmu network ping

Measures round-trip latency to a network by requesting its current block number.

### Usage

```bash
cmu network ping
cmu network ping mainnet
```

### Arguments

| Argument | Description                                                                                 |
| -------- | ------------------------------------------------------------------------------------------- |
| `[name]` | Optional. The saved network to ping. Defaults to the session's active network when omitted. |

### Behavior

When `[name]` is supplied, the network is looked up in the saved network store and no session is required. When it is omitted, the command reads `activeNetwork` from `.cmu-session` and therefore requires an active session.

Latency is measured as the elapsed time around a single `eth_blockNumber` call, so it reflects RPC round-trip time rather than block production speed.

### Output

```bash
Pinging local (http://127.0.0.1:8585)...
--- Ping result ---
Network      : local
Block number : 1482
Latency      : 12ms
-------------------
```

The command exits with code `1` if the endpoint is unreachable. The error is ethers' own, preceded by its retry notice:

```bash
Pinging geth (http://127.0.0.1:18546)...
JsonRpcProvider failed to detect network and cannot start up; retry in 1s (perhaps the URL is wrong or the node is not started)

error: network ping failed
connect ECONNREFUSED 127.0.0.1:18546
```

An endpoint that does not answer at all fails with `request timeout (code=TIMEOUT, version=6.17.0)` instead. Tracked as [CointMU-CLI#214](https://github.com/Cointmu-ORG/CointMU-CLI/issues/214).

---

## Deprecated Flags

Before the subcommands existed, `cmu network` took its actions as flags on the root command. Those flags still work, print a deprecation notice, and run the same handler the subcommand would.

| Deprecated flag       | Replacement                            |
| --------------------- | -------------------------------------- |
| `-s, --save <url>`    | `cmu network save <url> --name <name>` |
| `-u, --use <name>`    | `cmu network use <name>`               |
| `-l, --list`          | `cmu network list`                     |
| `-D, --delete <name>` | `cmu network delete <name>`            |

Each prints, before doing the work:

```bash
warning: `cmu network --save` is deprecated and will be removed in 2.0.0
hint: use `cmu network save <url> --name <name>` instead.
```

::: danger REMOVED IN 2.0.0
These flags are scheduled for removal in `2.0.0`. Migrate scripts and CI pipelines to the subcommand form now.
:::

Only one action runs per invocation. The flags are evaluated in a fixed order and the command returns after the first match:

1. `--save`
2. `--delete`
3. `--use`
4. `--list`

::: warning
`-n, --name` is **not** deprecated — it is how `cmu network save` receives its name, and it is declared on the root command as well as on the subcommand.

A combination that matches none of the four branches falls through to the network listing. In particular `cmu network --name prod`, which is what a forgotten `--save` looks like, prints the saved-network table and exits `0` without saving anything. Check the output for a `Saved network '<name>'` line before assuming a save succeeded, or use the subcommand form, which reports the missing name as an error.
:::

::: info
The delete flag is a **capital** `-D`. A lowercase `-d` is not registered and is rejected as an unknown option.
:::

---

## Network Storage

Saved networks are kept in `.cmu-networks.json` as an array of entries:

| Field    | Description                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------- |
| `name`   | The identifier used by `use` and `delete`.                                                        |
| `rpcUrl` | The JSON-RPC endpoint of the network.                                                             |
| `symbol` | Optional. The [coin symbol](#coin-symbol) amounts are labelled with; `ETH` when absent. Since 1.7.0. |

On first read the file is seeded with a single entry, `local` pointing at `http://127.0.0.1:8585`. Since 1.7.0 the seeded entry has the symbol `CMU`. It is only seeded when the file does not exist, so a deleted `local` stays deleted, and a file created by an older `cmu` keeps its `local` without a symbol.

```json
[
  {
    "name": "local",
    "rpcUrl": "http://127.0.0.1:8585",
    "symbol": "CMU"
  }
]
```

A network saved without `--symbol` is written with `name` and `rpcUrl` only, exactly as before 1.7.0.

A `symbol` edited by hand into something other than 1-11 letters or digits stops the commands that print amounts, and the error names the command that fixes it:

```bash
error: wallet balance failed
network 'local' has an invalid symbol "c m" in ~/.cmu-networks.json - expected 1-11 letters or digits, e.g. CMU.
hint: set it again with `cmu network save http://127.0.0.1:8585 --name local --symbol <SYMBOL>`.
```

Re-saving that network without `--symbol` keeps the broken value and says so (`symbol "c m" kept`), so pass a new `--symbol`.

::: warning
The file is written with your default permissions — `0644` under the usual umask — so other users on the machine can read it. Unlike `~/.cmu-wallets.json` and `.cmu-session`, which are `0600`. Avoid saving endpoints that embed credentials, or restrict the file yourself with `chmod 600 ~/.cmu-networks.json`; saves keep the mode of an existing file. Tracked as [CointMU-CLI#213](https://github.com/Cointmu-ORG/CointMU-CLI/issues/213).
:::

::: info
`.cmu-networks.json` is stored in your **home directory**, not in the project. The saved network list is therefore shared by every CointMU project on the machine. The active network *selection* is not shared — it lives in each project's own `.cmu-session` file.
:::

::: warning
Both `.cmu-networks.json` and `.cmu-session` are listed in the `.gitignore` generated by `cmu create`. Do not commit either file to version control.
:::
