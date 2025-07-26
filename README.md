# 现实世界RPG微信小程序

一款将用户日常生活转化为沉浸式角色扮演游戏体验的微信小程序。

## 项目结构

```
miniprogram-1/
├── miniprogram/                 # 小程序主目录
│   ├── pages/                   # 页面目录
│   │   ├── index/              # 首页
│   │   ├── character/          # 角色页面
│   │   ├── tasks/              # 任务中心
│   │   ├── habits/             # 习惯中心
│   │   ├── social/             # 社交中心
│   │   └── profile/            # 个人资料
│   ├── components/             # 组件目录
│   │   └── rpg-button/         # RPG风格按钮组件
│   ├── utils/                  # 工具函数
│   │   ├── index.js            # 通用工具函数
│   │   └── database.js         # 数据库工具类
│   ├── services/               # 服务层
│   │   └── index.js            # 云函数调用服务
│   ├── models/                 # 数据模型
│   │   └── index.js            # 数据模型定义
│   ├── constants/              # 常量定义
│   │   └── index.js            # 应用常量
│   ├── images/                 # 图片资源
│   ├── app.js                  # 应用入口
│   ├── app.json                # 应用配置
│   ├── app.wxss                # 全局样式
│   └── theme.wxss              # 主题样式
├── cloudfunctions/             # 云函数目录
│   ├── rpgFunctions/           # RPG游戏云函数
│   └── quickstartFunctions/    # 快速开始云函数
├── design.md                   # 设计文档
├── 任务文档.md                 # 开发任务文档
├── 进度文档.md                 # 开发进度记录
└── README.md                   # 项目说明
```

## 功能特性

### 已完成功能
- [x] 项目基础架构搭建
- [x] 微信小程序项目创建
- [x] 自定义RPG风格组件库
- [x] 云开发环境配置
- [x] 数据库工具类
- [x] 服务层架构
- [x] 数据模型定义
- [x] 首页UI设计

### 计划功能
- [ ] 角色系统
- [ ] 任务系统
- [ ] 习惯培养系统
- [ ] 奖励机制
- [ ] 社交互动
- [ ] 心理健康追踪
- [ ] 故事线系统

## 技术栈

- **前端**: 微信小程序原生框架
- **UI组件**: 自定义RPG风格组件
- **后端**: 微信云开发
- **数据库**: 微信云数据库
- **云函数**: Node.js

## 开发环境

1. 微信开发者工具
2. Node.js 14+
3. 微信云开发环境

## 安装和运行

1. 克隆项目到本地
2. 使用微信开发者工具打开项目
3. 配置云开发环境ID
4. 上传并部署云函数
5. 编译运行

## 项目配置

### 云开发环境配置
在 `miniprogram/app.js` 中配置云开发环境ID：
```javascript
env: "your-cloud-env-id"
```

### 数据库集合
项目使用以下数据库集合：
- users: 用户信息
- characters: 角色信息
- tasks: 任务数据
- habits: 习惯数据
- items: 物品数据
- inventory: 用户库存
- socialRelations: 社交关系
- teams: 团队信息
- moodLogs: 情绪记录
- storylines: 故事线

## 开发规范

### 代码风格
- 使用ES6+语法
- 遵循camelCase命名规范
- 组件使用PascalCase命名
- 常量使用UPPER_SNAKE_CASE命名

### 文件组织
- 页面文件放在pages目录下
- 可复用组件放在components目录下
- 工具函数放在utils目录下
- 业务逻辑放在services目录下
- 数据模型放在models目录下
- 常量定义放在constants目录下

### Git提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 更新日志

### v1.0.0 (2025-07-23)
- 初始项目搭建
- 基础架构完成
- 首页UI实现
- 云开发环境配置

## 参考文档

- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

