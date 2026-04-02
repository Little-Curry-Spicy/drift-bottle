# syntax=docker/dockerfile:1

FROM node:20-slim AS builder

WORKDIR /repo

# 使用 corepack 管理 pnpm（避免在镜像里手动装 pnpm）
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm --filter api build


FROM node:20-slim AS runner

RUN corepack enable
ENV NODE_ENV=production

WORKDIR /repo

# 只拷贝运行所需的清单文件与构建产物，避免把完整源码带进运行镜像。
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json

# workspace 依赖：shared 当前 exports 指向 src，需要把源码带上
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/shared/src ./packages/shared/src

COPY --from=builder /repo/apps/api/dist ./apps/api/dist

# 在运行镜像中安装 api 的 production 依赖（避免跨 stage 复制 node_modules 带来的 pnpm 链接问题）
RUN pnpm install --prod --frozen-lockfile --filter api...

WORKDIR /repo/apps/api

EXPOSE 3000

# 健康检查：调用 GET /（Nest 的 AppController 返回 Hello World）
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "const port=process.env.PORT||3000;fetch('http://127.0.0.1:'+port+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main"]

