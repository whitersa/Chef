FROM node:18-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

# --- 构建阶段 ---
FROM base AS builder
WORKDIR /app

# 复制 monorepo 配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# 复制所有包的 package.json (为了利用缓存，这里简化处理，实际项目可用 turbo prune)
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY packages/types/package.json packages/types/package.json

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY apps/api ./apps/api
COPY packages/types ./packages/types

# 构建 API (使用 turbo 以确保依赖被构建)
RUN pnpm exec turbo run build --filter=@chefos/api

# --- 运行阶段 ---
FROM base AS runner
WORKDIR /app

# 安装 Java (DITA-OT 需要)
RUN apk add --no-cache openjdk17 curl unzip

# 安装 DITA-OT
RUN curl -L https://github.com/dita-ot/dita-ot/releases/download/4.2/dita-ot-4.2.zip -o /tmp/dita.zip && \
    unzip /tmp/dita.zip -d /opt && \
    rm /tmp/dita.zip
ENV PATH="/opt/dita-ot-4.2/bin:${PATH}"

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/src ./apps/api/src
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/package.json ./package.json

# 设置环境变量
ENV NODE_ENV production

# 启动命令
CMD ["node", "apps/api/dist/main.js"]
