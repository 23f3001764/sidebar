/**
 * steami-store.ts
 *
 * Diary entries and recommendations are now backed by the real API.
 * On mount call `syncDiary()` to load from backend.
 * `addToDiary` calls POST /api/diary automatically when authenticated.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { diaryApi, dashboard, type DiaryEntry } from "@/lib/api";
import { useAuthStore } from "./auth-store";

export interface LocalDiaryEntry {
  id: string;
  text: string;
  source: string;
  sourceType: "explainer" | "article";
  field?: string;
  popup_id?: string;
  popup_type?: DiaryEntry["popup_type"];
  note?: string;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  type: "article" | "news" | "explainer";
  title: string;
  description: string;
  field: string;
}

interface SteamiState {
  diary: LocalDiaryEntry[];
  recommendations: Recommendation[];
  diaryLoaded: boolean;

  addToDiary: (entry: Omit<LocalDiaryEntry, "id" | "createdAt">) => Promise<void>;
  removeDiaryEntry: (id: string) => Promise<void>;
  clearDiary: () => void;
  syncDiary: () => Promise<void>;
  addRecommendation: (rec: Recommendation) => void;
  setRecommendations: (recs: Recommendation[]) => void;
}

function localToPopupType(sourceType: "explainer" | "article"): DiaryEntry["popup_type"] {
  return sourceType === "explainer" ? "explainer" : "research_article";
}

export const useSteamiStore = create<SteamiState>()(
  persist(
    (set, get) => ({
      diary: [],
      recommendations: [],
      diaryLoaded: false,

      addToDiary: async (entry) => {
        const id = crypto.randomUUID();
        const local: LocalDiaryEntry = {
          ...entry,
          id,
          createdAt: new Date().toISOString(),
        };

        // Optimistic update
        set((s) => ({ diary: [local, ...s.diary] }));

        // Track popup event
        if (entry.popup_id && entry.popup_type) {
          dashboard.event(entry.popup_type, entry.popup_id, entry.source);
        }

        // Persist to backend if authenticated
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated && entry.popup_id) {
          try {
            const saved = await diaryApi.create({
              popup_type: entry.popup_type ?? localToPopupType(entry.sourceType),
              popup_id: entry.popup_id,
              title: entry.source,
              selected_text: entry.text,
              note: entry.note ?? "",
            });
            // Replace optimistic entry with real one
            set((s) => ({
              diary: s.diary.map((d) =>
                d.id === id
                  ? { ...local, id: saved.id, popup_id: saved.popup_id }
                  : d
              ),
            }));
          } catch { /* keep optimistic */ }
        }
      },

      removeDiaryEntry: async (id) => {
        set((s) => ({ diary: s.diary.filter((d) => d.id !== id) }));
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try { await diaryApi.delete(id); } catch { /* ignore */ }
        }
      },

      clearDiary: () => set({ diary: [] }),

      syncDiary: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated || get().diaryLoaded) return;
        try {
          const res = await diaryApi.list(50);
          const entries: LocalDiaryEntry[] = res.entries.map((e) => ({
            id: e.id,
            text: e.selected_text,
            source: e.title,
            sourceType: e.popup_type === "explainer" ? "explainer" : "article",
            field: undefined,
            popup_id: e.popup_id,
            popup_type: e.popup_type,
            note: e.note,
            createdAt: e.created_at,
          }));
          set({ diary: entries, diaryLoaded: true });
        } catch { /* ignore, keep local */ }
      },

      addRecommendation: (rec) =>
        set((s) => ({ recommendations: [rec, ...s.recommendations].slice(0, 20) })),

      setRecommendations: (recs) => set({ recommendations: recs }),
    }),
    {
      name: "steami_store_v2",
      partialize: (s) => ({ diary: s.diary, recommendations: s.recommendations }),
    }
  )
);