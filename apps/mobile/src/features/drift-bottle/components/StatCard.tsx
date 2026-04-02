import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authTheme } from "@/src/theme/auth";

type StatCardProps = {
  label: string;
  value: number;
  /** 实时收到新回复时提示（「回复我的」卡片） */
  showDot?: boolean;
  /** 可点击的统计卡片：展示「点击查看」 */
  showTapHint?: boolean;
  onPress?: () => void;
};

export function StatCard({ label, value, showDot, showTapHint, onPress }: StatCardProps) {
  const iconName =
    label === "Dropped"
      ? "paper-plane"
      : label === "Saved"
        ? "heart"
        : label === "回复我的" || label === "他人回复我的"
          ? "mail-unread-outline"
          : label === "我回复的" || label === "我回复过的海友"
            ? "chatbubble-ellipses-outline"
            : "chatbubble-ellipses";

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
          点击查看
        </Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}，当前 ${value}，点击查看详情`}
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
