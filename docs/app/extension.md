# Browser Extension

The CointMU Wallet extension connects websites (dApps) to CointMU. It is a Chrome extension (Manifest V3) that adds an Ethereum provider, `window.ethereum`, to every page. It can either link to the CointMU desktop app or work on its own with an imported key.

The extension has its own version number, separate from the desktop app's. It is not published on the Chrome Web Store or as a GitHub Release; it ships inside the desktop app.

::: info Verified on
No Chrome or Chromium browser was available when these docs were written, so the extension's side of this page comes from its source. On the desktop side, the **Download ZIP** failure and the bridge listening on `127.0.0.1:8765` were checked on the Linux build.
:::

## Getting the Extension

The desktop app is meant to hand out the extension: **Settings → External Sources → Download ZIP** saves it as `CointMU-Extension.zip`, which you then load unpacked into Chrome.

::: danger Download ZIP does not work in installed builds
In installed builds, **Download ZIP** does nothing: no save dialog opens and no message is shown. The app looks for the ZIP in the wrong folder, and only writes `Extension ZIP not found at: <install dir>/resources/extension.zip` to `main.log`. Reproduced on the Linux 1.7.3 and 1.7.4 builds; Windows and macOS use the same code. See [CointMU-App#103](https://github.com/Cointmu-ORG/CointMU-App/issues/103).
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

To use the desktop app's node in standalone mode, add a network with the RPC URL `http://127.0.0.1:8585` and chain ID `1912`. Do not enter `http://localhost`: the extension turns that into `http://127.0.0.1:8545`, where the node is not listening ([CointMU-App#105](https://github.com/Cointmu-ORG/CointMU-App/issues/105)).

::: warning
In standalone mode the imported private key is stored unencrypted in the browser's extension storage, and the extension has no password or lock. Anyone with access to your browser profile can read it. Use a key that holds only small amounts. See [CointMU-App#107](https://github.com/Cointmu-ORG/CointMU-App/issues/107).
:::

## Connecting a Website

A website first asks to connect (`eth_requestAccounts`). The extension opens a **Connection Request** window naming the site; approve it to share your address. In standalone mode, each signing request opens its own window too (**Sign Message**, **Sign Typed Data**, **Approve Transaction**, **Sign Transaction**), showing the site, account, chain ID and, for transactions, the recipient, value and data. Transactions that call a contract carry a warning to approve them only if you trust the site.

The desktop app's [Settings → Connected Sites](/docs/app/settings#connected-sites) lists the sites it has granted read-only access, and **Revoke** removes a site's access there.
