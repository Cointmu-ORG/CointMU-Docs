# cmu network

`cmu network` manages the RPC networks saved on the machine and controls which one the active wallet session points at.

## Usage

```bash
cmu network <subcommand> [options]
```

## Subcommands

| Subcommand                          | Description                                        |
| ----------------------------------- | -------------------------------------------------- |
| `cmu network save <url> --name <n>` | Save a new network or update an existing one.      |
| `cmu network list`                  | List all saved networks.                           |
| `cmu network use <name>`            | Switch the active network.                         |
| `cmu network delete <name>`         | Delete a saved network.                            |
| `cmu network info`                  | Show the active network.                           |
| `cmu network ping [name]`           | Ping a network to check connectivity and latency.  |

Running `cmu network` with no subcommand lists the saved networks, exactly as `cmu network list` does.

::: tip
`-v, --verbose` is a global flag declared on `cmu` itself, so it works anywhere on the line — `cmu -v network list`, `cmu network -v list` and `cmu network list -v` are equivalent.
:::

---

## cmu network save

Saves a network to the local network store, or overwrites the RPC endpoint of an existing entry with the same name.

### Usage

```bash
cmu network save http://10.64.24.248:8585 --name mainnet
```

### Options

| Flag                | Description                            |
| ------------------- | -------------------------------------- |
| `-n, --name <name>` | Name to save the network under. Required. |

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

Saving does not change the active network. Use `cmu network use` to switch to it afterwards.

### Output

```bash
Saved network 'mainnet' (http://10.64.24.248:8585)
```

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
|        | mainnet              | http://10.64.24.248:8585
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
hint: run `cmu wallet login` first.
```

The target network must already be saved. An unknown name exits with:

```bash
error: network use failed
network 'mainnet' is not saved.
hint: list saved networks with `cmu network list`.
```

### Behavior

The command rewrites the `activeNetwork` field inside `.cmu-session` in the current working directory. All commands that resolve a network from the session — including `cmu wallet balance`, `cmu mine start`, and `cmu network ping` — use the new selection immediately.

### Output

```bash
Active network is now mainnet
```

::: warning
Running [`cmu wallet login`](/docs/cli/wallet) again resets the active network to `local`, discarding the selection made here. Re-run `cmu network use <name>` after any login.
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
----------------------
```

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

The command exits with code `1` if the endpoint is unreachable.

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

| Field    | Description                                    |
| -------- | ---------------------------------------------- |
| `name`   | The identifier used by `use` and `delete`.     |
| `rpcUrl` | The JSON-RPC endpoint of the network.          |

On first read the file is seeded with a single entry, `local` pointing at `http://127.0.0.1:8585`.

::: info
`.cmu-networks.json` is stored in your **home directory**, not in the project. The saved network list is therefore shared by every CointMU project on the machine. The active network *selection* is not shared — it lives in each project's own `.cmu-session` file.
:::

::: warning
Both `.cmu-networks.json` and `.cmu-session` are listed in the `.gitignore` generated by `cmu create`. Do not commit either file to version control.
:::
