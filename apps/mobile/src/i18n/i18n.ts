import * as Localization from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import zh from "./locales/zh.json";

export type AppLanguage = "en" | "zh";

function deviceLanguage(): AppLanguage {
  const tag = Localization.getLocales()[0]?.languageTag ?? "en";
  return tag.toLowerCase().startsWith("zh") ? "zh" : "en";
}

// eslint-disable-next-line import/no-named-as-default-member -- i18next 实例的 .use()，非 named export
void i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: deviceLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v4",
  react: { useSuspense: false },
});

export default i18next;
