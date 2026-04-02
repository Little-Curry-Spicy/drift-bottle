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

WORKDIR /repo/apps/api

RUN corepack enable
ENV NODE_ENV=production

# 运行时需要 node_modules（包含 Nest/依赖）
COPY --from=builder /repo/node_modules /repo/node_modules

# dist 产物
COPY --from=builder /repo/apps/api/dist ./dist

EXPOSE 3000

# 健康检查：调用 GET /（Nest 的 AppController 返回 Hello World）
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "const port=process.env.PORT||3000;fetch('http://127.0.0.1:'+port+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main"]

