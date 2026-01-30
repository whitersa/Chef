FROM node:20-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

# --- 构建阶段 ---
FROM base AS builder
WORKDIR /app

# 复制所有包的 package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/ ./packages/
# 为了 pnpm install 成功，我们需要先有一个基本的结构，
# 或者干脆在这里复制所有 package.json。
# 简单做法：复制所有 packages 目录，因为它们通常比较小
RUN pnpm install

# 复制源代码
COPY apps/api ./apps/api

# 构建 API (使用 turbo 以确保依赖被构建)
RUN pnpm exec turbo run build --filter=@chefos/api

# --- 运行阶段 ---
FROM base AS runner
WORKDIR /app

# 安装 Java (DITA-OT 需要)
RUN apk add --no-cache openjdk17 curl unzip fontconfig ttf-dejavu wqy-zenhei

# 安装 DITA-OT
RUN curl -L https://github.com/dita-ot/dita-ot/releases/download/4.2/dita-ot-4.2.zip -o /tmp/dita.zip && \
    unzip /tmp/dita.zip -d /opt && \
    rm /tmp/dita.zip
ENV PATH="/opt/dita-ot-4.2/bin:${PATH}"

# 安装自定义插件
COPY tools/dita-plugins/com.chefos.pdf /opt/dita-ot-4.2/plugins/com.chefos.pdf
RUN dita --install

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/src ./apps/api/src
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/tsconfig*.json ./apps/api/
COPY --from=builder /app/apps/api/nest-cli.json ./apps/api/
COPY --from=builder /app/apps/api/webpack.config.js ./apps/api/
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/turbo.json ./turbo.json

# 设置环境变量
ENV NODE_ENV production

# 启动命令
CMD ["node", "apps/api/dist/main.js"]
