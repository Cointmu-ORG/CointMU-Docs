import type { HeadConfig } from "vitepress";

/** Image used for link previews on every page. */
export interface SocialImage {
  readonly url: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

/** Per-page values for link previews. */
export interface PageSocialInfo {
  readonly title: string;
  readonly description: string;
  readonly url: string;
}

/** A square image renders best in the small "summary" card. */
const TWITTER_CARD_TYPE = "summary";

/** Open Graph and Twitter tags that are identical on every page. */
export function buildSiteSocialHead(siteName: string, image: SocialImage): HeadConfig[] {
  return [
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: siteName }],
    ["meta", { property: "og:image", content: image.url }],
    ["meta", { property: "og:image:width", content: String(image.width) }],
    ["meta", { property: "og:image:height", content: String(image.height) }],
    ["meta", { property: "og:image:alt", content: image.alt }],
    ["meta", { name: "twitter:card", content: TWITTER_CARD_TYPE }],
    ["meta", { name: "twitter:image", content: image.url }],
    ["meta", { name: "twitter:image:alt", content: image.alt }],
  ];
}

/** Open Graph and Twitter tags carrying the page's own title, description, and URL. */
export function buildPageSocialHead(page: PageSocialInfo): HeadConfig[] {
  return [
    ["meta", { property: "og:title", content: page.title }],
    ["meta", { property: "og:description", content: page.description }],
    ["meta", { property: "og:url", content: page.url }],
    ["meta", { name: "twitter:title", content: page.title }],
    ["meta", { name: "twitter:description", content: page.description }],
  ];
}
