"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { MASTER_BANK, EDUCATION_TEX, SKILLS_TEX, type SeedEntry } from "./seed-bank";

export type BankEntry = SeedEntry & {
  id: string;
};

type BankStore = {
  entries: BankEntry[];
  experiences: BankEntry[];
  projects: BankEntry[];
  educationTex: string;
  skillsTex: string;
  masterTex: string;
  addEntry: (entry: SeedEntry) => void;
  updateEntry: (id: string, entry: Partial<SeedEntry>) => void;
  deleteEntry: (id: string) => void;
  updateEducation: (tex: string) => void;
  updateSkills: (tex: string) => void;
  updateMasterTex: (tex: string) => void;
  resetToDefaults: () => void;
};

const BankContext = createContext<BankStore | null>(null);

const STORAGE_KEY = "forge-bank";
const EDUCATION_KEY = "forge-education-tex";
const SKILLS_KEY = "forge-skills-tex";
const MASTER_TEX_KEY = "forge-master-tex";

function generateId(): string {
  return crypto.randomUUID();
}

function seedEntries(): BankEntry[] {
  return MASTER_BANK.map((e) => ({ ...e, id: generateId() }));
}

function loadEntries(): BankEntry[] {
  if (typeof window === "undefined") return seedEntries();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedEntries();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(raw) as BankEntry[];
}

function saveEntries(entries: BankEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function BankProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [educationTex, setEducationTex] = useState(EDUCATION_TEX);
  const [skillsTex, setSkillsTex] = useState(SKILLS_TEX);
  const [masterTex, setMasterTex] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
    setEducationTex(
      localStorage.getItem(EDUCATION_KEY) || EDUCATION_TEX
    );
    setSkillsTex(localStorage.getItem(SKILLS_KEY) || SKILLS_TEX);
    setMasterTex(localStorage.getItem(MASTER_TEX_KEY) || "");
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveEntries(entries);
  }, [entries, loaded]);

  const addEntry = useCallback((entry: SeedEntry) => {
    setEntries((prev) => [...prev, { ...entry, id: generateId() }]);
  }, []);

  const updateEntry = useCallback((id: string, patch: Partial<SeedEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEducation = useCallback((tex: string) => {
    setEducationTex(tex);
    localStorage.setItem(EDUCATION_KEY, tex);
  }, []);

  const updateSkills = useCallback((tex: string) => {
    setSkillsTex(tex);
    localStorage.setItem(SKILLS_KEY, tex);
  }, []);

  const updateMasterTex = useCallback((tex: string) => {
    setMasterTex(tex);
    localStorage.setItem(MASTER_TEX_KEY, tex);
  }, []);

  const resetToDefaults = useCallback(() => {
    const seeded = seedEntries();
    setEntries(seeded);
    setEducationTex(EDUCATION_TEX);
    setSkillsTex(SKILLS_TEX);
    localStorage.removeItem(MASTER_TEX_KEY);
    setMasterTex("");
    localStorage.setItem(EDUCATION_KEY, EDUCATION_TEX);
    localStorage.setItem(SKILLS_KEY, SKILLS_TEX);
  }, []);

  const experiences = entries.filter((e) => e.kind === "experience");
  const projects = entries.filter((e) => e.kind === "project");

  return (
    <BankContext.Provider
      value={{
        entries,
        experiences,
        projects,
        educationTex,
        skillsTex,
        masterTex,
        addEntry,
        updateEntry,
        deleteEntry,
        updateEducation,
        updateSkills,
        updateMasterTex,
        resetToDefaults,
      }}
    >
      {loaded ? children : null}
    </BankContext.Provider>
  );
}

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error("useBank must be used within BankProvider");
  return ctx;
}
