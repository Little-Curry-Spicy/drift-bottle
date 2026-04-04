import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { authTheme } from "@/src/theme/auth";

export type StatCardKind = "dropped" | "saved" | "repliesToMe" | "repliesByMe";

type StatCardProps = {
  kind: StatCardKind;
  label: string;
  value: number;
  /** 实时收到新回复时提示 */
  showDot?: boolean;
  showTapHint?: boolean;
  onPress?: () => void;
};

const iconByKind: Record<StatCardKind, keyof typeof Ionicons.glyphMap> = {
  dropped: "paper-plane",
  saved: "heart",
  repliesToMe: "mail-unread-outline",
  repliesByMe: "chatbubble-ellipses-outline",
};

export function StatCard({ kind, label, value, showDot, showTapHint, onPress }: StatCardProps) {
  const { t } = useTranslation();
  const iconName = iconByKind[kind];

  const body = (
    <>
      {showDot ? (
        <View
          className="absolute right-2 top-2 z-10 h-2 w-2 rounded-full"
          style={{ backgroundColor: authTheme.error }}
        />
      ) : null}
      <View className="mb-1.5 flex-row items-center gap-1.5">
        <Ionicons name={iconName} size={14} color={authTheme.primary} />
        <Text className="text-xs" style={{ color: authTheme.body }}>
          {label}
        </Text>
      </View>
      <Text className="text-base font-sans-semibold" style={{ color: authTheme.title }}>
        {value}
      </Text>
      {onPress && showTapHint ? (
        <Text className="mt-1 text-[10px] leading-3" style={{ color: authTheme.footer }}>
          {t("drift.stats.tapToView")}
        </Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t("drift.stats.a11yButton", { label, value })}
        className="relative flex-1 rounded-2xl border border-border/70 bg-card px-3.5 py-3 active:opacity-90"
      >
        {body}
      </Pressable>
    );
  }

  return (
    <View className="relative flex-1 rounded-2xl border border-border/70 bg-card px-3.5 py-3">
      {body}
    </View>
  );
}
