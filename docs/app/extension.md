# Browser Extension

The CointMU Wallet extension connects websites (dApps) to CointMU. It is a Chrome extension (Manifest V3) that adds an Ethereum provider, `window.ethereum`, to every page. It can either link to the CointMU desktop app or work on its own with an imported key.

The extension has its own version number, separate from the desktop app's. It is not published on the Chrome Web Store or as a GitHub Release; it ships inside the desktop app.

::: info Verified on
No Chrome or Chromium browser was available when these docs were written, so the extension's side of this page comes from its source, version 1.0.18 as bundled with desktop 1.8.0. On the desktop side, **Download ZIP** and the bridge listening on `127.0.0.1:8765` were checked on the Linux 1.8.0 build.
:::

## Getting the Extension

The desktop app hands out the extension: **Settings → External Sources → Download ZIP** saves it as `CointMU-Extension.zip`, which you then load unpacked into Chrome. If the ZIP cannot be found or saved, an error appears under the button.

::: info Desktop 1.7.4 and older
Up to desktop 1.7.4, **Download ZIP** did nothing in installed builds: the app looked for the ZIP in the wrong folder ([CointMU-App#103](https://github.com/Cointmu-ORG/CointMU-App/issues/103)). Fixed in 1.8.0. On the Linux 1.8.0 build the button found the ZIP and nothing was logged about it missing. The save dialog did not appear on the test system, so the saved file was not checked.
:::

Once you have the ZIP, load it like any unpacked extension:

1. Unzip `CointMU-Extension.zip` to a folder you will keep.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Select **Load unpacked** and choose the unzipped folder.

## Linking to the Desktop App

Open the extension, choose **Add Wallet → Link to Desktop App**, and keep CointMU running. The extension connects to the desktop app on `ws://127.0.0.1:8765`, and the desktop app asks *Do you want to allow the CointMU Browser Extension to connect to your wallet?* Approve it to pair them. Once paired, the desktop app accepts requests only from that extension, and **Settings → Connected Sites** shows the extension as **Actively Connected**.

If the extension says *This extension is not paired with CointMU Desktop*, update both, then choose **Link to Desktop App** again. If it says *Could not reach CointMU Desktop App*, start the desktop app.

In linked mode, websites can read your active address and chain data through the desktop app's node. **They cannot ask you to sign:** message signing and transaction requests are refused with *Signing is not supported in desktop mode yet. Switch the CointMU extension to standalone mode to sign.*

## Standalone Mode

Choose **Add Wallet → Import Private Key** to use the extension without the desktop app. In this mode the extension signs with the imported key and sends requests to a network you add under **Add Network** (name, RPC URL, chain ID).

To use the desktop app's node in standalone mode, add a network with the RPC URL `http://127.0.0.1:8585` and chain ID `1912`. Do not enter `http://localhost`: the extension turns that into `http://127.0.0.1:8545`, where the node is not listening. This is still the case in extension 1.0.18.

### Wallet Password

Since extension 1.0.18 (desktop 1.8.0), imported keys are encrypted with a wallet password. Before, they were stored as plain text in the browser's extension storage ([CointMU-App#107](https://github.com/Cointmu-ORG/CointMU-App/issues/107), fixed).

- The first import asks you to choose a password of at least 8 characters, typed twice. Later imports and removing a wallet ask for it again.
- The keys are encrypted with AES-GCM-256, using a key derived from the password with PBKDF2-SHA-256 at 600,000 iterations.
- The wallet locks after 15 minutes without activity, when you close the browser, or with **Lock Wallet**. Signing and sending count as activity. While it is locked, the popup shows **Unlock Wallet**, websites see no accounts, and a connection or signing request asks for the password before **Approve** can be used.
- The password cannot be recovered. If you forget it, **Reset Wallet** removes every imported wallet from the browser, and you import your private keys again.

If an older version stored keys in plain text, the popup first shows **Protect Your Keys** and asks you to set a password (**Encrypt Keys**). Until then, websites in standalone mode get no accounts and cannot sign. The plain-text keys are only replaced once the encrypted copy has been read back and checked, so an interrupted run loses nothing; running it again asks for the password you chose then, or **Start Over With a New Password**. Desktop (linked) mode is unchanged.

::: warning
Old plain-text copies of the keys can stay in Chrome's own files until Chrome compacts them. If someone else may have had access to your browser profile while you used 1.0.17 or older, move your funds to a new key.
:::

Also since 1.0.18, the extension's background answers wallet requests only from its own toolbar popup and the approval windows it opened, and it no longer hands out private keys to any part of the extension that asks ([CointMU-App#109](https://github.com/Cointmu-ORG/CointMU-App/issues/109), fixed).

This section comes from the extension's source and its English text; it was not run in a browser.

## Connecting a Website

A website first asks to connect (`eth_requestAccounts`). The extension opens a **Connection Request** window naming the site; approve it to share your address. In standalone mode, each signing request opens its own window too (**Sign Message**, **Sign Typed Data**, **Approve Transaction**, **Sign Transaction**), showing the site, account, chain ID and, for transactions, the recipient, value and data. Transactions that call a contract carry a warning to approve them only if you trust the site. If the wallet is locked, the window first asks for your [wallet password](#wallet-password).

The desktop app's [Settings → Connected Sites](/docs/app/settings#connected-sites) lists the sites it has granted read-only access, and **Revoke** removes a site's access there.
