import { z } from "zod";

/**
 * 用户名：与多数 Clerk 实例兼容（Dashboard 可收紧规则；若被拒会走 Clerk 报错文案）。
 * 仅字母数字、下划线、点、连字符，3～64 位。
 */
const usernameField = z
  .string()
  .trim()
  .min(1, { message: "empty_username" })
  .min(3, { message: "short_username" })
  .max(64, { message: "long_username" })
  .regex(/^[a-zA-Z0-9_.-]+$/, { message: "invalid_username" });

/** 发送验证码前：合法邮箱 + 密码至少 8 位 + 用户名（Clerk 常将 username 列为 required_fields） */
export const signUpCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "empty_email" })
    .email({ message: "invalid_email" }),
  password: z.string().min(8, { message: "short_password" }),
  username: usernameField,
});

export type SignUpCredentials = z.infer<typeof signUpCredentialsSchema>;

export type SignUpCredentialIssueCode =
  | "empty_email"
  | "invalid_email"
  | "short_password"
  | "empty_username"
  | "short_username"
  | "long_username"
  | "invalid_username";

export function getSignUpCredentialIssueCode(
  error: z.ZodError,
): SignUpCredentialIssueCode | undefined {
  const msg = error.issues[0]?.message;
  if (
    msg === "empty_email" ||
    msg === "invalid_email" ||
    msg === "short_password" ||
    msg === "empty_username" ||
    msg === "short_username" ||
    msg === "long_username" ||
    msg === "invalid_username"
  ) {
    return msg;
  }
  return undefined;
}

/** 边输入边校验：有内容但不满足邮箱格式时提示（空不提示） */
export function getLiveEmailIssue(raw: string): "invalid_email" | undefined {
  const s = raw.trim();
  if (s.length === 0) return undefined;
  const r = z.string().email({ message: "invalid_email" }).safeParse(s);
  return r.success ? undefined : "invalid_email";
}

/** 有输入且不足 8 位时提示（空不提示） */
export function getLivePasswordIssue(raw: string): "short_password" | undefined {
  if (raw.length === 0) return undefined;
  if (raw.length < 8) return "short_password";
  return undefined;
}

/** 有输入（trim 后非空）但不满足用户名规则时提示 */
export function getLiveUsernameIssue(raw: string): SignUpCredentialIssueCode | undefined {
  const s = raw.trim();
  if (s.length === 0) return undefined;
  const r = usernameField.safeParse(s);
  if (r.success) return undefined;
  return getSignUpCredentialIssueCode(r.error);
}
