import { Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import type { Bottle } from "../types";
import { TouchableScale } from "./TouchableScale";

type SeaTabProps = {
  currentBottle: Bottle | null;
  replyDraft: string;
  onReplyDraftChange: (value: string) => void;
  onCatchBottle: () => void;
  onSendReply: () => void;
  onFavorite: (bottle: Bottle) => void;
};

export function SeaTab({
  currentBottle,
  replyDraft,
  onReplyDraftChange,
  onCatchBottle,
  onSendReply,
  onFavorite,
}: SeaTabProps) {
  return (
    <View className="gap-5">
      <Animated.View
        entering={FadeInUp.duration(260)}
        className="rounded-3xl border border-border/70 bg-card px-5 py-5"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="compass" size={18} color="#15803d" />
          <Text className="text-lg font-sans-semibold text-foreground">捞一个漂流瓶</Text>
        </View>
        <Text className="mt-2 text-sm leading-6 text-muted-foreground">
          随机遇见一位陌生人的心情故事
        </Text>
        <TouchableScale
          onPress={onCatchBottle}
          className="mt-5 items-center rounded-2xl bg-primary px-4 py-3.5"
          pressedScale={0.97}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="fish" size={16} color="#ffffff" />
            <Text className="font-sans-semibold text-white">开始捞瓶</Text>
          </View>
        </TouchableScale>
      </Animated.View>

      {currentBottle ? (
        <Animated.View
          entering={FadeInDown.duration(280)}
          className="rounded-3xl border border-border/70 bg-card px-5 py-5"
        >
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">{currentBottle.createdAt}</Text>
            <Text className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
              {currentBottle.mood}
            </Text>
          </View>
          <Text className="text-base leading-7 text-foreground">{currentBottle.content}</Text>

          <View className="mt-5 gap-3">
            <TextInput
              value={replyDraft}
              onChangeText={onReplyDraftChange}
              placeholder="写一句回复..."
              placeholderTextColor="rgba(15, 43, 29, 0.45)"
              className="rounded-2xl border border-border bg-background px-4 py-3.5 text-foreground"
            />
            <View className="flex-row gap-2">
              <TouchableScale
                onPress={onSendReply}
                className="flex-1 items-center rounded-2xl bg-primary px-4 py-3.5"
                pressedScale={0.97}
              >
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="chatbubble-ellipses" size={15} color="#eff6ff" />
                  <Text className="font-sans-semibold text-background">发送回复</Text>
                </View>
              </TouchableScale>
              <TouchableScale
                onPress={() => onFavorite(currentBottle)}
                className="flex-1 items-center rounded-2xl border border-border bg-background px-4 py-3.5"
                pressedScale={0.97}
              >
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="heart" size={15} color="#15803d" />
                  <Text className="font-sans-semibold text-foreground">收藏</Text>
                </View>
              </TouchableScale>
            </View>
          </View>
        </Animated.View>
      ) : (
        <View className="rounded-3xl border border-dashed border-border/80 bg-card px-5 py-4">
          <Text className="text-sm leading-6 text-muted-foreground">
            点击上方按钮后，这里会展示你捞到的瓶子。
          </Text>
        </View>
      )}
    </View>
  );
}
