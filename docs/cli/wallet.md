# cmu wallet

`cmu wallet` provides wallet management commands for generating, saving, switching between, and spending from EVM-compatible wallets on the CointMU network.

## Usage

```bash
cmu wallet <subcommand> [options]
```

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

## Subcommands

| Subcommand                           | Description                                                    |
| ------------------------------------ | -------------------------------------------------------------- |
| `cmu wallet create`                  | Generate a new EVM-compatible wallet.                          |
| `cmu wallet balance`                 | Show the native token balance of the active wallet.            |
| `cmu wallet info`                    | Show the active wallet session.                                |
| `cmu wallet save <name>`             | Save a private key as a named, encrypted wallet. Alias: `add`. |
| `cmu wallet use <name>`              | Make a saved wallet the active session in this project.        |
| `cmu wallet list`                    | List saved wallets.                                            |
| `cmu wallet delete <name>`           | Delete a saved wallet.                                         |
| `cmu wallet transfer <to> <amount>`  | Send ETH from the session wallet. Alias: `tf`.                 |

There are two places a key can live:

| Location                   | Scope                        | Written by                                       |
| -------------------------- | ---------------------------- | ------------------------------------------------ |
| `.cmu-session`             | The current project          | `use`                                            |
| `~/.cmu-wallets.json`      | Every project on the machine | `save`, `create --save`                          |

A saved wallet is never signed with directly. It is used by running `cmu wallet use <name>` in a project, which copies it into that project's session. Where each signing command takes its key from:

| Command               | Key sources, first match wins                                                |
| --------------------- | ---------------------------------------------------------------------------- |
| `cmu deploy`          | `wallet.privateKey` in `cmu.config`, then `PRIVATE_KEY`, then `.cmu-session` |
| `cmu console`         | The same as `cmu deploy`                                                     |
| `cmu wallet transfer` | `.cmu-session` only                                                          |

See [Resolving the Signing Key](/docs/cli/deploy#resolving-the-signing-key).

::: info
Every subcommand that prompts — `create --save`, `save`, `use`, `delete` without `--yes`, and `transfer` — refuses in a non-interactive session rather than hanging on a prompt nobody can answer:

```bash
error: wallet save failed
cannot prompt for a private key in a non-interactive session.
hint: run this in a terminal.
```

For `cmu deploy` and `cmu console` in CI, set `PRIVATE_KEY` instead; see [Resolving the Signing Key](/docs/cli/deploy#resolving-the-signing-key). `cmu wallet transfer` has no non-interactive form.

Pressing `Ctrl+C` at any of these prompts writes nothing. Only `transfer` says so (`aborted: nothing was sent.`); the others print inquirer's own message:

```bash
error: wallet save failed
User force closed the prompt with SIGINT
```

Tracked as [CointMU-CLI#215](https://github.com/Cointmu-ORG/CointMU-CLI/issues/215).
:::

---

## cmu wallet create

Generates a new EVM-compatible wallet using `ethers.Wallet.createRandom()`.

### Usage

```bash
cmu wallet create
cmu wallet create --save <name>
```

### Options

| Flag            | Description                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| `--save <name>` | Encrypt the new key into `~/.cmu-wallets.json` under `<name>` and print only the address and mnemonic. Since 1.5.0. |

### Default Behavior

Without `--save`, the address, private key, and mnemonic are printed to standard output:

```bash
New CointMU wallet
===========================
Address     : 0x...
Private key : 0x...
Mnemonic    : word1 word2 word3 ... word12
===========================

warning: back up the private key and mnemonic now - they are shown once.
Store them offline. Without them the funds in this wallet cannot be recovered.

warning: the values above are sensitive and stay behind in terminal
scrollback, tmux or screen logs and CI output. Clear them if this ran anywhere
shared.
hint: `cmu wallet create --save <name>` stores the key encrypted and prints only
the address and a mnemonic backup; activate it with `cmu wallet use <name>`.

To keep this wallet encrypted and use it in a project, run:
  cmu wallet save <name>
  cmu wallet use <name>
```

::: danger WARNING
This command prints the **private key and mnemonic phrase directly in the terminal**. They persist in scrollback, tmux and screen logs, and CI output. Copy them to secure offline storage, then clear the terminal if this ran anywhere shared.
:::

### With `--save <name>`

Available since 1.5.0. The name is checked first, under the same rules as [`cmu wallet save`](#cmu-wallet-save). The command then prompts for a wallet password twice, following the [password policy](#password-policy). Nothing is generated until both have passed. The new key goes straight into `~/.cmu-wallets.json`, encrypted. The private key is never printed:

```bash
New CointMU wallet
===========================
Address  : 0x...
Mnemonic : word1 word2 word3 ... word12
===========================
Saved wallet 'fresh' (0x...), encrypted in ~/.cmu-wallets.json.

warning: write the mnemonic down now - it is shown once and cmu keeps no copy.
~/.cmu-wallets.json holds only the private key, encrypted with your password.
If you lose that file or forget the password, the mnemonic is the only way to
recover this wallet - and anyone who reads it controls the funds.

warning: the mnemonic stays behind in terminal scrollback, tmux or screen logs
and CI output. Clear them if this ran anywhere shared.
hint: run `cmu wallet use fresh` in a project to make it active there.
```

The wallet is saved, not active. Run [`cmu wallet use <name>`](#cmu-wallet-use) in a project to sign with it there.

::: danger THE MNEMONIC IS THE ONLY BACKUP
`cmu` keeps no copy of the mnemonic. If `~/.cmu-wallets.json` is lost or its password forgotten, the printed mnemonic is the only way to recover the funds. Store it offline, then clear the terminal if this ran anywhere shared.
:::

---

## Removed: wallet login

::: warning REMOVED IN 1.6.0
`cmu wallet login` and `cmu wallet create --login` were removed in 1.6.0, after being deprecated since 1.5.0. Both exit with code `1` before asking for anything, and print:

```bash
error: wallet login failed
removed; use wallet save + wallet use (or wallet create --save)
```

`cmu wallet create --login` prints the same message under `error: wallet create failed`.

Use instead:

| You want to                         | Run                                                          |
| ----------------------------------- | ------------------------------------------------------------ |
| Sign with a key you already have    | `cmu wallet save <name>`, then `cmu wallet use <name>`       |
| Sign with a new key                 | `cmu wallet create --save <name>`, then `cmu wallet use <name>` |
| Sign in CI                          | Set `PRIVATE_KEY`; see [Resolving the Signing Key](/docs/cli/deploy#resolving-the-signing-key) |

A `.cmu-session` written by `login` in 1.3.2 or later keeps working with its password, because the file format did not change; one from 1.3.1 or older does not (see [Replacing a Session](#replacing-a-session)). If its key is not saved anywhere else, keep it with [`cmu wallet save <name> --session`](#saving-the-session-key) before running `cmu wallet use` in that project.
:::

---

## cmu wallet balance

Fetches and displays the native token balance of the active session's wallet from the active network.

### Usage

```bash
cmu wallet balance
```

### Requirements

An active wallet session must exist:

```bash
error: wallet balance failed
no active session.
hint: run `cmu wallet use <name>` first, or `cmu wallet create --save <name>` and then `cmu wallet use <name>`.
```

### Output

```bash
Connecting to local (http://127.0.0.1:8585)...
---------------------------
Address : 0x...
Balance : 9076.06 ETH
---------------------------
```

Only the plaintext address in `.cmu-session` is read, so no password is asked for. An unreachable node fails with ethers' raw error, preceded by its `JsonRpcProvider failed to detect network ...` retry notice:

```bash
Connecting to local (http://127.0.0.1:8585)...
JsonRpcProvider failed to detect network and cannot start up; retry in 1s (perhaps the URL is wrong or the node is not started)

error: wallet balance failed
connect ECONNREFUSED 127.0.0.1:8585
```

Tracked as [CointMU-CLI#214](https://github.com/Cointmu-ORG/CointMU-CLI/issues/214).

---

## cmu wallet info

Displays the active session's wallet address, network name, and RPC endpoint without exposing any key material.

### Usage

```bash
cmu wallet info
```

### Requirements

An active wallet session must exist. Run [`cmu wallet use <name>`](#cmu-wallet-use) first.

The session's network must still be saved. If it was deleted — for example from another project, since the saved list is shared — `cmu wallet info` and `cmu wallet balance` fail:

```bash
error: wallet info failed
network 'geth2' is not saved.
hint: list saved networks with `cmu network list`, or add one with `cmu network save <url> --name <name>`.
```

Pick another with [`cmu network use <name>`](/docs/cli/network#cmu-network-use).

### Output

```bash
--- Active session ---
Address      : 0x...
Network      : local
RPC endpoint : http://127.0.0.1:8585
----------------------
```

---

## cmu wallet save

Saves a private key as a named wallet in `~/.cmu-wallets.json`, encrypted with a password of its own. A saved wallet is available to every project on the machine through [`cmu wallet use`](#cmu-wallet-use).

### Usage

```bash
cmu wallet save <name>
cmu wallet save <name> --session
```

### Arguments

| Argument | Description                                                                                 |
| -------- | ------------------------------------------------------------------------------------------- |
| `<name>` | 1–32 characters: lowercase letters, digits, `-` or `_`, starting with a letter or digit.    |

### Options

| Flag        | Description                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| `--session` | Save the key in this project's `.cmu-session` instead of prompting for one. Since 1.5.2. See [Saving the Session Key](#saving-the-session-key). |

### Behavior

The name is checked before anything is prompted:

```bash
error: wallet save failed
invalid wallet name 'Bad'.
hint: use 1-32 lowercase letters, digits, '-' or '_', starting with a letter or digit.
```

A name that is already taken is refused rather than overwritten:

```bash
error: wallet save failed
wallet 'alice' is already saved.
hint: run `cmu wallet delete alice` first to replace it.
```

The command then prompts for:

| Prompt           | Description                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------- |
| Private key      | Masked. An unusable key is rejected at the prompt with `invalid private key - expected a 32-byte hex key (0x-prefixed).` |
| Wallet password  | Must satisfy the [password policy](#password-policy).                                         |
| Confirm password | Must match. A mismatch saves nothing: `passwords do not match.`                               |

The password is asked twice because a typo here cannot be caught later — decrypting with the same mistyped password succeeds, and the real one would never open the wallet.

### Password Policy

A new wallet password — for `cmu wallet save` and `cmu wallet create --save` — must:

- Be at least **12 characters** long.
- Use at least **two** of the following character classes: lowercase, uppercase, digits, symbols.
- Not appear in the CLI's built-in list of common weak passwords.

If the same key is already saved under another name, the command warns and saves it anyway:

```bash
warning: this key is already saved as 'deployer'.
```

The key is encrypted the same way as a session: AES-256-GCM, PBKDF2-SHA-256 at 600,000 iterations, random salt and IV.

### Output

```bash
Saved wallet 'alice' (0x90F79bf6EB2c4f870365E785982E1f101E93b906)
hint: run `cmu wallet use alice` in a project to make it active there.
```

::: info
`cmu wallet save` does not touch `.cmu-session`. Saving a wallet does not make it active anywhere.
:::

### Saving the Session Key

Since 1.5.2, `--session` copies the key that this project's `.cmu-session` already holds into `~/.cmu-wallets.json`. It prompts for nothing, so it also works in a non-interactive session. The saved wallet keeps the session's encryption, so it opens with that session's password:

```bash
Saved wallet 'keep' (0x70997970C51812dc3A010C7d01b50e0d17dc79C8) from .cmu-session.
It opens with this session's password.
hint: run `cmu wallet use keep` in a project to make it active there.
```

Use it to keep a key that exists only in a session — such as one written by `cmu wallet login` before 1.6.0 — before [replacing that session](#replacing-a-session).

| Cause                                               | Message                                             |
| --------------------------------------------------- | --------------------------------------------------- |
| The session's address is already a saved wallet     | `this session's key is already saved as '<name>'.`  |
| No `.cmu-session` here, or one without a usable key | `this project's .cmu-session holds no key to save.` |

The name is checked first, under the same rules as without `--session`.

::: warning
A session written by cmu 1.3.1 or older uses an earlier encryption format, and `--session` reports it as holding no key even though it does. See [Replacing a Session](#replacing-a-session).
:::

---

## cmu wallet use

Makes a saved wallet the active session of the current project.

### Usage

```bash
cmu wallet use <name>
```

### Behavior

1. Looks the wallet up in `~/.cmu-wallets.json`.
2. If the current `.cmu-session` holds a key that is not a saved wallet, asks before replacing it — see [below](#replacing-an-unsaved-key). This happens before any password prompt.
3. Prompts for that wallet's password and decrypts the key to check it.
4. Confirms that the decrypted key belongs to the address stored next to it.
5. Copies the encrypted key into `.cmu-session`, keeping the session's [active network](#active-network).

The session is a **copy**: it opens with the wallet's password, and deleting the wallet later does not affect it.

`cmu wallet use` is the only command that writes a key into `.cmu-session`.

### Output

```bash
Active wallet is now 'alice' (0x90F79bf6EB2c4f870365E785982E1f101E93b906)
Active network: local
```

### Errors

| Cause                                         | Message                                                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| No wallet by that name                        | `wallet '<name>' is not saved.`                                                                |
| Wrong password, or the ciphertext was altered | `wrong password for wallet '<name>', or ~/.cmu-wallets.json has been tampered with.`           |
| The stored address does not match the key     | `wallet '<name>' does not hold the key for 0x... - ~/.cmu-wallets.json has been modified.`     |

### Replacing an Unsaved Key

Since 1.5.2, if the current session holds a key that is **not** a saved wallet — such as one written by `cmu wallet login` before 1.6.0 — `cmu wallet use` names it and asks before any password prompt, defaulting to **no**:

```bash
warning: .cmu-session holds the key for 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, which is not a saved wallet.
Replacing the session deletes that key for good - cmu keeps no other copy and cannot recover it.
hint: keep it first with `cmu wallet save <name> --session`, then run this command again.
? Replace it anyway? (y/N)
```

Declining leaves `.cmu-session` unchanged and exits with code `1`:

```bash
error: wallet use failed
aborted: .cmu-session was not changed; it still holds 0x70997970C51812dc3A010C7d01b50e0d17dc79C8.
```

In a non-interactive session the question cannot be asked, so the command refuses. There is no flag to skip it. The three warning lines above are still printed first, then:

```bash
error: wallet use failed
cannot prompt for confirmation in a non-interactive session.
hint: keep the key first with `cmu wallet save <name> --session`, or run this in a terminal to confirm.
```

After [`cmu wallet save <name> --session`](#saving-the-session-key) the key is a saved wallet, and `cmu wallet use` replaces the session without asking.

### Active Network

`cmu wallet use` keeps the network the previous session had selected, so switching wallets does not undo a [`cmu network use <name>`](/docs/cli/network).

| Previous session                                | Active network after `use` |
| ----------------------------------------------- | -------------------------- |
| None — first `use` in this project              | `local`                    |
| Selected a network that is still saved          | That network               |
| Selected a network that has since been deleted  | `local`, with a warning    |
| Unreadable or corrupt                           | `local`                    |

```bash
warning: network 'staging' is no longer saved - active network reset to local.
```

The `Active network:` line in the output always names the network the new session points at.

---

## cmu wallet list

Lists the saved wallets. No password is needed — addresses are stored in plaintext.

### Usage

```bash
cmu wallet list
```

### Output

Saved wallets whose address matches the current project's session are marked with `[*]`. The same key saved under two names marks both:

```bash

Saved wallets
==========================================================================
| Active | Name                             | Address
--------------------------------------------------------------------------
| [*]    | alice                            | 0x90F79bf6EB2c4f870365E785982E1f101E93b906
|        | deployer                         | 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
==========================================================================

```

With nothing saved:

```bash
No saved wallets.
hint: save one with `cmu wallet save <name>`.
```

---

## cmu wallet delete

Deletes a saved wallet from `~/.cmu-wallets.json`.

### Usage

```bash
cmu wallet delete <name>
cmu wallet delete <name> --yes
```

### Options

| Flag        | Description                              |
| ----------- | ---------------------------------------- |
| `-y, --yes` | Delete without asking for confirmation.  |

### Behavior

Without `--yes` the command asks first, defaulting to **no**:

```bash
? Delete wallet 'alice' (0x90F79bf6EB2c4f870365E785982E1f101E93b906)? cmu keeps no other copy of its key. (y/N)
```

Declining prints `Nothing deleted.` In a non-interactive session without `--yes`, the command refuses:

```bash
error: wallet delete failed
cannot prompt for confirmation in a non-interactive session.
hint: re-run with --yes to delete without asking.
```

### Output

```bash
Deleted wallet 'alice'.
This project's .cmu-session keeps its own copy and still works.
hint: projects that already ran `cmu wallet use alice` keep their own encrypted copy in .cmu-session.
```

The second line only appears when the current project's session holds the deleted wallet.

---

## cmu wallet transfer

Sends ETH from the session wallet to an address, on the session's active network.

### Usage

```bash
cmu wallet transfer <to> <amount>
cmu wallet transfer <to> <amount> --yes
```

### Arguments

| Argument   | Description                                              |
| ---------- | -------------------------------------------------------- |
| `<to>`     | The recipient: a `0x`-prefixed, 40-digit hex address.    |
| `<amount>` | The amount in ETH, as a plain decimal such as `0.5`.     |

### Options

| Flag        | Description                                                                         |
| ----------- | ----------------------------------------------------------------------------------- |
| `-y, --yes` | Send without the final confirmation. The session password is still asked for.       |

### Signing Key and Network

The transfer always signs with the key in `.cmu-session` and always uses the session's active network — the same network [`cmu wallet balance`](#cmu-wallet-balance) reports.

| Source                        | Used by `cmu wallet transfer`  |
| ----------------------------- | ------------------------------ |
| `.cmu-session`                | Yes — the only key source      |
| `PRIVATE_KEY` (env or `.env`) | **No**, and a warning says so  |
| `defaultNetwork` / `-n`       | **No** — there is no `-n` flag |
| `cmu network use <name>`      | Yes                            |

```bash
warning: PRIVATE_KEY is set (environment or .env) - transfer ignores it and signs with the session wallet.
```

::: warning
The session password is always prompted for, so `cmu wallet transfer` cannot run in a non-interactive session, even with `--yes`:

```bash
error: wallet transfer failed
cannot prompt for the session password in a non-interactive session.
hint: transfer signs with the .cmu-session key and needs its password; run it in a terminal.
```
:::

### Validation

Both arguments are checked before the command connects to anything.

| `<to>` input                                    | Result                                       |
| ----------------------------------------------- | -------------------------------------------- |
| `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`    | Accepted.                                    |
| All-lowercase `0x...`                           | Accepted.                                    |
| Mixed case with a wrong checksum                | Rejected — `bad address checksum`.           |
| No `0x` prefix                                  | Rejected.                                    |
| An ENS name such as `vitalik.eth`               | Rejected — ENS names are never resolved.     |

| `<amount>` input | Result                               |
| ---------------- | ------------------------------------ |
| `1`, `0.5`       | Accepted.                            |
| `0`              | Rejected — must be greater than 0.   |
| `-1`             | Rejected.                            |
| `.5`, `1.`       | Rejected — write `0.5` or `1`.       |
| `1e3`            | Rejected.                            |
| 19+ decimals     | Rejected — 1 wei is 18 decimals.     |

```bash
error: wallet transfer failed
invalid amount ".5" - expected a positive decimal ETH value like 0.5.
hint: no sign, exponent, separators or bare leading/trailing dot: write 1 or 0.5.
```

### Pre-Send Checks

Everything that can be checked is checked **before** the password prompt, in this order:

1. The recipient and amount, as above.
2. An active session holding an encrypted key.
3. The node answers within 3 seconds.
4. The balance covers the amount.
5. The node can estimate the transfer — a contract with no payable `receive()` or `fallback()` fails here.
6. The balance covers the amount plus the maximum fee.
7. `--yes` is not being used to send to the zero address.

| Failure                     | Message                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| Balance below the amount    | `insufficient balance: 100.0 ETH, the transfer needs 1000.0 ETH plus fee.`                  |
| Balance below amount + fee  | `balance ... ETH covers the amount but not the max fee (... ETH).`                          |
| Recipient rejects plain ETH | `0x... would reject this transfer - the node could not estimate it (...).`                  |
| Zero address with `--yes`   | `--yes does not cover sending to the zero address.`                                         |

These conditions warn but do not stop the transfer:

```bash
warning: funds sent to the zero address are burned and cannot be recovered.
warning: 0x90F79bf6EB2c4f870365E785982E1f101E93b906 is the sending wallet - this only spends the fee.
warning: 0x... is a contract - plain ETH can be rejected or locked by it.
```

### Confirmation

After the password is accepted, the transfer is summarized and — unless `--yes` is passed — confirmed, defaulting to **no**. The two connection lines come from the node check in step 3 and print before the password prompt:

```bash
Pinging http://127.0.0.1:8585...
Connected to 'local' (chain ID 1912).

--- Transfer ---
Network : local (chain ID 1912)
From    : 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (.cmu-session, saved as 'alice')
To      : 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Amount  : 1.5 ETH (1500000000000000000 wei)
Max fee : 0.000063003 ETH
----------------
? Send this transaction? (y/N)
```

`saved as` appears when the session's address is also a saved wallet. Declining, or pressing `Ctrl+C` at either prompt, exits with `aborted: nothing was sent.`

### Output

```bash
Tx hash : 0x48ee9e16c3872f958117e9f65d78d680e6ffae0b6b2a166fc2664008158c8878
Waiting for 1 confirmation (up to 120s)...
---------------------------
Block   : 1
Balance : 98.499960625 ETH
---------------------------
```

The hash is printed before waiting, so it survives a `Ctrl+C` during the wait.

### Exit Codes

| Code | Meaning                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------ |
| `0`  | Sent and included in a block.                                                                    |
| `1`  | The transfer failed. Usually nothing was sent; see the cases below.                              |
| `2`  | Sent, but not confirmed within 120 seconds. **Do not retry blindly** — check the balance first.  |

Two exit-`1` failures happen after the transaction left the CLI:

| Failure                       | Message                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Mined but reverted            | `transaction 0x... was mined but reverted - the fee was paid, the amount was not transferred.`                                           |
| Sending failed                | `could not send the transaction: ...` — on a network error it may still have been broadcast; check `cmu wallet balance` before retrying. |

Exit `2` is kept separate from `1` so a script cannot mistake an unconfirmed transfer for a failed one and send it twice:

```bash
warning: transaction 0x3ab892210083d062ec6fd4060e491081aaa9fdd9d453e2fcb8db21022ca85217 was sent but is not in a block after 120s.
hint: blocks only appear while this node mines - `cmu mine status` shows whether it does and where its rewards go. `cmu mine start` would move the node's etherbase to your wallet for everyone. Either way, check `cmu wallet balance` before sending again.
```

The hint depends on what the node reports for `eth_mining`, asked with a 3-second limit:

| Node                               | Hint                                                                                                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No `eth_mining` — the local DevNet | `` the local DevNet puts each transaction in a block at once, so a missing confirmation means the node stopped or dropped it - check it is still running (`cmu node start`), then check `cmu wallet balance` before sending again. `` |
| Mining                             | `` this node is mining, but the first block after a start can take minutes while ethash builds its DAG - wait a little (`cmu mine status` shows progress), then check `cmu wallet balance` before sending again. ``                   |
| Not mining                         | The `blocks only appear while this node mines` hint above.                                                                                                                                                                            |
| No answer                          | `` the node did not answer a follow-up check - make sure it is still reachable, then check `cmu wallet balance` before sending again. ``                                                                                              |

When the confirmation could not be checked at all, rather than timing out, the warning reads `transaction 0x... was sent, but its confirmation could not be checked (...)`. Exit code `2` and the hint are the same.

A wrong session password stops the transfer with the session error shown under [Session File](#session-file):

```bash
error: wallet transfer failed
Invalid session password, or .cmu-session is from an older version or has been tampered with.
hint: check the password. To start a fresh session, run `cmu wallet use <name>`.
```

---

## Replacing a Session

A project has one `.cmu-session`, and [`cmu wallet use`](#cmu-wallet-use) is the only command that writes a key into it.

| The current session's key is…          | `cmu wallet use <name>`                                                |
| -------------------------------------- | ---------------------------------------------------------------------- |
| A saved wallet                         | Replaced without asking — the key is still in `~/.cmu-wallets.json`.   |
| Not a saved wallet                     | Asks first, defaulting to no; refuses without a terminal. Since 1.5.2. |
| Unreadable, or from cmu 1.3.1 or older | **Replaced without asking** — see the warning below.                   |

::: danger REPLACING AN UNSAVED KEY DELETES IT
If you answer yes, a key that exists nowhere else — such as one written by `cmu wallet login` or `cmu wallet create --login` before 1.6.0 — is gone, along with any funds sent to it. Keep it first with [`cmu wallet save <name> --session`](#saving-the-session-key).
:::

::: danger SESSIONS REPLACED WITHOUT ASKING
`cmu wallet use` only asks when it can read the old session and open its key format. It replaces these without asking, even though the key in them can still be recovered with its password:

- A session written by **cmu 1.3.1 or older**, which used AES-256-CBC and has no `authTag` field. `cmu wallet save <name> --session` cannot keep it either.
- A session whose JSON **does not parse**, such as one with a stray comma from a hand edit. The encrypted key is still in the file.

Before running `cmu wallet use` in a project that may hold such a session, copy `.cmu-session` somewhere safe. Tracked as [CointMU-CLI#209](https://github.com/Cointmu-ORG/CointMU-CLI/issues/209).
:::

---

## Session File

`cmu wallet use` writes a `.cmu-session` file to the current working directory. It is required by `cmu wallet balance`, `cmu wallet info`, `cmu wallet transfer`, `cmu mine`, and by `cmu network use`, `cmu network info` and `cmu network ping` without a name. All of them except `transfer` read only the plaintext `address` and `activeNetwork`, and never ask for the password.

A `.cmu-session` written by `cmu wallet login` in 1.3.2 through 1.5.x has the same format and keeps working. One written by 1.3.1 or older uses an earlier format that 1.6.0 cannot open.

| Field           | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `address`       | The public address of the active wallet.                           |
| `activeNetwork` | The name of the currently selected network.                        |
| `encryptedKey`  | The AES-256-GCM encrypted private key.                             |
| `salt`          | Hex-encoded PBKDF2 salt used for key derivation.                   |
| `iv`            | Hex-encoded initialization vector used during encryption.          |
| `authTag`       | Hex-encoded GCM authentication tag. A tampered file is rejected.   |
| `iterations`    | PBKDF2 work factor used for this session. Absent on legacy files.  |

The private key is encrypted using:

- **Algorithm** — `AES-256-GCM`
- **Key derivation** — `PBKDF2` with `SHA-256`, 600,000 iterations, random 16-byte salt
- **IV** — random 12-byte initialization vector per session
- **Authentication** — a GCM authentication tag is stored alongside the ciphertext

The file is written with `0600` permissions so it is readable only by the owning user.

::: info
Sessions created before the iteration count was recorded are read back at the legacy work factor of 100,000 iterations.
:::

A wrong password, or a session file that has been altered, is caught by the GCM authentication tag:

```bash
Invalid session password, or .cmu-session is from an older version or has been tampered with.
hint: check the password. To start a fresh session, run `cmu wallet use <name>`.
```

### Use by `cmu deploy` and `cmu console`

When neither `wallet.privateKey` in `cmu.config` nor `PRIVATE_KEY` yields a key, [`cmu deploy`](/docs/cli/deploy) and [`cmu console`](/docs/cli/console) fall back to this session: they prompt once for the password, decrypt the key, and cache it in memory for the rest of that CLI process. Dry runs (`--config`, `--ping`) and `cmu console --no-signer` never trigger the prompt.

::: warning
`.cmu-session` contains encrypted key material. Do not commit this file to version control. Projects scaffolded with `cmu create` already list it in the generated `.gitignore`.
:::

---

## Saved Wallets File

`cmu wallet save` writes `~/.cmu-wallets.json` in your **home directory**, so saved wallets are shared by every project on the machine.

| Field                                                           | Description                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------------------- |
| `version`                                                       | File format version. Currently `1`.                                 |
| `wallets[].name`                                                | The name used by `use` and `delete`.                                |
| `wallets[].address`                                             | Plaintext address, so `list` needs no password.                     |
| `wallets[].encryptedKey`, `salt`, `iv`, `authTag`, `iterations` | The encrypted key, in the same format as `.cmu-session`.            |

The file is created on the first save with `0600` permissions and is rewritten atomically, so an interrupted write leaves the previous file intact.

An unreadable file is reported rather than treated as empty — otherwise the next save would overwrite a file full of encrypted keys with an empty list:

| Condition                         | Message                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| Written by a newer `cmu`          | `~/.cmu-wallets.json was written by a newer version of cmu.`  |
| Malformed or wrong shape          | `~/.cmu-wallets.json is not a valid wallets file.`            |

::: info
The stored address is not covered by the GCM tag. `cmu wallet use` therefore takes the address from the decrypted key and refuses an entry whose stored address does not match it.
:::
