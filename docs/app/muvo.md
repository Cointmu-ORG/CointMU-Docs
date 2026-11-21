# Muvo Mobile Wallet

Muvo is the CointMU wallet for phones. You can create or import wallets, check balances, and send and receive CMU and CointMU tokens. Your keys stay on the phone. Muvo is a thin client: it runs no node and does not mine. Instead, it talks to a CointMU node over JSON-RPC.

This page describes Muvo **1.2.0**, codename **BettaSplendens**. Muvo has its own version number. It is unrelated to the [desktop app](/docs/app/changelog) and the [CLI](/docs/cli/changelog).

::: info Verified on
Muvo was not run on a phone for these docs. This page was written from the app's source at the `v1.2.0` tag of [Cointmu-ORG/CointMU-MobileApp](https://github.com/Cointmu-ORG/CointMU-MobileApp). The version, the package id, the Android versions, the permissions and the preset nodes were also read from the 1.2.0 APK built by the release workflow, without installing it. Everything else on this page is *source-only*.
:::

## Requirements

| Requirement | Notes                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Android     | Android 7.0 (API 24) or newer. One universal APK covers `arm64-v8a`, `armeabi-v7a`, `x86` and `x86_64`.                                                |
| iOS         | Not available. The project is set up for iOS (`com.cointmu.muvo`, tablets supported), but no iOS build is published.                                   |
| Network     | The three CointMU nodes on the campus network (see [Network](#network)). Off campus, connect through the VPN, or the app cannot read balances or send. |
| Phone lock  | A screen lock is recommended. The keys are stored with Android's secure storage, and biometric unlock needs a fingerprint or face set up on the phone. |

## Getting Muvo

Muvo is not on Google Play or the App Store. Android builds are published as an APK on the [CointMU-MobileApp releases page](https://github.com/Cointmu-ORG/CointMU-MobileApp/releases). Each release has:

- `Muvo-<version>-<codename>.apk`: the app.
- `Muvo-<version>-<codename>.apk.sha256`: its SHA-256 checksum.

Check the download before you install it. On a computer, put both files in one folder and run:

```bash
sha256sum -c Muvo-<version>-<codename>.apk.sha256
```

Then copy the APK to the phone and open it. Android asks you to allow installing apps from that source. Every release is signed with the same release key, so a newer APK installs over an older one and keeps your wallets. An APK signed with any other key cannot update Muvo.

Muvo does not update itself. To update, install the newer APK from the releases page.

::: warning
Install Muvo only from the CointMU-MobileApp releases page, and only if the checksum matches. A wallet app from anywhere else can steal your keys.
:::

## First Run

On first start, *Welcome to Muvo* offers **Create a new wallet** or **I already have a wallet**.

**Create a new wallet:**

1. Muvo generates a 12-word recovery phrase. This can take a few seconds.
2. *Your recovery phrase* shows the words once. Write them down in order and keep them offline. Screenshots are blocked on this screen.
3. *Check your backup* asks for three of the words. The wallet is only activated once they match.
4. Set a 6-digit PIN.

**I already have a wallet** imports one of these:

- A recovery phrase of 12 or 24 words.
- A private key (64 hex characters). A wallet imported from a private key has no recovery phrase and only one account. Muvo makes you confirm *I have my own backup of this private key* before importing it.

A phrase or key whose first address is already in Muvo is refused.

If Muvo is closed during setup, it continues at the same step the next time it opens.

After the PIN is set, a one-time notice explains error reporting (see [Security and Privacy](#security-and-privacy)).

## Screens

Muvo has four tabs: **Home**, **Wallets**, **History** and **Settings**.

| Screen   | What it does                                                                                                                                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home     | Total balance, a swipeable row of account cards, **Transfer** and **Scan QR**, and *Recent activity* (the newest ten transfers of all accounts, with **See all**). Pull down to refresh. The eye button hides or shows balances.                      |
| Wallets  | One card per account, grouped by wallet: name, color, icon, balance, short address, and a **Default** badge on the account used for transfers. **+** adds an account, creates another wallet or imports one. Long-press or **…** opens a card's menu. |
| History  | Transfers of all accounts, filtered with a row of chips (**All**, or one account). Tap a row for its details.                                                                                                                                         |
| Settings | Network, Wallets and accounts, Default account for transfers, Security, Appearance, Language (English or Bahasa Indonesia), Privacy and About.                                                                                                        |

Tapping an account card opens that account's screen: its balance, **Send**, **Receive** and **Scan**, its tokens, its activity, and the **…** menu.

A card's menu has these entries:

- **Personalize**: name, color and icon.
- **Set as default**.
- **Show receive QR code**.
- **Show private key**.

A wallet is removed from Settings → Security (see [Security and Privacy](#security-and-privacy)).

### Wallets and Accounts

- Muvo holds up to 10 wallets.
- A wallet is one recovery phrase or private key, plus its accounts.
- A phrase wallet can add more accounts from the same phrase, on the path `m/44'/60'/0'/0/<index>`.
- **Default account for transfers** in Settings chooses the account that **Transfer** and **Scan QR** on Home start from. You can still pick another account for a single transfer.

### Receive, Scan and Tokens

- **Receive** shows the account's address as a QR code, with **Copy address** and **Share address**. Only send CMU or CointMU tokens to it.
- **Scan** reads a CointMU address or payment QR code, then opens the send form with it filled in. Nothing is sent until you review and confirm. Before Android asks for camera access, Muvo explains why it needs it.
- **Tokens** (from **Manage**) adds an ERC-20 token by its contract address.
  - Muvo reads the token's symbol, decimals and name from the contract, and shows an *Unverified token* warning before adding it.
  - Tokens you added can be removed. Built-in tokens can only be hidden, and there are none yet.

## Sending

1. **The form.** Choose **From** (the account), the asset and the **Recipient address**, by typing, pasting or **Scan QR**. Then enter the amount.
   - An address with wrong capital letters (a bad checksum) is refused.
   - **Max** fills in the CMU balance minus the network fee, or the whole balance of a token.
   - Then tap **Review**.
2. **Review.** Shows From, To (the full address), the amount, the *Network fee (at most)*, the total and the network node.
   - The fee is fetched again when the screen opens, and again before signing if it is older than 30 seconds.
   - Muvo warns, but does not stop you, when you send to your own address or to a contract.
   - A token send also needs CMU, because the fee is paid in CMU.
3. **Confirm and send.** Enter your PIN, or use biometrics. Every send asks.
   - Muvo checks that the node is on chain ID 1912, then signs on the phone and sends the transaction once.
   - If the network does not answer in time, the result says *Sent, waiting for the network*, and Muvo keeps checking. Don't send again until the status updates.

A sent transaction moves through these statuses:

| Status         | Meaning                                                                           |
| -------------- | --------------------------------------------------------------------------------- |
| Pending        | Sent, not in a block yet.                                                         |
| Confirmed n/12 | In a block, with that many confirmations.                                         |
| Final          | 12 confirmations, about 2.5 minutes.                                              |
| Failed         | The transaction ran and was reverted.                                             |
| Replaced       | Another transaction with the same nonce was mined instead.                        |
| Dropped        | The node no longer knows the transaction, and its nonce was unused for 3 minutes. |

Muvo cannot speed up or cancel a pending transaction.

## Security and Privacy

- **Keys.**
  - Recovery phrases and private keys are kept only in Android's secure storage (`expo-secure-store`), one item per wallet. They are only readable while the phone is unlocked, and only on this device.
  - They are never copied to the clipboard, logs or error reports.
  - The app is excluded from Android backups, so the keys are not in a phone backup either.
- **PIN.**
  - A 6-digit PIN unlocks the app and approves every send, reveal and wallet removal.
  - It is stored as a salted PBKDF2-SHA-256 hash (2,000 iterations), never in plain text.
  - After 4 wrong attempts, each further one locks the PIN for longer: 30 seconds, 1, 5 and 15 minutes, then 1 hour.
  - After 10 wrong attempts, the lock screen offers **Reset wallet**, which removes every wallet from the phone.
  - **Change PIN** is in Settings → Security.
- **Biometric unlock.** This is optional. Turning it on needs your PIN, then a fingerprint or face check, and the PIN always works too. If the phone no longer has a fingerprint or face set up, Muvo turns biometric unlock off and says so. It is not offered while the PIN is locked out.
- **Auto-lock.** Muvo locks after it has been in the background for the time you choose in Settings → Security: **Immediately**, **1 minute** (default), **5** or **15 minutes**. **Lock now** locks it at once and deletes nothing.
- **Backups.**
  - **Recovery phrase** and **Show private key** need the PIN.
  - Their screens block screenshots.
  - The words or key stay hidden until you press the eye. They hide again after 30 seconds, when you leave the screen, and when Muvo goes to the background.
- **Hide balances and the app switcher.** The eye button masks balances; while they are hidden, a press shows them for 30 seconds. Settings → Appearance can also hide Muvo's content in the app switcher.
- **Removing a wallet.** **Remove wallet from this device** deletes one wallet's key and accounts after a warning, an acknowledgement, your PIN and a final confirmation. Removing the last wallet resets Muvo.
- **Error reports.**
  - These are on by default, and nothing is sent before you close the first-run notice.
  - Reports are cleaned before they are saved: phrases, keys, addresses and PIN-like numbers are removed.
  - They are sent to the CointMU error server, which is reachable only on the campus network. Elsewhere they wait on the phone: at most 30 reports, for up to 30 days.
  - Turn them off in Settings → Privacy. Turning them off deletes the reports that were not sent.

::: danger
Nobody can recover a lost wallet for you. Without its recovery phrase, or the private key for an imported key, a wallet removed from the phone or a lost phone means the funds are gone.
:::

## Network

Muvo connects to one CointMU node at a time. **Settings → Network** lists the nodes:

- Three preset nodes, the same campus nodes the desktop app uses: `http://10.64.24.101:8585`, `http://10.64.24.106:8585` and `http://10.64.24.113:8585`. The first is the default.
- Nodes you add yourself.

| Feature     | Behavior                                                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chain check | Muvo only uses a node that reports chain ID `1912`. A node on another chain, or one it cannot reach, is refused, and the current node stays in use.                  |
| Status      | Each node shows whether it can be reached and its latency, its chain, its block height, and *Out of sync* when it is more than 10 blocks behind the best node.       |
| Add a node  | Enter an `https://` RPC URL, then **Add and use**. Release builds block plain `http://` for every host except the three preset nodes. The list holds up to 10 nodes. |
| Ping all    | Checks every node again; so does pulling down the list.                                                                                                              |

Only add nodes you trust. A node sees your address and the transactions you send, and a dishonest node can show false balances. It can never move your funds.

## Known Limits

- **Android only.** There is no iOS build.
- **Campus network or VPN.** The preset nodes are on the campus network. Off campus without the VPN, Muvo cannot read balances or send, unless you add an `https://` node you trust.
- **History covers about 7 days**, plus every transaction sent from Muvo. That is about 50,000 blocks, scanned from the node because there is no indexer. Transfers that contracts make on your behalf (internal transfers) do not appear.
- **No explorer links.** The release build has no block explorer URL configured, so transaction details show the hash but no **View in explorer** link.
- **Not supported:** prices in fiat, swaps, a dApp browser, mining, and speeding up or cancelling a pending transaction.
- **No in-app updates.** Install newer releases by hand.
