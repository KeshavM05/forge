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

export type ResumeFile = {
  id: string;
  name: string;
  tex: string;
  isMaster: boolean;
  createdAt: string;
};

type BankStore = {
  entries: BankEntry[];
  experiences: BankEntry[];
  projects: BankEntry[];
  educationTex: string;
  skillsTex: string;
  resumes: ResumeFile[];
  masterResume: ResumeFile | null;
  addEntry: (entry: SeedEntry) => void;
  updateEntry: (id: string, entry: Partial<SeedEntry>) => void;
  deleteEntry: (id: string) => void;
  updateEducation: (tex: string) => void;
  updateSkills: (tex: string) => void;
  addResume: (name: string, tex: string) => string;
  updateResume: (id: string, patch: { name?: string; tex?: string }) => void;
  deleteResume: (id: string) => void;
  setMasterResume: (id: string) => void;
  resetToDefaults: () => void;
};

const BankContext = createContext<BankStore | null>(null);

const STORAGE_KEY = "forge-bank";
const EDUCATION_KEY = "forge-education-tex";
const SKILLS_KEY = "forge-skills-tex";
const RESUMES_KEY = "forge-resumes";

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

function loadResumes(): ResumeFile[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(RESUMES_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as ResumeFile[];
}

function saveResumes(resumes: ResumeFile[]) {
  localStorage.setItem(RESUMES_KEY, JSON.stringify(resumes));
}

export function BankProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [educationTex, setEducationTex] = useState(EDUCATION_TEX);
  const [skillsTex, setSkillsTex] = useState(SKILLS_TEX);
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
    setEducationTex(localStorage.getItem(EDUCATION_KEY) || EDUCATION_TEX);
    setSkillsTex(localStorage.getItem(SKILLS_KEY) || SKILLS_TEX);
    setResumes(loadResumes());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveEntries(entries);
  }, [entries, loaded]);

  useEffect(() => {
    if (loaded) saveResumes(resumes);
  }, [resumes, loaded]);

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

  const addResume = useCallback((name: string, tex: string): string => {
    const id = generateId();
    const newResume: ResumeFile = {
      id,
      name,
      tex,
      isMaster: false,
      createdAt: new Date().toISOString(),
    };
    setResumes((prev) => {
      if (prev.length === 0) {
        return [{ ...newResume, isMaster: true }];
      }
      return [...prev, newResume];
    });
    return id;
  }, []);

  const updateResume = useCallback(
    (id: string, patch: { name?: string; tex?: string }) => {
      setResumes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
      );
    },
    []
  );

  const deleteResume = useCallback((id: string) => {
    setResumes((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      if (prev.find((r) => r.id === id)?.isMaster && filtered.length > 0) {
        filtered[0].isMaster = true;
      }
      return filtered;
    });
  }, []);

  const setMasterResume = useCallback((id: string) => {
    setResumes((prev) =>
      prev.map((r) => ({ ...r, isMaster: r.id === id }))
    );
  }, []);

  const resetToDefaults = useCallback(() => {
    const seeded = seedEntries();
    setEntries(seeded);
    setEducationTex(EDUCATION_TEX);
    setSkillsTex(SKILLS_TEX);
    localStorage.setItem(EDUCATION_KEY, EDUCATION_TEX);
    localStorage.setItem(SKILLS_KEY, SKILLS_TEX);
  }, []);

  const experiences = entries.filter((e) => e.kind === "experience");
  const projects = entries.filter((e) => e.kind === "project");
  const masterResume = resumes.find((r) => r.isMaster) || null;

  return (
    <BankContext.Provider
      value={{
        entries,
        experiences,
        projects,
        educationTex,
        skillsTex,
        resumes,
        masterResume,
        addEntry,
        updateEntry,
        deleteEntry,
        updateEducation,
        updateSkills,
        addResume,
        updateResume,
        deleteResume,
        setMasterResume,
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
