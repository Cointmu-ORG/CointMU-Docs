/**
 * Prints a draft docs/cli/changelog.md entry for each CointMU CLI tag the page
 * does not cover yet, newest first. It writes nothing: rewrite the draft for
 * users, then paste it in (see the checklist at the top of the page).
 *
 *   node scripts/draft-changelog.mjs <path-to-CointMU-CLI> [from-tag]
 *   CMU_CLI_REPO=<path-to-CointMU-CLI> node scripts/draft-changelog.mjs [from-tag]
 *
 * from-tag defaults to the newest version heading on the page. Commits are
 * sorted by conventional-commit type; build, ci, test, chore, refactor, docs
 * and style commits are dropped as not user-facing. Publish dates come from
 * the npm registry, so a tag that never reached npm is flagged.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const CHANGELOG_URL = new URL("../docs/cli/changelog.md", import.meta.url);
const NPM_PACKAGE = "cointmu-cli";
const LABELS = { breaking: "Breaking", feat: "Added", fix: "Fixed" };
const VERSION_HEADING = /^## (\d+\.\d+\.\d+)/m;
const CONVENTIONAL_SUBJECT = /^(\w+)(?:\(([^)]*)\))?(!)?: (.*)$/;

function parseArgs(argv, env) {
  const [first, second] = argv;
  if (env.CMU_CLI_REPO) return { cliRepo: env.CMU_CLI_REPO, fromTag: first };
  if (!first) {
    throw new Error(
      "missing CLI repo path.\n" +
        "usage: node scripts/draft-changelog.mjs <path-to-CointMU-CLI> [from-tag]\n" +
        "   or: CMU_CLI_REPO=<path-to-CointMU-CLI> node scripts/draft-changelog.mjs [from-tag]",
    );
  }
  return { cliRepo: first, fromTag: second };
}

function lastCoveredTag() {
  const match = readFileSync(CHANGELOG_URL, "utf8").match(VERSION_HEADING);
  if (!match) throw new Error(`no "## <version>" heading in ${CHANGELOG_URL.pathname}`);
  return `v${match[1]}`;
}

function npmPublishTimes() {
  try {
    const out = execFileSync("npm", ["view", NPM_PACKAGE, "time", "--json"], { encoding: "utf8" });
    const times = JSON.parse(out);
    // npm 12 wraps a single `npm view --json` result in an array; older npm does not.
    return Array.isArray(times) ? times[0] : times;
  } catch (error) {
    console.error(`warning: could not read npm publish dates: ${error.message.split("\n")[0]}`);
    return {};
  }
}

/** Returns { label, text } for a user-facing commit, or null for one users would not notice. */
function classify(subject, body) {
  const match = subject.match(CONVENTIONAL_SUBJECT);
  if (!match) return null;
  const [, type, scope, bang, text] = match;
  const line = scope ? `(${scope}) ${text}` : text;
  if (bang || body.includes("BREAKING CHANGE")) return { label: LABELS.breaking, line };
  return LABELS[type] ? { label: LABELS[type], line } : null;
}

function draftEntry(git, { prev, tag, published }) {
  const pkg = JSON.parse(git("show", `${tag}:package.json`));
  const prevEngines = JSON.parse(git("show", `${prev}:package.json`)).engines?.node;
  const log = git("log", "--reverse", "--no-merges", "--format=%h%x1f%s%x1f%b%x1e", `${prev}..${tag}`);
  const bullets = [];
  if (prevEngines !== pkg.engines?.node) {
    bullets.push(`- **Changed** Node.js requirement ${prevEngines} -> ${pkg.engines?.node}`);
  }
  const entries = log.split("\x1e").map((c) => c.trim()).filter(Boolean).map((commit) => {
    const [sha, subject, body = ""] = commit.split("\x1f");
    const entry = classify(subject, body);
    return entry && { ...entry, sha };
  }).filter(Boolean);
  for (const label of Object.values(LABELS)) {
    for (const entry of entries.filter((e) => e.label === label)) {
      bullets.push(`- **${label}** ${entry.line} (${entry.sha})`);
    }
  }

  const date = published[pkg.version]?.slice(0, 10);
  const anchor = `v${pkg.version.replaceAll(".", "-")}`;
  return [
    `## ${pkg.version} — ${pkg.codename ?? "TODO(codename)"} {#${anchor}}`,
    "",
    date ? `Released ${date}.` : `TODO(release): ${pkg.version} is tagged but not published on npm.`,
    "",
    ...(bullets.length ? bullets : ["No user-facing commits found."]),
    "",
  ].join("\n");
}

function main() {
  const { cliRepo, fromTag } = parseArgs(process.argv.slice(2), process.env);
  const git = (...args) => execFileSync("git", ["-C", cliRepo, ...args], { encoding: "utf8" }).trim();
  const from = fromTag ?? lastCoveredTag();
  const tags = git("tag", "--sort=v:refname").split("\n");
  if (!tags.includes(from)) throw new Error(`tag ${from} not found in ${cliRepo}`);

  const newer = tags.slice(tags.indexOf(from) + 1);
  if (!newer.length) {
    console.error(`nothing to draft: ${from} is the newest tag in ${cliRepo}`);
    return;
  }

  const published = npmPublishTimes();
  const entries = newer.map((tag, i) => draftEntry(git, { prev: i ? newer[i - 1] : from, tag, published }));
  console.log(entries.reverse().join("\n"));
  console.error(`drafted ${newer.length} release(s) after ${from}; update the Latest table to ${newer.at(-1)}.`);
}

try {
  main();
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}
