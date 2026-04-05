import { getClerkOAuthRedirectUrl } from "@/src/auth/clerk-oauth-redirect";
import { AppLanguageToggle } from "@/src/drift-bottle/components/AppLanguageToggle";
import { authTheme } from "@/src/theme/auth";
import { AuthTextInput } from "@/src/theme/AuthTextInput";
import { useAuth, useSSO, useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { Link, Redirect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function SignInPage() {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, setActive } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"" | "google" | "github">("");

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/bottles" />;

  const onSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      // Clerk identifier：用户名或邮箱均可，界面以用户名为准
      const result = await signIn?.create({
        identifier: username.trim(),
        password,
      });
      if (result?.status === "complete") {
        await setActive?.({ session: result.createdSessionId });
      } else {
        setError(t("auth.signIn.errorIncomplete"));
      }
    } catch {
      setError(t("auth.signIn.errorBadCreds"));
    } finally {
      setLoading(false);
    }
  };

  const onOAuthSignIn = async (provider: "google" | "github") => {
    try {
      setError("");
      setOauthLoading(provider);
      const result = await startSSOFlow({
        strategy: provider === "google" ? "oauth_google" : "oauth_github",
        redirectUrl: getClerkOAuthRedirectUrl(),
      });

      if (result.createdSessionId) {
        await (result.setActive ?? setActive)?.({ session: result.createdSessionId });
      } else {
        setError(t("auth.signIn.errorOAuthIncomplete"));
      }
    } catch {
      setError(t("auth.signIn.errorOAuthFailed"));
    } finally {
      setOauthLoading("");
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: authTheme.screenBg }}>
      <View className="flex-row justify-end px-6 pt-1">
        <AppLanguageToggle compact />
      </View>
      <View className="mx-auto w-full max-w-[520px] flex-1 px-6 mt-6">
        <View className="items-center">
          <View className="h-[150px] w-[150px] items-center justify-center overflow-hidden">
            <DotLottie
              source={require("../assets/lottie/running-Cat.lottie")}
              autoplay
              loop
              style={{ width: 280, height: 150 }}
            />
          </View>
        </View>

        <View
          className="mx-4 mb-12 rounded-3xl border p-5"
          style={{ backgroundColor: authTheme.cardBg, borderColor: authTheme.cardBorder }}
        >
          <Text className="text-2xl font-sans-bold" style={{ color: authTheme.title }}>
            {t("auth.signIn.title")}
          </Text>
          <View className="mt-5 gap-4">
            <View>
              <Text className="mb-2 text-base font-sans-medium" style={{ color: authTheme.label }}>
                {t("auth.signIn.username")}
              </Text>
              <AuthTextInput
                value={username}
                onChangeText={setUsername}
                placeholder={t("auth.signIn.usernamePlaceholder")}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                className="rounded-2xl px-4 py-3.5"
                placeholderTextColor={authTheme.placeholder}
              />
            </View>
            <View>
              <Text className="mb-2 text-base font-sans-medium" style={{ color: authTheme.label }}>
                {t("auth.signIn.password")}
              </Text>
              <View
                className="flex-row items-center rounded-2xl border pr-1"
                style={{ borderColor: authTheme.inputBorder, backgroundColor: authTheme.inputBg }}
              >
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t("auth.signIn.passwordPlaceholder")}
                  secureTextEntry={!passwordVisible}
                  className="min-w-0 flex-1 px-4 py-3.5"
                  placeholderTextColor={authTheme.placeholder}
                  style={{ color: authTheme.inputText }}
                />
                <Pressable
                  onPress={() => setPasswordVisible((v) => !v)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={
                    passwordVisible ? t("auth.a11y.passwordHide") : t("auth.a11y.passwordShow")
                  }
                  className="p-2.5"
                >
                  <Ionicons
                    name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={authTheme.icon}
                  />
                </Pressable>
              </View>
            </View>
            {error ? (
              <Text className="text-sm" style={{ color: authTheme.error }}>
                {error}
              </Text>
            ) : null}
            <Pressable
              onPress={onSignIn}
              disabled={loading}
              className="items-center rounded-2xl px-4 py-3.5"
              style={{ backgroundColor: authTheme.primary, opacity: loading ? 0.7 : 1 }}
            >
              <Text className="font-sans-semibold text-white">
                {loading ? t("auth.signIn.signingIn") : t("auth.signIn.signInCta")}
              </Text>
            </Pressable>

            <View className="my-1 flex-row items-center gap-3">
              <View className="h-px flex-1" style={{ backgroundColor: authTheme.divider }} />
              <Text className="text-xs" style={{ color: authTheme.dividerMuted }}>
                {t("auth.signIn.orContinue")}
              </Text>
              <View className="h-px flex-1" style={{ backgroundColor: authTheme.divider }} />
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => onOAuthSignIn("google")}
                disabled={oauthLoading !== ""}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border px-4 py-3"
                style={{
                  borderColor: authTheme.inputBorder,
                  backgroundColor: authTheme.inputBg,
                }}
              >
                <Ionicons name="logo-google" size={16} color={authTheme.icon} />
                <Text className="font-sans-medium" style={{ color: authTheme.icon }}>
                  {oauthLoading === "google" ? t("auth.signIn.connecting") : t("auth.signIn.google")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onOAuthSignIn("github")}
                disabled={oauthLoading !== ""}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border px-4 py-3"
                style={{
                  borderColor: authTheme.inputBorder,
                  backgroundColor: authTheme.inputBg,
                }}
              >
                <Ionicons name="logo-github" size={16} color={authTheme.icon} />
                <Text className="font-sans-medium" style={{ color: authTheme.icon }}>
                  {oauthLoading === "github" ? t("auth.signIn.connecting") : t("auth.signIn.github")}
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-5 flex-row justify-center gap-1">
            <Text className="text-sm" style={{ color: authTheme.footer }}>
              {t("auth.signIn.newToApp", { name: t("auth.signIn.appName") })}
            </Text>
            <Link href="/sign-up" className="text-sm font-sans-semibold" style={{ color: authTheme.link }}>
              {t("auth.signIn.createAccount")}
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
