import { useClerk, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { authTheme } from "@/src/theme/auth";
import type { AppLanguage } from "@/src/i18n/i18n";
import { persistAppLanguage } from "@/src/i18n/persist-language";

export function MineProfileSection() {
  const { t, i18n } = useTranslation();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

  if (!isLoaded) return null;

  const displayName =
    user?.fullName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    t("drift.profile.defaultName");

  const email = user?.primaryEmailAddress?.emailAddress;
  const initial = displayName.trim().slice(0, 1).toUpperCase() || "?";
  const activeLang: AppLanguage = i18n.language.startsWith("zh") ? "zh" : "en";

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const langChip = (lng: AppLanguage, label: string) => {
    const selected = activeLang === lng;
    return (
      <Pressable
        onPress={() => void persistAppLanguage(lng)}
        className="rounded-xl border px-3 py-2 active:opacity-80"
        style={{
          borderColor: selected ? authTheme.primary : authTheme.cardBorder,
          backgroundColor: selected ? `${authTheme.primary}18` : authTheme.inputBg,
        }}
      >
        <Text
          className="text-xs font-sans-semibold"
          style={{ color: selected ? authTheme.primary : authTheme.body }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="rounded-3xl border border-border/70 bg-card px-5 py-5">
      <View className="flex-row items-center gap-4">
        {user?.imageUrl ? (
          <Image
            source={{ uri: user.imageUrl }}
            style={{ width: 56, height: 56, borderRadius: 28 }}
            contentFit="cover"
            accessibilityLabel={t("drift.profile.avatarLabel")}
          />
        ) : (
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: authTheme.inputBorder }}
          >
            <Text className="text-xl font-sans-semibold" style={{ color: authTheme.title }}>
              {initial}
            </Text>
          </View>
        )}
        <View className="min-w-0 flex-1">
          <Text
            className="text-base font-sans-semibold"
            style={{ color: authTheme.title }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {email ? (
            <Text
              className="mt-1 text-xs leading-5"
              style={{ color: authTheme.body }}
              numberOfLines={2}
            >
              {email}
            </Text>
          ) : null}
          {user?.id ? (
            <Text
              className="mt-1 font-mono text-[10px] leading-4"
              style={{ color: authTheme.footer }}
              numberOfLines={1}
            >
              ID · {user.id}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-4">
        <Text className="mb-2 text-xs font-sans-medium" style={{ color: authTheme.subtitle }}>
          {t("drift.profile.language")}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {langChip("en", t("drift.profile.langEn"))}
          {langChip("zh", t("drift.profile.langZh"))}
        </View>
      </View>

      <Pressable
        onPress={handleSignOut}
        disabled={signingOut}
        accessibilityRole="button"
        accessibilityLabel={t("drift.profile.signOutA11y")}
        className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl border py-3.5 active:opacity-90"
        style={{
          borderColor: authTheme.cardBorder,
          opacity: signingOut ? 0.65 : 1,
        }}
      >
        {signingOut ? (
          <ActivityIndicator color={authTheme.error} size="small" />
        ) : (
          <Ionicons name="log-out-outline" size={18} color={authTheme.error} />
        )}
        <Text className="font-sans-semibold" style={{ color: authTheme.error }}>
          {signingOut ? t("drift.profile.signingOut") : t("drift.profile.signOut")}
        </Text>
      </Pressable>
    </View>
  );
}
