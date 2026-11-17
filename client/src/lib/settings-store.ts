export type AppTheme = "light" | "dark" | "system";
export type WritingLanguage = "British English" | "American English";

export type AppSettings = {
  general: {
    displayName: string;
    language: string;
    timezone: string;
    theme: AppTheme;
    dateFormat: string;
    landingPage: string;
  };
  personalization: {
    writingLanguage: WritingLanguage;
    tone: string;
    writingLevel: string;
    referencingStyle: string;
    responseLength: string;
    preferences: string;
  };
  notifications: {
    productUpdates: boolean;
    subscriptionReminders: boolean;
    tokenAlerts: boolean;
    accountActivity: boolean;
    inApp: boolean;
  };
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  general: {
    displayName: "",
    language: "English",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    theme: "dark",
    dateFormat: "MMM d, yyyy",
    landingPage: "home",
  },
  personalization: {
    writingLanguage: "British English",
    tone: "Formal academic",
    writingLevel: "Undergraduate",
    referencingStyle: "APA (7th ed.)",
    responseLength: "Detailed",
    preferences: "Avoid unsupported claims. Never invent references, citations, or research findings.",
  },
  notifications: {
    productUpdates: true,
    subscriptionReminders: true,
    tokenAlerts: true,
    accountActivity: true,
    inApp: true,
  },
};

const STORAGE_KEY = "faython:app-settings";

export function loadAppSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APP_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      general: { ...DEFAULT_APP_SETTINGS.general, ...parsed.general },
      personalization: { ...DEFAULT_APP_SETTINGS.personalization, ...parsed.personalization },
      notifications: { ...DEFAULT_APP_SETTINGS.notifications, ...parsed.notifications },
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("faython:settings"));
}

export function applyTheme(theme: AppTheme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "system" ? "light dark" : theme;
}

export function dateFormatOptions(dateFormat: string): Intl.DateTimeFormatOptions {
  switch (dateFormat) {
    case "d MMM yyyy":
      return { day: "numeric", month: "short", year: "numeric" };
    case "MM/dd/yyyy":
      return { month: "2-digit", day: "2-digit", year: "numeric" };
    case "yyyy-MM-dd":
      return { year: "numeric", month: "2-digit", day: "2-digit" };
    default:
      return { year: "numeric", month: "short", day: "numeric" };
  }
}
