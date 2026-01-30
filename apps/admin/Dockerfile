# --- 构建阶段 ---
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# 复制 monorepo 配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# 复制 packages 依赖及其配置
COPY packages/ ./packages/
COPY apps/admin/package.json ./apps/admin/package.json

# 安装依赖
RUN pnpm install

# 复制 Admin 源代码
COPY apps/admin ./apps/admin

# 构建项目
RUN pnpm exec turbo run build --filter=@chefos/admin

# --- 运行阶段 ---
FROM nginx:alpine

# 从构建阶段复制产物
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY apps/admin/deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
