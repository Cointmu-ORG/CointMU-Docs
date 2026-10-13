# cmu mine

`cmu mine` controls the mining process on the active CointMU network. It provides subcommands to start and stop the local miner using the session wallet as the reward destination.

## Usage

```bash
cmu mine <subcommand> [options]
```

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

## Subcommands

| Subcommand       | Description                                  |
| ---------------- | -------------------------------------------- |
| `cmu mine start` | Start mining blocks on the active network.   |
| `cmu mine stop`  | Stop the active miner on the active network. |

## Requirements

Both subcommands require an active session. Run `cmu wallet login` before using any `cmu mine` command.

::: warning
If no active session is found, the command exits immediately:

```bash
error: mine start failed
no active session.
hint: run `cmu wallet login` first.
```

The session file is read from `.cmu-session` in the current working directory.
:::

::: warning
`cmu mine` needs a node that implements the `miner_*` JSON-RPC methods, such as geth. The local DevNet started by [`cmu node start`](/docs/cli/node) does not — it mines a block for every transaction on its own — so both subcommands fail against it with a raw provider error:

```bash
Setting etherbase to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8...

error: mine start failed
could not coalesce error (error={ "code": -32004, "message": "Method miner_setEtherbase is not supported" }, ...)
```

Tracked as [CointMU-CLI#184](https://github.com/Cointmu-ORG/CointMU-CLI/issues/184).
:::

---

## cmu mine start

Starts the miner on the active network and routes block rewards to the session wallet address.

### Usage

```bash
cmu mine start
```

### Behavior

1. Reads the active session from `.cmu-session`.
2. Resolves the active network configuration from the session.
3. Sets the etherbase (reward address) to the session wallet address via `miner_setEtherbase`.
4. Starts the miner with one worker thread via `miner_start`.

### Output

```bash
Setting etherbase to 0x...
Starting miner on local...
Mining started.
Rewards are routed to 0x...
```

---

## cmu mine stop

Stops the active miner on the configured network.

### Usage

```bash
cmu mine stop
```

### Behavior

1. Reads the active session from `.cmu-session`.
2. Resolves the active network configuration from the session.
3. Sends `miner_stop` to the JSON-RPC endpoint.

### Output

```bash
Stopping miner on local...
Mining stopped.
```

---

## Session File

Both subcommands depend on `.cmu-session`, a local file written by `cmu wallet login`. This file stores the active wallet address and network identifier used to route mining rewards and resolve the RPC endpoint.

::: info
The `.cmu-session` file is resolved relative to the current working directory. Always run `cmu mine` commands from the root of your CointMU project.
:::
