import { ReactNode } from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type TouchableScaleProps = PressableProps & {
  children: ReactNode;
  className?: string;
  pressedScale?: number;
};

export function TouchableScale({
  children,
  className,
  pressedScale = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: TouchableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      {...rest}
      className={className}
      onPressIn={(event) => {
        scale.value = withTiming(pressedScale, { duration: 120 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, { duration: 120 });
        onPressOut?.(event);
      }}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}
