#!/bin/bash

# 现实世界RPG云函数部署脚本
# 使用方法：在微信开发者工具中右键点击 cloudfunctions/rpgFunctions 文件夹
# 选择"上传并部署：云端安装依赖"

echo "=== 现实世界RPG云函数部署指南 ==="
echo ""
echo "请按照以下步骤部署云函数："
echo ""
echo "1. 打开微信开发者工具"
echo "2. 在左侧文件树中找到 cloudfunctions/rpgFunctions 文件夹"
echo "3. 右键点击 rpgFunctions 文件夹"
echo "4. 选择 '上传并部署：云端安装依赖'"
echo "5. 等待部署完成"
echo ""
echo "部署完成后，编辑资料功能将支持云端存储！"
echo ""

# 如果有CLI工具，可以使用以下命令（需要配置环境变量）
# ${installPath} cloud functions deploy --e ${envId} --n rpgFunctions --r --project ${projectPath}