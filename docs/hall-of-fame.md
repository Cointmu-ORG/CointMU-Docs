# Hall of Fame

This page credits the maintainers who build CointMU and the testers who find and report its bugs and security issues.

## Maintainers

| Maintainer             | GitHub                                                       |
| ---------------------- | ------------------------------------------------------------ |
| leosycthe              | [github.com/leosycthe](https://github.com/leosycthe)         |
| naomii / kakonoomoidee | [github.com/kakonoomoidee](https://github.com/kakonoomoidee) |

## Testers and Bug Hunters

::: info No one listed yet
No testers or bug hunters are listed yet. To be listed, report a bug or a security issue as described in [How to Report](#how-to-report), within the [Scope and Rules](#scope-and-rules) below.
:::

A finding is credited here only after its fix has been released, and only with the reporter's consent.

| Name | GitHub | Finding | Product | Fixed in |
| ---- | ------ | ------- | ------- | -------- |

<!--
Adding an entry to Testers and Bug Hunters:
1. Credit a finding only after its fix has been released. Never list a finding
   that is still open, or fixed but not yet in a release.
2. Credit it only with the reporter's consent. Ask first, and use the name and
   GitHub account they give you. If they want no credit, add no row.
3. Add one row per finding:
   - Name: the name the reporter chose.
   - GitHub: a link to their profile, or "-" if they gave none.
   - Finding: one short line. No exploit steps or other details that would
     help attack an unpatched install.
   - Product: CLI, Desktop app, Browser extension, Muvo or Docs.
   - Fixed in: the release with the fix, linked to its changelog entry or
     GitHub release. For the docs site, the date the fix went live.
4. When you add the first row, remove the "No one listed yet" info box above.
-->

## How to Report

### Bugs

Report a bug as an issue on the repository of the product it affects:

| Product                           | Where to report                                                                                 |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| CLI                               | [Cointmu-ORG/CointMU-CLI issues](https://github.com/Cointmu-ORG/CointMU-CLI/issues)             |
| Desktop app and browser extension | [Cointmu-ORG/CointMU-App issues](https://github.com/Cointmu-ORG/CointMU-App/issues)             |
| Muvo mobile wallet                | [Cointmu-ORG/CointMU-MobileApp issues](https://github.com/Cointmu-ORG/CointMU-MobileApp/issues) |
| This docs site                    | [Cointmu-ORG/CointMU-Docs issues](https://github.com/Cointmu-ORG/CointMU-Docs/issues)           |

### Security Issues

::: warning
Do not post security findings in public issues, pull requests or discussions. Anyone can read them, including people who could use the finding against other users.
:::

Report a security issue privately through GitHub's private vulnerability reporting, on the repository of the product it affects:

1. Open the repository on GitHub: [CointMU-CLI](https://github.com/Cointmu-ORG/CointMU-CLI), [CointMU-App](https://github.com/Cointmu-ORG/CointMU-App), [CointMU-MobileApp](https://github.com/Cointmu-ORG/CointMU-MobileApp) or [CointMU-Docs](https://github.com/Cointmu-ORG/CointMU-Docs).
2. Go to the **Security** tab and select **Report a vulnerability**.
3. Fill in the form and submit it. Only you and the maintainers can see the report.

### What a Good Report Contains

- **Product and version**: which product, and which version (for the CLI, the output of [`cmu version`](/docs/cli/version)). For the docs site, the page URL.
- **Steps to reproduce**: the exact commands or clicks, from a fresh setup if you can.
- **Actual and expected behavior**: what happened, and what you expected to happen. Copy error messages as text.
- **Impact**: who is affected and what could go wrong, for example exposed keys, lost funds or a wrong balance.

Never put a real seed phrase, private key or password in a report.

## Scope and Rules

### In Scope

- The [CointMU CLI](/docs/cli/overview)
- The [desktop app](/docs/app/overview)
- The [browser extension](/docs/app/extension)
- The [Muvo mobile wallet](/docs/app/muvo)
- This docs site

### Out of Scope

- The campus nodes and servers
- Other people's accounts or wallets
- Denial of service
- Social engineering

### Testing Rules

Right now the CointMU network is reachable only from the campus network or through the VPN. Even with that access, test only with your own accounts and on an isolated local chain, such as the DevNet that [`cmu test`](/docs/cli/test) starts. Never test on the shared campus network.

### Credit, Not Rewards

There is no reward for a report. A finding earns credit on this page, under the rule in [Testers and Bug Hunters](#testers-and-bug-hunters).
