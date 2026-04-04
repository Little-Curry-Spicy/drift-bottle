import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { authTheme } from "@/src/theme/auth";
import { formatBottleTime } from "../lib/datetime";
import type { Bottle } from "../types";

type BottleListVariant = "saved" | "mine";

type BottleListProps = {
  variant: BottleListVariant;
  data: Bottle[];
};

export function BottleList({ variant, data }: BottleListProps) {
  const { t } = useTranslation();
  const title =
    variant === "saved" ? t("drift.list.savedTitle") : t("drift.list.mineTitle");
  const emptyText =
    variant === "saved" ? t("drift.list.savedEmpty") : t("drift.list.mineEmpty");

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <Ionicons
          name={variant === "saved" ? "heart-circle" : "albums"}
          size={18}
          color={authTheme.primary}
        />
        <Text className="text-lg font-sans-semibold" style={{ color: authTheme.title }}>
          {title}
        </Text>
      </View>
      {data.length ? (
        data.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInUp.delay(index * 40).duration(220)}
            className="rounded-3xl border border-border/70 bg-card px-5 py-5"
          >
            <Text className="mb-3 text-xs text-muted-foreground">
              {formatBottleTime(item.createdAt)}
            </Text>
            <Text className="leading-7 text-foreground">{item.content}</Text>
            <Text className="mt-3 text-xs text-muted-foreground">
              {t("drift.list.replies", { count: item.replies.length })}
            </Text>
          </Animated.View>
        ))
      ) : (
        <View className="rounded-3xl border border-dashed border-border/80 bg-card px-5 py-4">
          <Text className="text-sm leading-6 text-muted-foreground">{emptyText}</Text>
        </View>
      )}
    </View>
  );
}
