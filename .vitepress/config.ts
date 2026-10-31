import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { defineConfig } from "vitepress";
import { extractPageDescription } from "./page-description";
import { buildPageSocialHead, buildSiteSocialHead, type SocialImage } from "./social-meta";

/** Production origin, used for the sitemap and canonical URLs on every deployment. */
const SITE_URL = "https://coint-mu-docs.vercel.app";

/** Google Search Console HTML-tag ownership token for SITE_URL. */
const GOOGLE_SITE_VERIFICATION = "tmOxFuuSKuzPsVNFFQUYsl0kyV5sa_agqPn50Y2KnWs";

const SITE_TITLE = "CointMU Docs";

/** Served from public/images/logo.png; also the favicon. */
const SOCIAL_IMAGE: SocialImage = {
  url: `${SITE_URL}/images/logo.png`,
  width: 1597,
  height: 1597,
  alt: "CointMU logo",
};

/**
 * Maps a source path to its public URL path. `cleanUrls` is off (VitePress
 * default and no Vercel rewrite), so pages are only served with `.html`.
 */
function toUrlPath(relativePath: string): string {
  return relativePath.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, ".html");
}

/**
 * VitePress site configuration for the CointMU documentation portal.
 * Defines global metadata, top navigation, and sidebar structure
 * for the core guides, CLI reference, and app documentation.
 */
export default defineConfig({
  title: SITE_TITLE,
  // `true` renders ":title | CointMU Docs". Unlike an explicit ":title" template,
  // it leaves the home page as plain "CointMU Docs" instead of repeating it.
  titleTemplate: true,
  description: "The official documentation for the CointMU ecosystem.",
  head: [
    ["link", { rel: "icon", href: "/images/logo.png" }],
    [
      "meta",
      { name: "google-site-verification", content: GOOGLE_SITE_VERIFICATION },
    ],
    ...buildSiteSocialHead(SITE_TITLE, SOCIAL_IMAGE),
  ],
  lastUpdated: true,
  sitemap: { hostname: SITE_URL },
  async transformPageData(pageData, { siteConfig }) {
    const canonicalUrl = `${SITE_URL}/${toUrlPath(pageData.relativePath)}`;
    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(["link", { rel: "canonical", href: canonicalUrl }]);

    const source = await readFile(join(siteConfig.srcDir, pageData.relativePath), "utf8");
    const description = extractPageDescription(source);
    if (description) pageData.description = description;
  },
  transformHead({ pageData, title, description }) {
    if (pageData.isNotFound) return;
    const url = `${SITE_URL}/${toUrlPath(pageData.relativePath)}`;
    return buildPageSocialHead({ title, description, url });
  },
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
          { text: "Changelog", link: "/docs/cli/changelog" },
          { text: "cmu create", link: "/docs/cli/create" },
          { text: "cmu compile", link: "/docs/cli/compile" },
          { text: "cmu deploy", link: "/docs/cli/deploy" },
          { text: "cmu console", link: "/docs/cli/console" },
          { text: "cmu explorer", link: "/docs/cli/explorer" },
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
          { text: "Changelog", link: "/docs/app/changelog" },
          { text: "Dashboard & Network Stats", link: "/docs/app/dashboard" },
          { text: "Multi-Asset Wallet", link: "/docs/app/wallet" },
          { text: "Mining & Miner Distribution", link: "/docs/app/mining" },
          { text: "Blockchain Explorer", link: "/docs/app/explorer" },
          { text: "Self-Healing Embedded Node", link: "/docs/app/node" },
          { text: "Settings", link: "/docs/app/settings" },
          { text: "Browser Extension", link: "/docs/app/extension" },
        ],
      },
    ],
  },
});
