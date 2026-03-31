import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type StatCardProps = {
  label: string;
  value: number;
};

export function StatCard({ label, value }: StatCardProps) {
  const iconName =
    label === "Dropped"
      ? "paper-plane"
      : label === "Saved"
        ? "heart"
        : "chatbubble-ellipses";

  return (
    <View className="min-w-28 rounded-2xl border border-border/70 bg-card px-3.5 py-3">
      <View className="mb-1.5 flex-row items-center gap-1.5">
        <Ionicons name={iconName} size={14} color="#15803d" />
        <Text className="text-xs text-muted-foreground">{label}</Text>
      </View>
      <Text className="text-base font-sans-semibold text-foreground">{value}</Text>
    </View>
  );
}
