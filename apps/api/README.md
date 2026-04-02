# Drift Bottle API

`apps/api` 是漂流瓶后端服务，基于 NestJS + TypeORM + PostgreSQL。

## 本地运行

```bash
pnpm --filter api start:dev
```

默认端口 `3000`，Swagger 地址：`http://localhost:3000/docs`。

## 安全与稳定性

- **限流**：默认 1 分钟内每个 IP 最多 60 次请求（`express-rate-limit`）
- **安全头**：启用 `helmet`
- **输入校验**：全局 `ValidationPipe`（白名单、自动转换、拒绝非法字段）
- **CORS**：可通过环境变量配置允许域名

## 日志（Winston）

已接入 `nest-winston + winston-daily-rotate-file`：

- **按日期切分**：文件名包含 `YYYY-MM-DD`
- **按大小切分**：单文件超过 `10KB` 自动分片（`%i`）
- **错误日志单独文件**：`error` 级别独立输出
- **超长日志分段**：单条 message 超过 `10KB` 时会被分段写入

日志目录：`apps/api/logs`（运行时自动创建）。

## 关键环境变量

- `PORT`：服务端口，默认 `3000`
- `CORS_ORIGIN`：逗号分隔的允许域名，如 `http://localhost:5173,http://localhost:8080`
- `RATE_LIMIT_WINDOW_MS`：限流时间窗（毫秒），默认 `60000`
- `RATE_LIMIT_MAX`：时间窗内最大请求数，默认 `60`
- `LOG_LEVEL`：日志级别，默认 `info`
- `LOG_MAX_FILES`：日志保留天数，例如 `14d`

## 目录说明

- `src/main.ts`：应用启动、安全策略、Swagger、全局中间件
- `src/logger/winston.logger.ts`：Winston 传输器与分片策略
- `src/bottles`：漂流瓶业务模块
- `src/auth`：鉴权相关
- `src/database`：数据库实体与配置
