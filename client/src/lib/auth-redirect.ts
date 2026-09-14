const KEY = "faython:auth-redirect";

export function setAuthRedirect(path: string): void {
  try {
    window.sessionStorage.setItem(KEY, path);
  } catch {
    // storage unavailable — fall back to default destination
  }
}

export function consumeAuthRedirect(): string | null {
  try {
    const value = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}