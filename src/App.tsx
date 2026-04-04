import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster }           from "@/components/ui/toaster";
import { TooltipProvider }   from "@/components/ui/tooltip";

import ExplainerPage   from "./pages/ExplainerPage";
import ResearchPage    from "./pages/ResearchPage";
import DashboardPage   from "./pages/DashboardPage";
import SimulationsPage from "./pages/SimulationsPage";
import NotFound        from "./pages/NotFound";

import SidePanel         from "@/components/SidePanel";
import NewsPopup         from "@/components/NewsPopup";
import SelectionToolbar  from "@/components/SelectionToolbar";
import { useArticles }   from "@/hooks/useArticles";
import { useFeed }       from "@/hooks/useFeed";

const queryClient = new QueryClient();

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

  function handleDiary(text: string) {
    console.log("Save to diary:", text);
  }

  function handleFeed(text: string) {
    setSelectionText(text);
    fetchFeedForSelection(text);
  }

  return (
    <>
      {(error || feedError) && (
        <div className="fixed top-0 left-0 right-0 z-[90] flex items-center
          justify-between gap-3 px-4 py-2 text-xs
          bg-red-950/90 border-b border-red-800/50 text-red-300 backdrop-blur">
          <span>⚠ {error || feedError}</span>
          <button onClick={() => { setError(""); setFeedError(""); }}
            className="font-bold text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

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

      <div className="pb-14 sm:pb-0">
        <BrowserRouter>
          <Routes>
            <Route path="/"            element={<ExplainerPage />} />
            <Route path="/research"    element={<ResearchPage />} />
            <Route path="/simulations" element={<SimulationsPage />} />
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="*"            element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>

      <SelectionToolbar onDiary={handleDiary} onFeed={handleFeed} />

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

      {articles.length > 0 && (
        <div className="fixed bottom-14 sm:bottom-5 left-5 z-30">
          <NewsPopup articles={articles} />
        </div>
      )}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppShell />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;