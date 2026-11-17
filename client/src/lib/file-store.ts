import { uid } from "./ids";

export type ExportedFile = {
  id: string;
  name: string;
  kind: "conversation" | "project";
  refId: string;
  exportedAt: string;
};

const LEGACY_KEY = "faython:exports";
const MAX_FILES = 50;

function filesKey(userId: string | null): string | null {
  return userId ? `faython:exports:${userId}` : null;
}

function adoptLegacyIfAbsent(key: string): string | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
    if (raw === null) {
      const legacy = window.localStorage.getItem(LEGACY_KEY);
      if (legacy !== null) {
        try {
          window.localStorage.setItem(key, legacy);
          window.localStorage.removeItem(LEGACY_KEY);
        } catch {
          // storage unavailable
        }
        return legacy;
      }
    }
  } catch {
    // ignore
  }
  return raw;
}

export function loadFiles(userId: string | null): ExportedFile[] {
  const key = filesKey(userId);
  if (!key || !userId) return [];
  const raw = adoptLegacyIfAbsent(key);
  try {
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ExportedFile[];
  } catch {
    return [];
  }
}

function persistFiles(userId: string | null, list: ExportedFile[]): void {
  const key = filesKey(userId);
  if (!key || !userId) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // storage unavailable — export history stays in memory only
  }
}

export function recordExport(
  userId: string | null,
  name: string,
  kind: "conversation" | "project",
  refId: string,
): void {
  const entry: ExportedFile = {
    id: uid(),
    name,
    kind,
    refId,
    exportedAt: new Date().toISOString(),
  };
  persistFiles(userId, [entry, ...loadFiles(userId)].slice(0, MAX_FILES));
}

export function deleteFile(userId: string | null, id: string): void {
  persistFiles(userId, loadFiles(userId).filter((f) => f.id !== id));
}