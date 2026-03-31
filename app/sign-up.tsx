import { useAuth, useSSO, useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { Link, Redirect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

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

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/bottles" />;

  const onSignUp = async () => {
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
    } catch {
      setError("注册失败，请检查邮箱格式和密码强度。");
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
    } catch {
      setError("验证码无效或已过期。");
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
    } catch {
      setError("第三方登录失败，请稍后重试。");
    } finally {
      setOauthLoading("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#edf8f0] px-6">
      <View className="mx-auto w-full max-w-[520px] flex-1 justify-center">
        <View className="mb-8 items-center">
          <View className="h-[150px] w-[150px] items-center justify-center overflow-hidden">
            <DotLottie
              source={require("../assets/lottie/running-Cat.lottie")}
              autoplay
              loop
              style={{ width: 280, height: 280 }}
            />
          </View>
          <View className="-mt-2 items-center">
            <View>
              <Text className="text-3xl font-sans-bold text-[#133222]">漂流瓶</Text>
              <Text className="text-sm text-[#3a6c52]">BOTTLE SOCIAL</Text>
            </View>
          </View>
        </View>

        <View className="w-full rounded-3xl border border-[#c9e5d1] bg-[#f5fbf7] p-5">
          <Text className="text-2xl font-sans-bold text-[#133222]">Create account</Text>
          <Text className="mt-1 text-base text-[#466b58]">
            Sign up to start throwing your first bottle
          </Text>

          {!pendingVerification ? (
            <View className="mt-5 gap-4">
              <View>
                <Text className="mb-2 text-base font-sans-medium text-[#133222]">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="rounded-2xl border border-[#bfdbc8] bg-[#f8fdf9] px-4 py-3.5 text-[#133222]"
                  placeholderTextColor="#5c7e6c"
                />
              </View>
              <View>
                <Text className="mb-2 text-base font-sans-medium text-[#133222]">Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  secureTextEntry
                  className="rounded-2xl border border-[#bfdbc8] bg-[#f8fdf9] px-4 py-3.5 text-[#133222]"
                  placeholderTextColor="#5c7e6c"
                />
              </View>
              {error ? <Text className="text-sm text-[#c73831]">{error}</Text> : null}
              <Pressable
                onPress={onSignUp}
                disabled={loading}
                className={`items-center rounded-2xl px-4 py-3.5 ${loading ? "bg-[#16a34a]/70" : "bg-[#16a34a]"}`}
              >
                <Text className="font-sans-semibold text-white">
                  {loading ? "Creating..." : "Create & send code"}
                </Text>
              </Pressable>

              <View className="my-1 flex-row items-center gap-3">
                <View className="h-px flex-1 bg-[#cfe6d6]" />
                <Text className="text-xs text-[#60816e]">or continue with</Text>
                <View className="h-px flex-1 bg-[#cfe6d6]" />
              </View>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => onOAuthSignUp("google")}
                  disabled={oauthLoading !== ""}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-[#bfdbc8] bg-[#f8fdf9] px-4 py-3"
                >
                  <Ionicons name="logo-google" size={16} color="#0f2b1d" />
                  <Text className="font-sans-medium text-[#133222]">
                    {oauthLoading === "google" ? "Connecting..." : "Google"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => onOAuthSignUp("github")}
                  disabled={oauthLoading !== ""}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-[#bfdbc8] bg-[#f8fdf9] px-4 py-3"
                >
                  <Ionicons name="logo-github" size={16} color="#0f2b1d" />
                  <Text className="font-sans-medium text-[#133222]">
                    {oauthLoading === "github" ? "Connecting..." : "GitHub"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="mt-5 gap-4">
              <Text className="text-sm text-[#4e6f5c]">
                We sent a 6-digit code to {email}. Enter it below.
              </Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="Verification code"
                keyboardType="number-pad"
                className="rounded-2xl border border-[#bfdbc8] bg-[#f8fdf9] px-4 py-3.5 text-[#133222]"
                placeholderTextColor="#5c7e6c"
              />
              {error ? <Text className="text-sm text-[#c73831]">{error}</Text> : null}
              <Pressable
                onPress={onVerify}
                disabled={loading}
                className={`items-center rounded-2xl px-4 py-3.5 ${loading ? "bg-[#16a34a]/70" : "bg-[#16a34a]"}`}
              >
                <Text className="font-sans-semibold text-white">
                  {loading ? "Verifying..." : "Complete sign up"}
                </Text>
              </Pressable>
            </View>
          )}

          <View className="mt-5 flex-row justify-center gap-1">
            <Text className="text-sm text-[#4e6f5c]">Already have an account?</Text>
            <Link href="/sign-in" className="text-sm font-sans-semibold text-[#15803d]">
              Sign in
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
