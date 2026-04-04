import { authTheme } from "@/src/theme/auth";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottleList } from "./components/BottleList";
import { BottomTabs } from "./components/BottomTabs";
import { MineProfileSection } from "./components/MineProfileSection";
import { RepliedOutModal } from "./components/RepliedOutModal";
import { RepliedToMeModal } from "./components/RepliedToMeModal";
import { SeaTab } from "./components/SeaTab";
import { StatCard } from "./components/StatCard";
import { ThrowTab } from "./components/ThrowTab";
import { useDriftBottleMvp } from "./hooks/useDriftBottleMvp";

export function DriftBottleScreen() {
  const { t } = useTranslation();
  const { state, stats, repliedOut, repliedToMe, actions } = useDriftBottleMvp();
  const [repliedOutModalOpen, setRepliedOutModalOpen] = useState(false);
  const [repliedToMeModalOpen, setRepliedToMeModalOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const horizontalPadding = isDesktop ? 32 : isTablet ? 24 : 16;
  /** 统计卡片：宽屏一行 4 列，窄屏换行 2×2 */
  const statsSingleRow = width >= 720;
  const statsGap = 12;
  const statsInnerWidth = width - horizontalPadding * 2;
  const statsNarrowColWidth = (statsInnerWidth - statsGap) / 2;
  const statSlotStyle = statsSingleRow
    ? ({ flex: 1, minWidth: 0 } as const)
    : ({ width: statsNarrowColWidth } as const);

  const activeTabLabel = t(`drift.tabs.${state.activeTab}`);

  const activeTabHint = useMemo(() => {
    const key = `drift.tabHints.${state.activeTab}` as const;
    return t(key);
  }, [state.activeTab, t]);

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      className="flex-1 pt-2"
      style={{ backgroundColor: authTheme.screenBg }}
    >
      <View className="px-4 pt-3" style={{ paddingHorizontal: horizontalPadding }}>
        <Text className="text-2xl font-sans-semibold" style={{ color: authTheme.title }}>
          {activeTabLabel}
        </Text>
        <Text className="mt-2 text-sm leading-6" style={{ color: authTheme.body }}>
          {activeTabHint}
        </Text>
      </View>

      <Animated.View
        entering={FadeInDown.duration(260)}
        style={{
          flexDirection: "row",
          flexWrap: statsSingleRow ? "nowrap" : "wrap",
          gap: statsGap,
          paddingTop: 16,
          paddingBottom: 16,
          paddingHorizontal: horizontalPadding,
        }}
      >
        <View style={statSlotStyle}>
          <StatCard kind="dropped" label={t("drift.stats.dropped")} value={stats.thrown} />
        </View>
        <View style={statSlotStyle}>
          <StatCard kind="saved" label={t("drift.stats.saved")} value={stats.favorite} />
        </View>
        <View style={statSlotStyle}>
          <StatCard
            kind="repliesToMe"
            label={t("drift.stats.repliesToMe")}
            value={stats.receivedReplies ?? 0}
            showDot={state.repliesNotifyDot}
            showTapHint
            onPress={() => setRepliedToMeModalOpen(true)}
          />
        </View>
        <View style={statSlotStyle}>
          <StatCard
            kind="repliesByMe"
            label={t("drift.stats.repliesByMe")}
            value={stats.replied ?? 0}
            showTapHint
            onPress={() => setRepliedOutModalOpen(true)}
          />
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1"
        style={{ flex: 1, minHeight: 0 }}
        contentContainerStyle={{
          paddingTop: 6,
          paddingBottom: 58,
          paddingHorizontal: horizontalPadding,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <Animated.View key={state.activeTab} entering={FadeInRight.duration(220)}>
          {state.activeTab === "sea" && (
            <SeaTab
              currentBottle={state.currentBottle}
              isFavorited={
                state.currentBottle
                  ? state.favorites.some((f) => f.id === state.currentBottle!.id)
                  : false
              }
              replyDraft={state.replyDraft}
              catchLoading={state.catchBusy}
              onReplyDraftChange={actions.setReplyDraft}
              onCatchBottle={actions.catchRandomBottle}
              onSendReply={actions.sendReply}
              onToggleFavorite={actions.toggleFavorite}
            />
          )}
          {state.activeTab === "throw" && (
            <ThrowTab
              draft={state.draft}
              onDraftChange={actions.setDraft}
              onThrow={actions.throwBottle}
            />
          )}
          {state.activeTab === "favorites" && (
            <BottleList variant="saved" data={state.favorites} />
          )}
          {state.activeTab === "mine" && (
            <View className="gap-5">
              <MineProfileSection />
              <BottleList variant="mine" data={state.myBottles} />
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <BottomTabs activeTab={state.activeTab} onChange={actions.setActiveTab} />

      <RepliedToMeModal
        visible={repliedToMeModalOpen}
        onClose={() => setRepliedToMeModalOpen(false)}
        items={repliedToMe}
        onSendReplyToBottle={actions.sendReplyToBottle}
      />

      <RepliedOutModal
        visible={repliedOutModalOpen}
        onClose={() => setRepliedOutModalOpen(false)}
        items={repliedOut}
      />

      {state.toast ? (
        <Animated.View
          entering={FadeInDown.duration(180)}
          className="absolute inset-x-8 bottom-24 rounded-2xl px-4 py-3.5"
          style={{
            left: horizontalPadding,
            right: horizontalPadding,
            alignSelf: "center",
            backgroundColor: authTheme.title,
          }}
        >
          <Text className="text-center text-white">{state.toast}</Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}
