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

export type BankEntry = SeedEntry & { id: string };

export type ResumeFile = {
  id: string;
  name: string;
  tex: string;
  isMaster: boolean;
  createdAt: string;
};

export type TailoredProject = {
  id: string;
  name: string;
  company: string;
  role: string;
  jd: string;
  tex: string;
  atsScore: number;
  coveredKeywords: string[];
  missingKeywords: string[];
  selectedExperiences: string[];
  selectedProject: string;
  analysis: string;
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
  tailored: TailoredProject[];
  addEntry: (entry: SeedEntry) => void;
  updateEntry: (id: string, entry: Partial<SeedEntry>) => void;
  deleteEntry: (id: string) => void;
  updateEducation: (tex: string) => void;
  updateSkills: (tex: string) => void;
  addResume: (name: string, tex: string) => string;
  updateResume: (id: string, patch: { name?: string; tex?: string }) => void;
  deleteResume: (id: string) => void;
  setMasterResume: (id: string) => void;
  saveTailored: (project: Omit<TailoredProject, "id" | "createdAt">) => string;
  deleteTailored: (id: string) => void;
  resetToDefaults: () => void;
};

const BankContext = createContext<BankStore | null>(null);

const STORAGE_KEY = "forge-bank";
const EDUCATION_KEY = "forge-education-tex";
const SKILLS_KEY = "forge-skills-tex";
const RESUMES_KEY = "forge-resumes";
const TAILORED_KEY = "forge-tailored";

function generateId(): string {
  return crypto.randomUUID();
}

function seedEntries(): BankEntry[] {
  return MASTER_BANK.map((e) => ({ ...e, id: generateId() }));
}

function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T[]; } catch { return fallback; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

async function fetchMasterTemplate(): Promise<string | null> {
  try {
    const res = await fetch("/api/master-tex");
    if (!res.ok) return null;
    const data = (await res.json()) as { tex: string };
    return data.tex;
  } catch {
    return null;
  }
}

export function BankProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [educationTex, setEducationTex] = useState(EDUCATION_TEX);
  const [skillsTex, setSkillsTex] = useState(SKILLS_TEX);
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [tailored, setTailored] = useState<TailoredProject[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedEntries = load<BankEntry>(STORAGE_KEY, []);
    setEntries(savedEntries.length > 0 ? savedEntries : seedEntries());
    setEducationTex(localStorage.getItem(EDUCATION_KEY) || EDUCATION_TEX);
    setSkillsTex(localStorage.getItem(SKILLS_KEY) || SKILLS_TEX);
    setTailored(load<TailoredProject>(TAILORED_KEY, []));

    const loadedResumes = load<ResumeFile>(RESUMES_KEY, []);
    if (loadedResumes.length > 0) {
      setResumes(loadedResumes);
      setLoaded(true);
    } else {
      fetchMasterTemplate().then((tex) => {
        if (tex) {
          const seeded: ResumeFile[] = [{
            id: generateId(), name: "Master Resume", tex, isMaster: true, createdAt: new Date().toISOString(),
          }];
          setResumes(seeded);
          save(RESUMES_KEY, seeded);
        }
        setLoaded(true);
      });
    }
  }, []);

  useEffect(() => { if (loaded) save(STORAGE_KEY, entries); }, [entries, loaded]);
  useEffect(() => { if (loaded) save(RESUMES_KEY, resumes); }, [resumes, loaded]);
  useEffect(() => { if (loaded) save(TAILORED_KEY, tailored); }, [tailored, loaded]);

  const addEntry = useCallback((entry: SeedEntry) => {
    setEntries((prev) => [...prev, { ...entry, id: generateId() }]);
  }, []);

  const updateEntry = useCallback((id: string, patch: Partial<SeedEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
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
    setResumes((prev) => {
      const r: ResumeFile = { id, name, tex, isMaster: prev.length === 0, createdAt: new Date().toISOString() };
      return [...prev, r];
    });
    return id;
  }, []);

  const updateResume = useCallback((id: string, patch: { name?: string; tex?: string }) => {
    setResumes((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const deleteResume = useCallback((id: string) => {
    setResumes((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      if (prev.find((r) => r.id === id)?.isMaster && filtered.length > 0) filtered[0].isMaster = true;
      return filtered;
    });
  }, []);

  const setMasterResume = useCallback((id: string) => {
    setResumes((prev) => prev.map((r) => ({ ...r, isMaster: r.id === id })));
  }, []);

  const saveTailored = useCallback((project: Omit<TailoredProject, "id" | "createdAt">): string => {
    const id = generateId();
    const full: TailoredProject = { ...project, id, createdAt: new Date().toISOString() };
    setTailored((prev) => [full, ...prev]);
    return id;
  }, []);

  const deleteTailored = useCallback((id: string) => {
    setTailored((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const resetToDefaults = useCallback(() => {
    const seeded = seedEntries();
    setEntries(seeded);
    save(STORAGE_KEY, seeded);
    setEducationTex(EDUCATION_TEX);
    setSkillsTex(SKILLS_TEX);
    localStorage.setItem(EDUCATION_KEY, EDUCATION_TEX);
    localStorage.setItem(SKILLS_KEY, SKILLS_TEX);
  }, []);

  return (
    <BankContext.Provider value={{
      entries,
      experiences: entries.filter((e) => e.kind === "experience"),
      projects: entries.filter((e) => e.kind === "project"),
      educationTex, skillsTex,
      resumes, masterResume: resumes.find((r) => r.isMaster) || null,
      tailored,
      addEntry, updateEntry, deleteEntry, updateEducation, updateSkills,
      addResume, updateResume, deleteResume, setMasterResume,
      saveTailored, deleteTailored, resetToDefaults,
    }}>
      {loaded ? children : null}
    </BankContext.Provider>
  );
}

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error("useBank must be used within BankProvider");
  return ctx;
}
