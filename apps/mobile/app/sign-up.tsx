import { authTheme } from "@/src/theme/auth";
import { useAuth, useSSO, useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { Link, Redirect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

function getClerkErrorMessage(error: unknown, fallback: string) {
  const maybe = error as { errors?: Array<{ longMessage?: string; message?: string }> };
  const first = maybe?.errors?.[0];
  return first?.longMessage || first?.message || fallback;
}

function isVerificationAlreadyUsedError(error: unknown) {
  const msg = getClerkErrorMessage(error, "").toLowerCase();
  return msg.includes("already been verified") || msg.includes("already verified");
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
  /** 防止连点「完成注册」：第一次校验成功后 Clerk 会消费验证码，再调 attempt 会报 already verified */
  const verifyInFlightRef = useRef(false);

  /** 只要 resendCountdown > 0 就每秒递减（不能依赖 pendingVerification：首次点击 Send 时先发 60 再 await，此时 pending 仍为 false，会导致 60s 卡住不动） */
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => {
      setResendCountdown((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  /** 邮箱已在服务端验证完成但本地未挂上 session 时，reload 后可拿到 complete + createdSessionId */
  const tryFinishSignUpAfterReload = async (): Promise<boolean> => {
    if (!signUp?.reload) return false;
    try {
      const updated = await signUp.reload();
      if (updated.status === "complete" && updated.createdSessionId) {
        await setActive?.({ session: updated.createdSessionId });
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  };

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/bottles" />;

  /** 发送邮箱验证码：先创建 signUp（邮箱+密码），再请求 Clerk 发 OTP */
  const sendVerificationCode = async () => {
    if (!email.trim()) {
      setError("请先输入邮箱。");
      return;
    }
    if (password.trim().length < 8) {
      setError("请先填写密码（至少 8 位，与 Clerk 策略一致），再发送验证码。");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await signUp?.create({
        emailAddress: email.trim(),
        password,
      });
      await signUp?.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setPendingVerification(true);
      setResendCountdown(60);
    } catch (error) {
      setResendCountdown(0);
      setError(getClerkErrorMessage(error, "Sign up failed. Please check your email and password."));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!pendingVerification) {
      setError("请先点击 Send 发送验证码。");
      return;
    }
    if (code.trim().length < 6) {
      setError("请输入 6 位邮箱验证码。");
      return;
    }
    if (verifyInFlightRef.current) return;
    verifyInFlightRef.current = true;
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
      if (isVerificationAlreadyUsedError(error) && (await tryFinishSignUpAfterReload())) {
        return;
      }
      setError(getClerkErrorMessage(error, "Invalid or expired verification code."));
    } finally {
      verifyInFlightRef.current = false;
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
      setError(getClerkErrorMessage(error, "OAuth sign-in failed. Please try again."));
    } finally {
      setOauthLoading("");
    }
  };

  const onResendCode = async () => {
    try {
      setLoading(true);
      setError("");
      // 邮箱已验证完成时不能再 prepare 新码，否则会报 already verified；应先尝试直接完成登录
      if (await tryFinishSignUpAfterReload()) {
        return;
      }
      await signUp?.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setResendCountdown(60);
    } catch (error) {
      if (isVerificationAlreadyUsedError(error) && (await tryFinishSignUpAfterReload())) {
        return;
      }
      setResendCountdown(0);
      setError(getClerkErrorMessage(error, "Failed to send verification code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      className="flex-1 px-6 pb-10"
      style={{ backgroundColor: authTheme.screenBg }}
    >
      <View className="mx-auto mt-10 w-full max-w-[520px] flex-1 pb-8">
        <View className="mx-auto mb-4 w-[220px] items-center justify-center overflow-hidden">
          <DotLottie
            source={require("../assets/lottie/bootstrap.lottie")}
            autoplay
            loop
            style={{ width: 220, height: 120 }}
          />
        </View>

        <View
          className="mx-4 mb-6 rounded-3xl border p-5 pb-8"
          style={{ backgroundColor: authTheme.cardBg, borderColor: authTheme.cardBorder }}
        >
          <Text className="text-2xl font-sans-bold" style={{ color: authTheme.title }}>
            Create account
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
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
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
                  onPress={pendingVerification ? onResendCode : sendVerificationCode}
                  disabled={
                    loading ||
                    resendCountdown > 0 ||
                    email.trim().length === 0 ||
                    (!pendingVerification && password.trim().length < 8)
                  }
                  className="rounded-2xl px-3 py-3"
                  style={{
                    backgroundColor: authTheme.primary,
                    opacity:
                      loading ||
                        resendCountdown > 0 ||
                        email.trim().length === 0 ||
                        (!pendingVerification && password.trim().length < 8)
                        ? 0.55
                        : 1,
                  }}
                >
                  <Text className="text-xs font-sans-semibold text-white">
                    {resendCountdown > 0 ? `${resendCountdown}s` : pendingVerification ? "Resend" : "Send"}
                  </Text>
                </Pressable>
              </View>
            </View>
            {pendingVerification ? (
              <Text className="text-sm" style={{ color: authTheme.body }}>
                验证码已发送到 {email}，输入后点击下方「完成注册」。
              </Text>
            ) : (
              <Text className="text-sm" style={{ color: authTheme.body }}>
                填写邮箱与密码后，点击验证码右侧 Send 发送验证码。
              </Text>
            )}
            {error ? (
              <Text className="text-sm" style={{ color: authTheme.error }}>
                {error}
              </Text>
            ) : null}
            <Pressable
              onPress={onVerify}
              disabled={
                loading ||
                !pendingVerification ||
                code.trim().length < 6
              }
              className="items-center rounded-2xl px-4 py-3.5"
              style={{
                backgroundColor: authTheme.primary,
                opacity:
                  loading || !pendingVerification || code.trim().length < 6 ? 0.55 : 1,
              }}
            >
              <Text className="font-sans-semibold text-white">
                {loading && pendingVerification ? "Verifying..." : "完成注册"}
              </Text>
            </Pressable>
            <Text className="text-center text-xs" style={{ color: authTheme.dividerMuted }}>
              {!pendingVerification
                ? "发送验证码后可填写验证码并点击完成注册"
                : code.trim().length < 6
                  ? "请输入 6 位验证码"
                  : "点击完成注册以创建账号"}
            </Text>

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
