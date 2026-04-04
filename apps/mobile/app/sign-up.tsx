import {
  getLiveEmailIssue,
  getLivePasswordIssue,
  getLiveUsernameIssue,
  getSignUpCredentialIssueCode,
  signUpCredentialsSchema,
  type SignUpCredentialIssueCode,
} from "@/src/auth/sign-up-credentials";
import { authTheme } from "@/src/theme/auth";
import { useAuth, useSSO, useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { Link, Redirect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 这行代码的作用是：处理 Web 端 OAuth 登录的回调，完成 pending 的 Auth Session。
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
  const { t } = useTranslation();
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
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

  const credentialsValid = useMemo(
    () => signUpCredentialsSchema.safeParse({ email, password, username }).success,
    [email, password, username],
  );

  const liveEmailIssue = useMemo(() => getLiveEmailIssue(email), [email]);
  const liveUsernameIssue = useMemo(() => getLiveUsernameIssue(username), [username]);
  const livePasswordIssue = useMemo(() => getLivePasswordIssue(password), [password]);

  const liveIssueMessage = (code: SignUpCredentialIssueCode | undefined) => {
    if (!code) return null;
    switch (code) {
      case "invalid_email":
        return t("auth.signUp.errorEmailInvalid");
      case "short_password":
        return t("auth.signUp.livePasswordShort", { count: password.length });
      case "empty_username":
        return t("auth.signUp.errorUsernameEmpty");
      case "short_username":
        return t("auth.signUp.errorUsernameShort");
      case "long_username":
        return t("auth.signUp.errorUsernameLong");
      case "invalid_username":
        return t("auth.signUp.errorUsernameInvalid");
      default:
        return null;
    }
  };

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
    const parsed = signUpCredentialsSchema.safeParse({ email, password, username });
    if (!parsed.success) {
      const code = getSignUpCredentialIssueCode(parsed.error);
      if (code === "empty_email") setError(t("auth.signUp.errorEnterEmail"));
      else if (code === "invalid_email") setError(t("auth.signUp.errorEmailInvalid"));
      else if (code === "empty_username") setError(t("auth.signUp.errorUsernameEmpty"));
      else if (code === "short_username") setError(t("auth.signUp.errorUsernameShort"));
      else if (code === "long_username") setError(t("auth.signUp.errorUsernameLong"));
      else if (code === "invalid_username") setError(t("auth.signUp.errorUsernameInvalid"));
      else setError(t("auth.signUp.errorPasswordShort"));
      return;
    }
    const { email: emailAddr, password: pwd, username: user } = parsed.data;
    try {
      setLoading(true);
      setError("");
      await signUp?.create({
        emailAddress: emailAddr,
        password: pwd,
        username: user,
      });
      // 发送邮箱验证码
      await signUp?.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setPendingVerification(true);
      setResendCountdown(60);
    } catch (error) {
      setResendCountdown(0);
      setError(getClerkErrorMessage(error, t("auth.signUp.fallbackSignUpFailed")));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!pendingVerification) {
      setError(t("auth.signUp.errorSendFirst"));
      return;
    }
    if (code.trim().length < 6) {
      setError(t("auth.signUp.errorCodeLength"));
      return;
    }
    if (verifyInFlightRef.current) return;
    verifyInFlightRef.current = true;
    try {
      setLoading(true);
      setError("");
      // 验证邮箱验证码
      const verifyResult = await signUp?.attemptEmailAddressVerification({
        code: code.trim(),
      });
      if (verifyResult?.status === "complete" && verifyResult.createdSessionId) {
        await setActive?.({ session: verifyResult.createdSessionId });
        return;
      }
      if (verifyResult?.status === "missing_requirements") {
        const u = username.trim();
        if (!u) {
          setError(t("auth.signUp.errorUsernameRequired"));
          return;
        }
        const updated = await signUp?.update({ username: u });
        if (updated?.status === "complete" && updated.createdSessionId) {
          await setActive?.({ session: updated.createdSessionId });
          return;
        }
        setError(t("auth.signUp.errorVerifyIncomplete"));
        return;
      }
      setError(t("auth.signUp.errorVerifyIncomplete"));
    } catch (error) {
      if (isVerificationAlreadyUsedError(error) && (await tryFinishSignUpAfterReload())) {
        return;
      }
      if (isVerificationAlreadyUsedError(error)) {
        const u = username.trim();
        if (!u) {
          setError(t("auth.signUp.errorUsernameRequired"));
          return;
        }
        try {
          const updated = await signUp?.update({ username: u });
          if (updated?.status === "complete" && updated.createdSessionId) {
            await setActive?.({ session: updated.createdSessionId });
            return;
          }
        } catch (updateErr) {
          setError(getClerkErrorMessage(updateErr, t("auth.signUp.fallbackSignUpFailed")));
          return;
        }
        setError(t("auth.signUp.errorVerifyIncomplete"));
        return;
      }
      setError(getClerkErrorMessage(error, t("auth.signUp.fallbackInvalidCode")));
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
        setError(t("auth.signUp.errorOAuthIncomplete"));
      }
    } catch (error) {
      setError(getClerkErrorMessage(error, t("auth.signUp.fallbackOAuthFailed")));
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
      setError(getClerkErrorMessage(error, t("auth.signUp.fallbackResendFailed")));
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
            {t("auth.signUp.title")}
          </Text>
          <View className="mt-2 gap-4">
            <View>
              <Text className="mb-2 text-base font-sans-medium" style={{ color: authTheme.label }}>
                {t("auth.signUp.email")}
              </Text>
              <TextInput
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError("");
                }}
                placeholder={t("auth.signUp.emailPlaceholder")}
                autoCapitalize="none"
                keyboardType="email-address"
                className="rounded-2xl border px-4 py-3.5"
                placeholderTextColor={authTheme.placeholder}
                accessibilityHint={liveIssueMessage(liveEmailIssue) ?? undefined}
                style={{
                  borderColor: liveEmailIssue ? authTheme.error : authTheme.inputBorder,
                  backgroundColor: authTheme.inputBg,
                  color: authTheme.inputText,
                }}
              />
              {liveEmailIssue ? (
                <Text className="mt-1.5 text-xs" style={{ color: authTheme.error }}>
                  {liveIssueMessage(liveEmailIssue)}
                </Text>
              ) : null}
            </View>
            <View>
              <Text className="mb-2 text-base font-sans-medium" style={{ color: authTheme.label }}>
                {t("auth.signUp.username")}
              </Text>
              <TextInput
                value={username}
                onChangeText={(v) => {
                  setUsername(v);
                  setError("");
                }}
                placeholder={t("auth.signUp.usernamePlaceholder")}
                autoCapitalize="none"
                autoCorrect={false}
                className="rounded-2xl border px-4 py-3.5"
                placeholderTextColor={authTheme.placeholder}
                accessibilityHint={liveIssueMessage(liveUsernameIssue) ?? undefined}
                style={{
                  borderColor: liveUsernameIssue ? authTheme.error : authTheme.inputBorder,
                  backgroundColor: authTheme.inputBg,
                  color: authTheme.inputText,
                }}
              />
              {liveUsernameIssue ? (
                <Text className="mt-1.5 text-xs" style={{ color: authTheme.error }}>
                  {liveIssueMessage(liveUsernameIssue)}
                </Text>
              ) : null}
            </View>
            <View>
              <Text className="mb-2 text-base font-sans-medium" style={{ color: authTheme.label }}>
                {t("auth.signUp.password")}
              </Text>
              <View
                className="flex-row items-center rounded-2xl border pr-1"
                style={{
                  borderColor: livePasswordIssue ? authTheme.error : authTheme.inputBorder,
                  backgroundColor: authTheme.inputBg,
                }}
              >
                <TextInput
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setError("");
                  }}
                  placeholder={t("auth.signUp.passwordPlaceholder")}
                  secureTextEntry={!passwordVisible}
                  className="min-w-0 flex-1 px-4 py-3.5"
                  placeholderTextColor={authTheme.placeholder}
                  accessibilityHint={liveIssueMessage(livePasswordIssue) ?? undefined}
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
              {livePasswordIssue ? (
                <Text className="mt-1.5 text-xs" style={{ color: authTheme.error }}>
                  {liveIssueMessage(livePasswordIssue)}
                </Text>
              ) : null}
            </View>
            <View>
              <Text className="mb-2 text-base font-sans-medium" style={{ color: authTheme.label }}>
                {t("auth.signUp.verificationCode")}
              </Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder={t("auth.signUp.codePlaceholder")}
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
                    (!pendingVerification && !credentialsValid)
                  }
                  className="rounded-2xl px-3 py-3"
                  style={{
                    backgroundColor: authTheme.primary,
                    opacity:
                      loading ||
                        resendCountdown > 0 ||
                        (!pendingVerification && !credentialsValid)
                        ? 0.55
                        : 1,
                  }}
                >
                  <Text className="text-xs font-sans-semibold text-white">
                    {resendCountdown > 0
                      ? `${resendCountdown}s`
                      : pendingVerification
                        ? t("auth.signUp.resend")
                        : t("auth.signUp.send")}
                  </Text>
                </Pressable>
              </View>
            </View>
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
                {loading && pendingVerification ? t("auth.signUp.verifying") : t("auth.signUp.finish")}
              </Text>
            </Pressable>

            <View className="my-1 flex-row items-center gap-3">
              <View className="h-px flex-1" style={{ backgroundColor: authTheme.divider }} />
              <Text className="text-xs" style={{ color: authTheme.dividerMuted }}>
                {t("auth.signUp.orContinue")}
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
                  {oauthLoading === "google" ? t("auth.signUp.connecting") : t("auth.signUp.google")}
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
                  {oauthLoading === "github" ? t("auth.signUp.connecting") : t("auth.signUp.github")}
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-5 flex-row justify-center gap-1">
            <Text className="text-sm" style={{ color: authTheme.footer }}>
              {t("auth.signUp.alreadyHave")}
            </Text>
            <Link href="/sign-in" className="text-sm font-sans-semibold" style={{ color: authTheme.link }}>
              {t("auth.signUp.signInLink")}
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
