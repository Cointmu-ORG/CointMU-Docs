# cmu wallet

`cmu wallet` provides wallet management commands for generating, authenticating, saving, switching between, and spending from EVM-compatible wallets on the CointMU network.

## Usage

```bash
cmu wallet <subcommand> [options]
```

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

## Subcommands

| Subcommand                           | Description                                                    |
| ------------------------------------ | -------------------------------------------------------------- |
| `cmu wallet create`                  | Generate a new EVM-compatible wallet.                          |
| `cmu wallet login`                   | Log in and store the key in an encrypted session.              |
| `cmu wallet balance`                 | Show the native token balance of the logged-in wallet.         |
| `cmu wallet info`                    | Show the active wallet session.                                |
| `cmu wallet save <name>`             | Save a private key as a named, encrypted wallet. Alias: `add`. |
| `cmu wallet use <name>`              | Make a saved wallet the active session in this project.        |
| `cmu wallet list`                    | List saved wallets.                                            |
| `cmu wallet delete <name>`           | Delete a saved wallet.                                         |
| `cmu wallet transfer <to> <amount>`  | Send ETH from the session wallet. Alias: `tf`.                 |

There are two places a key can live:

| Location                   | Scope                        | Written by                                       |
| -------------------------- | ---------------------------- | ------------------------------------------------ |
| `.cmu-session`             | The current project          | `login`, `create --login`, `use`                 |
| `~/.cmu-wallets.json`      | Every project on the machine | `save`                                           |

Commands that sign — `cmu deploy`, `cmu console`, `cmu wallet transfer` — only ever read `.cmu-session`. A saved wallet is used by running `cmu wallet use <name>` in a project, which copies it into that project's session.

::: info
Every subcommand that prompts — `create --login`, `login`, `save`, `use`, `delete` without `--yes`, and `transfer` — refuses in a non-interactive session rather than hanging on a prompt nobody can answer:

```bash
error: wallet login failed
cannot prompt for a private key in a non-interactive session.
hint: run this in a terminal; in CI, set PRIVATE_KEY instead.
```
:::

---

## cmu wallet create

Generates a new EVM-compatible wallet using `ethers.Wallet.createRandom()`.

### Usage

```bash
cmu wallet create
cmu wallet create --login
```

### Options

| Flag      | Description                                                                |
| --------- | -------------------------------------------------------------------------- |
| `--login` | Encrypt the new key straight into a session instead of printing it.        |

### Default Behavior

Without `--login`, the address, private key, and mnemonic are printed to standard output:

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
hint: `cmu wallet create --login` encrypts the key into a session
instead of printing it.

To start an encrypted local session with this wallet, run:
  cmu wallet login
```

::: danger WARNING
This command prints the **private key and mnemonic phrase directly in the terminal**. They persist in scrollback, tmux and screen logs, and CI output. Copy them to secure offline storage, then clear the terminal if this ran anywhere shared.
:::

### With `--login`

The generated key goes straight into an encrypted session. Neither the key nor the mnemonic is ever printed, so nothing recoverable reaches scrollback or a CI log:

```bash
New CointMU wallet
===========================
Address : 0x...
===========================
Session encrypted and saved.
Active network: local

warning: the private key and mnemonic were not printed - this wallet
exists only inside .cmu-session. Lose that file or its password and the funds
in it cannot be recovered.
hint: run `cmu wallet create` without --login for a printed backup.

`cmu deploy` will use this key automatically when PRIVATE_KEY is not set.
```

::: danger NO BACKUP EXISTS
A wallet created with `--login` exists **only** inside `.cmu-session`. There is no printed backup and the mnemonic is unrecoverable. Losing the file or forgetting its password loses the funds.

Running `cmu wallet create --login` or `cmu wallet login` again in the same project **overwrites** that session without asking — see [Replacing a Session](#replacing-a-session).

Use `--login` for throwaway development keys. For anything you intend to keep, run `cmu wallet create` without it and store the backup offline.
:::

---

## cmu wallet login

Authenticates into an existing wallet using its private key and creates an AES-256-GCM encrypted session file at `.cmu-session`.

### Usage

```bash
cmu wallet login
```

### Behavior

The command prompts for two inputs:

| Prompt           | Description                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Private key      | The wallet's private key. Input is masked. Validated as a valid EVM key before proceeding.             |
| Session password | A password used to encrypt the private key in the session file. Must satisfy the password policy below. |

An unusable key is rejected at the prompt with `invalid private key - expected a 32-byte hex key (0x-prefixed).`

**Password policy:**

- Minimum **12 characters**.
- At least **two** of the following character classes: lowercase, uppercase, digits, symbols.
- Must not appear in the CLI's built-in list of common weak passwords.

The private key is encrypted using:

- **Algorithm** — `AES-256-GCM`
- **Key derivation** — `PBKDF2` with `SHA-256`, 600,000 iterations, random 16-byte salt
- **IV** — random 12-byte initialization vector per session
- **Authentication** — a GCM authentication tag is stored alongside the ciphertext

The resulting session file (`.cmu-session`) stores the encrypted key, salt, IV, authentication tag, iteration count, wallet address, and active network name. It is written with `0600` permissions so it is readable only by the owning user.

::: info
Sessions created before the iteration count was recorded are read back at the legacy work factor of 100,000 iterations. Running `cmu wallet login` again rewrites the session at the current 600,000-iteration default.
:::

A wrong password, or a session file that has been altered, is caught by the GCM authentication tag:

```bash
Invalid session password, or .cmu-session is from an older version or has been tampered with.
hint: run `cmu wallet login` again to recreate the session.
```

### Output

```bash
Session encrypted and saved.
Logged in as 0x...
Active network: local
`cmu deploy` will use this key automatically when PRIVATE_KEY is not set.
```

### Active Network

Logging in keeps the network the previous session had selected, so rotating a key does not undo a [`cmu network use <name>`](/docs/cli/network). The same rule applies to `cmu wallet create --login` and `cmu wallet use`.

| Previous session                                | Active network after login |
| ----------------------------------------------- | -------------------------- |
| None — first login in this project              | `local`                    |
| Selected a network that is still saved          | That network               |
| Selected a network that has since been deleted  | `local`, with a warning    |
| Unreadable or corrupt                           | `local`                    |

```bash
warning: network 'staging' is no longer saved - active network reset to local.
```

The `Active network:` line in the output always names the network the new session points at.

---

## cmu wallet balance

Fetches and displays the native token balance of the currently logged-in wallet from the active network.

### Usage

```bash
cmu wallet balance
```

### Requirements

An active wallet session must exist:

```bash
error: wallet balance failed
no active session.
hint: run `cmu wallet login` first.
```

### Output

```bash
Connecting to local (http://127.0.0.1:8585)...
---------------------------
Address : 0x...
Balance : 9076.06 ETH
---------------------------
```

---

## cmu wallet info

Displays the active session's wallet address, network name, and RPC endpoint without exposing any key material.

### Usage

```bash
cmu wallet info
```

### Requirements

An active wallet session must exist. Run `cmu wallet login` first.

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
cmu wallet add <name>
```

### Arguments

| Argument | Description                                                                                 |
| -------- | ------------------------------------------------------------------------------------------- |
| `<name>` | 1–32 characters: lowercase letters, digits, `-` or `_`, starting with a letter or digit.    |

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
| Private key      | Masked, and validated exactly as for `cmu wallet login`.                                      |
| Wallet password  | Must satisfy the [password policy](#cmu-wallet-login).                                        |
| Confirm password | Must match. A mismatch saves nothing: `passwords do not match.`                               |

The password is asked twice because a typo here cannot be caught later — decrypting with the same mistyped password succeeds, and the real one would never open the wallet.

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

---

## cmu wallet use

Makes a saved wallet the active session of the current project.

### Usage

```bash
cmu wallet use <name>
```

### Behavior

1. Looks the wallet up in `~/.cmu-wallets.json`.
2. Prompts for that wallet's password and decrypts the key to check it.
3. Confirms that the decrypted key belongs to the address stored next to it.
4. Copies the encrypted key into `.cmu-session`, keeping the session's [active network](#active-network).

The session is a **copy**: it opens with the wallet's password, and deleting the wallet later does not affect it.

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

::: warning
If the current session holds a key that is **not** a saved wallet, `cmu wallet use` replaces it anyway. The warning is printed after the password prompt, and the command does not stop:

```bash
warning: replacing the session for 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 - that key is not a saved wallet.
hint: enter it again with `cmu wallet login` or `cmu wallet save` if you still need it.
```

See [Replacing a Session](#replacing-a-session).
:::

---

## cmu wallet list

Lists the saved wallets. No password is needed — addresses are stored in plaintext.

### Usage

```bash
cmu wallet list
```

### Output

The wallet the current project's session holds is marked with `[*]`:

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
cmu wallet tf <to> <amount> --yes
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

After the password is accepted, the transfer is summarized and — unless `--yes` is passed — confirmed, defaulting to **no**:

```bash
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
warning: transaction 0x... was sent but is not in a block after 120s.
hint: blocks only appear while something mines - `cmu mine start`, then check `cmu wallet balance` before sending again.
```

::: info
The local DevNet started by [`cmu node start`](/docs/cli/node) mines a block for every transaction, so a transfer there confirms immediately. The `cmu mine start` hint does not apply to it — `cmu mine` does not work against the DevNet. Tracked as [CointMU-CLI#184](https://github.com/Cointmu-ORG/CointMU-CLI/issues/184).
:::

A wrong session password stops the transfer with the session error shown under [`cmu wallet login`](#cmu-wallet-login). Its hint suggests `cmu wallet login` even when the session came from `cmu wallet use`, where re-running `cmu wallet use <name>` is the fix. Tracked as [CointMU-CLI#188](https://github.com/Cointmu-ORG/CointMU-CLI/issues/188).

---

## Replacing a Session

A project has one `.cmu-session`. `cmu wallet login`, `cmu wallet create --login`, and `cmu wallet use` all overwrite it.

| Command                     | When the current session's key is not a saved wallet  |
| --------------------------- | ----------------------------------------------------- |
| `cmu wallet login`          | Overwritten silently                                  |
| `cmu wallet create --login` | Overwritten silently                                  |
| `cmu wallet use <name>`     | Overwritten, with a warning after the password prompt |

::: danger POTENTIAL DATA LOSS
None of these commands asks before replacing a session. If the replaced key exists nowhere else — in particular a wallet made with `cmu wallet create --login`, which has no printed backup — it is gone, along with any funds sent to it.

Before logging in or switching wallets in a project, run `cmu wallet save <name>` for any session key you want to keep. Tracked as [CointMU-CLI#182](https://github.com/Cointmu-ORG/CointMU-CLI/issues/182).
:::

---

## Session File

`cmu wallet login`, `cmu wallet create --login`, and `cmu wallet use` write a `.cmu-session` file to the current working directory. This file is required by several other `cmu` commands including `cmu mine`, `cmu network`, `cmu wallet balance`, and `cmu wallet transfer`.

| Field           | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `address`       | The public address of the logged-in wallet.                        |
| `activeNetwork` | The name of the currently selected network.                        |
| `encryptedKey`  | The AES-256-GCM encrypted private key.                             |
| `salt`          | Hex-encoded PBKDF2 salt used for key derivation.                   |
| `iv`            | Hex-encoded initialization vector used during encryption.          |
| `authTag`       | Hex-encoded GCM authentication tag. A tampered file is rejected.   |
| `iterations`    | PBKDF2 work factor used for this session. Absent on legacy files.  |

### Use by `cmu deploy`

When `PRIVATE_KEY` is not set in the environment, [`cmu deploy`](/docs/cli/deploy) falls back to this session: it prompts once for the password, decrypts the key, and caches it in memory for the rest of that CLI process. Dry runs (`--config`, `--ping`) never trigger the prompt.

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
