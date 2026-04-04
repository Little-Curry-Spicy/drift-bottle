import "../global.css";
import "@/src/i18n/i18n";
import { hydrateStoredLanguage } from "@/src/i18n/persist-language";
import { Stack } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function RootLayout() {
  const { t } = useTranslation();

  useEffect(() => {
    void hydrateStoredLanguage();
  }, []);

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-base text-foreground">
          {t("layout.clerkKeyMissing")}
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}
