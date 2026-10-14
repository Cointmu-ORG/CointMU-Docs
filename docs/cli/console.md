# cmu console

`cmu console` opens an interactive JavaScript REPL connected to the configured CointMU network, with a provider, an optional signer, `ethers`, and a contract loader already in scope.

## Usage

```bash
cmu console [options]
```

## Requirements

`cmu console` must be executed from the root of a CointMU project when you want it to use that project's network definitions or contract artifacts.

- `cmu.config.ts/js` is read to resolve the network. Without one, the console falls back to the local devnet at `http://127.0.0.1:8585` (chain ID `1912`).
- The RPC endpoint must be reachable. The console pings it first and refuses to open if it does not answer.
- `getContract()` reads `artifacts/<Name>.json`, so run [`cmu compile`](/docs/cli/compile) before loading a contract.

## Options

| Flag                   | Description                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| `-n, --network <name>` | Network to connect to, by name from `cmu.config.ts`.                     |
| `--no-signer`          | Start read-only: skip signer resolution and the session password prompt. |
| `-y, --yes`            | Skip the confirmation prompt before executing project code.              |

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

## Network Resolution

The console resolves its network the same way [`cmu deploy`](/docs/cli/deploy) does — from `cmu.config.ts`, not from the saved-network list:

| Source                              | Used by                                     |
| ----------------------------------- | ------------------------------------------- |
| `defaultNetwork` in `cmu.config.ts` | `cmu console`, `cmu explorer`, `cmu deploy` |
| `-n, --network <name>`              | Overrides `defaultNetwork` for this run     |
| `cmu network use <name>`            | **Not** consulted by `cmu console`          |

::: info
`cmu network use` sets the active network for [`cmu network`](/docs/cli/network), [`cmu node`](/docs/cli/node), [`cmu mine`](/docs/cli/mine), and [`cmu wallet`](/docs/cli/wallet). It has no effect on the console. If the console opens on a different network than you expected, check `defaultNetwork` in `cmu.config.ts`.
:::

Requesting a network that the config does not define fails before anything connects:

```bash
error: console failed
network 'staging' is not defined in cmu.config.ts.
hint: add it under `networks`, or pick one that is already defined.
```

## Trust Model

`cmu.config.ts/js` is `require()`d from the working directory, and the REPL then executes whatever you type with your full environment — including any key it decrypted for `signer`. The console therefore goes through the same confirmation gate as `cmu deploy`, listing the project config before it runs:

```bash
warning: the following project files will be executed as code:
      cmu.config.ts  ->  /home/you/my-token/cmu.config.ts

    They run with your full environment, including the PRIVATE_KEY decrypted from
    your session and injected for deploy scripts, and can do anything your user
    account can. This is the same trust model as Hardhat, Foundry and Truffle;
    see the 'Trust Model' section of the README.

? Execute these files? (y/N)
```

With `--no-signer` the listed files are the same, but the wording is the read-only one `cmu compile` and `cmu explorer` use, since no key is decrypted:

```bash
    They are require()d as code to read this project's configuration, run with
    your full environment, and can do anything your user account can. This
    command does not sign anything and does not unlock your session. ...
```

The prompt defaults to **no**, `-y, --yes` skips it, and a non-interactive session without `--yes` refuses rather than continuing. The full rules are on [the `cmu deploy` page](/docs/cli/deploy#trust-model).

::: warning
Only the project config is listed, but the REPL itself is unrestricted. Anything you paste at the `cmu>` prompt runs immediately, with the signer attached. Treat a pasted snippet the same way you would treat a deploy script.
:::

## Startup Output

Once the network is resolved and the endpoint answers, the console prints its configuration and opens the prompt:

```bash
Pinging http://127.0.0.1:8585...
Connected to 'local' (chain ID 1912).

--- Console configuration ---
Network      : local
RPC endpoint : http://127.0.0.1:8585
Chain ID     : 1912
Signer       : 0x9A201a7Bf68758C43187c3fB0c2280dCfedF3f98
Preloaded    : provider, signer, ethers, getContract(name, address), getDeployed(name)
-----------------------------

cmu>
```

If the endpoint does not answer within 3 seconds, the console does not open:

```bash
error: console failed
RPC endpoint http://127.0.0.1:8585 is unreachable (timed out after 3000ms).
hint: check the node is running and the endpoint is correct - `cmu network list`.
```

## Preloaded Context

| Binding                      | Type                           | Description                                                    |
| ---------------------------- | ------------------------------ | -------------------------------------------------------------- |
| `provider`                   | `ethers.JsonRpcProvider`       | Connected to the resolved RPC endpoint, with the chain pinned. |
| `signer`                     | `ethers.Wallet` \| `undefined` | Connected to `provider` when a key was resolved.               |
| `ethers`                     | module                         | The same ethers version the CLI bundles.                       |
| `getContract(name, address)` | function                       | Loads a compiled ABI and binds it to an address.               |
| `getDeployed(name)`          | async function                 | Loads a contract `cmu deploy` recorded on this network.        |

The provider is created with `staticNetwork`, so the chain is detected once and then pinned — every call you type costs one request instead of two.

::: tip
Top-level `await` works at the prompt, so `await provider.getBlockNumber()` is enough; there is no need to wrap calls in an async function.
:::

## Resolving the Signer

`signer` is populated from the first source that yields a key, identical to [`cmu deploy`](/docs/cli/deploy#resolving-the-signing-key):

| Priority | Source                              | Prompts?                                  |
| -------- | ----------------------------------- | ----------------------------------------- |
| 1        | `wallet.privateKey` in `cmu.config` | No.                                       |
| 2        | `PRIVATE_KEY` environment variable  | No. Read from `.env` or the ambient env.  |
| 3        | Encrypted `.cmu-session`            | Yes — asks once for the session password. |

A missing key is **not** an error. The console still opens, `signer` is `undefined`, and `getContract()` falls back to the provider:

```bash
Signer       : none (no key) - run `cmu wallet use <name>`, or set PRIVATE_KEY in .env or cmu.config.ts
```

A key that is present but unusable *is* an error, and the console refuses to open:

```bash
error: console failed
invalid private key.
hint: expected a 32-byte hex key (0x-prefixed); run `cmu console --no-signer` to start read-only.
```

### The `--no-signer` Flag

`--no-signer` starts the console read-only whatever key is reachable. No session password prompt appears, `signer` is `undefined`, and `getContract()` binds to the provider — even when `PRIVATE_KEY` is set or `cmu.config` supplies `wallet.privateKey`:

```bash
Signer       : none (--no-signer)
```

## Loading a Contract

```js
getContract(name, address);
```

| Parameter | Required | Description                                                                        |
| --------- | -------- | ---------------------------------------------------------------------------------- |
| `name`    | Yes      | The **contract** name, matching `artifacts/<Name>.json` — not the `.sol` filename. |
| `address` | Yes      | A `0x`-prefixed 20-byte address.                                                   |

The returned contract is connected to `signer` when there is one, and to `provider` otherwise — so a read-only console can still call view functions, but a state-changing call will fail for lack of a signer.

```bash
cmu> const token = getContract("StandardERC20", "0x43862ad4C579a04B0D6F6d057Da16Ac317b9454F")
cmu> await token.name()
'MyToken'
cmu> ethers.formatEther(await token.totalSupply())
'1000000.0'
```

::: info
`getContract` never looks an address up. For a contract deployed with `cmu deploy`, use [`getDeployed`](#loading-a-deployed-contract) instead.
:::

### getContract Errors

Each failure is thrown into the REPL and leaves the session open:

| Cause                       | Message                                                     |
| --------------------------- | ----------------------------------------------------------- |
| Address omitted             | `getContract(name, address) requires an address.`           |
| Address malformed           | `'<value>' is not a valid contract address.`                |
| Artifact missing            | `artifact for '<name>' not found at artifacts/<name>.json.` |
| Artifact unreadable, no ABI | `artifacts/<name>.json is not a usable artifact (no abi).`  |

```bash
cmu> getContract("Token", "0xnope")
Uncaught Error: '0xnope' is not a valid contract address.
hint: expected a 0x-prefixed 20-byte address.
```

::: tip
`getContract` validates the address itself rather than handing it to ethers. An unvalidated non-address string would be treated as a possible ENS name and resolved over the network, surfacing the typo as an unrelated connection error.
:::

## Loading a Deployed Contract

```js
await getDeployed(name);
```

`getDeployed` returns the same contract `getContract` would, at the address [`cmu deploy` recorded](/docs/cli/deploy#deployment-records) for `name` on the console's network, in `deployments/<network>/<name>.json`. It is async, so always `await` it. Each successful call prints where the address came from:

```bash
cmu> const token = await getDeployed("StandardERC20")
getDeployed: StandardERC20 -> 0x0e7f183193856290E9B5C294AdEAc9974Eb7ea70 on 'local' (chain 1912), recorded 2026-10-14T03:15:09.000Z from deployments/local/StandardERC20.json
cmu> await token.name()
'MyToken'
```

Before handing the contract back, the record is checked against the chain, so a stale or foreign record fails instead of pointing the console at the wrong contract:

| Check                                            | Message on failure                                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `name` is a contract name                        | `'<name>' is not a contract name.`                                                                                           |
| A record exists for this network                 | `no deployment record for '<name>' on '<network>' (deployments/<network>/<name>.json).`                                      |
| The record is well-formed and names this network | `deployments/<network>/<name>.json is not a usable deployment record.`                                                       |
| The chain ID matches the record                  | `the record for <name> on '<network>' is for chain <id>, but '<network>' is chain <id>.`                                     |
| There is code at the address                     | `the record for <name> on '<network>' is stale: there is no contract at 0x... (was the devnet restarted?).`                  |
| The code is the code that was recorded           | `the record for <name> on '<network>' is stale: the code at 0x... is not the code that was recorded.`                        |
| The code matches `artifacts/<name>.json`         | `<name> at 0x...: the compiled artifact no longer matches the deployed code (did the source change since the last deploy?).` |

A local DevNet is fresh every time it starts, so after a restart its records are stale:

```bash
cmu> await getDeployed("StandardERC20")
Uncaught:
Error: the record for StandardERC20 on 'local' is stale: there is no contract at 0x0e7f183193856290E9B5C294AdEAc9974Eb7ea70 (was the devnet restarted?).
hint: run `cmu deploy` again.
```

The last check compares against the runtime bytecode in the artifact, ignoring immutables, so it needs artifacts from `cmu compile` 1.5.1 or later; run `cmu compile` if it reports `artifacts/<name>.json has no deployed bytecode to check the contract against.` Contracts that link libraries cannot be checked and are refused. A flat `deployments/<name>.json` written by older scaffolds is never read; when one exists, the "no deployment record" hint says so.

## Ending the Session

| Input          | Effect                                                |
| -------------- | ----------------------------------------------------- |
| `.exit`        | Closes the REPL and exits with code `0`.              |
| `Ctrl+D`       | Same as `.exit`.                                      |
| `Ctrl+C`       | Interrupts the running evaluation, keeps the session. |
| `Ctrl+C` twice | Exits from an empty prompt.                           |

The provider is torn down on exit, so the process does not linger on an open socket.

::: info
The REPL evaluates in the global context rather than in its own VM realm. Without that, a `Uint8Array` typed at the prompt would fail ethers' internal `instanceof` checks and every bytes-taking call would reject it as invalid.
:::

## Related Commands

- [cmu explorer](/docs/cli/explorer) — one-shot block and contract lookups, without opening a REPL.
- [cmu compile](/docs/cli/compile) — produces the `artifacts/` that `getContract()` reads.
- [cmu deploy](/docs/cli/deploy) — shares the network resolution, key resolution, and trust model described above.
