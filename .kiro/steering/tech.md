# 技术栈与构建系统

## 前端框架
- **平台**：微信小程序
- **语言**：JavaScript ES6+
- **标记语言**：WXML (微信标记语言)
- **样式**：WXSS (微信样式表)
- **UI组件**：自定义RPG风格组件（因环境问题替代TDesign）

## 后端与云服务
- **后端**：微信云开发
- **数据库**：微信云数据库（NoSQL文档数据库）
- **云函数**：基于Node.js的无服务器函数
- **身份认证**：微信登录与OpenID
- **存储**：微信云存储用于资源文件

## AI集成
- **AI服务**：ChatAnywhere GPT-3.5 Turbo
- **API端点**：https://api.chatanywhere.tech/v1
- **功能**：个性化任务推荐、习惯建议、随机事件生成
- **降级方案**：AI服务不可用时使用本地智能算法

## 架构模式
- **离线优先**：应用在未部署云函数时也能正常工作
- **服务层**：模块化服务架构（认证、用户、角色、任务、习惯、故事）
- **数据模型**：集中式数据模型定义与验证
- **状态管理**：全局应用状态与本地存储持久化

## 主要依赖
```json
{
  "dependencies": {
    "tdesign-miniprogram": "^1.4.0"
  },
  "cloudFunctions": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

## 开发环境
- **IDE**：微信开发者工具
- **Node.js**：14+（用于云函数）
- **云环境**：cloud1-1gf83xgo315db82d

## 构建与部署命令

### 本地开发
```bash
# 在微信开发者工具中打开项目
# 无需构建步骤 - IDE中直接编译

# 云函数部署
./uploadCloudFunction.sh
```

### 云函数部署
```bash
# 部署RPG云函数
# 在微信开发者工具中右键点击 cloudfunctions/rpgFunctions
# 选择"上传并部署：云端安装依赖"

# 或使用CLI（如已配置）
${installPath} cloud functions deploy --e ${envId} --n rpgFunctions --r --project ${projectPath}
```

### 测试
- **单元测试**：在微信开发者工具模拟器中手动测试
- **设备测试**：微信开发者工具远程调试
- **云函数测试**：云开发控制台测试界面

## 域名白名单要求
需要在微信小程序后台添加以下域名：
- `https://api.chatanywhere.tech`（AI服务）
- `https://openrouter.ai`（备用AI服务）

## 代码风格与规范
- **命名**：变量/函数使用camelCase，组件使用PascalCase
- **文件组织**：模块化结构，包含services/、components/、pages/、utils/
- **错误处理**：使用try-catch块和用户友好的错误信息
- **模块系统**：CommonJS（require/module.exports）- 不支持ES6模块
- **异步模式**：在支持的地方使用Promise和async/await

## 性能考虑
- **本地存储**：大量使用wx.getStorageSync实现离线能力
- **懒加载**：组件按需加载
- **图片优化**：images/目录中的压缩图片
- **数据缓存**：服务层级的频繁访问数据缓存

## 安全特性
- **数据验证**：前端和云函数中的输入验证
- **访问控制**：云数据库中基于用户的数据隔离
- **API安全**：AI服务的安全API密钥和请求头
- **隐私保护**：用户数据本地存储，可选云端同步