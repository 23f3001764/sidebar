/**
 * App.tsx — STEAMI Nexus  (final)
 *
 * Preserves your exact router structure.
 * Adds: SidePanel, InsightPopup, NewsPopup, error banner, loading overlay.
 *
 * SidePanel is rendered OUTSIDE <BrowserRouter> so it persists across all
 * routes without remounting. useArticles() boots on first render:
 *   1. GET /api/articles?limit=35   → load from Firestore
 *   2. If empty → POST /api/articles/fetch  → pull fresh from RSS
 *   3. Per-card click → POST /api/articles/:id/insight  → Gemini or cache
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import ExplainerPage   from "./pages/ExplainerPage";
import ResearchPage    from "./pages/ResearchPage";
import DashboardPage   from "./pages/DashboardPage";
import SimulationsPage from "./pages/SimulationsPage";
import NotFound        from "./pages/NotFound";

import SidePanel    from "@/components/SidePanel";
import NewsPopup    from "@/components/NewsPopup";
import { useArticles } from "@/hooks/useArticles";

const queryClient = new QueryClient();

// ── Inner shell — needs hooks (must be inside QueryClientProvider) ────────────
function AppShell() {
  const {
    articles,
    loading,
    refreshing,
    error,       setError,
    insightLoadingId,
    openInsight, setOpenInsight,
    requestInsight,
    doFetch,
  } = useArticles();

  return (
    <>
      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {error && (
        <div
          className="fixed top-0 left-0 right-0 z-[90] flex items-center
            justify-between gap-3 px-4 py-2 text-xs
            bg-red-950/90 border-b border-red-800/50 text-red-300 backdrop-blur"
        >
          <span>⚠ {error}</span>
          <button
            onClick={() => setError("")}
            className="font-bold text-red-400 hover:text-red-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Initial loading overlay ──────────────────────────────────────── */}
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

      {/* ── Router + pages ─────────────────────────────────────────────── */}
      <BrowserRouter>
        <Routes>
          <Route path="/"            element={<ExplainerPage />} />
          <Route path="/research"    element={<ResearchPage />} />
          <Route path="/simulations" element={<SimulationsPage />} />
          <Route path="/dashboard"   element={<DashboardPage />} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </BrowserRouter>

      {/* ── Side panel — persists across all routes ──────────────────────
          Rendered outside BrowserRouter intentionally so it doesn't
          remount on navigation. z-50 (below tab buttons at z-60).
      ─────────────────────────────────────────────────────────────────── */}
      <SidePanel
        articles={articles}
        insightLoadingId={insightLoadingId}
        onInsight={requestInsight}
        onRefresh={doFetch}
        refreshing={refreshing}
        openInsight={openInsight}
        onCloseInsight={() => setOpenInsight(null)}
      />

      {/* ── News ticker — bottom-left, z-30 ─────────────────────────────── */}
      {articles.length > 0 && <NewsPopup articles={articles} />}
    </>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
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