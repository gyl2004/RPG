// AI任务推荐页面
import { checkLoginAndRedirect } from '../../utils/auth-helper.js';

Page({
  data: {
    aiTaskRecommendations: [],
    userProfile: {},
    emotionalState: {},
    characterGrowth: {},
    loading: false,
    refreshing: false
  },

  onLoad: function() {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/ai-tasks/ai-tasks')) {
      return;
    }
    
    this.loadAIRecommendations();
  },

  onShow: function() {
    // 每次显示时刷新数据
    this.loadAIRecommendations();
  },

  /**
   * 加载AI推荐数据
   */
  loadAIRecommendations() {
    try {
      this.setData({ loading: true });

      const storyService = this.getStoryService();
      if (!storyService) {
        console.error('❌ 无法获取故事服务，使用默认数据');
        this.setData({
          aiTaskRecommendations: this.getDefaultRecommendations(),
          loading: false
        });
        return;
      }

      // 获取AI推荐数据
      const aiTaskRecommendations = storyService.getAITaskRecommendations();
      const userProfile = storyService.getUserProfile();
      const emotionalState = storyService.getEmotionalState();
      const characterGrowth = storyService.getCharacterGrowthTracking();

      console.log('AI任务推荐数据:', aiTaskRecommendations);
      console.log('用户配置:', userProfile);
      console.log('情感状态:', emotionalState);

      this.setData({
        aiTaskRecommendations,
        userProfile,
        emotionalState,
        characterGrowth
      });

    } catch (error) {
      console.error('加载AI推荐失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 获取故事服务
   */
  getStoryService() {
    try {
      console.log('🔍 尝试加载完整故事服务...');
      const storyService = require('../../services/story-service.js');
      console.log('✅ 完整故事服务加载成功:', typeof storyService);
      return storyService;
    } catch (error) {
      console.error('❌ 完整故事服务加载失败:', error);

      // 降级到简化版故事服务
      try {
        console.log('🔄 降级到简化版故事服务...');
        const storyServiceLite = require('./story-service-lite.js');
        console.log('✅ 简化版故事服务加载成功');
        return storyServiceLite;
      } catch (liteError) {
        console.error('❌ 简化版故事服务也失败:', liteError);
        return null;
      }
    }
  },

  /**
   * 刷新AI推荐
   */
  refreshAIRecommendations() {
    this.setData({ refreshing: true });
    
    setTimeout(() => {
      this.loadAIRecommendations();
      this.setData({ refreshing: false });
      
      wx.showToast({
        title: '推荐已更新',
        icon: 'success'
      });
    }, 1000);
  },

  /**
   * 创建AI推荐任务
   */
  createAITask(e) {
    const taskIndex = e.currentTarget.dataset.taskIndex;
    const task = this.data.aiTaskRecommendations[taskIndex];

    if (!task) {
      wx.showToast({
        title: '任务数据不存在',
        icon: 'error'
      });
      return;
    }

    // 显示确认对话框
    wx.showModal({
      title: '创建任务',
      content: `确定要创建任务"${task.title}"吗？\n\n${task.personalizedReason}`,
      confirmText: '创建',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.doCreateAITask(task, taskIndex);
        }
      }
    });
  },

  /**
   * 执行创建AI任务
   */
  doCreateAITask(task, taskIndex) {
    try {
      wx.showLoading({ title: '创建中...' });

      // 获取任务服务
      const taskService = require('../../services/task-service.js');

      // 准备任务数据
      const taskData = {
        title: task.title,
        description: `${task.description}\n\n💡 AI推荐理由：${task.personalizedReason}`,
        category: task.category || 'routine',
        difficulty: task.difficulty || 'medium',
        estimatedTime: task.estimatedTime || 30,
        notes: `AI生成任务 - ${task.source || 'chatanywhere_gpt'}`,
        verification: 'self',
        source: 'ai_generated'
      };

      // 创建任务
      const result = taskService.createTask(taskData);

      wx.hideLoading();

      if (result.success) {
        // 标记任务为已创建
        const updatedRecommendations = [...this.data.aiTaskRecommendations];
        updatedRecommendations[taskIndex] = {
          ...updatedRecommendations[taskIndex],
          isCreated: true,
          createdTaskId: result.task.id
        };

        this.setData({
          aiTaskRecommendations: updatedRecommendations
        });

        wx.showToast({
          title: '✅ 任务创建成功',
          icon: 'none',
          duration: 2000
        });

        // 询问是否跳转到任务页面
        setTimeout(() => {
          wx.showModal({
            title: '任务已创建',
            content: '任务已成功创建！是否前往任务页面查看？',
            confirmText: '前往',
            cancelText: '留在这里',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.switchTab({
                  url: '/pages/tasks/tasks'
                });
              }
            }
          });
        }, 1500);

      } else {
        wx.showToast({
          title: result.error || '创建失败',
          icon: 'error'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('创建AI任务失败:', error);
      wx.showToast({
        title: '创建失败',
        icon: 'error'
      });
    }
  },

  /**
   * 跳转到任务页面
   */
  goToTasks() {
    wx.switchTab({
      url: '/pages/tasks/tasks'
    });
  },

  /**
   * 重置推荐状态（用于测试）
   */
  resetRecommendationStatus() {
    const updatedRecommendations = this.data.aiTaskRecommendations.map(task => ({
      ...task,
      isCreated: false,
      createdTaskId: null
    }));

    this.setData({
      aiTaskRecommendations: updatedRecommendations
    });

    wx.showToast({
      title: '状态已重置',
      icon: 'success'
    });
  },

  /**
   * 查看任务详情
   */
  viewTaskDetail(e) {
    const taskIndex = e.currentTarget.dataset.taskIndex;
    const task = this.data.aiTaskRecommendations[taskIndex];
    
    if (!task) return;

    wx.showModal({
      title: task.title,
      content: `${task.description}\n\n推荐理由：${task.personalizedReason}\n\n预计时间：${task.estimatedTime}分钟\n奖励：${task.estimatedReward.coins}金币 + ${task.estimatedReward.experience}经验`,
      confirmText: '创建任务',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.createAITask(e);
        }
      }
    });
  },

  /**
   * 获取难度颜色
   */
  getDifficultyColor(difficulty) {
    switch (difficulty) {
      case 'easy': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  },

  /**
   * 获取难度文本
   */
  getDifficultyText(difficulty) {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return '未知';
    }
  },

  /**
   * 格式化情感值显示
   */
  formatEmotionValue(value) {
    if (value >= 80) return '很高';
    if (value >= 60) return '较高';
    if (value >= 40) return '中等';
    if (value >= 20) return '较低';
    return '很低';
  },

  /**
   * 测试DeepSeek AI连接
   */
  async testAIConnection() {
    try {
      wx.showLoading({ title: '测试AI连接...' });

      const deepSeekAI = require('../../services/deepseek-ai-service.js');
      const result = await deepSeekAI.testConnection();

      wx.hideLoading();

      if (result.success) {
        wx.showModal({
          title: '✅ AI连接成功',
          content: `DeepSeek R1 API连接正常\n响应: ${result.response}`,
          showCancel: false
        });
      } else {
        wx.showModal({
          title: '❌ AI连接失败',
          content: `错误信息: ${result.error}`,
          showCancel: false
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('测试AI连接失败:', error);
      wx.showModal({
        title: '❌ 测试失败',
        content: `无法连接到AI服务: ${error.message}`,
        showCancel: false
      });
    }
  },

  /**
   * 使用真实AI生成推荐
   */
  async generateRealAIRecommendations() {
    try {
      wx.showLoading({ title: 'AI分析中...' });

      const storyService = this.getStoryService();
      if (!storyService) {
        throw new Error('故事服务不可用');
      }

      // 调用异步AI推荐方法
      const aiRecommendations = await storyService.getAITaskRecommendationsAsync();

      wx.hideLoading();

      this.setData({ aiTaskRecommendations: aiRecommendations });

      if (aiRecommendations.length > 0) {
        const isRealAI = aiRecommendations[0].source === 'chatanywhere_gpt';
        if (isRealAI) {
          wx.showToast({
            title: '✅ AI推荐生成成功',
            icon: 'none',
            duration: 2000
          });
        } else {
          // 检查是否是速率限制导致的降级
          const hasRateLimitNote = aiRecommendations[0].aiNote &&
            aiRecommendations[0].aiNote.includes('速率限制');

          wx.showModal({
            title: '⚠️ 使用本地算法',
            content: hasRateLimitNote ?
              'API调用频率限制，已为您使用本地智能算法生成推荐。' :
              'AI服务暂时不可用，已为您使用本地智能算法生成推荐。',
            showCancel: false,
            confirmText: '了解'
          });
        }
      } else {
        wx.showToast({
          title: '未生成推荐',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('AI推荐生成失败:', error);

      // 特别处理速率限制错误
      if (error.message.includes('请等待') || error.message.includes('Rate limit')) {
        wx.showModal({
          title: '⏰ 速率限制',
          content: '免费版本每分钟只能调用1次AI。请稍后再试，或使用本地推荐算法。',
          confirmText: '使用本地推荐',
          cancelText: '稍后再试',
          success: (res) => {
            if (res.confirm) {
              this.generateTestRecommendations();
            }
          }
        });
      } else {
        wx.showToast({
          title: '生成失败',
          icon: 'error'
        });
      }
    }
  },

  /**
   * 生成测试推荐（用于演示）
   */
  generateTestRecommendations() {
    const testTasks = [
      {
        id: 'test_1',
        title: '15分钟快速整理',
        description: '整理桌面或房间的一个小角落',
        category: 'organization',
        difficulty: 'easy',
        estimatedTime: 15,
        aiReason: '提升环境整洁度',
        priority: 8,
        tags: ['整理', '环境'],
        personalizedReason: '基于你的当前状态，整理环境能帮助提升专注力',
        estimatedReward: { coins: 30, experience: 50 }
      },
      {
        id: 'test_2',
        title: '学习新知识',
        description: '花30分钟学习一个感兴趣的新话题',
        category: 'learning',
        difficulty: 'medium',
        estimatedTime: 30,
        aiReason: '提升智慧属性',
        priority: 7,
        tags: ['学习', '成长'],
        personalizedReason: '根据你的学习偏好，这个任务能有效提升你的知识储备',
        estimatedReward: { coins: 50, experience: 100 }
      },
      {
        id: 'test_3',
        title: '创意表达时间',
        description: '进行20分钟的创意活动，如画画、写作或手工',
        category: 'creative',
        difficulty: 'medium',
        estimatedTime: 20,
        aiReason: '提升创造力',
        priority: 6,
        tags: ['创意', '艺术'],
        personalizedReason: '基于你的角色类型，创意活动能激发你的潜能',
        estimatedReward: { coins: 40, experience: 80 }
      }
    ];

    this.setData({ aiTaskRecommendations: testTasks });
    
    wx.showToast({
      title: '已生成测试推荐',
      icon: 'success'
    });
  },

  /**
   * 跳转到AI测试页面
   */
  goToAITest() {
    wx.navigateTo({
      url: '/pages/ai-test/ai-test'
    });
  },

  /**
   * 获取默认推荐数据
   */
  getDefaultRecommendations() {
    return [
      {
        id: 'default_1',
        title: '15分钟快速整理',
        description: '整理桌面或房间的一个小角落',
        category: 'organization',
        difficulty: 'easy',
        estimatedTime: 15,
        personalizedReason: '整理环境能帮助提升专注力',
        tags: ['整理', '环境'],
        priority: 8,
        expectedBenefits: '改善环境，提升效率',
        source: 'default_data',
        generatedAt: new Date().toISOString(),
        estimatedReward: { coins: 30, experience: 50 }
      },
      {
        id: 'default_2',
        title: '学习新知识',
        description: '花30分钟学习一个感兴趣的新话题',
        category: 'learning',
        difficulty: 'medium',
        estimatedTime: 30,
        personalizedReason: '持续学习能有效提升你的知识储备',
        tags: ['学习', '成长'],
        priority: 7,
        expectedBenefits: '增长知识，开拓视野',
        source: 'default_data',
        generatedAt: new Date().toISOString(),
        estimatedReward: { coins: 50, experience: 100 }
      }
    ];
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadAIRecommendations();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
