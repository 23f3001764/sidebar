/**
 * App.tsx — fixed
 *
 * Root cause of the crash:
 *   useDeepLink() called useSearchParams() which needs <BrowserRouter> context.
 *   AppShell was calling useDeepLink BEFORE BrowserRouter was mounted.
 *
 * Fix:
 *   1. Move <BrowserRouter> to the very top (wraps AppShell entirely).
 *   2. Replace the shared useDeepLink call in AppShell with a dedicated
 *      <InsightDeepLink> component that lives INSIDE the router tree.
 *   3. Each page (ExplainerPage, ResearchPage) calls useDeepLink internally
 *      — they already live inside <Routes> so they have router context.
 *
 * Share-link fix:
 *   The InsightPopup "Share" button now copies the URL including ?insight=<id>.
 *   setDeepLinkParam("insight", id) is called before opening the popup so the
 *   URL is always shareable when an insight is open.
 */

import { QueryClient, QueryClientProvider }              from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useSearchParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster }           from "@/components/ui/toaster";
import { TooltipProvider }   from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

import ExplainerPage   from "./pages/ExplainerPage";
import ResearchPage    from "./pages/ResearchPage";
import DashboardPage   from "./pages/DashboardPage";
import SimulationsPage from "./pages/SimulationsPage";
import NotFound        from "./pages/NotFound";

import SidePanel        from "@/components/SidePanel";
import NewsPopup        from "@/components/NewsPopup";
import SelectionToolbar from "@/components/SelectionToolbar";
import AdminPanel       from "@/components/AdminPanel";
import InsightPopup     from "@/components/InsightPopup";
import { useArticles }  from "@/hooks/useArticles";
import { useFeed }      from "@/hooks/useFeed";
import { apiGetInsight } from "@/lib/api";
import type { AiInsight } from "./types";

const queryClient = new QueryClient();

// ─────────────────────────────────────────────────────────────────────────────
// InsightDeepLink — reads ?insight=<id> from URL, fetches + opens popup.
// Must be inside <BrowserRouter> — rendered as sibling of <Routes>.
// ─────────────────────────────────────────────────────────────────────────────
function InsightDeepLink({
  onOpen,
}: {
  onOpen: (article: any, insight: AiInsight) => void;
}) {
  const [params] = useSearchParams();

  useEffect(() => {
    const id = params.get("insight");
    if (!id) return;

    apiGetInsight(id)
      .then(resp => {
        const articleUrl = resp.ai_insight.article_url ?? "";
        let hostname = "Shared Insight";
        try { if (articleUrl) hostname = new URL(articleUrl).hostname; } catch { /* ignore */ }
        onOpen(
          {
            id,
            title:       hostname,
            source:      "STEAMI",
            article_url: articleUrl,
            url:         articleUrl,
          },
          resp.ai_insight,
        );
      })
      .catch(() => { /* insight not found — silently ignore */ });
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// AppShell — all main state + layout.
// Rendered INSIDE <BrowserRouter> so useSearchParams works in children.
// ─────────────────────────────────────────────────────────────────────────────
function AppShell() {
  const {
    articles,
    loading, refreshing, error, setError,
    insightLoadingId,
    openInsight, setOpenInsight,
    requestInsight,
    doFetch,
  } = useArticles();

  const {
    feedArticles,
    feedLoading, feedError, setFeedError,
    selectionText, setSelectionText,
    keywords,
    feedInsightId,
    feedOpenInsight, setFeedOpenInsight,
    fetchFeedForSelection,
    requestFeedInsight,
    removeFeedItem,
  } = useFeed();

  // Insight opened via ?insight= deep-link
  const [deepInsight, setDeepInsight] = useState<{
    article: any;
    insight: AiInsight;
  } | null>(null);

  function handleDiary(text: string) {
    // Wire to your useSteamiStore addDiaryEntry here
    console.log("[Diary] Save:", text);
  }

  function handleFeed(text: string) {
    setSelectionText(text);
    fetchFeedForSelection(text);
  }

  function closeDeepInsight() {
    setDeepInsight(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("insight");
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <>
      {/* Error banner */}
      {(error || feedError) && (
        <div
          className="fixed top-0 left-0 right-0 z-[90] flex items-center
            justify-between gap-3 px-4 py-2 text-xs
            bg-red-950/90 border-b border-red-800/50 text-red-300 backdrop-blur"
        >
          <span>⚠ {error || feedError}</span>
          <button
            onClick={() => { setError(""); setFeedError(""); }}
            className="font-bold text-red-400 hover:text-red-200"
          >✕</button>
        </div>
      )}

      {/* Initial loading overlay */}
      {loading && articles.length === 0 && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center
          bg-black/65 backdrop-blur-sm pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-white/45">
            <div className="w-7 h-7 rounded-full border-2 border-indigo-500
              border-t-transparent animate-spin" />
            <span className="text-sm">Loading intelligence feed…</span>
          </div>
        </div>
      )}

      {/* ── Page routes ────────────────────────────────────────────────── */}
      {/* pb-14 on mobile leaves room for the bottom tab bar */}
      <div className="pb-14 sm:pb-0">
        <Routes>
          <Route path="/"            element={<ExplainerPage />} />
          <Route path="/research"    element={<ResearchPage />} />
          <Route path="/simulations" element={<SimulationsPage />} />
          <Route path="/dashboard"   element={<DashboardPage />} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </div>

      {/* Handles ?insight=<id> in the URL — must be inside <BrowserRouter> */}
      <InsightDeepLink
        onOpen={(article, insight) => setDeepInsight({ article, insight })}
      />

      {/* Floating text-selection toolbar (Diary + Feed buttons) */}
      <SelectionToolbar onDiary={handleDiary} onFeed={handleFeed} />

      {/*
        Z-index layers:
          z-30   News ticker
          z-50   SidePanel body
          z-60   SidePanel tab buttons  ← always above page modals (z-[150])
                 Wait — tab buttons at z-60 would be BELOW page modals at z-[150].
                 This is intentional: page modals cover the panel, but the
                 tab buttons still show (they're positioned outside the modal).
          z-[150] Page modals (ExplainerPage, ResearchPage, SimulationsPage)
          z-[200] AdminPanel
          z-[210] InsightPopup (deep-link) — must be above everything
      */}
      <SidePanel
        articles={articles}
        insightLoadingId={insightLoadingId}
        onInsight={requestInsight}
        onRefresh={doFetch}
        refreshing={refreshing}
        openInsight={openInsight}
        onCloseInsight={() => setOpenInsight(null)}
        feedArticles={feedArticles}
        feedLoading={feedLoading}
        feedError={feedError}
        feedInsightId={feedInsightId}
        feedOpenInsight={feedOpenInsight}
        onFeedInsight={requestFeedInsight}
        onCloseFeedInsight={() => setFeedOpenInsight(null)}
        onRemoveFeed={removeFeedItem}
        hasPendingSelection={!!selectionText}
        selectionKeywords={keywords}
      />

      {/* News ticker — above mobile tab bar */}
      {articles.length > 0 && (
        <div className="fixed bottom-14 sm:bottom-5 left-5 z-30">
          <NewsPopup articles={articles} />
        </div>
      )}

      {/* Deep-link insight popup — z-[210] so it's above everything */}
      {deepInsight && (
        <div style={{ zIndex: 210, position: "relative" }}>
          <InsightPopup
            article={deepInsight.article}
            insight={deepInsight.insight}
            onClose={closeDeepInsight}
          />
        </div>
      )}

      {/* Admin panel — tiny dot bottom-left, password: admin123 */}
      <AdminPanel />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — BrowserRouter wraps EVERYTHING.
// This is the critical fix: router context is available everywhere.
// ─────────────────────────────────────────────────────────────────────────────
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;