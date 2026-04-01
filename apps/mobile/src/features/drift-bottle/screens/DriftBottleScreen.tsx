import { ScrollView, Text, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottleList } from "../components/BottleList";
import { BottomTabs } from "../components/BottomTabs";
import { SeaTab } from "../components/SeaTab";
import { StatCard } from "../components/StatCard";
import { ThrowTab } from "../components/ThrowTab";
import { useDriftBottleMvp } from "../hooks/useDriftBottleMvp";

export function DriftBottleScreen() {
  const { state, stats, actions } = useDriftBottleMvp();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const horizontalPadding = isDesktop ? 32 : isTablet ? 24 : 16;
  const contentMaxWidth = isDesktop ? 820 : isTablet ? 700 : 9999;

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} className="flex-1 bg-background pt-2">
      <Animated.View entering={FadeIn.duration(280)} style={{ paddingHorizontal: horizontalPadding }}>
        <Animated.View className="rounded-3xl border border-border/70 bg-card/90 px-5 pb-4 pt-5">
          <Text className="text-[30px] font-sans-bold text-foreground">Drift Bottle</Text>
          <Text className="mt-1.5 text-base leading-6 text-muted-foreground">
            Share a feeling anonymously and connect with someone who resonates.
          </Text>
          <Text className="mt-3 text-xs text-muted-foreground/85">
            Local MVP: drop, catch, reply, and save.
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(260)}
        className="flex-row flex-wrap gap-3 pb-4 pt-5"
        style={{ paddingHorizontal: horizontalPadding }}
      >
        <StatCard label="Dropped" value={stats.thrown} />
        <StatCard label="Saved" value={stats.favorite} />
        <StatCard label="Replies" value={stats.replied} />
      </Animated.View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 6,
          paddingBottom: 108,
          paddingHorizontal: horizontalPadding,
          width: "100%",
          maxWidth: contentMaxWidth,
          alignSelf: "center",
        }}
      >
        <Animated.View key={state.activeTab} entering={FadeInRight.duration(220)}>
          {state.activeTab === "sea" && (
            <SeaTab
              currentBottle={state.currentBottle}
              replyDraft={state.replyDraft}
              onReplyDraftChange={actions.setReplyDraft}
              onCatchBottle={actions.catchRandomBottle}
              onSendReply={actions.sendReply}
              onFavorite={actions.addFavorite}
            />
          )}
          {state.activeTab === "throw" && (
            <ThrowTab
              draft={state.draft}
              selectedMood={state.selectedMood}
              onDraftChange={actions.setDraft}
              onMoodChange={actions.setSelectedMood}
              onThrow={actions.throwBottle}
            />
          )}
          {state.activeTab === "favorites" && (
            <BottleList
              title="Saved bottles"
              data={state.favorites}
              emptyText="No saved bottles yet."
            />
          )}
          {state.activeTab === "mine" && (
            <BottleList
              title="My bottles"
              data={state.myBottles}
              emptyText="You have not dropped any bottles yet."
            />
          )}
        </Animated.View>
      </ScrollView>

      <BottomTabs activeTab={state.activeTab} onChange={actions.setActiveTab} />

      {state.toast ? (
        <Animated.View
          entering={FadeInDown.duration(180)}
          className="absolute inset-x-8 bottom-24 rounded-2xl bg-foreground px-4 py-3.5"
          style={{
            left: horizontalPadding,
            right: horizontalPadding,
            maxWidth: contentMaxWidth,
            alignSelf: "center",
          }}
        >
          <Text className="text-center text-background/95">{state.toast}</Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}
