import { useCallback, useState } from "react";
import { Platform, TextInput, type TextInputProps, type TextStyle } from "react-native";

import { authTheme } from "./auth";

/** 登录/注册输入框：聚焦描边与 authTheme.primary 一致；Web 上关闭系统默认金橙色 outline */
export function AuthTextInput({
  style,
  onFocus,
  onBlur,
  ...props
}: TextInputProps) {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<TextInputProps["onFocus"]>>[0]) => {
      onFocus?.(e);
      setFocused(true);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<TextInputProps["onBlur"]>>[0]) => {
      onBlur?.(e);
      setFocused(false);
    },
    [onBlur],
  );

  return (
    <TextInput
      {...props}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={[
        {
          backgroundColor: authTheme.inputBg,
          color: authTheme.inputText,
          ...(Platform.OS === "web"
            ? ({ outlineStyle: "none", outlineWidth: 0 } as unknown as TextStyle)
            : null),
        },
        style,
        {
          borderWidth: focused ? 2 : 1,
          borderColor: focused ? authTheme.primary : authTheme.inputBorder,
        },
      ]}
    />
  );
}
