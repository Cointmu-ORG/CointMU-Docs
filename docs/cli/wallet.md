# cmu wallet

`cmu wallet` provides wallet management commands for generating, authenticating, and inspecting EVM-compatible wallets on the CointMU network.

## Usage

```bash
cmu wallet <subcommand> [options]
```

`-v, --verbose` is available globally; see [Global Options](/docs/cli/overview#global-options).

## Subcommands

| Subcommand           | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| `cmu wallet create`  | Generate a new EVM-compatible wallet.                          |
| `cmu wallet login`   | Log in and store the key in an encrypted session.              |
| `cmu wallet balance` | Show the native token balance of the logged-in wallet.         |
| `cmu wallet info`    | Show the active wallet session.                                |

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

warning: the private key and mnemonic were not printed - this wallet
exists only inside .cmu-session. Lose that file or its password and the funds
in it cannot be recovered.
hint: run `cmu wallet create` without --login for a printed backup.

`cmu deploy` will use this key automatically when PRIVATE_KEY is not set.
```

::: danger NO BACKUP EXISTS
A wallet created with `--login` exists **only** inside `.cmu-session`. There is no printed backup and the mnemonic is unrecoverable. Losing the file or forgetting its password loses the funds.

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
`cmu deploy` will use this key automatically when PRIVATE_KEY is not set.
```

::: warning
Logging in sets the active network to `local`, **every time**. This is not limited to the first login — re-running `cmu wallet login` to rotate a key silently discards a previous [`cmu network use <name>`](/docs/cli/network) selection.

Re-run `cmu network use <name>` after any login, and check with `cmu wallet info` before deploying.
:::

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

## Session File

`cmu wallet login` writes a `.cmu-session` file to the current working directory. This file is required by several other `cmu` commands including `cmu mine`, `cmu network`, and `cmu wallet balance`.

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
