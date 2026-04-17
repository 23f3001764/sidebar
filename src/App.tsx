import { QueryClient, QueryClientProvider }              from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useSearchParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster }           from "@/components/ui/toaster";
import { TooltipProvider }   from "@/components/ui/tooltip";
import { useState, useEffect, useCallback } from "react";

import ExplainerPage   from "@/pages/ExplainerPage";
import ResearchPage    from "@/pages/ResearchPage";
import DashboardPage   from "@/pages/DashboardPage";
import SimulationsPage from "@/pages/SimulationsPage";
import AdminPage       from "@/pages/AdminPage";
import ArticlesPage    from "@/pages/ArticlesPage";
import InsightsPage    from "@/pages/InsightsPage";
import DiaryPage       from "@/pages/DiaryPage";
import ChatPage        from "@/pages/ChatPage";
import ApiToolsPage    from "@/pages/ApiToolsPage";
import FeedPage        from "@/pages/FeedPage";
import NotFound        from "@/pages/NotFound";

import SidePanel        from "@/components/SidePanel";
import NewsPopup        from "@/components/NewsPopup";
import SelectionToolbar from "@/components/SelectionToolbar";
import AdminPanel       from "@/components/AdminPanel";
import InsightPopup     from "@/components/InsightPopup";
import { useArticles }  from "@/hooks/useArticles";
import { useFeed }      from "@/hooks/useFeed";
import { useAuthStore } from "@/stores/auth-store";
import { useSteamiStore } from "@/stores/steami-store";
import { insights, dashboard, type AiInsight } from "@/lib/api";
import { resolveImg }   from "@/lib/api";

const queryClient = new QueryClient();

// ── Handles ?insight=<article_id> deep-link ──────────────────────────────────
function InsightDeepLink({ onOpen }: { onOpen: (article: any, insight: AiInsight) => void }) {
  const [params] = useSearchParams();
  useEffect(() => {
    const id = params.get("insight");
    if (!id) return;
    insights.get(id)
      .then(resp => {
        const url = resp.ai_insight.article_url ?? "";
        let host = "Shared Insight";
        try { if (url) host = new URL(url).hostname; } catch { /* ignore */ }
        onOpen({ id, title: host, source: "STEAMI", article_url: url, url }, resp.ai_insight);
        dashboard.event("ai_insight", id, host);
      })
      .catch(() => { /* insight not found */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

// ── App shell ─────────────────────────────────────────────────────────────────
function AppShell() {
  const { fetchMe } = useAuthStore();
  const { syncDiary, addToDiary } = useSteamiStore();

  // Restore auth session + load diary on mount
  useEffect(() => {
    fetchMe().then(() => syncDiary());
  }, [fetchMe, syncDiary]);

  const {
    articles, loading, refreshing, error, setError,
    insightLoadingId, openInsight, setOpenInsight, requestInsight, doFetch,
  } = useArticles();

  const {
    feedArticles, feedLoading, feedError, setFeedError,
    selectionText, setSelectionText, keywords,
    feedTabOpen, setFeedTabOpen, feedInsightId,
    feedOpenInsight, setFeedOpenInsight,
    fetchFeedForSelection, requestFeedInsight, removeFeedItem,
  } = useFeed();

  const [deepInsight, setDeepInsight] = useState<{ article: any; insight: AiInsight } | null>(null);

  function handleDiary(text: string) {
    addToDiary({
      text,
      source: "Selection",
      sourceType: "article",
      popup_type: "research_article",
    }).catch(() => {});
  }

  function handleFeed(text: string) {
    setSelectionText(text);
    fetchFeedForSelection(text);
  }

  useEffect(() => {
    const onPopupFeed = (event: Event) => {
      const text = (event as CustomEvent<string>).detail;
      if (text) handleFeed(text);
    };
    window.addEventListener("steami:feed-selection", onPopupFeed);
    return () => window.removeEventListener("steami:feed-selection", onPopupFeed);
  }, [fetchFeedForSelection, setSelectionText]);

  const handleFeedTabOpened = useCallback(() => setFeedTabOpen(false), [setFeedTabOpen]);

  function closeDeepInsight() {
    setDeepInsight(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("insight");
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <>
      {(error || feedError) && (
        <div className="fixed top-0 left-0 right-0 z-[90] flex items-center justify-between gap-3 px-4 py-2 text-xs bg-red-950/90 border-b border-red-800/50 text-red-300 backdrop-blur">
          <span>⚠ {error || feedError}</span>
          <button onClick={() => { setError(""); setFeedError(""); }} className="font-bold text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      {loading && articles.length === 0 && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/65 backdrop-blur-sm pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-white/45">
            <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <span className="text-sm">Loading intelligence feed…</span>
          </div>
        </div>
      )}

      {/* Routes */}
      <div className="pb-14 sm:pb-0">
        <Routes>
          <Route path="/"            element={<ExplainerPage />} />
          <Route path="/research"    element={<ResearchPage />} />
          <Route path="/simulations" element={<SimulationsPage />} />
          <Route path="/articles"    element={<ArticlesPage />} />
          <Route path="/insights"    element={<InsightsPage />} />
          <Route path="/diary"       element={<DiaryPage />} />
          <Route path="/feed"        element={<FeedPage />} />
          <Route path="/chat"        element={<ChatPage />} />
          <Route path="/api-tools"   element={<ApiToolsPage />} />
          <Route path="/dashboard"   element={<DashboardPage />} />
          <Route path="/admin"       element={<AdminPage />} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </div>

      {/* Deep-link handler — inside BrowserRouter */}
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
        <InsightPopup article={deepInsight.article} insight={deepInsight.insight} onClose={closeDeepInsight} />
      )}

      {/* Hidden admin content panel */}
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
      {/* BrowserRouter wraps everything — required for useSearchParams in InsightDeepLink */}
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
