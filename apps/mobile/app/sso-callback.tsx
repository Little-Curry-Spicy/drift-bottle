import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

/** OAuth 弹窗回跳页：需与 `getClerkOAuthRedirectUrl()` 路径一致，并完成 AuthSession */
export default function SsoCallbackScreen() {
  const { t } = useTranslation();

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <ActivityIndicator />
      <Text className="mt-3 text-base text-foreground">{t("auth.ssoCallback.completing")}</Text>
    </View>
  );
}
