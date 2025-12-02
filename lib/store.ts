import { create } from "zustand";
import type { KundliProfile, RuleMapping } from "./types";

type ModuleType = "astrology" | "numerology" | "graphology" | "tarot";

type AppState = {
  activeModule: ModuleType | null;
  kundli?: KundliProfile;
  numerologyOutput?: string;
  graphologyFileUrl?: string;
  tarotQuestion?: string;
  selectedCategory?: string;
  selectedQuestion?: RuleMapping | null;
  paidUnlocked: boolean;
  setActiveModule: (module: ModuleType) => void;
  setKundli: (profile: KundliProfile) => void;
  setNumerologyOutput: (output: string) => void;
  setGraphologyFileUrl: (url: string) => void;
  setTarotQuestion: (question: string) => void;
  setSelectedCategory: (category?: string) => void;
  setSelectedQuestion: (mapping: RuleMapping | null) => void;
  unlockPaid: () => void;
  reset: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeModule: null,
  paidUnlocked: false,
  selectedQuestion: null,
  setActiveModule: (module) => set({ activeModule: module }),
  setKundli: (profile) => set({ kundli: profile }),
  setNumerologyOutput: (output) => set({ numerologyOutput: output }),
  setGraphologyFileUrl: (url) => set({ graphologyFileUrl: url }),
  setTarotQuestion: (question) => set({ tarotQuestion: question }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedQuestion: (mapping) => set({ selectedQuestion: mapping }),
  unlockPaid: () => set({ paidUnlocked: true }),
  reset: () =>
    set({
      activeModule: null,
      paidUnlocked: false,
      selectedCategory: undefined,
      selectedQuestion: null,
      numerologyOutput: undefined,
      graphologyFileUrl: undefined,
      tarotQuestion: undefined,
    }),
}));

