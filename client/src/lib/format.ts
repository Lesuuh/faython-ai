import { dateFormatOptions, loadAppSettings } from "./settings-store";

export function formatDate(iso: string): string {
  try {
    const settings = loadAppSettings().general;
    return new Intl.DateTimeFormat(settings.language, {
      ...dateFormatOptions(settings.dateFormat),
      timeZone: settings.timezone,
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleDateString();
  }
}