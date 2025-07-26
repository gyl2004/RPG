# 项目结构与组织

## 根目录结构
```
miniprogram-1/
├── miniprogram/                 # 小程序主目录
├── cloudfunctions/             # 云函数目录
├── design.md                   # 设计文档
├── README.md                   # 项目文档
├── project.config.json         # 微信项目配置
├── uploadCloudFunction.sh      # 云函数部署脚本
└── *.md                        # 中文文档文件
```

## 小程序结构 (`miniprogram/`)
```
miniprogram/
├── pages/                      # 页面组件
│   ├── index/                  # 首页
│   ├── login/                  # 登录页面
│   ├── character/              # 角色管理
│   ├── tasks/                  # 任务中心
│   ├── habits/                 # 习惯中心
│   ├── story/                  # 故事线和个性化
│   ├── ai-tasks/               # AI任务推荐
│   ├── ai-test/                # AI服务测试
│   └── settings/               # 用户设置
├── components/                 # 可复用组件
│   └── rpg-button/             # 自定义RPG风格按钮
├── services/                   # 业务逻辑层
│   ├── auth-service.js         # 认证服务
│   ├── user-service.js         # 用户管理
│   ├── character-service.js    # 角色系统
│   ├── task-service.js         # 任务管理
│   ├── habit-service.js        # 习惯追踪
│   ├── story-service.js        # 故事线和AI功能
│   └── deepseek-ai-service.js  # AI集成
├── utils/                      # 工具函数
│   ├── index.js                # 通用工具
│   └── database.js             # 数据库助手
├── models/                     # 数据模型
│   └── index.js                # 模型定义
├── constants/                  # 应用常量
│   └── index.js                # 常量定义
├── images/                     # 静态图片资源
├── app.js                      # 应用入口点
├── app.json                    # 应用配置
├── app.wxss                    # 全局样式
├── theme.wxss                  # 主题系统
└── package.json                # 依赖项
```

## 云函数结构 (`cloudfunctions/`)
```
cloudfunctions/
├── rpgFunctions/               # 主要RPG云函数
│   ├── index.js                # 函数入口点
│   ├── package.json            # 依赖项
│   └── config.json             # 函数配置
├── quickstartFunctions/        # 快速开始函数
└── initDatabase/               # 数据库初始化
```

## 页面组织模式

### 标准页面结构
每个页面遵循以下结构：
```
pages/[页面名称]/
├── [页面名称].js              # 页面逻辑
├── [页面名称].wxml            # 页面标记
├── [页面名称].wxss            # 页面样式
└── [页面名称].json            # 页面配置
```

### 页面分类
- **核心页面**：index、character、tasks、habits（在tabBar中）
- **功能页面**：story、ai-tasks、rewards、settings
- **工具页面**：login、ai-test、admin
- **详情页面**：task-detail、habit-detail、create-* 页面

## 服务层架构

### 服务职责
- **auth-service.js**：用户认证、登录/登出
- **user-service.js**：用户资料、设置、统计
- **character-service.js**：角色属性、升级、外观
- **task-service.js**：任务增删改查、完成、奖励
- **habit-service.js**：习惯追踪、连击、分析
- **story-service.js**：故事线、AI推荐、事件
- **deepseek-ai-service.js**：AI集成、提示词工程

### 服务通信模式
```javascript
// 服务使用CommonJS模块系统
const userService = require('../../services/user-service.js');
const characterService = require('../../services/character-service.js');

// 服务可以相互调用但避免循环依赖
// 使用app.globalData共享状态
```

## 数据流架构

### 本地优先模式
```
用户操作 → 页面逻辑 → 服务层 → 本地存储
                                ↓
                        云端同步（可选）
```

### 状态管理
- **全局状态**：`app.globalData`用于用户、角色、登录状态
- **本地存储**：`wx.getStorageSync/setStorageSync`用于持久化
- **页面状态**：`this.data`用于页面特定状态
- **服务缓存**：服务模块中的内存缓存

## 组件系统

### 自定义组件
- **rpg-button**：带RPG样式的主题按钮
- **未来组件**：rpg-card、rpg-modal、rpg-progress-bar

### 组件使用
```javascript
// 在app.json全局组件中
"usingComponents": {
  "rpg-button": "/components/rpg-button/rpg-button"
}

// 在页面WXML中
<rpg-button text="开始冒险" bindtap="startAdventure" />
```

## 文件命名约定

### 文件和目录
- **页面**：kebab-case（如`create-task`、`task-detail`）
- **服务**：kebab-case加后缀（如`user-service.js`）
- **组件**：kebab-case（如`rpg-button`）
- **工具**：camelCase（如`database.js`）

### 代码命名
- **变量/函数**：camelCase（如`getUserInfo`、`taskData`）
- **常量**：UPPER_SNAKE_CASE（如`API_ENDPOINTS`）
- **类**：PascalCase（如`TaskService`、`CharacterManager`）
- **组件属性**：camelCase（如`bindtap`、`customData`）

## 资源组织

### 图片
```
images/
├── icons/                      # UI图标
├── characters/                 # 角色头像
├── backgrounds/                # 背景图片
└── *.png                       # 标签栏图标
```

### 样式
- **app.wxss**：全局样式和重置
- **theme.wxss**：RPG主题系统（颜色、字体、效果）
- **页面样式**：组件特定样式

## 配置文件

### 关键配置
- **app.json**：页面、tabBar、权限、组件
- **project.config.json**：微信项目设置、云环境
- **package.json**：依赖项和项目元数据
- **config.json**：云函数权限和触发器

## 开发工作流

### 添加新功能
1. 在`pages/`目录中创建页面
2. 将页面添加到`app.json`页面数组
3. 如需要在`services/`中创建服务
4. 将常量添加到`constants/index.js`
5. 在`models/index.js`中更新模型
6. 在微信开发者工具中测试

### 服务开发
1. 在`services/`中创建服务文件
2. 使用CommonJS导出：`module.exports = serviceObject`
3. 使用try-catch块处理错误
4. 为离线场景提供降级方案
5. 缓存频繁访问的数据

## 导入/导出模式

### 服务导入
```javascript
// 微信小程序的正确模式
const taskService = require('../../services/task-service.js');

// 避免ES6导入（不支持）
// import taskService from '../../services/task-service.js'; // ❌
```

### 模块导出
```javascript
// 服务导出模式
const taskService = {
  createTask: function(taskData) { /* ... */ },
  getTasks: function() { /* ... */ }
};

module.exports = taskService;
```

这种结构支持离线优先架构，同时保持清晰的关注点分离和未来功能的可扩展性。