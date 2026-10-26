# Network & Node Setup

CointMU runs as a private Geth network with a fixed Chain ID of `1912`. The Chain ID is embedded in every signed transaction to prevent replay attacks and to ensure that all wallets, scripts, and deployment tools are bound to the CointMU chain only.

## Prerequisites

| Requirement   | Details                                                  |
| ------------- | -------------------------------------------------------- |
| Geth          | `1.10.26-stable` installed and available on `$PATH`.     |
| Nginx         | Installed and running for reverse proxy configuration.   |
| Genesis file  | A configured `genesis.json` with Chain ID `1912`.        |
| Password file | A `password.txt` containing the account unlock password. |

## Genesis Configuration

The genesis file defines the initial network state, including the consensus rules, pre-funded accounts, and the chain identity.

Critical fields for CointMU:

| Field                   | Value     | Description                                               |
| ----------------------- | --------- | --------------------------------------------------------- |
| `config.chainId`        | `1912`    | Unique identifier binding all transactions to this chain. |
| `config.homesteadBlock` | `0`       | Enables Homestead rules from block 0.                     |
| `config.eip155Block`    | `0`       | Enables replay protection from block 0.                   |
| `difficulty`            | Low value | Set low for fast local block production.                  |
| `alloc`                 | —         | Pre-funded deployer accounts for development.             |

Every node started against the same genesis must use the same `chainId` and genesis hash. Nodes with a mismatched genesis will be rejected by peers.

## Initializing the Chain

Before starting Geth for the first time, initialize the data directory with the genesis file:

```bash
geth --datadir ./data init ./genesis.json
```

This step only needs to be run once per data directory. Re-running it on an existing chain will fail unless the data directory is cleared first.

## Starting the Geth Node

Use the following script to start the node with the JSON-RPC HTTP API exposed on `127.0.0.1:8545`:

```bash
#!/usr/bin/env bash
set -euo pipefail

DATA_DIR="./data"
GENESIS_FILE="./genesis.json"
RPC_ADDR="127.0.0.1"
RPC_PORT="8545"
CHAIN_ID="1912"

if [ ! -d "$DATA_DIR/geth" ]; then
  geth --datadir "$DATA_DIR" init "$GENESIS_FILE"
fi

geth \
  --datadir "$DATA_DIR" \
  --networkid "$CHAIN_ID" \
  --http \
  --http.addr "$RPC_ADDR" \
  --http.port "$RPC_PORT" \
  --http.api "eth,net,web3,personal,miner,admin" \
  --http.corsdomain "*" \
  --allow-insecure-unlock \
  --unlock 0 \
  --password ./password.txt
```

::: warning
`--http.corsdomain "*"` allows all origins. This is acceptable only when the node is bound to `127.0.0.1` and sits behind the Nginx proxy. Never expose the Geth HTTP API directly on a public interface.
:::

::: info
`--allow-insecure-unlock` is required to unlock accounts over HTTP. This flag is intentional for a private development network and should not be used on public-facing nodes.
:::

## Nginx Reverse Proxy

CointMU uses Nginx as a security layer in front of Geth. The proxy listens on port `8585`, forwards traffic to the local JSON-RPC endpoint on `127.0.0.1:8545`, and restricts access to approved IP ranges.

```nginx
server {
    listen 8585;
    server_name _;

    location / {
        allow 10.0.0.0/8;
        deny all;

        proxy_pass http://127.0.0.1:8545;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Access rules:**

| Source             | Result                           |
| ------------------ | -------------------------------- |
| `10.x.x.x` network | Allowed — forwarded to Geth RPC. |
| All other IPs      | Rejected at the proxy boundary.  |

Clients inside the whitelisted network connect via `http://10.64.24.101:8585`. The raw Geth port `8545` remains inaccessible from outside the host.

## Operational Notes

- Use Chain ID `1912` consistently across all wallets, deployment scripts, and local tooling.
- Keep the Geth HTTP API bound to `127.0.0.1` at all times.
- Treat the Nginx proxy as the only external entry point for JSON-RPC access.
- Start the miner before sending transactions — if no blocks are being produced, transactions remain pending indefinitely.
- Use `cmu node connect` to verify connectivity to the active RPC endpoint at any time.
