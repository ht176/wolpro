#!/bin/bash

# 停止脚本如果任何命令失败
set -e

echo "🚀 开始构建 WOL Pro 镜像 (Target Platform: linux/amd64)..."

# 1. 构建后端
echo "📦 构建 Backend..."
# 使用 --platform linux/amd64 确保构建出的镜像能在 Synology (Intel/AMD) 上运行
# 如果你的 Synology 是 ARM 架构，请改为 linux/arm64
docker build --platform linux/amd64 -t wolpro-backend:latest ./backend

# 2. 构建前端
echo "📦 构建 Frontend..."
docker build --platform linux/amd64 -t wolpro-frontend:latest ./frontend

echo "✅ 镜像构建完成！"

# 3. 导出镜像
OUTPUT_FILE="wolpro-images.tar"
echo "💾 正在导出镜像到 $OUTPUT_FILE ..."
docker save -o $OUTPUT_FILE wolpro-backend:latest wolpro-frontend:latest

echo "🎉 完成！"
echo "请执行以下步骤在群晖部署："
echo "1. 将 '$OUTPUT_FILE' 上传到群晖，在 Docker/Container Manager 中选择 '映像 -> 导入'。"
echo "2. 将 'docker-compose-synology.yml' 上传到群晖某个文件夹。"
echo "3. 在群晖 Docker 中使用 '项目 -> 新增'，选择该 yaml 文件启动。"
