import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Clerk `useSSO` / `startSSOFlow` 的 redirectUrl。
 * 与 app.json 中 `experiments.baseUrl` 保持一致；子路径部署时 Clerk Dashboard
 * 的 Redirect URLs 需包含：`{origin}{baseUrl}/sso-callback`。
 */
export function getClerkOAuthRedirectUrl(): string {
  const baseUrl = (
    Constants.expoConfig?.experiments as { baseUrl?: string } | undefined
  )?.baseUrl?.trim();

  if (Platform.OS === "web" && typeof window !== "undefined" && baseUrl) {
    const normalized = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;
    const path = normalized.replace(/\/+$/, "") || "/";
    return `${window.location.origin}${path}/sso-callback`;
  }

  return AuthSession.makeRedirectUri({ path: "sso-callback" });
}

/**
 * Web 端 `signOut({ redirectUrl })`：Clerk 默认跳到 `/`，在子路径部署时会落到服务器根（如 Apache 欢迎页）。
 * 返回绝对 URL；非 Web 返回 null，由页面根据登录态自行跳转（如 `/bottles` 上的 Redirect）。
 */
export function getClerkPostSignOutRedirectUrl(): string | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;

  const baseUrl = (
    Constants.expoConfig?.experiments as { baseUrl?: string } | undefined
  )?.baseUrl?.trim();

  if (baseUrl) {
    const normalized = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;
    const path = normalized.replace(/\/+$/, "") || "/";
    return `${window.location.origin}${path}/sign-in`;
  }

  return `${window.location.origin}/sign-in`;
}
