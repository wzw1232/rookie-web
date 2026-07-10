# Stage 1: 构建阶段
FROM node:20-alpine AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 优先复制依赖文件，利用 Docker 缓存层
COPY pnpm-lock.yaml package.json ./

# 安装生产依赖 + 开发依赖（构建需要）
RUN pnpm install --frozen-lockfile

# 复制源码和配置文件
COPY . .

# 构建项目（输出到 dist/）
RUN pnpm run build

# Stage 2: 运行阶段（Nginx）
FROM nginx:1.27-alpine

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
