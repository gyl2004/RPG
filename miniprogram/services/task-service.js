// 任务管理服务
class TaskService {
  constructor() {
    // 任务分类定义
    this.taskCategories = {
      'fitness': {
        id: 'fitness',
        name: '健身运动',
        icon: '💪',
        color: '#ef4444',
        description: '体育锻炼、健身训练相关任务',
        relatedAttribute: 'strength'
      },
      'study': {
        id: 'study',
        name: '学习成长',
        icon: '📚',
        color: '#3b82f6',
        description: '学习、阅读、技能提升相关任务',
        relatedAttribute: 'intelligence'
      },
      'learning': {
        id: 'learning',
        name: '学习成长',
        icon: '📚',
        color: '#3b82f6',
        description: '学习、阅读、技能提升相关任务',
        relatedAttribute: 'intelligence'
      },
      'productivity': {
        id: 'productivity',
        name: '效率提升',
        icon: '⚡',
        color: '#10b981',
        description: '工作效率、时间管理相关任务',
        relatedAttribute: 'discipline'
      },
      'social': {
        id: 'social',
        name: '社交活动',
        icon: '👥',
        color: '#f59e0b',
        description: '社交、沟通、人际关系相关任务',
        relatedAttribute: 'charisma'
      },
      'creative': {
        id: 'creative',
        name: '创意创作',
        icon: '🎨',
        color: '#8b5cf6',
        description: '艺术创作、创新思维相关任务',
        relatedAttribute: 'creativity'
      },
      'routine': {
        id: 'routine',
        name: '日常规律',
        icon: '📅',
        color: '#059669',
        description: '日常规律、自律管理相关任务',
        relatedAttribute: 'discipline'
      },
      'wellness': {
        id: 'wellness',
        name: '身心健康',
        icon: '🌟',
        color: '#ec4899',
        description: '身心健康、情绪管理相关任务',
        relatedAttribute: 'vitality'
      }
    };

    // 任务难度定义
    this.taskDifficulties = {
      'easy': {
        id: 'easy',
        name: '简单',
        icon: '🟢',
        color: '#22c55e',
        expMultiplier: 1.0,
        coinMultiplier: 1.0,
        description: '轻松完成的任务'
      },
      'normal': {
        id: 'normal',
        name: '普通',
        icon: '🟡',
        color: '#fbbf24',
        expMultiplier: 1.5,
        coinMultiplier: 1.2,
        description: '需要一定努力的任务'
      },
      'medium': {
        id: 'medium',
        name: '中等',
        icon: '🟡',
        color: '#fbbf24',
        expMultiplier: 1.5,
        coinMultiplier: 1.2,
        description: '需要一定努力的任务'
      },
      'hard': {
        id: 'hard',
        name: '困难',
        icon: '🟠',
        color: '#f97316',
        expMultiplier: 2.0,
        coinMultiplier: 1.5,
        description: '具有挑战性的任务'
      },
      'expert': {
        id: 'expert',
        name: '专家',
        icon: '🔴',
        color: '#ef4444',
        expMultiplier: 3.0,
        coinMultiplier: 2.0,
        description: '需要专业技能的任务'
      },
      'legendary': {
        id: 'legendary',
        name: '传奇',
        icon: '🟣',
        color: '#8b5cf6',
        expMultiplier: 5.0,
        coinMultiplier: 3.0,
        description: '极具挑战性的任务'
      }
    };

    // 任务状态定义
    this.taskStatuses = {
      'pending': {
        id: 'pending',
        name: '待开始',
        icon: '⏳',
        color: '#6b7280'
      },
      'in_progress': {
        id: 'in_progress',
        name: '进行中',
        icon: '🔄',
        color: '#3b82f6'
      },
      'completed': {
        id: 'completed',
        name: '已完成',
        icon: '✅',
        color: '#22c55e'
      },
      'failed': {
        id: 'failed',
        name: '已失败',
        icon: '❌',
        color: '#ef4444'
      },
      'cancelled': {
        id: 'cancelled',
        name: '已取消',
        icon: '⭕',
        color: '#6b7280'
      }
    };

    // 验证类型定义
    this.verificationTypes = {
      'none': {
        id: 'none',
        name: '无需记录',
        icon: '✨',
        description: '简单完成，无需留下记录'
      },
      'photo': {
        id: 'photo',
        name: '照片记录',
        icon: '📷',
        description: '拍照留念，记录完成瞬间'
      },
      'note': {
        id: 'note',
        name: '文字记录',
        icon: '📝',
        description: '写下感想，记录心得体会'
      }
    };
  }

  /**
   * 创建新任务
   */
  createTask(taskData) {
    try {
      console.log('TaskService.createTask 被调用:', taskData);

      if (!taskData.title || !taskData.category || !taskData.difficulty) {
        return { success: false, error: '请填写完整的任务信息' };
      }

      const tasks = wx.getStorageSync('userTasks') || [];

      // 检查是否有重复的任务（相同标题且在5秒内创建）
      const now = Date.now();
      const duplicateTask = tasks.find(task =>
        task.title === taskData.title &&
        (now - new Date(task.createdAt).getTime()) < 5000
      );

      if (duplicateTask) {
        console.log('检测到重复任务，静默返回已存在的任务:', duplicateTask);
        // 静默处理，返回已存在的任务作为成功结果
        return {
          success: true,
          task: duplicateTask,
          message: '任务创建成功',
          isDuplicate: true
        };
      }

      const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const rewards = this.calculateTaskRewards(taskData);

      console.log('生成任务ID:', taskId);
      console.log('当前任务数量:', tasks.length);

      const task = {
        id: taskId,
        title: taskData.title,
        description: taskData.description || '',
        category: taskData.category,
        difficulty: taskData.difficulty,
        estimatedTime: taskData.estimatedTime || 30,
        verification: taskData.verification || 'none',
        deadline: taskData.deadline || null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startedAt: null,
        rewards: rewards,
        notes: taskData.notes || '',
        progress: 0,
        completedAt: null,
        verificationData: null,
        progressRecords: []
      };

      tasks.unshift(task);
      wx.setStorageSync('userTasks', tasks);

      console.log('任务创建成功，新任务数量:', tasks.length);
      console.log('创建的任务:', task);

      return {
        success: true,
        task: task,
        message: '任务创建成功'
      };
    } catch (error) {
      console.error('创建任务失败:', error);
      return { success: false, error: '创建任务失败' };
    }
  }

  /**
   * 计算任务奖励
   */
  calculateTaskRewards(taskData) {
    const difficulty = this.taskDifficulties[taskData.difficulty] || this.taskDifficulties['normal'];
    const category = this.taskCategories[taskData.category] || this.taskCategories['routine'];

    if (!difficulty) {
      console.warn('未知的任务难度:', taskData.difficulty, '使用默认难度');
    }

    if (!category) {
      console.warn('未知的任务分类:', taskData.category, '使用默认分类');
    }

    const baseExp = 50;
    const baseCoins = 20;
    const timeMultiplier = Math.max(1, (taskData.estimatedTime || 30) / 30);

    const expReward = Math.floor(baseExp * difficulty.expMultiplier * timeMultiplier);
    const coinReward = Math.floor(baseCoins * difficulty.coinMultiplier * timeMultiplier);

    return {
      experience: expReward,
      coins: coinReward,
      attributeBonus: {
        [category.relatedAttribute]: Math.floor(expReward * 0.1)
      }
    };
  }

  /**
   * 获取用户任务列表
   */
  getUserTasks(filter = {}) {
    try {
      let tasks = wx.getStorageSync('userTasks') || [];

      if (filter.status) {
        tasks = tasks.filter(task => task.status === filter.status);
      }

      if (filter.category) {
        tasks = tasks.filter(task => task.category === filter.category);
      }

      if (filter.difficulty) {
        tasks = tasks.filter(task => task.difficulty === filter.difficulty);
      }

      return tasks;
    } catch (error) {
      console.error('获取任务列表失败:', error);
      return [];
    }
  }

  /**
   * 更新任务状态
   */
  updateTaskStatus(taskId, status, additionalData = {}) {
    console.log('🔧 TaskService.updateTaskStatus 被调用');
    console.log('🔧 参数 - taskId:', taskId, 'status:', status, 'additionalData:', additionalData);

    try {
      const tasks = wx.getStorageSync('userTasks') || [];
      console.log('🔧 当前任务总数:', tasks.length);

      const taskIndex = tasks.findIndex(task => task.id === taskId);
      console.log('🔧 找到任务索引:', taskIndex);

      if (taskIndex === -1) {
        console.error('❌ 任务不存在, taskId:', taskId);
        return { success: false, error: '任务不存在' };
      }

      const task = tasks[taskIndex];
      const oldStatus = task.status;
      console.log('🔧 任务原状态:', oldStatus, '新状态:', status);

      task.status = status;
      task.updatedAt = new Date().toISOString();
      console.log('🔧 任务状态已更新');

      if (status === 'in_progress' && oldStatus === 'pending') {
        task.startedAt = new Date().toISOString();
      }

      if (status === 'completed') {
        task.completedAt = new Date().toISOString();
        task.progress = 100;

        if (additionalData.verificationData) {
          task.verificationData = additionalData.verificationData;
        }

        // 给予任务奖励
        try {
          const rewardService = require('./reward-service.js');
          rewardService.giveRewards(task.rewards);

          // 更新统计数据
          const userRewards = rewardService.getUserRewards();
          userRewards.statistics.totalTasksCompleted++;
          rewardService.saveUserRewards(userRewards);

          // 记录用户活动
          const userService = require('./user-service.js');
          userService.recordUserActivity('task_completed', {
            taskId: task.id,
            taskTitle: task.title,
            taskCategory: task.category,
            rewards: task.rewards
          });

          // 更新故事进度
          try {
            const storyService = require('./story-service.js');
            storyService.updateStoryProgress();
          } catch (error) {
            console.error('更新故事进度失败:', error);
          }
        } catch (error) {
          console.error('给予任务奖励失败:', error);
        }
      }

      if (additionalData.progress !== undefined) {
        task.progress = additionalData.progress;
      }

      tasks[taskIndex] = task;
      wx.setStorageSync('userTasks', tasks);
      console.log('🔧 任务数据已保存到本地存储');

      const result = {
        success: true,
        task: task,
        message: '任务状态更新成功'
      };
      console.log('🔧 TaskService.updateTaskStatus 返回结果:', result);
      return result;
    } catch (error) {
      console.error('💥 更新任务状态失败:', error);
      const errorResult = { success: false, error: '更新任务状态失败' };
      console.log('🔧 TaskService.updateTaskStatus 返回错误:', errorResult);
      return errorResult;
    }
  }

  /**
   * 删除任务
   */
  deleteTask(taskId) {
    try {
      const tasks = wx.getStorageSync('userTasks') || [];
      const taskIndex = tasks.findIndex(task => task.id === taskId);

      if (taskIndex === -1) {
        return { success: false, error: '任务不存在' };
      }

      tasks.splice(taskIndex, 1);
      wx.setStorageSync('userTasks', tasks);

      return {
        success: true,
        message: '任务删除成功'
      };
    } catch (error) {
      console.error('删除任务失败:', error);
      return { success: false, error: '删除任务失败' };
    }
  }

  /**
   * 获取任务统计信息
   */
  getTaskStatistics() {
    try {
      const tasks = wx.getStorageSync('userTasks') || [];

      if (tasks.length === 0) {
        return {
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          failed: 0,
          byCategory: {},
          byDifficulty: {},
          totalRewards: { experience: 0, coins: 0 }
        };
      }

      return {
        total: tasks.length,
        completed: tasks.filter(task => task.status === 'completed').length,
        inProgress: tasks.filter(task => task.status === 'in_progress').length,
        pending: tasks.filter(task => task.status === 'pending').length,
        failed: tasks.filter(task => task.status === 'failed').length,
        byCategory: {},
        byDifficulty: {},
        totalRewards: {
          experience: 0,
          coins: 0
        }
      };
    } catch (error) {
      console.error('获取任务统计失败:', error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        failed: 0,
        byCategory: {},
        byDifficulty: {},
        totalRewards: { experience: 0, coins: 0 }
      };
    }
  }

  /**
   * 获取任务分类信息
   */
  getTaskCategories() {
    return this.taskCategories;
  }

  /**
   * 获取任务难度信息
   */
  getTaskDifficulties() {
    return this.taskDifficulties;
  }

  /**
   * 获取任务状态信息
   */
  getTaskStatuses() {
    return this.taskStatuses;
  }

  /**
   * 获取验证类型信息
   */
  getVerificationTypes() {
    return this.verificationTypes;
  }

  /**
   * 根据ID获取任务
   */
  getTaskById(taskId) {
    try {
      const tasks = wx.getStorageSync('userTasks') || [];
      return tasks.find(task => task.id === taskId) || null;
    } catch (error) {
      console.error('获取任务失败:', error);
      return null;
    }
  }

  /**
   * 添加阶段性记录
   */
  addProgressRecord(taskId, recordData) {
    try {
      const tasks = wx.getStorageSync('userTasks') || [];
      const taskIndex = tasks.findIndex(task => task.id === taskId);

      if (taskIndex === -1) {
        return { success: false, error: '任务不存在' };
      }

      const task = tasks[taskIndex];

      if (!task.progressRecords) {
        task.progressRecords = [];
      }

      const record = {
        id: 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        type: recordData.type,
        timestamp: new Date().toISOString(),
        progress: recordData.progress || task.progress || 0,
        data: recordData.data || {}
      };

      task.progressRecords.unshift(record);
      task.updatedAt = new Date().toISOString();
      tasks[taskIndex] = task;
      wx.setStorageSync('userTasks', tasks);

      return {
        success: true,
        record,
        message: '记录添加成功'
      };
    } catch (error) {
      console.error('添加阶段性记录失败:', error);
      return { success: false, error: '添加记录失败' };
    }
  }

  /**
   * 删除阶段性记录
   */
  deleteProgressRecord(taskId, recordId) {
    try {
      const tasks = wx.getStorageSync('userTasks') || [];
      const taskIndex = tasks.findIndex(task => task.id === taskId);

      if (taskIndex === -1) {
        return { success: false, error: '任务不存在' };
      }

      const task = tasks[taskIndex];

      if (!task.progressRecords) {
        return { success: false, error: '记录不存在' };
      }

      const recordIndex = task.progressRecords.findIndex(record => record.id === recordId);
      if (recordIndex === -1) {
        return { success: false, error: '记录不存在' };
      }

      task.progressRecords.splice(recordIndex, 1);
      task.updatedAt = new Date().toISOString();
      tasks[taskIndex] = task;
      wx.setStorageSync('userTasks', tasks);

      return {
        success: true,
        message: '记录删除成功'
      };
    } catch (error) {
      console.error('删除阶段性记录失败:', error);
      return { success: false, error: '删除记录失败' };
    }
  }
}

// 导出单例实例
const taskService = new TaskService();
module.exports = taskService;
