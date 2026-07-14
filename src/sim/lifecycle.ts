/** Flush save when the tab/app is backgrounded — mobile OSes can kill without shutdown. */
export function bindVisibilitySave(onSave: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const handler = () => {
    if (document.visibilityState === "hidden") onSave();
  };
  document.addEventListener("visibilitychange", handler);
  return () => document.removeEventListener("visibilitychange", handler);
}
