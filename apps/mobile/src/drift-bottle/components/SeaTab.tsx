import { authTheme } from "@/src/theme/auth";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { formatBottleTime } from "../lib/datetime";
import type { Bottle } from "../types";
import { TouchableScale } from "./TouchableScale";

/** 捞瓶 / 发送回复 / 收藏 统一固定高度（px），避免 minHeight + padding 不一致 */
const SEA_PRIMARY_CTA_H = 44;

const FAVORITE_FILLED = "#e11d48";
const FAVORITE_SOFT_BG = "#fff1f2";
const FAVORITE_SOFT_BORDER = "#fda4af";

type SeaTabProps = {
  currentBottle: Bottle | null;
  isFavorited: boolean;
  replyDraft: string;
  catchLoading?: boolean;
  onReplyDraftChange: (value: string) => void;
  onCatchBottle: () => void;
  onSendReply: () => void;
  onToggleFavorite?: (bottle: Bottle) => void;
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
  const { t } = useTranslation();
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
            {t("drift.sea.title")}
          </Text>
        </View>
        <Text className="mt-2 text-sm leading-6" style={{ color: authTheme.body }}>
          {t("drift.sea.subtitle")}
        </Text>
        <TouchableScale
          onPress={onCatchBottle}
          disabled={catchLoading}
          className="mt-5 items-center justify-center rounded-2xl px-4"
          style={{
            height: SEA_PRIMARY_CTA_H,
            backgroundColor: authTheme.primary,
            opacity: catchLoading ? 0.75 : 1,
          }}
          pressedScale={0.97}
        >
          <View className="flex-row items-center gap-2">
            {catchLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Ionicons name="fish" size={15} color="#ffffff" />
            )}
            <Text className="font-sans-semibold text-white">
              {catchLoading ? t("drift.sea.catching") : t("drift.sea.catchNow")}
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
              placeholder={t("drift.sea.replyPlaceholder")}
              placeholderTextColor={authTheme.placeholder}
              className="rounded-2xl border px-4 py-3.5"
              style={{
                borderColor: authTheme.inputBorder,
                backgroundColor: authTheme.cardBg,
              }}
            />
            <View className="flex-row items-stretch gap-3">
              <TouchableScale
                onPress={onSendReply}
                className="flex-1 items-center justify-center rounded-2xl px-4"
                style={{ height: SEA_PRIMARY_CTA_H, backgroundColor: authTheme.primary }}
                pressedScale={0.97}
                accessibilityRole="button"
                accessibilityLabel={t("drift.sea.a11ySendReply")}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="chatbubble-ellipses" size={15} color="#ffffff" />
                  <Text className="font-sans-semibold text-white">{t("drift.sea.sendReply")}</Text>
                </View>
              </TouchableScale>
              <TouchableScale
                onPress={() => handleFavoritePress?.(currentBottle)}
                disabled={!handleFavoritePress}
                className="shrink-0 items-center justify-center rounded-2xl px-2.5"
                style={{
                  height: SEA_PRIMARY_CTA_H,
                  minWidth: 92,
                  borderWidth: isFavorited ? 0 : 2,
                  borderColor: isFavorited ? "transparent" : FAVORITE_SOFT_BORDER,
                  backgroundColor: isFavorited ? FAVORITE_FILLED : FAVORITE_SOFT_BG,
                  opacity: handleFavoritePress ? 1 : 0.45,
                }}
                pressedScale={0.96}
                accessibilityRole="button"
                accessibilityLabel={
                  isFavorited ? t("drift.sea.a11yRemoveSaved") : t("drift.sea.a11ySaveBottle")
                }
                accessibilityState={{ selected: isFavorited }}
              >
                <View className="flex-row items-center gap-1.5">
                  <Ionicons
                    name={isFavorited ? "heart" : "heart-outline"}
                    size={15}
                    color={isFavorited ? "#ffffff" : FAVORITE_FILLED}
                  />
                  <Text
                    className="text-xs font-sans-semibold"
                    style={{ color: isFavorited ? "#ffe4e6" : FAVORITE_FILLED }}
                    numberOfLines={1}
                  >
                    {isFavorited ? t("drift.sea.saved") : t("drift.sea.save")}
                  </Text>
                </View>
              </TouchableScale>
            </View>
          </View>
        </Animated.View>
      ) : (
        <View className="rounded-3xl border border-dashed border-border/80 bg-card px-5 py-4">
          <Text className="text-sm leading-6 text-muted-foreground">
            {t("drift.sea.emptyCatch")}
          </Text>
        </View>
      )}
    </View>
  );
}
