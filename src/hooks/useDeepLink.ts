/**
 * useDeepLink
 *
 * Reads URL search params on mount and triggers callbacks.
 * Uses window.location directly — no useSearchParams / router context needed,
 * so it can be called from anywhere (inside or outside <BrowserRouter>).
 *
 * Supported params:
 *   ?explainer=<id>   → opens explainer popup
 *   ?research=<id>    → opens research article popup
 *   ?insight=<id>     → handled by InsightDeepLink in App.tsx (needs API call)
 */
import { useEffect } from "react";

interface Options {
  onExplainer?: (id: string) => void;
  onResearch?:  (id: string) => void;
}

export function useDeepLink({ onExplainer, onResearch }: Options = {}) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const explainerId = params.get("explainer");
    const researchId  = params.get("research");

    if (explainerId && onExplainer) onExplainer(explainerId);
    if (researchId  && onResearch)  onResearch(researchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount
}

// ── URL helpers — no router needed ───────────────────────────────────────────

/** Remove a deep-link param from the URL (no navigation) */
export function clearDeepLinkParam(key: "explainer" | "research" | "insight") {
  const url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.replaceState({}, "", url.toString());
}

/** Set a deep-link param in the URL (no navigation) */
export function setDeepLinkParam(
  key: "explainer" | "research" | "insight",
  value: string,
) {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState({}, "", url.toString());
}

/** Copy the current URL to clipboard and return it */
export function copyDeepLink(): string {
  const link = window.location.href;
  navigator.clipboard.writeText(link).catch(() => {});
  return link;
}