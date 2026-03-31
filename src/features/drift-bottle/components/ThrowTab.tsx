import { Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { moodOptions } from "../constants";
import type { Mood } from "../types";
import { CompassPicker } from "./CompassPicker";
import { TouchableScale } from "./TouchableScale";

type ThrowTabProps = {
  draft: string;
  selectedMood: Mood;
  onDraftChange: (value: string) => void;
  onMoodChange: (mood: Mood) => void;
  onThrow: () => void;
};

export function ThrowTab({
  draft,
  selectedMood,
  onDraftChange,
  onMoodChange,
  onThrow,
}: ThrowTabProps) {
  return (
    <View className="gap-5">
      <Animated.View
        entering={FadeInUp.duration(260)}
        className="rounded-3xl border border-border/70 bg-card px-5 py-5"
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="paper-plane" size={18} color="#15803d" />
          <Text className="text-lg font-sans-semibold text-foreground">扔一个漂流瓶</Text>
        </View>
        <Text className="mt-2 text-sm leading-6 text-muted-foreground">
          写下你现在的想法，匿名漂向远方
        </Text>
        <TextInput
          value={draft}
          onChangeText={onDraftChange}
          multiline
          maxLength={200}
          placeholder="这一刻你想说点什么..."
          placeholderTextColor="rgba(15, 43, 29, 0.45)"
          className="mt-5 min-h-28 rounded-2xl border border-border bg-background p-4 text-foreground"
        />
        <Text className="mt-2 text-right text-xs text-muted-foreground/90">{draft.length}/200</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(80).duration(260)}
        className="rounded-3xl border border-border/70 bg-card px-5 py-5"
      >
        <Text className="mb-2 text-sm font-sans-medium text-foreground">选择抛出方向</Text>
        <Text className="mb-4 text-xs leading-5 text-muted-foreground">
          手指在罗盘上拖动，模拟把瓶子抛向不同方向
        </Text>
        <CompassPicker />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(120).duration(260)}
        className="rounded-3xl border border-border/70 bg-card px-5 py-5"
      >
        <Text className="mb-3 text-sm font-sans-medium text-foreground">选择心情标签</Text>
        <View className="flex-row flex-wrap gap-2">
          {moodOptions.map((mood) => {
            const active = selectedMood === mood;
            return (
              <TouchableScale
                key={mood}
                onPress={() => onMoodChange(mood)}
                className={`rounded-full border px-3.5 py-2 ${active ? "border-primary bg-primary" : "border-border bg-background"}`}
                pressedScale={0.95}
              >
                <Text className={active ? "text-white" : "text-foreground"}>{mood}</Text>
              </TouchableScale>
            );
          })}
        </View>
        <TouchableScale
          onPress={onThrow}
          className="mt-5 items-center rounded-2xl bg-primary px-4 py-3.5"
          pressedScale={0.97}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="send" size={15} color="#eff6ff" />
            <Text className="font-sans-semibold text-background">扔进海里</Text>
          </View>
        </TouchableScale>
      </Animated.View>
    </View>
  );
}
