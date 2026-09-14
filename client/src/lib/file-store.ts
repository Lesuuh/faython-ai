import { uid } from "./chat-store";

export type ExportedFile = {
  id: string;
  name: string;
  kind: "conversation" | "project";
  refId: string;
  exportedAt: string;
};

const FILES_KEY = "faython:exports";
const MAX_FILES = 50;

export function loadFiles(): ExportedFile[] {
  try {
    const raw = window.localStorage.getItem(FILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ExportedFile[];
  } catch {
    return [];
  }
}

function persistFiles(list: ExportedFile[]): void {
  try {
    window.localStorage.setItem(FILES_KEY, JSON.stringify(list));
  } catch {
    // storage unavailable — export history stays in memory only
  }
}

export function recordExport(name: string, kind: "conversation" | "project", refId: string): void {
  const entry: ExportedFile = {
    id: uid(),
    name,
    kind,
    refId,
    exportedAt: new Date().toISOString(),
  };
  persistFiles([entry, ...loadFiles()].slice(0, MAX_FILES));
}

export function deleteFile(id: string): void {
  persistFiles(loadFiles().filter((f) => f.id !== id));
}