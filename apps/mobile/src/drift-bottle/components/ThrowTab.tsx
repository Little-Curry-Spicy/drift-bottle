import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  cancelAnimation,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { authTheme } from "@/src/theme/auth";

type ThrowTabProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onThrow: () => void;
};

export function ThrowTab({
  draft,
  onDraftChange,
  onThrow,
}: ThrowTabProps) {
  const { t } = useTranslation();
  const bobY = useSharedValue(0);
  const tilt = useSharedValue(0);
  const waveFrontX = useSharedValue(0);
  const waveBackX = useSharedValue(0);

  useEffect(() => {
    bobY.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(5, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    tilt.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(7, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    waveFrontX.value = withRepeat(withTiming(-110, { duration: 2200, easing: Easing.linear }), -1, true);
    waveBackX.value = withRepeat(withTiming(95, { duration: 2800, easing: Easing.linear }), -1, true);

    return () => {
      cancelAnimation(bobY);
      cancelAnimation(tilt);
      cancelAnimation(waveFrontX);
      cancelAnimation(waveBackX);
    };
  }, [bobY, tilt, waveFrontX, waveBackX]);

  const bottleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobY.value }, { rotate: `${tilt.value}deg` }],
  }));
  const waveFrontStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: waveFrontX.value }],
  }));
  const waveBackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: waveBackX.value }],
  }));

  return (
    <View className="gap-5">
      <Animated.View
        entering={FadeInUp.duration(260)}
        className="rounded-3xl border border-border/70 bg-card px-5 py-5"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="paper-plane" size={18} color={authTheme.primary} />
          <Text className="text-lg font-sans-semibold" style={{ color: authTheme.title }}>
            {t("drift.throw.title")}
          </Text>
        </View>
        <Text className="mt-2 text-sm leading-6" style={{ color: authTheme.body }}>
          {t("drift.throw.subtitle")}
        </Text>
        <TextInput
          value={draft}
          onChangeText={onDraftChange}
          multiline
          maxLength={200}
          placeholder={t("drift.throw.placeholder")}
          placeholderTextColor={authTheme.placeholder}
          className="mt-5 min-h-28 rounded-2xl border border-border bg-background p-4 text-foreground"
        />
        <Text className="mt-2 text-right text-xs text-muted-foreground/90">{draft.length}/200</Text>
        <Pressable
          onPress={onThrow}
          disabled={!draft.trim()}
          className="mt-4 items-center rounded-2xl px-4 py-3.5"
          style={{ backgroundColor: authTheme.primary, opacity: draft.trim() ? 1 : 0.55 }}
        >
          <Text className="font-sans-semibold text-white">{t("drift.throw.cta")}</Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(80).duration(260)}
        className="rounded-3xl border border-border/70 bg-card px-5 py-5"
      >
        <Text className="mb-2 text-sm font-sans-medium" style={{ color: authTheme.title }}>
          {t("drift.throw.previewTitle")}
        </Text>
        <Text className="mb-4 text-xs leading-5" style={{ color: authTheme.body }}>
          {t("drift.throw.previewHint")}
        </Text>
        <View
          className="h-52 items-center justify-end overflow-hidden rounded-2xl border"
          style={{ borderColor: authTheme.cardBorder, backgroundColor: "#dceeff" }}
        >
          <View className="absolute inset-x-0 top-0 h-[52%] bg-[#eaf5ff]" />
          <View className="absolute inset-x-0 top-[46%] h-px bg-white/70" />
          <View className="absolute inset-x-0 bottom-0 h-[54%] bg-[#cfe6ff]" />

          <Animated.View
            style={waveBackStyle}
            className="absolute bottom-4 left-[-40%] h-14 w-[85%] rounded-full bg-[#b5d8ff]/70"
          />
          <Animated.View
            style={waveBackStyle}
            className="absolute bottom-5 right-[-35%] h-12 w-[78%] rounded-full bg-[#b5d8ff]/70"
          />
          <Animated.View
            style={waveFrontStyle}
            className="absolute -bottom-1 left-[-36%] h-16 w-[84%] rounded-full bg-[#9fc9fb]"
          />
          <Animated.View
            style={waveFrontStyle}
            className="absolute -bottom-2 right-[-34%] h-16 w-[82%] rounded-full bg-[#9fc9fb]"
          />
          <View className="absolute inset-x-0 bottom-12 h-px bg-white/65" />

          <Animated.View style={bottleStyle} className="mb-[58px] items-center">
            <View className="h-2 w-3 rounded-sm bg-[#6f8d9f]" />
            <View className="-mt-0.5 h-3.5 w-5 rounded-sm border border-[#7faacb] bg-[#edf8ff]" />
            <View className="-mt-1 h-10 w-8 rounded-b-[10px] rounded-t-[8px] border border-[#7faacb] bg-[#e8f6ff]">
              <View className="absolute left-1 top-2 h-5 w-1 rounded-full bg-white/75" />
              <View className="absolute right-1 bottom-1 h-3 w-2 rounded-sm bg-[#c7e2f8]/70" />
            </View>
          </Animated.View>
          <View className="absolute inset-x-0 bottom-[58px] h-3 bg-[#b7d8fb]/75" />
        </View>
      </Animated.View>

    </View>
  );
}
