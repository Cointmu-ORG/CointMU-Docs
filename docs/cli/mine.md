# cmu mine

`cmu mine` starts, stops and inspects mining on the node behind the session's active network, and routes block rewards to the session wallet. It is meant for a geth node with the miner API enabled, such as the CointMU server. The local DevNet started by [`cmu node start`](/docs/cli/node) has no miner API; see [DevNet and Geth](#devnet-and-geth).

## Usage

```bash
cmu mine <subcommand> [options]
```

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

## Subcommands

| Subcommand        | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `cmu mine start`  | Point the node's etherbase at the session wallet, then mine.   |
| `cmu mine stop`   | Stop the node's miner.                                         |
| `cmu mine status` | Show mining state, hashrate, etherbase and the wallet balance. |

## Requirements

Every subcommand needs an active session in the current directory. `cmu mine` reads two plaintext fields from `.cmu-session`:

| Field           | Used for                                                                               |
| --------------- | -------------------------------------------------------------------------------------- |
| `address`       | The etherbase `mine start` sets, and the wallet `mine status` and `--watch` report on. |
| `activeNetwork` | The saved network whose RPC endpoint is called. Set it with `cmu network use <name>`.  |

The encrypted key is never read, so no subcommand asks for a password. The address is whichever wallet [`cmu wallet use <name>`](/docs/cli/wallet#cmu-wallet-use) last made active in this directory.

::: info
`cmu mine` uses the saved network the session points at, **not** `defaultNetwork` in `cmu.config.ts`. A project that deploys to the server through `cmu.config.ts` still needs `cmu network use <name>` before `cmu mine` reaches the same node. See [Which Network a Command Uses](/docs/cli/network#which-network-a-command-uses).
:::

Without a session, every subcommand exits before contacting anything:

```bash
error: mine start failed
no active session.
hint: run `cmu wallet use <name>` first, or `cmu wallet create --save <name>` and then `cmu wallet use <name>`.
```

If the session's network has since been deleted from the saved list:

```bash
error: mine status failed
network 'staging' is not saved.
hint: list saved networks with `cmu network list`, or add one with `cmu network save <url> --name <name>`.
```

## DevNet and Geth

|                                                   | Local DevNet (`cmu node start`)            | Geth node with the `miner` API (e.g. Geth `1.10.26`) |
| ------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| How blocks are made                               | One block per transaction, automatically.  | Only while a miner runs.                             |
| `miner_setEtherbase`, `miner_start`, `miner_stop` | Not supported.                             | Supported.                                           |
| `cmu mine start` / `cmu mine stop`                | Exit `1` with the error below.             | Work.                                                |
| `cmu mine status`                                 | Works; `Mining` and `Hashrate` read `n/a`. | Works.                                               |

Against the DevNet, or any node that does not expose the `miner` API, `start` and `stop` explain why rather than failing with a raw provider error:

```bash
Setting etherbase to 0xbc4671Dd2101BD2dC1334917eA18675f7fFC8dE2...

error: mine start failed
network 'local' has no miner_setEtherbase RPC, so mining cannot be controlled here.
hint: the local DevNet mines a block for each transaction by itself; `cmu mine` is for a geth node with the miner API enabled.
```

`cmu mine stop` prints the same error naming `miner_stop`. "Not supported" means the node answered `-32601` (method not found) or `-32004`, which is what the DevNet answers.

::: warning
The etherbase and the miner belong to the **node**, not to your session. `cmu mine start` moves the rewards of everyone mining on that node to your wallet, and `cmu mine stop` stops mining for everyone using it. Coordinate before running either against a shared server.
:::

---

## cmu mine start

Sets the node's etherbase to the session wallet and starts mining with one thread.

### Usage

```bash
cmu mine start
cmu mine start --watch
```

### Options

| Flag      | Description                                                                                |
| --------- | ------------------------------------------------------------------------------------------ |
| `--watch` | Keep watching mining progress after starting. `Ctrl+C` leaves the watch; mining continues. |

### Behavior

1. Reads `address` and `activeNetwork` from `.cmu-session`.
2. Resolves `activeNetwork` from the saved networks.
3. Calls `eth_mining` and `eth_coinbase`. If the node is already mining to a different address, prints a warning and carries on.
4. Sends `miner_setEtherbase` with the session address.
5. Sends `miner_start` with `1`, a single mining thread.

The JSON-RPC calls, in order:

| Call                 | Parameters              |
| -------------------- | ----------------------- |
| `eth_mining`         | none                    |
| `eth_coinbase`       | none                    |
| `miner_setEtherbase` | `["<session address>"]` |
| `miner_start`        | `[1]`                   |

### Output

```bash
Setting etherbase to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8...
Starting miner on geth...
Mining started.
Rewards are routed to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

When the node is already mining to someone else, two lines come first:

```bash
warning: this node is already mining to 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc.
hint: starting moves its rewards to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8. The etherbase is node-wide, and `cmu mine stop` stops mining for everyone.
```

### Errors

| Cause                           | Message                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| No `.cmu-session`               | `no active session.`                                                                   |
| Session network no longer saved | `network '<name>' is not saved.`                                                       |
| Node has no `miner` API         | `network '<name>' has no miner_setEtherbase RPC, so mining cannot be controlled here.` |
| Node unreachable                | ethers' raw connection error, e.g. `connect ECONNREFUSED 127.0.0.1:8585`               |
| Geth with no etherbase set yet  | A raw `could not coalesce error` — see below.                                          |

An unreachable node also prints ethers' `JsonRpcProvider failed to detect network and cannot start up; retry in 1s ...` notice before the error. Tracked as [CointMU-CLI#214](https://github.com/Cointmu-ORG/CointMU-CLI/issues/214).

::: warning
A freshly started geth node with no local accounts has no etherbase, and answers `eth_coinbase` with an error instead of an address. `cmu mine start` fails on that answer in step 3, **before** it sends the `miner_setEtherbase` that would fix it:

```bash
error: mine start failed
could not coalesce error (error={ "code": -32000, "message": "etherbase must be explicitly specified" }, payload={ "id": 3, "jsonrpc": "2.0", "method": "eth_coinbase", "params": [  ] }, code=UNKNOWN_ERROR, version=6.17.0)
```

Set any etherbase on the node once by hand — `miner.setEtherbase("0x...")` in `geth attach` — then `cmu mine start` works and replaces it. `cmu mine status` fails the same way on such a node. Tracked as [CointMU-CLI#210](https://github.com/Cointmu-ORG/CointMU-CLI/issues/210).
:::

### Watching Progress

With `--watch`, the command keeps polling the node after mining has started:

```bash
Watching. Ctrl-C leaves the watch - mining keeps running until `cmu mine stop`.
The first block can take minutes while ethash builds its DAG.
Balance change counts block rewards, uncle rewards and fees, plus any transfer in or out.

#34  hashrate 0 H/s  mined by you since #34: 0  balance 1024.0 ETH (change +0.0)
block #36 mined by you.
#36  hashrate 0 H/s  mined by you since #34: 1  balance 1026.0 ETH (change +2.0)
```

The status line shows the head block, the hashrate, how many blocks the session wallet mined since the watch started, and its balance with the change since then. The node is polled about every 4 seconds.

| Output       | Behavior                                                      |
| ------------ | ------------------------------------------------------------- |
| Terminal     | The status line is redrawn in place; events print above it.   |
| Pipe or file | One line per event, and the status line only when it changes. |

Events are printed once, when they happen:

| Event                                                                                       | Meaning                                               |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `block #<n> mined by you.`                                                                  | A new block whose miner is the session wallet.        |
| `reorg: blocks from #<n> were replaced; the count is redone.`                               | The chain reorganised; blocks are counted again.      |
| `warning: etherbase changed: rewards now go to 0x..., not your wallet.`                     | Someone moved the node's etherbase.                   |
| `etherbase is back on your wallet: rewards go to 0x... again.`                              | The etherbase returned to the session wallet.         |
| `` warning: mining stopped - someone ran `cmu mine stop`, or the node stopped its miner. `` | The node's mining flag turned off.                    |
| `mining resumed.`                                                                           | The node's mining flag turned back on.                |
| `connection lost (<reason>), retrying in <n>s`                                              | A poll failed. Retries back off from 4 to 60 seconds. |
| `reconnected.`                                                                              | A poll succeeded after a failure.                     |

A lost connection never ends the watch, so it survives a node restart. `Ctrl+C` leaves the watch and exits `0`, and mining keeps running:

```bash
Stopped watching. Mining is still running on geth - stop it with `cmu mine stop`.
```

::: info
The count only covers blocks after the watch started, and a single poll fetches at most 100 missed blocks. The `hashrate` comes from `eth_hashrate` and can read `0 H/s` while the node is mining; the block count is the reliable signal.
:::

---

## cmu mine stop

Stops the node's miner. The etherbase is left as it is.

### Usage

```bash
cmu mine stop
```

### Behavior

1. Reads `activeNetwork` from `.cmu-session` and resolves it from the saved networks.
2. Sends `miner_stop` with no parameters.

The node is not asked whether it was mining first, so stopping an idle node still succeeds and prints the same output.

### Output

```bash
Stopping miner on geth...
Mining stopped.
```

---

## cmu mine status

A one-shot, read-only view of the node's mining state. It sends no `miner_*` call and changes nothing.

### Usage

```bash
cmu mine status
```

### Behavior

The command reads the latest block, then in parallel `eth_mining`, `eth_hashrate`, `eth_coinbase`, and the session wallet's balance at that same block.

### Output

```bash
--- Mining status ---
Network      : geth (http://127.0.0.1:18545)
Mining       : yes
Hashrate     : 0 H/s
Etherbase    : 0x70997970c51812dc3a010c7d01b50e0d17dc79c8
Latest block : #95, 1s ago
Difficulty   : 131776
Wallet       : 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Balance      : 1142.999999999631051 ETH
---------------------
```

When the node mines to another address, the `Etherbase` line says so:

```bash
Etherbase    : 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (not your session wallet - rewards go there)
```

| Field          | Source                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `Network`      | The session's active network and its RPC endpoint.                                               |
| `Mining`       | `eth_mining`: `yes`, `no`, or `n/a` when the node does not support it.                           |
| `Hashrate`     | `eth_hashrate`, scaled to `H/s` … `TH/s`, or `n/a`.                                              |
| `Etherbase`    | `eth_coinbase`, or `n/a`. Marked `(not your session wallet - rewards go there)` when it differs. |
| `Latest block` | Number and age of the latest block. Ages are shown in `s`, `m` or `h`.                           |
| `Difficulty`   | The latest block's difficulty.                                                                   |
| `Wallet`       | The session address.                                                                             |
| `Balance`      | The session wallet's balance at the latest block.                                                |

Against the DevNet the miner fields read `n/a`:

```bash
--- Mining status ---
Network      : local (http://127.0.0.1:8585)
Mining       : n/a
Hashrate     : n/a
Etherbase    : 0xc014ba5ec014ba5ec014ba5ec014ba5ec014ba5e (not your session wallet - rewards go there)
Latest block : #0, 16s ago
Difficulty   : 0
Wallet       : 0xbc4671Dd2101BD2dC1334917eA18675f7fFC8dE2
Balance      : 100.0 ETH
---------------------
```

::: warning
The DevNet's `Etherbase` is a fixed placeholder address, not a reward recipient — the DevNet pays no block rewards. The `rewards go there` note is wrong there. Tracked as [CointMU-CLI#211](https://github.com/Cointmu-ORG/CointMU-CLI/issues/211), which also covers ages beyond hours being printed as large `h` values.
:::

---

## Related Commands

- [cmu wallet use](/docs/cli/wallet#cmu-wallet-use) — makes a wallet the session wallet whose address `cmu mine` mines to.
- [cmu network use](/docs/cli/network#cmu-network-use) — points the session, and so `cmu mine`, at a saved network.
- [cmu wallet transfer](/docs/cli/wallet#cmu-wallet-transfer) — on a geth node, transfers only confirm while something mines.
