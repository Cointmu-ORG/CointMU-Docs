import { defineConfig } from "vitepress";

/**
 * VitePress site configuration for the CointMU documentation portal.
 * Defines global metadata, top navigation, and sidebar structure
 * for the core guides, CLI reference, and app documentation.
 */
export default defineConfig({
  title: "CointMU Docs",
  description: "The official documentation for the CointMU ecosystem.",
  head: [["link", { rel: "icon", href: "/images/logo.png" }]],
  themeConfig: {
    nav: [
      { text: "Guide", link: "/docs/guide/introduction" },
      { text: "CLI Reference", link: "/docs/cli/overview" },
      { text: "App", link: "/docs/app/overview" },
    ],
    sidebar: [
      {
        text: "Getting Started",
        items: [{ text: "Introduction", link: "/docs/guide/introduction" }],
      },
      {
        text: "Core Guides",
        items: [
          { text: "Network & Node Setup", link: "/docs/guide/network-setup" },
          {
            text: "Deploying Your First Token",
            link: "/docs/guide/deploying-first-token",
          },
          {
            text: "Supported Libraries",
            link: "/docs/guide/supported-libraries",
          },
        ],
      },
      {
        text: "CLI Reference",
        items: [
          { text: "Overview", link: "/docs/cli/overview" },
          { text: "Installation", link: "/docs/cli/installation" },
          { text: "cmu create", link: "/docs/cli/create" },
          { text: "cmu compile", link: "/docs/cli/compile" },
          { text: "cmu deploy", link: "/docs/cli/deploy" },
          { text: "cmu audit", link: "/docs/cli/audit" },
          { text: "cmu test", link: "/docs/cli/test" },
          { text: "cmu mine", link: "/docs/cli/mine" },
          { text: "cmu wallet", link: "/docs/cli/wallet" },
          { text: "cmu network", link: "/docs/cli/network" },
          { text: "cmu node", link: "/docs/cli/node" },
          { text: "cmu version", link: "/docs/cli/version" },
          { text: "cmu update", link: "/docs/cli/update" },
        ],
      },
      {
        text: "App",
        items: [
          { text: "Overview", link: "/docs/app/overview" },
          { text: "Installation", link: "/docs/app/installation" },
          { text: "Dashboard & Network Stats", link: "/docs/app/dashboard" },
          { text: "Multi-Asset Wallet", link: "/docs/app/wallet" },
          { text: "Mining & Miner Distribution", link: "/docs/app/mining" },
          { text: "Blockchain Explorer", link: "/docs/app/explorer" },
          { text: "Self-Healing Embedded Node", link: "/docs/app/node" },
        ],
      },
    ],
  },
});
