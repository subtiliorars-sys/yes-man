import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bindVisibilitySave } from "./lifecycle.js";

describe("bindVisibilitySave", () => {
  let visibilityState = "visible";
  const listeners = new Map<string, Set<EventListener>>();

  beforeEach(() => {
    visibilityState = "visible";
    listeners.clear();
    vi.stubGlobal("document", {
      get visibilityState() {
        return visibilityState;
      },
      addEventListener(type: string, handler: EventListener) {
        const set = listeners.get(type) ?? new Set();
        set.add(handler);
        listeners.set(type, set);
      },
      removeEventListener(type: string, handler: EventListener) {
        listeners.get(type)?.delete(handler);
      },
      dispatchEvent(event: Event) {
        listeners.get(event.type)?.forEach((handler) => handler(event));
        return true;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saves when the document becomes hidden", () => {
    const onSave = vi.fn();
    const unbind = bindVisibilitySave(onSave);
    visibilityState = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
    expect(onSave).toHaveBeenCalledOnce();
    unbind();
  });

  it("does not save while the document stays visible", () => {
    const onSave = vi.fn();
    const unbind = bindVisibilitySave(onSave);
    visibilityState = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
    expect(onSave).not.toHaveBeenCalled();
    unbind();
  });

  it("stops listening after unbind", () => {
    const onSave = vi.fn();
    const unbind = bindVisibilitySave(onSave);
    unbind();
    visibilityState = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
    expect(onSave).not.toHaveBeenCalled();
  });
});
