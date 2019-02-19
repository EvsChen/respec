import { fetchAndCache } from "./utils";

export const name = "core/mdn-annoatation";

const SPEC_MAP_URL =
  "https://raw.githubusercontent.com/w3c/mdn-spec-links/master/SPECMAP.json";
const JSON_BASE = "https://w3c.github.io/mdn-spec-links/";

async function fetchAndCacheJson(url) {
  if (!url) return;
  const request = new Request(url);
  const response = await fetchAndCache(request, 60 * 60 * 24 * 1000);
  const json = await response.json();
  return json;
}

export async function run(conf) {
  // error handler

  if (!conf.shortName) {
    return;
  }

  const specMap = await fetchAndCacheJson(SPEC_MAP_URL);
  const shortName = conf.shortName;
  const w3cBase = "https://w3c.github.io/";
  const key = `${w3cBase}${shortName}/`;
  const jsonName = specMap[key];
  const mdnSpecMap = await fetchAndCacheJson(`${JSON_BASE}${jsonName}`);
  debugger;
}
