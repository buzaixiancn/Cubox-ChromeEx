#!/bin/bash

# GitHub Release 创建脚本
# 使用方法: ./create-release.sh [版本号] [标签名]
# 例如: ./create-release.sh 0.5.0 v0.5.0

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取版本号
VERSION=${1:-$(node -p "require('./package.json').version")}
TAG=${2:-"v${VERSION}"}

echo -e "${GREEN}准备创建 Release: ${TAG}${NC}"

# 1. 确保已打包
if [ ! -d "dist-zip" ] || [ -z "$(ls -A dist-zip/*.zip 2>/dev/null)" ]; then
  echo -e "${YELLOW}未找到打包文件，开始打包...${NC}"
  pnpm zip
fi

# 获取最新的打包文件
ZIP_FILE=$(ls -t dist-zip/*.zip | head -1)
ZIP_NAME=$(basename "$ZIP_FILE")

if [ ! -f "$ZIP_FILE" ]; then
  echo -e "${RED}错误: 找不到打包文件${NC}"
  exit 1
fi

echo -e "${GREEN}找到打包文件: ${ZIP_FILE}${NC}"

# 2. 获取 GitHub token 和仓库信息
GIT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
REPO_OWNER="buzaixiancn"
REPO_NAME="Cubox-ChromeEx"

# 从 git remote URL 中提取 token（如果存在）
if [[ "$GIT_REMOTE" =~ ghp_[^@]+ ]]; then
  GITHUB_TOKEN="${BASH_REMATCH[0]}"
  echo -e "${GREEN}从 git remote 中检测到 GitHub token${NC}"
elif [ -n "$GITHUB_TOKEN" ]; then
  # 使用环境变量中的 token
  echo -e "${GREEN}使用环境变量中的 GitHub token${NC}"
else
  GITHUB_TOKEN=""
fi

# 3. 检查是否安装了 GitHub CLI
if command -v gh &> /dev/null; then
  echo -e "${GREEN}使用 GitHub CLI 创建 Release...${NC}"
  
  # 检查是否已登录
  if gh auth status &> /dev/null; then
    # 创建 Release
    gh release create "$TAG" \
      "$ZIP_FILE" \
      --title "Release $TAG" \
      --notes "## 版本 $VERSION

### 更新内容
- 修复生产构建中显示开发提示的问题
- 代码清理和优化
- 使用 IS_DEV 控制开发调试信息

### 安装说明
1. 下载 \`${ZIP_NAME}\`
2. 解压文件
3. 打开 Chrome 浏览器，进入 \`chrome://extensions/\`
4. 开启"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择解压后的文件夹

### 文件
- \`${ZIP_NAME}\` - Chrome 扩展包"
    
    echo -e "${GREEN}✅ Release 创建成功！${NC}"
    echo -e "${GREEN}访问: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/releases/tag/${TAG}${NC}"
    exit 0
  else
    echo -e "${YELLOW}GitHub CLI 未登录，尝试使用 GitHub API...${NC}"
  fi
fi

# 4. 使用 GitHub API 创建 Release
if [ -n "$GITHUB_TOKEN" ]; then
  echo -e "${GREEN}使用 GitHub API 创建 Release...${NC}"
  
  # 准备 Release 说明
  RELEASE_NOTES="## 版本 $VERSION

### 更新内容
- 修复生产构建中显示开发提示的问题
- 代码清理和优化
- 使用 IS_DEV 控制开发调试信息

### 安装说明
1. 下载 \`${ZIP_NAME}\`
2. 解压文件
3. 打开 Chrome 浏览器，进入 \`chrome://extensions/\`
4. 开启"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择解压后的文件夹

### 文件
- \`${ZIP_NAME}\` - Chrome 扩展包"
  
  # 使用 jq 转义 JSON
  RELEASE_NOTES_JSON=$(echo "$RELEASE_NOTES" | jq -Rs .)
  
  # 创建 Release
  echo -e "${YELLOW}正在创建 Release...${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases" \
    -d "{
      \"tag_name\": \"$TAG\",
      \"name\": \"Release $TAG\",
      \"body\": $RELEASE_NOTES_JSON,
      \"draft\": false,
      \"prerelease\": false
    }")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ Release 创建成功！${NC}"
    
    # 获取 upload_url
    UPLOAD_URL=$(echo "$RESPONSE_BODY" | jq -r '.upload_url' | sed 's/{?name,label}//')
    
    if [ -n "$UPLOAD_URL" ] && [ "$UPLOAD_URL" != "null" ]; then
      echo -e "${GREEN}正在上传文件...${NC}"
      
      # 上传文件
      UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/zip" \
        --data-binary "@$ZIP_FILE" \
        "${UPLOAD_URL}?name=${ZIP_NAME}")
      
      UPLOAD_HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -n1)
      
      if [ "$UPLOAD_HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅ 文件上传成功！${NC}"
        echo -e "${GREEN}访问: https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${TAG}${NC}"
        exit 0
      else
        echo -e "${YELLOW}⚠️  Release 已创建，但文件上传失败 (HTTP $UPLOAD_HTTP_CODE)${NC}"
        echo -e "${YELLOW}请手动上传文件: ${ZIP_FILE}${NC}"
        echo -e "${GREEN}访问: https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${TAG}${NC}"
        exit 0
      fi
    fi
  elif [ "$HTTP_CODE" = "422" ]; then
    echo -e "${YELLOW}⚠️  Release 标签 ${TAG} 可能已存在${NC}"
    echo -e "${YELLOW}尝试上传文件到现有 Release...${NC}"
    
    # 获取现有 Release 的 upload_url
    EXISTING_RELEASE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${TAG}")
    
    UPLOAD_URL=$(echo "$EXISTING_RELEASE" | jq -r '.upload_url' | sed 's/{?name,label}//')
    
    if [ -n "$UPLOAD_URL" ] && [ "$UPLOAD_URL" != "null" ]; then
      UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/zip" \
        --data-binary "@$ZIP_FILE" \
        "${UPLOAD_URL}?name=${ZIP_NAME}")
      
      UPLOAD_HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -n1)
      
      if [ "$UPLOAD_HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅ 文件上传成功！${NC}"
        echo -e "${GREEN}访问: https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/${TAG}${NC}"
        exit 0
      else
        echo -e "${RED}❌ 文件上传失败 (HTTP $UPLOAD_HTTP_CODE)${NC}"
        echo "$UPLOAD_RESPONSE" | head -20
      fi
    else
      echo -e "${RED}❌ 无法获取上传 URL${NC}"
    fi
  else
    echo -e "${RED}❌ 创建 Release 失败 (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY" | head -20
    exit 1
  fi
else
  echo -e "${YELLOW}未找到 GitHub token，使用手动方式...${NC}"
  echo ""
  echo -e "${GREEN}请按照以下步骤手动创建 Release:${NC}"
  echo ""
  echo "1. 访问 GitHub 仓库:"
  echo "   https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/new"
  echo ""
  echo "2. 填写 Release 信息:"
  echo "   - Tag: ${TAG}"
  echo "   - Title: Release ${TAG}"
  echo "   - Description:"
  echo ""
  echo "   ## 版本 ${VERSION}"
  echo ""
  echo "   ### 更新内容"
  echo "   - 修复生产构建中显示开发提示的问题"
  echo "   - 代码清理和优化"
  echo "   - 使用 IS_DEV 控制开发调试信息"
  echo ""
  echo "   ### 安装说明"
  echo "   1. 下载 \`${ZIP_NAME}\`"
  echo "   2. 解压文件"
  echo "   3. 打开 Chrome 浏览器，进入 \`chrome://extensions/\`"
  echo "   4. 开启"开发者模式""
  echo "   5. 点击"加载已解压的扩展程序""
  echo "   6. 选择解压后的文件夹"
  echo ""
  echo "3. 上传文件:"
  echo "   - 拖拽或选择文件: ${ZIP_FILE}"
  echo ""
  echo "4. 点击 'Publish release' 按钮"
  echo ""
  echo -e "${GREEN}打包文件位置: ${ZIP_FILE}${NC}"
  exit 0
fi
