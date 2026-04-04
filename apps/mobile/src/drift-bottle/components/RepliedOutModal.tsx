import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { authTheme } from "@/src/theme/auth";
import { formatBottleTime } from "../lib/datetime";
import { parseQuotedReply } from "../lib/reply-quote";
import type { RepliedOutItem } from "../types";

type RepliedOutModalProps = {
  visible: boolean;
  onClose: () => void;
  items: RepliedOutItem[];
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

export function RepliedOutModal({ visible, onClose, items }: RepliedOutModalProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const maxH = Math.min(height * 0.72, 560);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={sheetStyles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("drift.repliedOut.close")}
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
                <Ionicons name="chatbubbles-outline" size={20} color={authTheme.primary} />
                <Text className="text-lg font-sans-semibold" style={{ color: authTheme.title }}>
                  {t("drift.repliedOut.title")}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t("drift.repliedOut.close")}
              >
                <Ionicons name="close" size={24} color={authTheme.body} />
              </Pressable>
            </View>
            <Text className="mb-4 text-xs leading-5" style={{ color: authTheme.body }}>
              {t("drift.repliedOut.subtitle")}
            </Text>

            <ScrollView
              style={{ maxHeight: maxH }}
              contentContainerStyle={{ paddingBottom: 12, gap: 12 }}
              showsVerticalScrollIndicator
            >
              {items.length === 0 ? (
                <View className="rounded-2xl border border-dashed border-border/80 px-4 py-6">
                  <Text className="text-center text-sm" style={{ color: authTheme.body }}>
                    {t("drift.repliedOut.empty")}
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
                        {t("drift.repliedOut.lastReplied")} {formatBottleTime(row.lastRepliedAt)}
                      </Text>
                    </View>
                    <Text className="text-xs text-muted-foreground">
                      {t("drift.repliedOut.bottleAt")} · {formatBottleTime(row.bottleCreatedAt)}
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
                        {t("drift.repliedOut.mySentReplies")}
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
                                {t("drift.repliedOut.quote")}
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
                              {i + 1}. {t("drift.repliedOut.myWordsLabel")}
                              {text ? text : t("drift.repliedOut.quoteOnly")}
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
      </View>
    </Modal>
  );
}
