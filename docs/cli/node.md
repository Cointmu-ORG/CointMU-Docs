# cmu node

`cmu node` manages the local EVM node for development and testing. It provides subcommands to test connectivity against a configured RPC endpoint and to spin up a local development network with pre-funded accounts.

## Usage

```bash
cmu node <subcommand> [options]
```

## Subcommands

| Subcommand         | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `cmu node connect` | Ping the configured RPC endpoint to test connectivity. |
| `cmu node start`   | Start a local DevNet with pre-funded accounts.         |

::: tip
`-v, --verbose` is a global flag declared on `cmu` itself, so it works anywhere on the line — `cmu -v node start`, `cmu node -v start` and `cmu node start -v` are equivalent. When set, suppressed internal warnings from native dependencies are printed, and errors are reported with their full stack trace.
:::

---

## cmu node connect

Verifies connectivity to a configured CointMU JSON-RPC endpoint by fetching network metadata and the latest block number.

### Usage

```bash
cmu node connect [options]
```

### Options

| Flag                   | Description                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `-n, --network <name>` | Specify the named network to connect to. If omitted, the active network from the current session is used. |

### Behavior

The command performs the following steps in order:

1. Resolves the RPC endpoint from the specified or active network configuration.
2. Opens a JSON-RPC provider with the resolved endpoint.
3. Fetches the connected network metadata.
4. Fetches the latest block number.

If any step fails, the command reports the failure and exits with code `1`. An unsaved network name is rejected before any connection is attempted:

```bash
error: node connect failed
network 'staging' is not saved.
hint: list saved networks with `cmu network list`, or add one with `cmu network save <url> --name <name>`.
hint: start a local node with `cmu node start`, or check the endpoint with `cmu network info`.
```

### Output

```bash
Pinging http://127.0.0.1:8585...
Connected to the CointMU node.
Network      : unknown
Chain ID     : 1912
Block number : 5686
```

::: info
`Network` reports the name **ethers** resolves for the chain ID, not the name the endpoint is saved under. ethers has no registered name for chain `1912`, so this field reads `unknown` against a CointMU node even when the connection is healthy. Use `Chain ID` to confirm you reached the right chain, and [`cmu network info`](/docs/cli/network) to see the saved name.
:::

---

## cmu node start

Starts a local development network with Chain ID `1912`, pre-funded accounts, and an optional custom mnemonic.

The chain is an in-process **Hardhat 3** network running on EDR. `cmu node start` does not use Hardhat's own `node` task: it creates the network with a config override, then serves it over HTTP through the CLI's own JSON-RPC proxy, which is what makes the access control below possible and the printed Chain ID accurate.

### Usage

```bash
cmu node start [options]
```

::: danger NODE.JS 22 REQUIRED
The DevNet needs **Node.js 22 or newer**, even though the CLI itself runs on Node 20.12+. EDR ships its native binary as an optional dependency that npm silently skips on older Node, so the chain cannot start at all:

```bash
error: node start failed
the local DevNet needs Node.js 22 or newer, but this is Node v20.12.0.
    npm skips EDR's native binary on older Node without reporting it, so no chain can start.
hint: upgrade Node.js, or install a version manager such as nvm or fnm.
```

The check runs before anything else, so a too-old runtime fails immediately rather than part-way through startup.
:::

### Options

| Flag                      | Description                                                                     | Default        |
| ------------------------- | ------------------------------------------------------------------------------- | -------------- |
| `--host <host>`           | Host address to bind the DevNet server to.                                      | `127.0.0.1`    |
| `-p, --port <number>`     | Port to bind the DevNet server to.                                              | `8585`         |
| `-m, --mnemonic <phrase>` | 12-word mnemonic seed phrase to generate deterministic accounts.                | Auto-generated |
| `-l, --log`               | Log RPC calls as they arrive, for `eth_`, `net_`, and `web3_` methods.          | Disabled       |
| `--allow-cors`            | Allow cross-origin browser access to the DevNet RPC.                            | Disabled       |

### Behavior

On startup, the DevNet:

- Validates the port, then binds to the specified host and port **before printing anything**.
- Creates **10 pre-funded accounts** with **100 ETH each**, derived from the mnemonic at `m/44'/60'/0'/0/<index>`.
- Uses Chain ID `1912` to match the CointMU network.
- Prints the active mnemonic and every account to the console.
- Shuts down gracefully on `SIGINT` (`Ctrl+C`).

::: warning
The default port `8585` is the same port the Nginx security proxy binds to in a full [network setup](/docs/guide/network-setup). Pass `-p` to choose another port when running a DevNet on a host that also serves the proxy.
:::

### Port Handling

The port is validated before the chain boots. Anything outside `1`–`65535`, or not a number, is rejected:

```bash
error: node start failed
invalid port '99999'.
hint: pass a port between 1 and 65535, e.g. `cmu node start -p 8585`.
```

A port that is already taken is **reported, never freed**. Killing whatever holds a port is a surprising default that can take out an unrelated process, so the command stops instead:

```bash
error: node start failed
port 8585 is already in use.
hint: stop the process using it, or run `cmu node start` with a different -p.
```

::: info
The bind happens before any output, so a port clash surfaces on its own rather than after ten private keys and a "listening on" line that was not yet true have scrolled past.
:::

### Output

```bash

CointMU DevNet listening on http://127.0.0.1:8585
Chain ID: 1912

Mnemonic: dress domain depart crystal desk jungle repair purpose chronic ride flame always
warning: development mnemonic - never use it on a live network.


Pre-funded developer accounts (100 ETH each):

Account #0
Address     : 0x9a47a51747bf54F233dFD031b0b7A6A4FF0F8F34
Private key : 0x2646d844f67245e2f12a19d14dbc2bc2bfc318a9299c144efdeb32c5d733c4c0

Account #1
Address     : 0x793e1EAc6B31263aD1600d1B3C1B8c2184E14Af1
Private key : 0xfe8bb1c91ef5a9f3ef055c9d5ef721fb0c54a3f6e6f51337dd53c50c260bab31

...
```

Stopping it with `Ctrl+C`:

```bash
Stopping the CointMU DevNet...
CointMU DevNet stopped.
```

::: danger WARNING
The mnemonic and private keys printed on startup are for **local development only**. Never use them on a live or production network.
:::

::: info
Internal warnings from native dependencies (such as `uws_win32` or µWS fallback messages) are suppressed by default. Pass `-v` to expose them.
:::

### Binding to a Non-Loopback Host

`--host` exists so another device on the network can reach the DevNet. Because that also exposes the private keys printed at startup, the command warns before it binds:

```bash
warning: --host 0.0.0.0 binds the DevNet to a non-loopback address
    The RPC endpoint becomes reachable from your network, and the private keys
    of the 10 pre-funded accounts are printed below in plain text. Anyone who
    can reach this machine can then drive the node and spend those accounts.
hint: omit --host to bind 127.0.0.1 unless another device really needs access.
```

This is a warning, not a gate — binding to the LAN is a legitimate way to test from another device.

### RPC Access Control

The DevNet RPC rejects requests that look like they originate from a web page. A request is refused when it carries an `Origin` header, or — while the bind is loopback — when its `Host` header is not one of `127.0.0.1:<port>`, `localhost:<port>`, or `[::1]:<port>`.

Refused requests receive HTTP `403` with a JSON-RPC error of code `-32600`:

```bash
Forbidden: cross-origin or non-local request rejected. Pass --allow-cors to cmu node start to allow browser access.
```

Node JSON-RPC clients such as ethers' `JsonRpcProvider` send no `Origin` header and address the host the proxy is bound to, so they pass unaffected. A browser always sends `Origin` on a cross-origin fetch, and a DNS-rebound request carries an attacker-controlled `Host`.

This protects the unlocked developer accounts from DNS-rebinding attacks, where a malicious page resolves its own hostname to `127.0.0.1` and issues signed transactions against the local node.

::: warning
The `Host` allowlist only applies to a **loopback bind**. A LAN client legitimately addresses an address that cannot be enumerated in advance, so under `--host 0.0.0.0` any client that sends no `Origin` header is allowed through. The `Origin` check — which is what actually stops a browser, including a rebound one — stays on either way.

Treat `--host` as making the DevNet and its funded accounts reachable by anything on the network.
:::

::: danger WARNING
`--allow-cors` disables both checks and responds with `Access-Control-Allow-Origin: *`, letting **any** website reach the DevNet RPC and its pre-funded accounts while it is running. Use it only when a browser-based harness genuinely requires it. The command prints a warning at startup when the flag is active:

```bash
warning: --allow-cors - the DevNet RPC on 127.0.0.1:8585 accepts
    requests from any browser origin. Any page you visit can then drive this
    node and spend the accounts printed below.
```
:::

### RPC Logging

When `--log` is enabled, the DevNet prints incoming RPC method calls in real time:

```bash
rpc: eth_blockNumber
rpc: eth_getBalance
rpc: net_version
```

Only `eth_`, `net_`, and `web3_` prefixed methods are logged.
