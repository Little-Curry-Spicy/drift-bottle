import { Link, Redirect } from "expo-router";
import { Image, ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/bottles" />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ImageBackground
        source={require("../assets/images/icon.png")}
        resizeMode="cover"
        className="absolute inset-0"
        imageStyle={{ opacity: 0.12 }}
      />
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={FadeInUp.duration(320)}
          className="w-full max-w-[520px] rounded-3xl border border-border bg-card p-6"
        >
          <View className="mb-6 flex-row items-center gap-2">
            <Image
              source={require("../assets/images/icon.png")}
              className="h-8 w-8 rounded-lg"
            />
            <Text className="text-3xl font-sans-bold text-foreground">漂流瓶</Text>
          </View>
          <Text className="text-base leading-6 text-muted-foreground">
            把情绪装进瓶子，扔向大海。也许会被某个陌生人捞起，也许会收到一句刚好治愈你的回复。
          </Text>

          <View className="mt-6 gap-3">
            <Link href="/sign-up" asChild>
              <Pressable className="items-center rounded-xl bg-primary px-4 py-3">
                <Text className="font-sans-semibold text-white">创建账号</Text>
              </Pressable>
            </Link>
            <Link href="/sign-in" asChild>
              <Pressable className="items-center rounded-xl border border-border bg-background px-4 py-3">
                <Text className="font-sans-semibold text-foreground">登录</Text>
              </Pressable>
            </Link>
          </View>

          <Text className="mt-5 text-center text-xs text-muted-foreground">
            登录后进入漂流瓶大厅，开始扔瓶和捞瓶
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
