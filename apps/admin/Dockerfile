# --- 构建阶段 ---
FROM node:18-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# 复制 monorepo 配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# 复制依赖描述文件
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY packages/types/package.json packages/types/package.json

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY apps/admin ./apps/admin
COPY packages/types ./packages/types

# 构建 Admin
RUN pnpm --filter @chefos/admin build

# --- 运行阶段 ---
FROM nginx:alpine

# 复制构建产物到 Nginx 目录
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

# 复制 Nginx 配置文件 (假设我们在 deploy 目录下有 nginx.conf)
# 注意：这里假设构建上下文是项目根目录
COPY apps/admin/deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
