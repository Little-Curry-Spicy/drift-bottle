import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { authTheme } from "@/src/theme/auth";
import { tabItems } from "../constants";
import type { Tab } from "../types";
import { TouchableScale } from "./TouchableScale";

type BottomTabsProps = {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
};

export function BottomTabs({ activeTab, onChange }: BottomTabsProps) {
  const iconByTab: Record<Tab, keyof typeof Ionicons.glyphMap> = {
    sea: "compass-outline",
    throw: "paper-plane-outline",
    favorites: "heart-outline",
    mine: "person-outline",
  };

  return (
    <View className="mx-3 mb-2 flex-row items-stretch rounded-2xl border border-border/70 bg-card/95 p-2">
      {tabItems.map((item) => {
        const active = activeTab === item.key;
        return (
          <TouchableScale
            key={item.key}
            onPress={() => onChange(item.key)}
            className={`flex-1 flex items-center justify-center rounded-xl px-2 py-3 ${active ? "bg-muted" : "bg-transparent"}`}
            pressedScale={0.95}
          >
            <View className="flex-col items-center justify-center">
              <Ionicons
                name={iconByTab[item.key]}
                size={18}
                color={active ? authTheme.primary : authTheme.body}
              />
              <Text className="mt-1 font-sans-medium text-xs" style={{ color: active ? authTheme.title : authTheme.body }}>
                {item.label}
              </Text>
            </View>
          </TouchableScale>
        );
      })}
    </View>
  );
}
