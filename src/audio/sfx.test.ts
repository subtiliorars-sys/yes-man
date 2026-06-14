import { describe, expect, it, beforeEach, vi } from "vitest";
import { isSfxMuted, setSfxMuted } from "./sfx.js";

describe("sfx mute preference", () => {
  beforeEach(() => {
    const map = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        map.set(k, v);
      },
      clear: () => map.clear(),
    });
  });

  it("defaults to unmuted", () => {
    expect(isSfxMuted()).toBe(false);
  });

  it("persists mute flag", () => {
    setSfxMuted(true);
    expect(isSfxMuted()).toBe(true);
    setSfxMuted(false);
    expect(isSfxMuted()).toBe(false);
  });
});
