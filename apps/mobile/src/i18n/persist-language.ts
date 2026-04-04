import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AppLanguage } from "./i18n";
import i18next from "./i18n";

const STORAGE_KEY = "app_language";

const allowed = (v: string | null): v is AppLanguage => v === "en" || v === "zh";

export async function hydrateStoredLanguage(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (allowed(raw)) await i18next.changeLanguage(raw);
  } catch {
    /* ignore */
  }
}

export async function persistAppLanguage(lng: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, lng);
  await i18next.changeLanguage(lng);
}
