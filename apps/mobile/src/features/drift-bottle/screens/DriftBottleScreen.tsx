import { authTheme } from "@/src/theme/auth";
import { useState } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottleList } from "../components/BottleList";
import { BottomTabs } from "../components/BottomTabs";
import { MineProfileSection } from "../components/MineProfileSection";
import { RepliedOutModal } from "../components/RepliedOutModal";
import { RepliedToMeModal } from "../components/RepliedToMeModal";
import { SeaTab } from "../components/SeaTab";
import { StatCard } from "../components/StatCard";
import { ThrowTab } from "../components/ThrowTab";
import { useDriftBottleMvp } from "../hooks/useDriftBottleMvp";

export function DriftBottleScreen() {
  const { state, stats, repliedOut, repliedToMe, actions } = useDriftBottleMvp();
  const [repliedOutModalOpen, setRepliedOutModalOpen] = useState(false);
  const [repliedToMeModalOpen, setRepliedToMeModalOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const horizontalPadding = isDesktop ? 32 : isTablet ? 24 : 16;
  const activeTabLabel =
    state.activeTab === "sea"
      ? "Sea"
      : state.activeTab === "throw"
        ? "Drop"
        : state.activeTab === "favorites"
          ? "Saved"
          : "Mine";

  const activeTabHint =
    state.activeTab === "sea"
      ? "捞一个瓶子，看看此刻谁在海上说话。"
      : state.activeTab === "throw"
        ? "写下心情，把它轻轻扔进海里。"
        : state.activeTab === "favorites"
          ? "你收藏过的瓶子会保存在这里。"
          : "查看你投递过的全部瓶子。";

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
        className="flex-row gap-3 pb-4 pt-4"
        style={{ paddingHorizontal: horizontalPadding }}
      >
        <StatCard label="Dropped" value={stats.thrown} />
        <StatCard label="Saved" value={stats.favorite} />
        <StatCard
          label="他人回复我的"
          value={stats.receivedReplies ?? 0}
          showDot={state.repliesNotifyDot}
          showTapHint
          onPress={() => setRepliedToMeModalOpen(true)}
        />
        <StatCard
          label="我回复过的海友"
          value={stats.replied ?? 0}
          showTapHint
          onPress={() => setRepliedOutModalOpen(true)}
        />
      </Animated.View>

      <ScrollView
        className="flex-1"
        // RN Web：flex 子项默认 minHeight 为 auto，ScrollView 会被内容撑满并把底部 Tabs 顶出视口；minHeight: 0 让中间区域在 flex 内正确收缩并可滚动
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
            <BottleList
              title="Saved bottles"
              data={state.favorites}
              emptyText="No saved bottles yet."
            />
          )}
          {state.activeTab === "mine" && (
            <View className="gap-5">
              <MineProfileSection />
              <BottleList
                title="My bottles"
                data={state.myBottles}
                emptyText="You have not dropped any bottles yet."
              />
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
