export const PLAYTEST_QUERY_PARAM = "playtest";

export interface PlaytestInvite {
  url: string;
  shortText: string;
  longText: string;
}

export function playtestUrlFrom(baseUrl: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set(PLAYTEST_QUERY_PARAM, "1");
  return url.toString();
}

export function shouldOpenPlaytestHub(search: string): boolean {
  const params = new URLSearchParams(search);
  const value = params.get(PLAYTEST_QUERY_PARAM);
  return value === "1" || value === "true";
}

export function buildPlaytestInvite(baseUrl: string): PlaytestInvite {
  const url = playtestUrlFrom(baseUrl);
  return {
    url,
    shortText:
      `Playtest Yes Man for 3-5 minutes, then tap Playtest + feedback: ${url}`,
    longText: [
      "We are playtesting Yes Man, a tiny cozy idle game about saying yes to increasingly silly things.",
      "Please play for 3-5 minutes, tap Playtest + feedback, submit one honest note, vote on design prompts, and export the JSON if you consent to share it.",
      `Play here: ${url}`,
    ].join("\n"),
  };
}
