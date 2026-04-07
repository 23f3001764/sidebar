import { QueryClient, QueryClientProvider }              from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useSearchParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster }           from "@/components/ui/toaster";
import { TooltipProvider }   from "@/components/ui/tooltip";
import { useState, useEffect, useCallback } from "react";

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

// ── Handles ?insight=<id> deep-link — must be inside <BrowserRouter> ──────────
function InsightDeepLink({
  onOpen,
}: { onOpen: (article: any, insight: AiInsight) => void }) {
  const [params] = useSearchParams();
  useEffect(() => {
    const id = params.get("insight");
    if (!id) return;
    apiGetInsight(id)
      .then(resp => {
        const url = resp.ai_insight.article_url ?? "";
        let host  = "Shared Insight";
        try { if (url) host = new URL(url).hostname; } catch { /* ignore */ }
        onOpen({ id, title: host, source: "STEAMI", article_url: url, url }, resp.ai_insight);
      })
      .catch(() => { /* insight not found */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

// ── AppShell ──────────────────────────────────────────────────────────────────
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
    feedTabOpen,   setFeedTabOpen,
    feedInsightId,
    feedOpenInsight, setFeedOpenInsight,
    fetchFeedForSelection,
    requestFeedInsight,
    removeFeedItem,
  } = useFeed();

  // Deep-linked insight popup
  const [deepInsight, setDeepInsight] = useState<{ article: any; insight: AiInsight } | null>(null);

  function handleDiary(text: string) {
    // Wire to useSteamiStore addDiaryEntry here
    console.log("[Diary] Save:", text);
  }

  function handleFeed(text: string) {
    setSelectionText(text);
    fetchFeedForSelection(text);
    // feedTabOpen becomes true inside useFeed → SidePanel switches to Feed tab
  }

  const handleFeedTabOpened = useCallback(() => {
    setFeedTabOpen(false);  // reset so it doesn't re-trigger
  }, [setFeedTabOpen]);

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
        <div className="fixed top-0 left-0 right-0 z-[90] flex items-center
          justify-between gap-3 px-4 py-2 text-xs
          bg-red-950/90 border-b border-red-800/50 text-red-300 backdrop-blur">
          <span>⚠ {error || feedError}</span>
          <button onClick={() => { setError(""); setFeedError(""); }}
            className="font-bold text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      {/* Loading overlay */}
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

      {/* Routes — bottom padding on mobile for tab bar */}
      <div className="pb-14 sm:pb-0">
        <Routes>
          <Route path="/"            element={<ExplainerPage />} />
          <Route path="/research"    element={<ResearchPage />} />
          <Route path="/simulations" element={<SimulationsPage />} />
          <Route path="/dashboard"   element={<DashboardPage />} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </div>

      {/* Deep-link handler (inside BrowserRouter = has router context) */}
      <InsightDeepLink onOpen={(art, ins) => setDeepInsight({ article: art, insight: ins })} />

      {/* Text selection toolbar */}
      <SelectionToolbar onDiary={handleDiary} onFeed={handleFeed} />

      {/* Side panel */}
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
        feedTabOpen={feedTabOpen}
        onFeedTabOpened={handleFeedTabOpened}
      />

      {/* News ticker */}
      {articles.length > 0 && (
        <div className="fixed bottom-14 sm:bottom-5 left-5 z-30">
          <NewsPopup articles={articles} />
        </div>
      )}

      {/* Deep-link insight popup */}
      {deepInsight && (
        <InsightPopup
          article={deepInsight.article}
          insight={deepInsight.insight}
          onClose={closeDeepInsight}
        />
      )}

      {/* Admin panel */}
      <AdminPanel />
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
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