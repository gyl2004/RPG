// 数据库管理页面
const dbInitializer = require('../../utils/db-init.js');
const { DATABASE_SCHEMA } = require('../../utils/db-schema.js');
const dbIndexManager = require('../../utils/db-indexes.js');
const dbSecurityManager = require('../../utils/db-security.js');
const modelInterface = require('../../utils/model-interface.js');
const databaseManager = require('../../utils/database.js');

Page({
  data: {
    dbStatus: {},
    indexRecommendations: {},
    securitySummary: {},
    modelTypes: [],
    loading: false,
    logs: [],
    activeTab: 'status' // status, indexes, security, models, logs
  },

  onLoad: function() {
    this.loadDatabaseStatus();
    this.loadIndexRecommendations();
    this.loadSecuritySummary();
    this.loadModelTypes();
  },

  // 加载数据库状态
  async loadDatabaseStatus() {
    this.setData({ loading: true });
    
    try {
      const status = await dbInitializer.getDatabaseStatus();
      this.setData({ 
        dbStatus: status,
        loading: false 
      });
      this.addLog('数据库状态加载完成');
    } catch (error) {
      this.setData({ loading: false });
      this.addLog(`加载数据库状态失败: ${error.message}`, 'error');
    }
  },

  // 初始化数据库
  async initializeDatabase() {
    this.setData({ loading: true });
    this.addLog('开始初始化数据库...');

    try {
      const result = await dbInitializer.initializeDatabase();
      
      if (result.success) {
        this.addLog('数据库初始化成功', 'success');
        wx.showToast({
          title: '初始化成功',
          icon: 'success'
        });
        
        // 重新加载状态
        await this.loadDatabaseStatus();
      } else {
        this.addLog(`数据库初始化失败: ${result.error}`, 'error');
        wx.showToast({
          title: '初始化失败',
          icon: 'error'
        });
      }
    } catch (error) {
      this.addLog(`数据库初始化异常: ${error.message}`, 'error');
      wx.showToast({
        title: '初始化异常',
        icon: 'error'
      });
    }

    this.setData({ loading: false });
  },

  // 清空数据库（仅开发环境）
  async clearDatabase() {
    const result = await wx.showModal({
      title: '危险操作',
      content: '确定要清空所有数据库数据吗？此操作不可恢复！',
      confirmText: '确定清空',
      confirmColor: '#ff4444'
    });

    if (!result.confirm) return;

    this.setData({ loading: true });
    this.addLog('开始清空数据库...', 'warning');

    try {
      await dbInitializer.clearAllData();
      this.addLog('数据库清空完成', 'warning');
      
      wx.showToast({
        title: '清空完成',
        icon: 'success'
      });
      
      // 重新加载状态
      await this.loadDatabaseStatus();
    } catch (error) {
      this.addLog(`清空数据库失败: ${error.message}`, 'error');
      wx.showToast({
        title: '清空失败',
        icon: 'error'
      });
    }

    this.setData({ loading: false });
  },

  // 查看集合详情
  viewCollectionDetails(e) {
    const collectionName = e.currentTarget.dataset.collection;
    const schema = DATABASE_SCHEMA[collectionName];
    
    if (!schema) {
      wx.showToast({
        title: '集合不存在',
        icon: 'error'
      });
      return;
    }

    wx.showModal({
      title: `集合: ${collectionName}`,
      content: `描述: ${schema.description}\n字段数: ${Object.keys(schema.fields).length}\n索引数: ${schema.indexes.length}`,
      showCancel: false
    });
  },

  // 测试云函数连接
  async testCloudFunction() {
    this.setData({ loading: true });
    this.addLog('测试云函数连接...');

    try {
      const result = await wx.cloud.callFunction({
        name: 'rpgFunctions',
        data: {
          type: 'test',
          data: { message: 'Hello from admin page' }
        }
      });

      if (result.result) {
        this.addLog('云函数连接正常', 'success');
        wx.showToast({
          title: '连接正常',
          icon: 'success'
        });
      } else {
        this.addLog('云函数连接异常', 'error');
        wx.showToast({
          title: '连接异常',
          icon: 'error'
        });
      }
    } catch (error) {
      this.addLog(`云函数连接失败: ${error.message}`, 'error');
      wx.showToast({
        title: '连接失败',
        icon: 'error'
      });
    }

    this.setData({ loading: false });
  },

  // 添加日志
  addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const log = {
      id: Date.now(),
      timestamp,
      message,
      type
    };

    const logs = [log, ...this.data.logs.slice(0, 49)]; // 保留最近50条
    this.setData({ logs });
  },

  // 清空日志
  clearLogs() {
    this.setData({ logs: [] });
  },

  // 刷新状态
  refreshStatus() {
    this.loadDatabaseStatus();
  },

  // 导出数据库状态
  exportStatus() {
    const statusText = JSON.stringify(this.data.dbStatus, null, 2);

    wx.setClipboardData({
      data: statusText,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 加载索引推荐
  loadIndexRecommendations() {
    try {
      const recommendations = dbIndexManager.getRecommendedIndexes();
      this.setData({ indexRecommendations: recommendations });
      this.addLog('索引推荐加载完成');
    } catch (error) {
      this.addLog(`加载索引推荐失败: ${error.message}`, 'error');
    }
  },

  // 创建索引
  async createIndexes() {
    this.setData({ loading: true });
    this.addLog('开始创建数据库索引...');

    try {
      const results = await dbIndexManager.createAllIndexes();

      let successCount = 0;
      let failCount = 0;

      results.forEach(result => {
        if (result.success) {
          successCount++;
          this.addLog(`${result.collection} 索引配置完成`, 'success');
        } else {
          failCount++;
          this.addLog(`${result.collection} 索引配置失败: ${result.error}`, 'error');
        }
      });

      this.addLog(`索引创建完成: 成功 ${successCount} 个，失败 ${failCount} 个`, 'info');

      wx.showToast({
        title: `配置完成 ${successCount}/${results.length}`,
        icon: successCount === results.length ? 'success' : 'none'
      });
    } catch (error) {
      this.addLog(`创建索引异常: ${error.message}`, 'error');
      wx.showToast({
        title: '创建失败',
        icon: 'error'
      });
    }

    this.setData({ loading: false });
  },

  // 生成索引脚本
  generateIndexScript() {
    try {
      const script = dbIndexManager.generateIndexScript();

      wx.setClipboardData({
        data: script,
        success: () => {
          wx.showToast({
            title: '脚本已复制到剪贴板',
            icon: 'success'
          });
          this.addLog('索引创建脚本已生成并复制', 'success');
        }
      });
    } catch (error) {
      this.addLog(`生成索引脚本失败: ${error.message}`, 'error');
      wx.showToast({
        title: '生成失败',
        icon: 'error'
      });
    }
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 查看索引详情
  viewIndexDetails(e) {
    const collection = e.currentTarget.dataset.collection;
    const indexes = this.data.indexRecommendations[collection] || [];

    if (indexes.length === 0) {
      wx.showToast({
        title: '该集合无推荐索引',
        icon: 'none'
      });
      return;
    }

    const content = indexes.map(index =>
      `${index.field} (${index.reason})`
    ).join('\n');

    wx.showModal({
      title: `${collection} 推荐索引`,
      content: content,
      showCancel: false
    });
  },

  // 加载安全规则摘要
  loadSecuritySummary() {
    try {
      const summary = dbSecurityManager.getSecuritySummary();
      const validation = dbSecurityManager.validateSecurityRules();

      this.setData({
        securitySummary: {
          ...summary,
          validation
        }
      });
      this.addLog('安全规则摘要加载完成');
    } catch (error) {
      this.addLog(`加载安全规则摘要失败: ${error.message}`, 'error');
    }
  },

  // 生成安全规则脚本
  generateSecurityScript() {
    try {
      const script = dbSecurityManager.generateSecurityScript();

      wx.setClipboardData({
        data: script,
        success: () => {
          wx.showToast({
            title: '安全规则已复制到剪贴板',
            icon: 'success'
          });
          this.addLog('安全规则脚本已生成并复制', 'success');
        }
      });
    } catch (error) {
      this.addLog(`生成安全规则脚本失败: ${error.message}`, 'error');
      wx.showToast({
        title: '生成失败',
        icon: 'error'
      });
    }
  },

  // 验证安全规则
  validateSecurityRules() {
    try {
      const validation = dbSecurityManager.validateSecurityRules();

      let message = `验证完成\n`;
      message += `错误: ${validation.errors.length} 个\n`;
      message += `警告: ${validation.warnings.length} 个`;

      if (validation.errors.length > 0) {
        message += `\n\n错误:\n${validation.errors.join('\n')}`;
      }

      if (validation.warnings.length > 0) {
        message += `\n\n警告:\n${validation.warnings.join('\n')}`;
      }

      wx.showModal({
        title: '安全规则验证',
        content: message,
        showCancel: false
      });

      this.addLog(`安全规则验证: ${validation.valid ? '通过' : '失败'}`,
                  validation.valid ? 'success' : 'warning');
    } catch (error) {
      this.addLog(`验证安全规则失败: ${error.message}`, 'error');
      wx.showToast({
        title: '验证失败',
        icon: 'error'
      });
    }
  },

  // 查看集合安全规则
  viewSecurityRules(e) {
    const collection = e.currentTarget.dataset.collection;
    const rules = dbSecurityManager.getCollectionSecurityRules(collection);

    if (!rules) {
      wx.showToast({
        title: '该集合无安全规则',
        icon: 'none'
      });
      return;
    }

    let content = `${rules.description}\n\n`;
    if (rules.read) content += `读取: ${rules.read.description}\n`;
    if (rules.write) content += `写入: ${rules.write.description}\n`;
    if (rules.create) content += `创建: ${rules.create.description}\n`;
    if (rules.delete) content += `删除: ${rules.delete.description}`;

    wx.showModal({
      title: `${collection} 安全规则`,
      content: content,
      showCancel: false
    });
  },

  // 加载模型类型
  loadModelTypes() {
    try {
      const types = modelInterface.getSupportedModelTypes();
      this.setData({ modelTypes: types });
      this.addLog(`支持的模型类型: ${types.join(', ')}`);
    } catch (error) {
      this.addLog(`加载模型类型失败: ${error.message}`, 'error');
    }
  },

  // 测试模型接口
  async testModelInterface() {
    this.setData({ loading: true });
    this.addLog('开始测试模型接口...');

    try {
      // 测试用户模型
      await this.testUserModel();

      // 测试角色模型
      await this.testCharacterModel();

      // 测试任务模型
      await this.testTaskModel();

      this.addLog('模型接口测试完成', 'success');
      wx.showToast({
        title: '测试完成',
        icon: 'success'
      });
    } catch (error) {
      this.addLog(`模型接口测试失败: ${error.message}`, 'error');
      wx.showToast({
        title: '测试失败',
        icon: 'error'
      });
    }

    this.setData({ loading: false });
  },

  // 测试用户模型
  async testUserModel() {
    this.addLog('测试用户模型...');

    // 创建测试用户数据
    const testUserData = {
      openid: 'test_openid_' + Date.now(),
      nickname: '测试用户',
      avatarUrl: 'https://example.com/avatar.jpg'
    };

    // 验证数据
    const validation = modelInterface.validateModel('user', testUserData);
    if (validation.valid) {
      this.addLog('用户数据验证通过', 'success');
    } else {
      this.addLog(`用户数据验证失败: ${validation.errors.join(', ')}`, 'error');
      return;
    }

    // 创建模型实例
    const userModel = modelInterface.createModel('user', testUserData);
    this.addLog(`用户模型创建成功: ${userModel.nickname}`);

    // 测试数据库操作
    const createResult = await databaseManager.createModel('user', testUserData);
    if (createResult.success) {
      this.addLog('用户模型数据库创建成功', 'success');

      // 清理测试数据
      await databaseManager.deleteModel('user', createResult.data.id);
      this.addLog('测试用户数据已清理');
    } else {
      this.addLog(`用户模型数据库创建失败: ${createResult.error}`, 'error');
    }
  },

  // 测试角色模型
  async testCharacterModel() {
    this.addLog('测试角色模型...');

    const testCharacterData = {
      userId: 'test_user_id',
      name: '测试角色',
      class: 'warrior',
      level: 5,
      experience: 250
    };

    const validation = modelInterface.validateModel('character', testCharacterData);
    if (validation.valid) {
      this.addLog('角色数据验证通过', 'success');
    } else {
      this.addLog(`角色数据验证失败: ${validation.errors.join(', ')}`, 'error');
      return;
    }

    const characterModel = modelInterface.createModel('character', testCharacterData);
    this.addLog(`角色模型创建成功: ${characterModel.name} Lv.${characterModel.level}`);

    // 测试业务逻辑
    const expPercent = characterModel.getExpProgress();
    this.addLog(`角色经验进度: ${expPercent}%`);
  },

  // 测试任务模型
  async testTaskModel() {
    this.addLog('测试任务模型...');

    const testTaskData = {
      creatorId: 'test_user_id',
      assigneeIds: ['test_user_id'],
      title: '测试任务',
      description: '这是一个测试任务',
      category: 'learning',
      difficulty: 3
    };

    const validation = modelInterface.validateModel('task', testTaskData);
    if (validation.valid) {
      this.addLog('任务数据验证通过', 'success');
    } else {
      this.addLog(`任务数据验证失败: ${validation.errors.join(', ')}`, 'error');
      return;
    }

    const taskModel = modelInterface.createModel('task', testTaskData);
    this.addLog(`任务模型创建成功: ${taskModel.title}`);

    // 测试业务逻辑
    taskModel.updateProgress(50);
    this.addLog(`任务进度更新: ${taskModel.progress}%`);
  },

  // 创建默认模型
  createDefaultModel(e) {
    const modelType = e.currentTarget.dataset.type;

    try {
      const defaultModel = modelInterface.createDefault(modelType);
      const modelData = modelInterface.toDatabase(defaultModel);

      wx.showModal({
        title: `${modelType} 默认模型`,
        content: JSON.stringify(modelData, null, 2),
        showCancel: false
      });

      this.addLog(`创建${modelType}默认模型成功`);
    } catch (error) {
      this.addLog(`创建${modelType}默认模型失败: ${error.message}`, 'error');
      wx.showToast({
        title: '创建失败',
        icon: 'error'
      });
    }
  }
});
