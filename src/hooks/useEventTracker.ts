/**
 * useEventTracker — convenience hook that wraps POST /api/dashboard/event
 *
 * Usage in any popup/page:
 *   const track = useEventTracker();
 *   track("popup_open", "explainer", explainerId);
 *   track("insight_view", "article", articleId);
 *   track("share", "research", articleId, { platform: "whatsapp" });
 */
import { useCallback } from "react";
import { trackEvent } from "@/lib/api-client";

export function useEventTracker() {
  return useCallback((
    event_type: string,
    entity_type?: string,
    entity_id?: string,
    metadata?: Record<string, any>,
  ) => {
    trackEvent({ event_type, entity_type, entity_id, metadata });
  }, []);
}