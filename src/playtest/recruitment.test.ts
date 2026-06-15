import { describe, expect, it } from "vitest";
import {
  buildPlaytestInvite,
  playtestUrlFrom,
  shouldOpenPlaytestHub,
} from "./recruitment.js";

describe("playtest recruitment helpers", () => {
  it("adds the playtest query parameter to invite URLs", () => {
    expect(playtestUrlFrom("https://example.test/yes-man/")).toBe(
      "https://example.test/yes-man/?playtest=1"
    );
    expect(playtestUrlFrom("https://example.test/yes-man/?utm=discord")).toBe(
      "https://example.test/yes-man/?utm=discord&playtest=1"
    );
  });

  it("detects URLs that should open the playtest hub", () => {
    expect(shouldOpenPlaytestHub("?playtest=1")).toBe(true);
    expect(shouldOpenPlaytestHub("?playtest=true")).toBe(true);
    expect(shouldOpenPlaytestHub("?playtest=0")).toBe(false);
    expect(shouldOpenPlaytestHub("")).toBe(false);
  });

  it("builds share copy with the invite URL", () => {
    const invite = buildPlaytestInvite("https://example.test/yes-man/");
    expect(invite.url).toBe("https://example.test/yes-man/?playtest=1");
    expect(invite.shortText).toContain(invite.url);
    expect(invite.longText).toContain("Playtest + feedback");
  });
});
