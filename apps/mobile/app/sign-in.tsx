import { authTheme } from "@/src/theme/auth";
import { useAuth, useSSO, useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { Link, Redirect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, setActive } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"" | "google" | "github">("");

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/bottles" />;

  const onSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await signIn?.create({
        identifier: email.trim(),
        password,
      });
      if (result?.status === "complete") {
        await setActive?.({ session: result.createdSessionId });
      } else {
        setError("登录未完成，请重试。");
      }
    } catch {
      setError("邮箱或密码错误，请检查后重试。");
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
      });

      if (result.createdSessionId) {
        await (result.setActive ?? setActive)?.({ session: result.createdSessionId });
      } else {
        setError("第三方登录未完成，请重试。");
      }
    } catch {
      setError("第三方登录失败，请稍后重试。");
    } finally {
      setOauthLoading("");
    }
  };

  return (
    <SafeAreaView className="flex-1 px-6" style={{ backgroundColor: authTheme.screenBg }}>
      <View className="mx-auto w-full max-w-[520px] pt-10 flex-1 justify-center">
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
            Welcome back
          </Text>
          <View className="mt-5 gap-4">
            <View>
              <Text className="mb-2 text-base font-sans-medium" style={{ color: authTheme.label }}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
                className="rounded-2xl border px-4 py-3.5"
                placeholderTextColor={authTheme.placeholder}
                style={{
                  borderColor: authTheme.inputBorder,
                  backgroundColor: authTheme.inputBg,
                  color: authTheme.inputText,
                }}
              />
            </View>
            <View>
              <Text className="mb-2 text-base font-sans-medium" style={{ color: authTheme.label }}>
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                className="rounded-2xl border px-4 py-3.5"
                placeholderTextColor={authTheme.placeholder}
                style={{
                  borderColor: authTheme.inputBorder,
                  backgroundColor: authTheme.inputBg,
                  color: authTheme.inputText,
                }}
              />
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
                {loading ? "Signing in..." : "Sign in"}
              </Text>
            </Pressable>

            <View className="my-1 flex-row items-center gap-3">
              <View className="h-px flex-1" style={{ backgroundColor: authTheme.divider }} />
              <Text className="text-xs" style={{ color: authTheme.dividerMuted }}>
                or continue with
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
                  {oauthLoading === "google" ? "Connecting..." : "Google"}
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
                  {oauthLoading === "github" ? "Connecting..." : "GitHub"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-5 flex-row justify-center gap-1">
            <Text className="text-sm" style={{ color: authTheme.footer }}>
              New to 漂流瓶?
            </Text>
            <Link href="/sign-up" className="text-sm font-sans-semibold" style={{ color: authTheme.link }}>
              Create an account
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
