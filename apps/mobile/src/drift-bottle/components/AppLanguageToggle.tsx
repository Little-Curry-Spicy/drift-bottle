import type { AppLanguage } from "@/src/i18n/i18n";
import { persistAppLanguage } from "@/src/i18n/persist-language";
import { authTheme } from "@/src/theme/auth";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  /** 为 true 时不显示「界面语言」标题，用于顶栏右侧 */
  compact?: boolean;
};

export function AppLanguageToggle({ compact }: Props) {
  const { t, i18n } = useTranslation();
  const activeLang: AppLanguage = i18n.language.startsWith("zh") ? "zh" : "en";

  const langChip = (lng: AppLanguage, label: string) => {
    const selected = activeLang === lng;
    return (
      <Pressable
        onPress={() => void persistAppLanguage(lng)}
        className={`rounded-xl border active:opacity-80 ${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`}
        style={{
          borderColor: selected ? authTheme.primary : authTheme.cardBorder,
          backgroundColor: selected ? `${authTheme.primary}18` : authTheme.inputBg,
        }}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={label}
      >
        <Text
          className={`font-sans-semibold ${compact ? "text-[11px]" : "text-xs"}`}
          style={{ color: selected ? authTheme.primary : authTheme.body }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="shrink-0">
      {!compact ? (
        <Text className="mb-2 text-xs font-sans-medium" style={{ color: authTheme.subtitle }}>
          {t("drift.profile.language")}
        </Text>
      ) : null}
      <View className="flex-row flex-wrap gap-1.5">
        {langChip("en", t("drift.profile.langEn"))}
        {langChip("zh", t("drift.profile.langZh"))}
      </View>
    </View>
  );
}
