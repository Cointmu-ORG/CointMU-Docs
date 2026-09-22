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

| Flag                   | Description                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| `-n, --network <name>` | Network to connect to, by name from `cmu.config.ts`.                    |
| `--no-signer`          | Skip the session password prompt and start without unlocking a session. |
| `-y, --yes`            | Skip the confirmation prompt before executing project code.             |

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

::: warning
`--no-signer` does **not** guarantee a read-only console. It suppresses the session password prompt, but a key found in `.env`, in the ambient environment, or in `cmu.config.ts` still produces a signer. See [The `--no-signer` Flag](#the-no-signer-flag).
:::

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

The prompt defaults to **no**, `-y, --yes` skips it, and a non-interactive session without `--yes` refuses rather than continuing. The full rules are on [the `cmu deploy` page](/docs/cli/deploy#trust-model).

::: warning
Only the project config is listed, but the REPL itself is unrestricted. Anything you paste at the `cmu>` prompt runs immediately, with the signer attached. Treat a pasted snippet the same way you would treat a deploy script.
:::

## Startup Output

Once the network is resolved and the endpoint answers, the console prints its configuration and opens the prompt:

```bash
Pinging http://127.0.0.1:8585...
Connected to 'unknown' (chain ID 1912).

--- Console configuration ---
Network      : local
RPC endpoint : http://127.0.0.1:8585
Chain ID     : 1912
Signer       : 0x9A201a7Bf68758C43187c3fB0c2280dCfedF3f98
Preloaded    : provider, signer, ethers, getContract(name, address)
-----------------------------

cmu>
```

::: info
`Connected to 'unknown'` is expected. The name comes from ethers, which has no registered label for chain ID `1912`; the `Network` line below it shows the name the CLI resolved. Tracked as [CointMU-CLI#138](https://github.com/kakonoomoidee/CointMU-CLI/issues/138).
:::

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

The provider is created with `staticNetwork`, so the chain is detected once and then pinned — every call you type costs one request instead of two.

::: tip
Top-level `await` works at the prompt, so `await provider.getBlockNumber()` is enough; there is no need to wrap calls in an async function.
:::

## Resolving the Signer

`signer` is populated from the first source that yields a key, identical to [`cmu deploy`](/docs/cli/deploy#resolving-the-signing-key):

| Priority | Source                              | Prompts?                                  |
| -------- | ----------------------------------- | ----------------------------------------- |
| 1        | `PRIVATE_KEY` environment variable  | No. Read from `.env` or the ambient env.  |
| 2        | `wallet.privateKey` in `cmu.config` | No.                                       |
| 3        | Encrypted `.cmu-session`            | Yes — asks once for the session password. |

A missing key is **not** an error. The console still opens, `signer` is `undefined`, and `getContract()` falls back to the provider:

```bash
Signer       : none (read-only) - run `cmu wallet login`
```

A key that is present but unusable *is* an error, and the console refuses to open:

```bash
error: console failed
invalid private key.
hint: expected a 32-byte hex key (0x-prefixed); run `cmu console --no-signer` to start read-only.
```

### The `--no-signer` Flag

`--no-signer` sets `noPrompt` on the network resolver. In practice that means it suppresses **priority 3 only** — the encrypted-session password prompt — and lets a console open in a project whose `.cmu-session` is locked.

It does not override priorities 1 and 2. This is the behavior as shipped in `1.3.8`:

| Key source                          | Result with `--no-signer`     |
| ----------------------------------- | ----------------------------- |
| `PRIVATE_KEY` in `.env`             | Signer attached               |
| `PRIVATE_KEY` in the ambient env    | Signer attached               |
| `wallet.privateKey` in `cmu.config` | Signer attached               |
| Encrypted session only              | `none (read-only)`, no prompt |
| No key anywhere                     | `none (read-only)`            |

::: danger
Do not rely on `--no-signer` to make a console incapable of signing. Where a key is reachable without a prompt, the flag's help text (`Start read-only`) does not describe what happens, and an accidental state-changing call at the prompt will be broadcast. To be certain a console cannot sign, start it in an environment with no `PRIVATE_KEY` set and no `wallet.privateKey` in the config.

This gap is tracked as [CointMU-CLI#135](https://github.com/kakonoomoidee/CointMU-CLI/issues/135).
:::

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
The address is required because nothing in a project records deployed addresses per network. `deployments/<Contract>.json` is written by the scaffolded deploy script, but it is one file per contract rather than per chain, and a hand-written script may not write it at all — so resolving an address from it could silently point the console at a contract on the wrong chain.
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
