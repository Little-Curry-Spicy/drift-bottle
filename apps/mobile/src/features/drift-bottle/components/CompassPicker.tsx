import { Ionicons } from "@expo/vector-icons";
import { DeviceMotion } from "expo-sensors";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PanResponder, Platform, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type CompassPickerProps = {
  size?: number;
  initialAngle?: number;
  onAngleChange?: (angle: number) => void;
};

function degreeToDirection(angle: number) {
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(angle / 45) % 8;
  return labels[index];
}

export function CompassPicker({
  size = 250,
  initialAngle = 180,
  onAngleChange,
}: CompassPickerProps) {
  const [angle, setAngle] = useState(initialAngle);
  const [power, setPower] = useState(0);
  const radius = size / 2;
  const pointerRotate = useSharedValue(initialAngle);
  const dragPower = useSharedValue(0);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const maxDragDist = 150;
  const launchThreshold = 0.76;

  const setNextAngle = useCallback(
    (next: number) => {
      const normalized = ((next % 360) + 360) % 360;
      setAngle(normalized);
      pointerRotate.value = withTiming(normalized, {
        duration: 75,
        easing: Easing.out(Easing.cubic),
      });
      onAngleChange?.(Math.round(normalized));
    },
    [onAngleChange, pointerRotate],
  );

  const updateByPoint = useCallback(
    (x: number, y: number) => {
      const dx = x - radius;
      const dy = y - radius;
      const dragAngle = (Math.atan2(dx, -dy) * 180) / Math.PI;
      const launchAngle = dragAngle + 180;
      setNextAngle(launchAngle);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normalizedPower = Math.min(dist / maxDragDist, 1);
      setPower(normalizedPower);
      dragPower.value = withTiming(normalizedPower, { duration: 60 });
      const clampRatio = dist > maxDragDist ? maxDragDist / dist : 1;
      // Slingshot behavior: projectile follows drag position.
      const nextX = dx * clampRatio;
      const nextY = dy * clampRatio;
      dragX.value = withTiming(nextX, { duration: 60, easing: Easing.out(Easing.cubic) });
      dragY.value = withTiming(nextY, { duration: 60, easing: Easing.out(Easing.cubic) });
    },
    [dragPower, dragX, dragY, radius, setNextAngle],
  );

  useEffect(() => {
    let active = true;
    let sub: { remove: () => void } | null = null;

    const setupMotion = async () => {
      if (Platform.OS === "web") return;
      const available = await DeviceMotion.isAvailableAsync();
      if (!available || !active) return;

      DeviceMotion.setUpdateInterval(50);
      sub = DeviceMotion.addListener((event) => {
        const beta = event.rotation?.beta ?? 0;
        const gamma = event.rotation?.gamma ?? 0;
        const nextX = Math.max(-5, Math.min(5, beta * 5));
        const nextY = Math.max(-5, Math.min(5, gamma * 5));
        tiltX.value = withTiming(nextX, { duration: 120 });
        tiltY.value = withTiming(nextY, { duration: 120 });
      });
    };

    setupMotion();

    return () => {
      active = false;
      sub?.remove();
    };
  }, [tiltX, tiltY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          updateByPoint(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        },
        onPanResponderMove: (evt) => {
          updateByPoint(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
        },
        onPanResponderRelease: () => {
          if (power >= launchThreshold) {
            dragPower.value = withSequence(
              withTiming(1.08, { duration: 130, easing: Easing.out(Easing.exp) }),
              withSpring(0, { damping: 20, stiffness: 210 }),
            );
          } else {
            dragPower.value = withSpring(0, { damping: 20, stiffness: 210 });
          }
          dragX.value = withSpring(0, { damping: 20, stiffness: 210 });
          dragY.value = withSpring(0, { damping: 20, stiffness: 210 });
          setPower(0);
        },
      }),
    [dragPower, dragX, dragY, power, updateByPoint],
  );

  const compassTiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${tiltX.value}deg` },
      { rotateY: `${-tiltY.value}deg` },
    ],
  }));

  const planeStyle = useAnimatedStyle(() => {
    const easedPower = 1 - Math.pow(1 - Math.min(dragPower.value, 1), 3);
    const planeScale = 1 + easedPower * 0.95;
    return {
      transform: [
        { translateX: dragX.value },
        { translateY: dragY.value },
        { rotate: `${pointerRotate.value}deg` },
        { scale: planeScale },
      ],
    };
  });

  return (
    <View className="items-center">
      <View className="mb-3 flex-row items-center gap-3">
        <Text className="text-sm text-muted-foreground">Angle</Text>
        <Text className="font-sans-semibold text-foreground">{Math.round(angle)}°</Text>
        <Text className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
          {degreeToDirection(angle)}
        </Text>
        <Text className="rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground">
          Power {Math.round(power * 100)}%
        </Text>
      </View>

      <View
        {...panResponder.panHandlers}
        style={{ width: size, height: size }}
        className="items-center justify-center"
      >
        <Animated.View style={compassTiltStyle}>
          <View
            style={{ width: size, height: size, borderRadius: radius }}
            className="items-center justify-center rounded-full border border-border/70 bg-background"
          >
            <Text
              className="absolute font-sans-semibold text-lg text-foreground"
              style={{ top: 22 }}
            >
              N
            </Text>
            <Text
              className="absolute font-sans-semibold text-lg text-foreground"
              style={{ right: 24, top: radius - 10 }}
            >
              E
            </Text>
            <Text
              className="absolute font-sans-semibold text-lg text-foreground"
              style={{ bottom: 22 }}
            >
              S
            </Text>
            <Text
              className="absolute font-sans-semibold text-lg text-foreground"
              style={{ left: 24, top: radius - 10 }}
            >
              W
            </Text>

            <Animated.View
              style={[
                {
                  position: "absolute",
                  alignItems: "center",
                  justifyContent: "center",
                },
                planeStyle,
              ]}
            >
              <Ionicons name="paper-plane" size={40} color="#22c55e" />
            </Animated.View>
            <View className="h-4 w-4 rounded-full border border-border bg-card" />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
