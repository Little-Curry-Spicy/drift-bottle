import "../global.css";
import { Stack } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Text, View } from "react-native";

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-base text-foreground">
          请先在环境变量中配置 EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
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
