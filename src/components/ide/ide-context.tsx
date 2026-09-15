"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from "react";

export type Tab = {
  id: string;
  label: string;
  href: string;
  closable: boolean;
};

type IDEState = {
  sidebarCollapsed: boolean;
  rightPanelCollapsed: boolean;
  commandPaletteOpen: boolean;
  openTabs: Tab[];
  activeTabId: string;
  coverageScore: number | null;
  selectedCount: number;
  bankCount: number;
  agentStatus: "idle" | "running" | "done";
};

type Action =
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_RIGHT_PANEL" }
  | { type: "TOGGLE_COMMAND_PALETTE" }
  | { type: "OPEN_TAB"; tab: Tab }
  | { type: "CLOSE_TAB"; id: string }
  | { type: "SET_ACTIVE_TAB"; id: string }
  | { type: "SET_COVERAGE"; score: number | null }
  | { type: "SET_COUNTS"; selected: number; bank: number }
  | { type: "SET_AGENT_STATUS"; status: "idle" | "running" | "done" };

const DEFAULT_TABS: Tab[] = [
  { id: "agent", label: "Agent", href: "/dashboard", closable: false },
];

const initialState: IDEState = {
  sidebarCollapsed: false,
  rightPanelCollapsed: false,
  commandPaletteOpen: false,
  openTabs: DEFAULT_TABS,
  activeTabId: "agent",
  coverageScore: null,
  selectedCount: 0,
  bankCount: 0,
  agentStatus: "idle",
};

function reducer(state: IDEState, action: Action): IDEState {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case "TOGGLE_RIGHT_PANEL":
      return { ...state, rightPanelCollapsed: !state.rightPanelCollapsed };
    case "TOGGLE_COMMAND_PALETTE":
      return { ...state, commandPaletteOpen: !state.commandPaletteOpen };
    case "OPEN_TAB": {
      const exists = state.openTabs.find((t) => t.id === action.tab.id);
      if (exists) return { ...state, activeTabId: action.tab.id };
      return {
        ...state,
        openTabs: [...state.openTabs, action.tab],
        activeTabId: action.tab.id,
      };
    }
    case "CLOSE_TAB": {
      const filtered = state.openTabs.filter((t) => t.id !== action.id);
      const newActive =
        state.activeTabId === action.id
          ? filtered[filtered.length - 1]?.id ?? "agent"
          : state.activeTabId;
      return { ...state, openTabs: filtered, activeTabId: newActive };
    }
    case "SET_ACTIVE_TAB":
      return { ...state, activeTabId: action.id };
    case "SET_COVERAGE":
      return { ...state, coverageScore: action.score };
    case "SET_COUNTS":
      return {
        ...state,
        selectedCount: action.selected,
        bankCount: action.bank,
      };
    case "SET_AGENT_STATUS":
      return { ...state, agentStatus: action.status };
    default:
      return state;
  }
}

const IDEContext = createContext<IDEState>(initialState);
const IDEDispatchContext = createContext<Dispatch<Action>>(() => {});

export function IDEProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_COMMAND_PALETTE" });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <IDEContext.Provider value={state}>
      <IDEDispatchContext.Provider value={dispatch}>
        {children}
      </IDEDispatchContext.Provider>
    </IDEContext.Provider>
  );
}

export function useIDE() {
  return useContext(IDEContext);
}

export function useIDEDispatch() {
  return useContext(IDEDispatchContext);
}
