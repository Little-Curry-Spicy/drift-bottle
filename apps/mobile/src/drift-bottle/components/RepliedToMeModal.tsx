import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { authTheme } from "@/src/theme/auth";
import { formatBottleTime } from "../lib/datetime";
import { buildQuotedReplyPayload, parseQuotedReply } from "../lib/reply-quote";
import type { RepliedToMeItem } from "../types";
import { TouchableScale } from "./TouchableScale";

type ReplyTarget = {
  authorMask: string;
  content: string;
};

type RepliedToMeModalProps = {
  visible: boolean;
  onClose: () => void;
  items: RepliedToMeItem[];
  /** 快捷回复：给指定瓶子再追加一条回复 */
  onSendReplyToBottle: (bottleId: string, content: string) => Promise<void>;
};

const sheetStyles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
    pointerEvents: "box-none",
  },
});

export function RepliedToMeModal({
  visible,
  onClose,
  items,
  onSendReplyToBottle,
}: RepliedToMeModalProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const maxH = Math.min(height * 0.72, 560);
  const [draftByBottleId, setDraftByBottleId] = useState<Record<string, string>>({});
  const [replyTargetByBottleId, setReplyTargetByBottleId] = useState<Record<string, ReplyTarget | null>>(
    {},
  );

  const setDraft = (bottleId: string, value: string) => {
    setDraftByBottleId((prev) => ({ ...prev, [bottleId]: value }));
  };

  const quickReply = (bottleId: string, target: ReplyTarget) => {
    setReplyTargetByBottleId((prev) => ({ ...prev, [bottleId]: target }));
  };

  const cancelQuickReply = (bottleId: string) => {
    setReplyTargetByBottleId((prev) => ({ ...prev, [bottleId]: null }));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={sheetStyles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("drift.repliedToMe.close")}
          style={sheetStyles.backdrop}
          onPress={onClose}
        />
        <View style={sheetStyles.sheetWrap} pointerEvents="box-none">
          <View
            className="rounded-t-3xl bg-card px-5 pb-8 pt-4"
            style={{ maxHeight: maxH + 48, borderTopWidth: 1, borderTopColor: authTheme.cardBorder }}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="mail-unread-outline" size={20} color={authTheme.primary} />
                <Text className="text-lg font-sans-semibold" style={{ color: authTheme.title }}>
                  {t("drift.repliedToMe.title")}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t("drift.repliedToMe.close")}
              >
                <Ionicons name="close" size={24} color={authTheme.body} />
              </Pressable>
            </View>
            <Text className="mb-4 text-xs leading-5" style={{ color: authTheme.body }}>
              {t("drift.repliedToMe.subtitle")}
            </Text>

            <ScrollView
              style={{ maxHeight: maxH }}
              contentContainerStyle={{ paddingBottom: 12, gap: 12 }}
              showsVerticalScrollIndicator
            >
              {items.length === 0 ? (
                <View className="rounded-2xl border border-dashed border-border/80 px-4 py-6">
                  <Text className="text-center text-sm" style={{ color: authTheme.body }}>
                    {t("drift.repliedToMe.empty")}
                  </Text>
                </View>
              ) : (
                items.map((row) => (
                  <View
                    key={row.bottleId}
                    className="rounded-2xl border border-border/70 bg-background px-4 py-4"
                  >
                  <View className="mb-2 flex-row flex-wrap items-center justify-between gap-2">
                    <Text className="text-xs text-muted-foreground">
                      {t("drift.repliedToMe.myBottle")} · {formatBottleTime(row.bottleCreatedAt)}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {t("drift.repliedToMe.latest")} {formatBottleTime(row.lastReplyAt)}
                    </Text>
                  </View>
                  <Text
                    className="text-sm leading-6 text-foreground"
                    numberOfLines={4}
                    style={{ color: authTheme.label }}
                  >
                    {row.bottleContent}
                  </Text>
                  <View className="mt-3 rounded-2xl border border-border/60 bg-background px-3 py-3">
                    <View className="mb-2 flex-row items-center gap-2">
                      <View className="h-3 w-1 rounded-full" style={{ backgroundColor: authTheme.primary }} />
                      <Text className="text-xs font-sans-semibold" style={{ color: authTheme.subtitle }}>
                        {t("drift.repliedToMe.theirReply")}
                      </Text>
                    </View>
                    {row.incomingReplies.map((line, i) => (
                      <View
                        key={`${line.createdAt}-${i}`}
                        className="mb-2 rounded-xl border border-border/70 bg-card px-3 py-2"
                      >
                        <View className="mb-1 flex-row flex-wrap items-center justify-between gap-2">
                          <Text
                            className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-sans-medium"
                            style={{ color: authTheme.title }}
                          >
                            {line.authorMask}
                          </Text>
                          <Text className="text-[11px] text-muted-foreground">
                            {formatBottleTime(line.createdAt)}
                          </Text>
                        </View>
                        <Text className="text-sm leading-6" style={{ color: authTheme.body }}>
                          {line.content}
                        </Text>

                        <Pressable
                          onPress={() =>
                            quickReply(row.bottleId, {
                              authorMask: line.authorMask,
                              content: line.content,
                            })
                          }
                          className="mt-2 self-start rounded-full border border-border/60 bg-background px-3 py-1.5 active:opacity-80"
                          accessibilityRole="button"
                          accessibilityLabel={t("drift.repliedToMe.replyThisLineA11y")}
                        >
                          <View className="flex-row items-center gap-1">
                            <Ionicons
                              name="chatbubble-ellipses-outline"
                              size={12}
                              color={authTheme.primary}
                            />
                            <Text
                              className="text-[11px] font-sans-semibold"
                              style={{ color: authTheme.primary }}
                            >
                              {t("drift.repliedToMe.replyThisLine")}
                            </Text>
                          </View>
                        </Pressable>
                      </View>
                    ))}

                    <View className="mt-3 rounded-2xl border border-border/60 bg-background px-3 py-3">
                      <View className="mb-2 flex-row items-center gap-2">
                        <View className="h-3 w-1 rounded-full" style={{ backgroundColor: authTheme.primary }} />
                        <Text className="text-xs font-sans-semibold" style={{ color: authTheme.subtitle }}>
                          {t("drift.repliedToMe.mySentReplies")}
                        </Text>
                      </View>
                      {row.myReplyContents.length === 0 ? (
                        <Text className="text-sm leading-6" style={{ color: authTheme.body }}>
                          {t("drift.repliedToMe.notRepliedYet")}
                        </Text>
                      ) : (
                        row.myReplyContents.map((raw, i) => {
                          const { quote, text } = parseQuotedReply(raw);
                          if (!quote) {
                            return (
                              <View
                                key={`${raw}-${i}`}
                                className="mb-2 rounded-xl border border-border/70 bg-card px-3 py-2"
                              >
                                <Text className="text-sm leading-6" style={{ color: authTheme.body }}>
                                  {i + 1}. {raw}
                                </Text>
                              </View>
                            );
                          }

                          return (
                            <View key={`${raw}-${i}`} className="mb-2 rounded-xl border border-border/70 bg-card px-3 py-2">
                              <View className="mb-2 rounded-xl bg-muted px-3 py-2">
                                <View className="mb-1 flex-row items-center gap-2">
                                  <View
                                    className="h-2 w-1 rounded-full"
                                    style={{ backgroundColor: authTheme.primary }}
                                  />
                                  <Text className="text-[11px] font-sans-semibold" style={{ color: authTheme.subtitle }}>
                                    {t("drift.repliedToMe.quote")}
                                  </Text>
                                </View>
                                <Text className="text-sm leading-5" style={{ color: authTheme.body }}>
                                  “{quote}”
                                </Text>
                              </View>
                              <Text className="text-sm leading-6" style={{ color: authTheme.body }}>
                                {text ? text : t("drift.repliedToMe.quoteOnly")}
                              </Text>
                            </View>
                          );
                        })
                      )}
                    </View>

                    <View className="mt-4 gap-2 rounded-2xl border border-border/70 bg-background px-3 py-3">
                      <Text className="text-xs font-sans-medium" style={{ color: authTheme.subtitle }}>
                        {t("drift.repliedToMe.addReply")}
                      </Text>

                      {replyTargetByBottleId[row.bottleId] ? (
                        <View className="mb-1 flex-row items-start gap-2 rounded-xl border border-border/60 bg-background px-2 py-2">
                          <View
                            className="mt-0.5 h-3 w-1 rounded-full"
                            style={{ backgroundColor: authTheme.primary }}
                          />
                          <View className="flex-1">
                            <Text className="text-[11px] font-sans-semibold" style={{ color: authTheme.subtitle }}>
                              {t("drift.repliedToMe.replyingToLine")}
                            </Text>
                            <Text
                              className="mt-1 text-[12px] leading-4"
                              style={{ color: authTheme.body }}
                              numberOfLines={2}
                            >
                              {replyTargetByBottleId[row.bottleId]!.authorMask}:{" "}
                              {replyTargetByBottleId[row.bottleId]!.content}
                            </Text>
                          </View>
                          <Pressable
                            onPress={() => cancelQuickReply(row.bottleId)}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel={t("drift.repliedToMe.cancelQuickReplyA11y")}
                          >
                            <Ionicons name="close" size={16} color={authTheme.body} />
                          </Pressable>
                        </View>
                      ) : null}

                      <TextInput
                        value={draftByBottleId[row.bottleId] ?? ""}
                        onChangeText={(value) => setDraft(row.bottleId, value)}
                        placeholder={t("drift.repliedToMe.replyPlaceholder")}
                        placeholderTextColor={authTheme.placeholder}
                        className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground"
                      />
                      <TouchableScale
                        onPress={() =>
                          {
                            const extra = (draftByBottleId[row.bottleId] ?? "").trim();
                            const target = replyTargetByBottleId[row.bottleId];

                            if (!target && !extra) return;
                            const payload = buildQuotedReplyPayload(target?.content ?? null, extra);

                            onSendReplyToBottle(row.bottleId, payload).then(() => {
                              setDraft(row.bottleId, "");
                              cancelQuickReply(row.bottleId);
                            });
                          }
                        }
                        disabled={
                          !replyTargetByBottleId[row.bottleId] &&
                          !((draftByBottleId[row.bottleId] ?? "").trim().length > 0)
                        }
                        className="items-center rounded-2xl px-4 py-3 active:opacity-90"
                        style={{
                          backgroundColor: authTheme.primary,
                          opacity:
                            !(
                              replyTargetByBottleId[row.bottleId] ||
                              ((draftByBottleId[row.bottleId] ?? "").trim().length > 0)
                            )
                              ? 0.6
                              : 1,
                        }}
                        pressedScale={0.97}
                      >
                        <View className="flex-row items-center gap-2">
                          <Ionicons name="send" size={16} color="#ffffff" />
                          <Text className="font-sans-semibold text-white">{t("drift.repliedToMe.replyCta")}</Text>
                        </View>
                      </TouchableScale>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
