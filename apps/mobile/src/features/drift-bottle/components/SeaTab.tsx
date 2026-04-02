import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { authTheme } from "@/src/theme/auth";
import { formatBottleTime } from "../datetime";
import type { Bottle } from "../types";
import { TouchableScale } from "./TouchableScale";

/** 与主色（蓝）区分，收藏用玫红系 */
const FAVORITE_FILLED = "#e11d48";
const FAVORITE_SOFT_BG = "#fff1f2";
const FAVORITE_SOFT_BORDER = "#fda4af";

type SeaTabProps = {
  currentBottle: Bottle | null;
  /** 当前捞到的瓶子是否已在收藏列表中 */
  isFavorited: boolean;
  replyDraft: string;
  catchLoading?: boolean;
  onReplyDraftChange: (value: string) => void;
  onCatchBottle: () => void;
  onSendReply: () => void;
  /** 收藏开关；与旧版 `onFavorite` 二选一或同时传入时优先此项 */
  onToggleFavorite?: (bottle: Bottle) => void;
  /** @deprecated 请改用 onToggleFavorite，保留以兼容旧调用方 */
  onFavorite?: (bottle: Bottle) => void;
};

export function SeaTab({
  currentBottle,
  isFavorited,
  replyDraft,
  catchLoading = false,
  onReplyDraftChange,
  onCatchBottle,
  onSendReply,
  onToggleFavorite,
  onFavorite,
}: SeaTabProps) {
  const handleFavoritePress = onToggleFavorite ?? onFavorite;

  return (
    <View className="gap-5">
      <Animated.View
        entering={FadeInUp.duration(260)}
        className="rounded-3xl border border-border/70 bg-card px-5 py-5"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="compass" size={18} color={authTheme.primary} />
          <Text className="text-lg font-sans-semibold" style={{ color: authTheme.title }}>
            Catch a bottle
          </Text>
        </View>
        <Text className="mt-2 text-sm leading-6" style={{ color: authTheme.body }}>
          Meet an anonymous story from someone out there.
        </Text>
        <TouchableScale
          onPress={onCatchBottle}
          disabled={catchLoading}
          className="mt-5 items-center rounded-2xl px-4 py-3.5"
          style={{
            backgroundColor: authTheme.primary,
            opacity: catchLoading ? 0.75 : 1,
          }}
          pressedScale={0.97}
        >
          <View className="flex-row items-center gap-2">
            {catchLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Ionicons name="fish" size={16} color="#ffffff" />
            )}
            <Text className="font-sans-semibold text-white">
              {catchLoading ? "Catching…" : "Catch now"}
            </Text>
          </View>
        </TouchableScale>
      </Animated.View>

      {currentBottle ? (
        <Animated.View
          entering={FadeInDown.duration(280)}
          className="rounded-3xl border border-border/70 bg-card px-5 py-5"
        >
          <Text className="mb-3 text-sm text-muted-foreground">
            {formatBottleTime(currentBottle.createdAt)}
          </Text>
          <Text className="text-base leading-7 text-foreground">{currentBottle.content}</Text>

          <View className="mt-5 gap-3">
            <TextInput
              value={replyDraft}
              onChangeText={onReplyDraftChange}
              placeholder="Write a reply..."
              placeholderTextColor={authTheme.placeholder}
              className="rounded-2xl border border-border bg-background px-4 py-3.5 text-foreground"
            />
            <View className="flex-row gap-3">
              <TouchableScale
                onPress={onSendReply}
                className="min-h-[52px] flex-1 items-center justify-center rounded-2xl px-4 py-3.5"
                style={{ backgroundColor: authTheme.primary }}
                pressedScale={0.97}
                accessibilityRole="button"
                accessibilityLabel="Send reply"
              >
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="chatbubble-ellipses" size={15} color="#eff6ff" />
                  <Text className="font-sans-semibold text-white">Send reply</Text>
                </View>
              </TouchableScale>
              <TouchableScale
                onPress={() => handleFavoritePress?.(currentBottle)}
                disabled={!handleFavoritePress}
                className="min-h-[52px] w-[76] items-center justify-center rounded-2xl py-2"
                style={{
                  borderWidth: isFavorited ? 0 : 2,
                  borderColor: isFavorited ? "transparent" : FAVORITE_SOFT_BORDER,
                  backgroundColor: isFavorited ? FAVORITE_FILLED : FAVORITE_SOFT_BG,
                  opacity: handleFavoritePress ? 1 : 0.45,
                }}
                pressedScale={0.96}
                accessibilityRole="button"
                accessibilityLabel={isFavorited ? "Remove from saved" : "Save bottle"}
                accessibilityState={{ selected: isFavorited }}
              >
                <Ionicons
                  name={isFavorited ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorited ? "#ffffff" : FAVORITE_FILLED}
                />
                <Text
                  className="mt-0.5 text-[11px] font-sans-semibold"
                  style={{ color: isFavorited ? "#ffe4e6" : FAVORITE_FILLED }}
                >
                  {isFavorited ? "Saved" : "Save"}
                </Text>
              </TouchableScale>
            </View>
          </View>
        </Animated.View>
      ) : (
        <View className="rounded-3xl border border-dashed border-border/80 bg-card px-5 py-4">
          <Text className="text-sm leading-6 text-muted-foreground">
            Your caught bottle will appear here.
          </Text>
        </View>
      )}
    </View>
  );
}
