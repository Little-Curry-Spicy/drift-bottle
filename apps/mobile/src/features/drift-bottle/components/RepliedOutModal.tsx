import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";
import { authTheme } from "@/src/theme/auth";
import { formatBottleTime } from "../datetime";
import type { RepliedOutItem } from "../types";
import { parseQuotedReply } from "../reply-quote";

type RepliedOutModalProps = {
  visible: boolean;
  onClose: () => void;
  items: RepliedOutItem[];
};

export function RepliedOutModal({ visible, onClose, items }: RepliedOutModalProps) {
  const { height } = useWindowDimensions();
  const maxH = Math.min(height * 0.72, 560);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 justify-end bg-black/40"
        onTouchStart={(e: any) => {
          // RN：遮罩点击即关闭；Web：仅当点的是遮罩本身时关闭
          if (Platform.OS !== "web") {
            onClose();
            return;
          }
          const ev = e as { target?: unknown; currentTarget?: unknown };
          if (ev.target === ev.currentTarget) onClose();
        }}
      >
        <View
          onTouchStart={(e) => e.stopPropagation()}
          className="rounded-t-3xl bg-card px-5 pb-8 pt-4"
          style={{ maxHeight: maxH + 48, borderTopWidth: 1, borderTopColor: authTheme.cardBorder }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="chatbubbles-outline" size={20} color={authTheme.primary} />
              <Text className="text-lg font-sans-semibold" style={{ color: authTheme.title }}>
                我回复过的海友
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="关闭"
            >
              <Ionicons name="close" size={24} color={authTheme.body} />
            </Pressable>
          </View>
          <Text className="mb-4 text-xs leading-5" style={{ color: authTheme.body }}>
            每条记录对应一只他人扔出的瓶子；「海友」为匿名代号，便于区分不同瓶主。
          </Text>

          <ScrollView
            style={{ maxHeight: maxH }}
            contentContainerStyle={{ paddingBottom: 12, gap: 12 }}
            showsVerticalScrollIndicator
          >
            {items.length === 0 ? (
              <View className="rounded-2xl border border-dashed border-border/80 px-4 py-6">
                <Text className="text-center text-sm" style={{ color: authTheme.body }}>
                  还没有回复过别人的瓶子。去海里捞一只试试吧。
                </Text>
              </View>
            ) : (
              items.map((row) => (
                <View
                  key={row.bottleId}
                  className="rounded-2xl border border-border/70 bg-background px-4 py-4"
                >
                  <View className="mb-2 flex-row flex-wrap items-center justify-between gap-2">
                    <Text
                      className="rounded-full bg-muted px-2.5 py-1 text-xs font-sans-medium"
                      style={{ color: authTheme.title }}
                    >
                      {row.bottleAuthorMask}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      上次回复 {formatBottleTime(row.lastRepliedAt)}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">
                    瓶子 · {formatBottleTime(row.bottleCreatedAt)}
                  </Text>
                  <Text
                    className="mt-2 text-sm leading-6 text-foreground"
                    numberOfLines={4}
                    style={{ color: authTheme.label }}
                  >
                    {row.bottleContent}
                  </Text>
                  <View className="mt-3 border-t border-border/60 pt-3">
                    <Text className="mb-1 text-xs font-sans-medium" style={{ color: authTheme.subtitle }}>
                      我发出的回复
                    </Text>
                    {row.myReplyContents.map((raw, i) => {
                      const { quote, text } = parseQuotedReply(raw);
                      if (!quote) {
                        return (
                          <View
                            key={`${raw}-${i}`}
                            className="mb-2 rounded-xl border border-border/70 bg-card px-3 py-2"
                          >
                            <Text
                              className="text-sm leading-6"
                              style={{ color: authTheme.body }}
                            >
                              {i + 1}. {raw}
                            </Text>
                          </View>
                        );
                      }

                      return (
                        <View
                          key={`${raw}-${i}`}
                          className="mb-2 rounded-xl border border-border/70 bg-card px-3 py-2"
                        >
                          <View className="rounded-xl bg-muted px-3 py-2">
                            <Text
                              className="text-[11px] font-sans-medium"
                              style={{ color: authTheme.subtitle }}
                            >
                              引用
                            </Text>
                            <Text
                              className="mt-1 text-sm leading-5"
                              style={{ color: authTheme.body }}
                            >
                              “{quote}”
                            </Text>
                          </View>
                          <Text
                            className="mt-2 text-sm leading-6"
                            style={{ color: authTheme.body }}
                          >
                            {i + 1}. 我的话：{text ? text : "（仅引用）"}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
