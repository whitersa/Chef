# --- 构建阶段 ---
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# 复制 monorepo 配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# 复制配置以及依赖描述文件
COPY apps/portal/package.json apps/portal/package.json
COPY packages/ ./packages/

# 安装依赖
RUN pnpm install

# 复制源代码
COPY apps/portal ./apps/portal

# 构建 Portal
RUN pnpm exec turbo run build --filter=@chefos/portal

# --- 运行阶段 ---
FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/apps/portal/package.json ./apps/portal/package.json
COPY --from=builder /app/apps/portal/next.config.ts ./apps/portal/
COPY --from=builder /app/apps/portal/postcss.config.mjs ./apps/portal/
COPY --from=builder /app/apps/portal/tsconfig.json ./apps/portal/
COPY --from=builder /app/apps/portal/.next ./apps/portal/.next
COPY --from=builder /app/apps/portal/public ./apps/portal/public
COPY --from=builder /app/apps/portal/node_modules ./apps/portal/node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

EXPOSE 3000

ENV NODE_ENV=production

# 启动 Next.js
CMD ["pnpm", "--filter", "@chefos/portal", "start"]
