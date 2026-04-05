import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { authTheme } from "@/src/theme/auth";

type ThrowTabProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onThrow: () => void;
};

export function ThrowTab({ draft, onDraftChange, onThrow }: ThrowTabProps) {
  const { t } = useTranslation();
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleThrow = () => {
    if (!draft.trim()) return;
    onThrow();
  };

  return (
    <View className="gap-5">
      <Animated.View
        entering={FadeInUp.duration(260)}
        className="rounded-[30px] border px-5 py-5"
        style={{ borderColor: "#d4e3fb", backgroundColor: "#f8fbff" }}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="chatbox-ellipses-outline" size={18} color={authTheme.primary} />
          <Text className="text-base font-sans-semibold" style={{ color: authTheme.title }}>
            {t("drift.throw.messageTitle")}
          </Text>
        </View>
        <Text className="mt-2 text-sm leading-6" style={{ color: authTheme.body }}>
          {t("drift.throw.messageHint")}
        </Text>

        <TextInput
          value={draft}
          onChangeText={onDraftChange}
          multiline
          maxLength={200}
          placeholder={t("drift.throw.placeholder")}
          placeholderTextColor={authTheme.placeholder}
          textAlignVertical="top"
          className="mt-4 min-h-32 rounded-[24px] border p-4 text-foreground"
          style={{
            borderColor: "#d5e4fb",
            backgroundColor: "#ffffff",
            color: authTheme.inputText,
          }}
        />

        <View className="mt-4 flex-row items-center justify-between gap-3">
          <Text className="text-xs" style={{ color: "#6c88b0" }}>
            {draft.length}/200
          </Text>
          <Animated.View style={buttonAnimatedStyle}>
            <Pressable
              onPress={handleThrow}
              onPressIn={() => {
                buttonScale.value = withTiming(0.96, { duration: 120 });
              }}
              onPressOut={() => {
                buttonScale.value = withTiming(1, { duration: 140 });
              }}
              disabled={!draft.trim()}
              className="rounded-[22px] px-5 py-3.5"
              style={{ backgroundColor: authTheme.primary, opacity: draft.trim() ? 1 : 0.5 }}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="paper-plane" size={16} color="#ffffff" />
                <Text className="font-sans-semibold text-white">{t("drift.throw.cta")}</Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}
