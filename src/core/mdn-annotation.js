import { fetchAndCache } from "./utils";

export const name = "core/mdn-annoatation";

const SPEC_MAP_URL = "https://raw.githubusercontent.com/w3c/mdn-spec-links/master/SPECMAP.json";

async function fetchAndCacheJson(url) {
  if (!url) return;
  const request = new Request(url);
  const response = await fetchAndCache(request, 60 * 60 * 24 * 1000);
  const json = await response.json();
  return json;
}

export async function run(conf) {
  if (!conf.shortName) {
    return;
  }

  const json = fetchAndCacheJson(SPEC_MAP_URL);
  if (
    typeof conf.github === "object" &&
    !conf.github.hasOwnProperty("repoURL")
  ) {
    const msg =
      "Config option `[github](https://github.com/w3c/respec/wiki/github)` " +
      "is missing property `repoURL`.";
    pub("error", msg);
    return;
  }
  let tempURL = conf.github.repoURL || conf.github;
  if (!tempURL.endsWith("/")) tempURL += "/";
  let ghURL;
  try {
    ghURL = new URL(tempURL, "https://github.com");
  } catch (err) {
    pub("error", `\`respecConf.github\` is not a valid URL? (${ghURL})`);
    return;
  }
  if (ghURL.origin !== "https://github.com") {
    const msg = `\`respecConf.github\` must be HTTPS and pointing to GitHub. (${ghURL})`;
    pub("error", msg);
    return;
  }
  const [org, repo] = ghURL.pathname.split("/").filter(item => item);
  if (!org || !repo) {
    const msg =
      "`respecConf.github` URL needs a path with, for example, w3c/my-spec";
    pub("error", msg);
    return;
  }
  const branch = conf.github.branch || "gh-pages";
  const issueBase = new URL("./issues/", ghURL).href;
  const newProps = {
    edDraftURI: `https://${org.toLowerCase()}.github.io/${repo}/`,
    githubToken: undefined,
    githubUser: undefined,
    githubAPI: `https://api.github.com/repos/${org}/${repo}`,
    issueBase,
    atRiskBase: issueBase,
    otherLinks: [],
    pullBase: new URL("./pulls/", ghURL).href,
    shortName: repo,
  };
  const otherLink = {
    key: conf.l10n.participate,
    data: [
      {
        value: `GitHub ${org}/${repo}`,
        href: ghURL,
      },
      {
        value: conf.l10n.file_a_bug,
        href: newProps.issueBase,
      },
      {
        value: conf.l10n.commit_history,
        href: new URL(`./commits/${branch}`, ghURL.href).href,
      },
      {
        value: conf.l10n.pull_requests,
        href: newProps.pullBase,
      },
    ],
  };
  // Assign new properties, but retain existing ones
  const normalizedGHObj = {
    branch,
    repoURL: ghURL.href,
  };
  const normalizedConfig = { ...newProps, ...conf, github: normalizedGHObj };
  Object.assign(conf, normalizedConfig);
  conf.otherLinks.unshift(otherLink);
}
