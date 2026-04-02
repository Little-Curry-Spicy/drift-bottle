import { authTheme } from "@/src/theme/auth";
import { useAuth, useSSO, useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { Link, Redirect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

function getClerkErrorMessage(error: unknown, fallback: string) {
  const maybe = error as { errors?: Array<{ longMessage?: string; message?: string }> };
  const first = maybe?.errors?.[0];
  return first?.longMessage || first?.message || fallback;
}

export default function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"" | "google" | "github">("");
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (!pendingVerification || resendCountdown <= 0) return;
    const timer = setTimeout(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pendingVerification, resendCountdown]);

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/bottles" />;

  const onSignUp = async () => {
    if (!email.trim()) {
      setError("请先输入邮箱。");
      return;
    }
    if (password.trim().length < 6) {
      setError("密码至少 6 位。");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setResendCountdown(60);
      await signUp?.create({
        emailAddress: email.trim(),
        password,
      });
      await signUp?.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setPendingVerification(true);
    } catch (error) {
      setResendCountdown(0);
      setError(getClerkErrorMessage(error, "注册失败，请检查邮箱格式和密码强度。"));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    try {
      setLoading(true);
      setError("");
      const verifyResult = await signUp?.attemptEmailAddressVerification({
        code: code.trim(),
      });
      if (verifyResult?.status === "complete") {
        await setActive?.({ session: verifyResult.createdSessionId });
      } else {
        setError("验证码验证未完成，请重试。");
      }
    } catch (error) {
      setError(getClerkErrorMessage(error, "验证码无效或已过期。"));
    } finally {
      setLoading(false);
    }
  };

  const onOAuthSignUp = async (provider: "google" | "github") => {
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
    } catch (error) {
      setError(getClerkErrorMessage(error, "第三方登录失败，请稍后重试。"));
    } finally {
      setOauthLoading("");
    }
  };

  const onResendCode = async () => {
    try {
      setLoading(true);
      setError("");
      setResendCountdown(60);
      await signUp?.prepareEmailAddressVerification({
        strategy: "email_code",
      });
    } catch (error) {
      setResendCountdown(0);
      setError(getClerkErrorMessage(error, "验证码发送失败，请稍后重试。"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 px-6" style={{ backgroundColor: authTheme.screenBg }}>
      <View className="mx-auto w-full max-w-[520px] flex-1 justify-center">
        <View className="mx-auto w-[220px] items-center justify-center overflow-hidden">
          <DotLottie
            source={require("../assets/lottie/bootstrap.lottie")}
            autoplay
            loop
            style={{ width: 220, height: 120 }}
          />
        </View>

        <View
          className="mx-4 mb-12 rounded-3xl border p-5"
          style={{ backgroundColor: authTheme.cardBg, borderColor: authTheme.cardBorder }}
        >
          <Text className="text-2xl font-sans-bold" style={{ color: authTheme.title }}>
            Create account
          </Text>
          <Text className="mt-1 text-sm" style={{ color: authTheme.body }}>
            填写邮箱、验证码与密码，在同一页完成注册。
          </Text>

          <View className="mt-2 gap-4">
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
                Verification code
              </Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  className="flex-1 rounded-2xl border px-4 py-3.5"
                  placeholderTextColor={authTheme.placeholder}
                  style={{
                    borderColor: authTheme.inputBorder,
                    backgroundColor: authTheme.inputBg,
                    color: authTheme.inputText,
                  }}
                />
                <Pressable
                  onPress={pendingVerification ? onResendCode : onSignUp}
                  disabled={loading || resendCountdown > 0 || email.trim().length === 0}
                  className="rounded-2xl px-3 py-3"
                  style={{
                    backgroundColor: authTheme.primary,
                    opacity:
                      loading || resendCountdown > 0 || email.trim().length === 0
                        ? 0.55
                        : 1,
                  }}
                >
                  <Text className="text-xs font-sans-semibold text-white">
                    {resendCountdown > 0 ? `${resendCountdown}s` : "Send"}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View>
              <Text className="mb-2 text-base font-sans-medium" style={{ color: authTheme.label }}>
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                  placeholder="At least 6 characters"
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
            {pendingVerification ? (
              <Text className="text-sm" style={{ color: authTheme.body }}>
                验证码已发送到 {email}，请输入后点击完成注册。
              </Text>
            ) : null}
            {error ? (
              <Text className="text-sm" style={{ color: authTheme.error }}>
                {error}
              </Text>
            ) : null}
            <Pressable
              onPress={pendingVerification ? onVerify : onSignUp}
              disabled={loading || (pendingVerification && code.trim().length === 0)}
              className="items-center rounded-2xl px-4 py-3.5"
              style={{
                backgroundColor: authTheme.primary,
                opacity: loading || (pendingVerification && code.trim().length === 0) ? 0.7 : 1,
              }}
            >
              <Text className="font-sans-semibold text-white">
                {loading
                  ? pendingVerification
                    ? "Verifying..."
                    : "Sending code..."
                  : pendingVerification
                    ? "Complete sign up"
                    : "Send verification code"}
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
                onPress={() => onOAuthSignUp("google")}
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
                onPress={() => onOAuthSignUp("github")}
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
              Already have an account?
            </Text>
            <Link href="/sign-in" className="text-sm font-sans-semibold" style={{ color: authTheme.link }}>
              Sign in
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
