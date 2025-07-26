// 故事线页面
import { checkLoginAndRedirect } from '../../utils/auth-helper.js';

Page({
  data: {
    storyProgress: {},
    userProfile: {},
    storyChapters: {},
    storyTypes: {},
    characterTypes: {},
    dailyContent: {},
    loading: false,
    currentTab: 'story', // story, profile, events, growth
    tabs: [
      { id: 'story', name: '故事线', icon: '📖' },
      { id: 'profile', name: '个性化', icon: '👤' },
      { id: 'events', name: '活动', icon: '🎉' },
      { id: 'growth', name: '成长', icon: '📊' }
    ],
    showChapterModal: false,
    selectedChapter: null,
    showProfileEditModal: false,
    showGenerateModal: false,
    chaptersList: [],
    storyDisplayMode: 'timeline', // timeline, book, card
    seasonalEvents: {},
    randomEvents: [],
    emotionalState: {},
    characterGrowth: {},
    aiTaskRecommendations: []
  },

  onLoad: function(options) {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/story/story')) {
      return;
    }

    // 检查是否有指定的标签页
    if (options.tab) {
      this.setData({ currentTab: options.tab });
    }

    this.loadStoryData();
  },

  onShow: function() {
    // 每次显示时刷新数据
    this.loadStoryData();
  },

  /**
   * 加载故事数据
   */
  async loadStoryData() {
    try {
      this.setData({ loading: true });

      const storyService = this.getStoryService();
      if (!storyService) {
        console.error('❌ 无法获取故事服务，使用默认数据');
        this.setData({
          chaptersList: [],
          storyProgress: { completedChapters: [], unlockedChapters: ['prologue'], totalProgress: 0 },
          dailyContent: { greeting: '欢迎回来！', motivation: '继续你的成长之旅！' },
          personalizedRecommendations: { tasks: [], habits: [], tips: [] },
          seasonalEvents: { currentSeason: 'spring', activeEvents: [], upcomingEvents: [] },
          activeRandomEvents: [],
          emotionalState: { metrics: {}, primaryEmotion: 'balanced', advice: '' },
          characterGrowth: { growthMetrics: {}, overallProgress: 0 },
          aiTaskRecommendations: [],
          loading: false
        });
        return;
      }



      // 强制初始化故事数据
      this.initializeStoryData(storyService);

      // 更新故事进度
      const updateResult = storyService.updateStoryProgress();

      const storyProgress = storyService.getUserStoryProgress();
      const userProfile = storyService.getUserProfile();
      const storyChapters = storyService.getStoryChapters();
      const storyTypes = storyService.getStoryTypes();
      const characterTypes = storyService.getCharacterTypes();
      const dailyContent = storyService.generateDailyContent();



      // 加载高级功能数据
      const seasonalEvents = storyService.getSeasonalEvents();
      const randomEvents = storyService.getActiveRandomEvents();
      const emotionalState = storyService.getEmotionalState();
      const characterGrowth = storyService.getCharacterGrowthTracking();



      // 生成章节列表
      const chaptersList = Object.values(storyChapters).sort((a, b) => a.order - b.order);

      // 调试信息
      console.log('故事章节数据:', storyChapters);
      console.log('故事章节数量:', Object.keys(storyChapters).length);
      console.log('章节列表:', chaptersList);
      console.log('故事进度:', storyProgress);

      // 检查每日故事生成
      const dailyStoryResult = storyService.checkDailyStoryGeneration();
      if (dailyStoryResult.isNew) {
        // 如果生成了新的每日故事，显示提示
        setTimeout(() => {
          wx.showToast({
            title: '今日故事已更新！',
            icon: 'success'
          });
        }, 1000);
      }

      this.setData({
        storyProgress,
        userProfile,
        storyChapters,
        storyTypes,
        characterTypes,
        dailyContent,
        chaptersList,
        seasonalEvents,
        randomEvents,
        emotionalState,
        characterGrowth
      });

      // 如果有新解锁的章节，显示提示
      if (updateResult.hasUpdates) {
        wx.showToast({
          title: '有新章节解锁！',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('加载故事数据失败:', error);
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
      console.log('✅ 完整故事服务加载成功');
      return storyService;
    } catch (error) {
      console.error('❌ 完整故事服务加载失败:', error);

      // 尝试使用简化版故事服务
      try {
        console.log('🔄 尝试加载简化版故事服务...');
        const storyServiceLite = require('../ai-tasks/story-service-lite.js');
        console.log('✅ 简化版故事服务加载成功');
        return storyServiceLite;
      } catch (liteError) {
        console.error('❌ 简化版故事服务也失败:', liteError);

        // 返回一个最小化的故事服务
        return this.createMinimalStoryService();
      }
    }
  },

  /**
   * 初始化故事数据
   */
  initializeStoryData(storyService) {
    try {
      // 确保故事进度正确初始化
      let progress = storyService.getUserStoryProgress();

      // 如果没有解锁任何章节，强制解锁序章
      if (!progress.unlockedChapters || progress.unlockedChapters.length === 0) {
        progress.unlockedChapters = ['prologue'];
        storyService.saveUserStoryProgress(progress);
        console.log('强制解锁序章');
      }

      // 确保故事章节数据存在
      const chapters = storyService.getStoryChapters();
      if (!chapters || Object.keys(chapters).length === 0) {
        console.error('故事章节数据为空，尝试重新初始化');
        // 重新创建故事服务实例
        delete require.cache[require.resolve('../../services/story-service.js')];
        return require('../../services/story-service.js');
      }

      return storyService;
    } catch (error) {
      console.error('初始化故事数据失败:', error);
      return storyService;
    }
  },

  /**
   * 切换标签页
   */
  switchTab(e) {
    const tabId = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tabId });
  },

  /**
   * 创建最小化故事服务
   */
  createMinimalStoryService() {
    console.log('🔧 创建最小化故事服务...');

    return {
      // 基础数据
      getStoryChapters: () => ({}),
      getStoryTypes: () => ({}),
      getCharacterTypes: () => ({}),

      // 用户数据
      getUserStoryProgress: () => ({
        completedChapters: [],
        unlockedChapters: ['prologue'],
        totalProgress: 0
      }),

      getUserProfile: () => ({
        characterType: 'explorer',
        preferences: {}
      }),

      // AI推荐
      getAITaskRecommendations: () => [],
      getAITaskRecommendationsAsync: async () => [],

      // 个性化内容
      generateDailyContent: () => ({
        greeting: '欢迎回来！',
        motivation: '继续你的成长之旅！'
      }),

      getPersonalizedRecommendations: () => ({
        tasks: [
          '完成一个小目标',
          '学习新知识15分钟',
          '整理个人空间',
          '进行体能锻炼'
        ],
        habits: [
          '每日10分钟冥想',
          '制定每日计划',
          '记录三件好事',
          '晨间积极肯定'
        ],
        tips: [
          '成长是一个渐进的过程，每天进步一点点就是巨大的成功',
          '早晨是大脑最活跃的时候，适合处理重要任务',
          '压力过大时，试试深呼吸放松'
        ],
        characterAdvice: '继续保持你的成长节奏，每一步都在让你变得更好！'
      }),

      // 异步获取个性化推荐
      getPersonalizedRecommendationsAsync: async () => ({
        tasks: [
          '完成一个小目标',
          '学习新知识15分钟',
          '整理个人空间',
          '进行体能锻炼'
        ],
        habits: [
          '每日10分钟冥想',
          '制定每日计划',
          '记录三件好事',
          '晨间积极肯定'
        ],
        tips: [
          '成长是一个渐进的过程，每天进步一点点就是巨大的成功',
          '早晨是大脑最活跃的时候，适合处理重要任务',
          '压力过大时，试试深呼吸放松'
        ],
        characterAdvice: '继续保持你的成长节奏，每一步都在让你变得更好！'
      }),

      // 季节性活动
      getSeasonalEvents: () => ({
        currentSeason: 'spring',
        activeEvents: [],
        upcomingEvents: []
      }),

      // 随机事件
      getActiveRandomEvents: () => [],
      generateRandomEvent: () => null,
      completeRandomEvent: () => ({ success: false, error: '服务不可用' }),

      // 情感和成长
      getEmotionalState: () => ({
        metrics: { happiness: 50, motivation: 50, confidence: 50, stress: 50 },
        primaryEmotion: 'balanced',
        advice: '保持平衡'
      }),

      getCharacterGrowthTracking: () => ({
        growthMetrics: { strength: 50, wisdom: 50, creativity: 50, social: 50, discipline: 50 },
        overallProgress: 50
      }),

      // 章节操作
      completeChapter: () => ({ success: false, error: '服务不可用' }),
      generatePersonalizedChapter: () => null,
      saveGeneratedChapter: () => false,

      // 用户配置
      saveUserProfile: () => false,

      // 季节性事件
      activateSeasonalEvent: () => ({ success: false, error: '服务不可用' }),

      // 进度更新
      updateStoryProgress: () => ({ success: true, hasUpdates: false })
    };
  },

  /**
   * 显示章节详情
   */
  showChapterDetail(e) {
    const chapterId = e.currentTarget.dataset.chapterId;
    const chapter = this.data.storyChapters[chapterId];
    
    if (!chapter) return;

    this.setData({
      selectedChapter: chapter,
      showChapterModal: true
    });
  },

  /**
   * 隐藏章节详情
   */
  hideChapterModal() {
    this.setData({
      showChapterModal: false,
      selectedChapter: null
    });
  },

  /**
   * 完成章节
   */
  completeChapter() {
    const { selectedChapter } = this.data;
    if (!selectedChapter) return;

    try {
      const storyService = this.getStoryService();
      if (!storyService) {
        wx.showToast({
          title: '服务不可用',
          icon: 'error'
        });
        return;
      }

      const result = storyService.completeChapter(selectedChapter.id);
      
      if (result.success) {
        wx.showToast({
          title: '章节完成！',
          icon: 'success'
        });
        
        this.hideChapterModal();
        this.loadStoryData();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('完成章节失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 显示个性化编辑
   */
  showProfileEdit() {
    this.setData({ showProfileEditModal: true });
  },

  /**
   * 隐藏个性化编辑
   */
  hideProfileEdit() {
    this.setData({ showProfileEditModal: false });
  },

  /**
   * 更新角色类型
   */
  updateCharacterType(e) {
    const characterType = e.currentTarget.dataset.type;
    const userProfile = { ...this.data.userProfile };
    userProfile.characterType = characterType;
    
    this.updateUserProfile(userProfile);
  },

  /**
   * 更新活跃时间偏好
   */
  updateActiveTime(e) {
    const activeTime = e.currentTarget.dataset.time;
    const userProfile = { ...this.data.userProfile };
    userProfile.preferences.activeTime = activeTime;
    
    this.updateUserProfile(userProfile);
  },

  /**
   * 更新用户配置
   */
  updateUserProfile(userProfile) {
    try {
      const storyService = this.getStoryService();
      if (!storyService) {
        wx.showToast({
          title: '服务不可用',
          icon: 'error'
        });
        return;
      }

      const success = storyService.saveUserProfile(userProfile);
      
      if (success) {
        this.setData({ userProfile });
        
        // 重新生成每日内容
        const dailyContent = storyService.generateDailyContent();

        this.setData({
          dailyContent
        });
        
        wx.showToast({
          title: '设置已更新',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '更新失败',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('更新用户配置失败:', error);
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      });
    }
  },

  /**
   * 获取章节列表（按顺序排列）
   */
  getChaptersList() {
    const { storyChapters } = this.data;
    return Object.values(storyChapters).sort((a, b) => a.order - b.order);
  },

  /**
   * 检查章节是否已解锁
   */
  isChapterUnlocked(chapterId) {
    const { storyProgress } = this.data;
    return storyProgress.unlockedChapters && storyProgress.unlockedChapters.includes(chapterId);
  },

  /**
   * 检查章节是否已完成
   */
  isChapterCompleted(chapterId) {
    const { storyProgress } = this.data;
    return storyProgress.completedChapters && storyProgress.completedChapters.includes(chapterId);
  },

  /**
   * 获取章节状态
   */
  getChapterStatus(chapter) {
    if (this.isChapterCompleted(chapter.id)) {
      return 'completed';
    } else if (this.isChapterUnlocked(chapter.id)) {
      return 'unlocked';
    } else {
      return 'locked';
    }
  },

  /**
   * 显示生成章节模态框
   */
  showGenerateModal() {
    this.setData({ showGenerateModal: true });
  },

  /**
   * 隐藏生成章节模态框
   */
  hideGenerateModal() {
    this.setData({ showGenerateModal: false });
  },

  /**
   * 生成新的个性化章节
   */
  generateNewChapter() {
    try {
      const storyService = this.getStoryService();
      if (!storyService) {
        wx.showToast({
          title: '服务不可用',
          icon: 'error'
        });
        this.hideGenerateModal();
        return;
      }

      // 获取用户数据
      const userStats = storyService.getUserStats();
      const userProfile = storyService.getUserProfile();

      // 生成新章节
      const newChapter = storyService.generatePersonalizedChapter(userStats, userProfile);

      if (newChapter) {
        // 保存章节
        storyService.saveGeneratedChapter(newChapter);

        // 更新故事进度
        const progress = storyService.getUserStoryProgress();
        progress.unlockedChapters.push(newChapter.id);
        storyService.saveUserStoryProgress(progress);

        wx.showToast({
          title: '新章节已生成！',
          icon: 'success'
        });

        this.hideGenerateModal();
        this.loadStoryData();
      } else {
        wx.showToast({
          title: '生成失败，请稍后再试',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('生成新章节失败:', error);
      wx.showToast({
        title: '生成失败',
        icon: 'error'
      });
    }
  },

  /**
   * 检查是否可以生成新章节
   */
  canGenerateNewChapter() {
    const { storyProgress } = this.data;
    const completedCount = storyProgress.completedChapters ? storyProgress.completedChapters.length : 0;

    // 至少完成一个章节才能生成新章节
    return completedCount >= 1;
  },

  /**
   * 激活季节性活动
   */
  activateSeasonalEvent(e) {
    const eventId = e.currentTarget.dataset.eventId;

    try {
      const storyService = this.getStoryService();
      if (!storyService) {
        wx.showToast({
          title: '服务不可用',
          icon: 'error'
        });
        return;
      }

      const result = storyService.activateSeasonalEvent(eventId);

      if (result.success) {
        wx.showToast({
          title: '活动已激活！',
          icon: 'success'
        });

        this.loadStoryData();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('激活季节性活动失败:', error);
      wx.showToast({
        title: '激活失败',
        icon: 'error'
      });
    }
  },

  /**
   * 完成随机事件
   */
  completeRandomEvent(e) {
    const eventId = e.currentTarget.dataset.eventId;

    try {
      const storyService = this.getStoryService();
      if (!storyService) {
        wx.showToast({
          title: '服务不可用',
          icon: 'error'
        });
        return;
      }

      const result = storyService.completeRandomEvent(eventId);

      if (result.success) {
        wx.showToast({
          title: '事件完成！',
          icon: 'success'
        });

        this.loadStoryData();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('完成随机事件失败:', error);
      wx.showToast({
        title: '完成失败',
        icon: 'error'
      });
    }
  },

  /**
   * 生成随机事件
   */
  generateRandomEvent() {
    try {
      const storyService = this.getStoryService();
      if (!storyService) {
        wx.showToast({
          title: '服务不可用',
          icon: 'error'
        });
        return;
      }

      const event = storyService.generateRandomEvent();

      if (event) {
        wx.showToast({
          title: '新事件出现！',
          icon: 'success'
        });

        this.loadStoryData();
      } else {
        wx.showToast({
          title: '暂无新事件',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('生成随机事件失败:', error);
      wx.showToast({
        title: '生成失败',
        icon: 'error'
      });
    }
  },

  /**
   * 生成AI随机事件
   */
  async generateAIRandomEvent() {
    try {
      wx.showLoading({ title: 'AI分析中...' });

      const storyService = this.getStoryService();
      if (!storyService) {
        wx.hideLoading();
        wx.showToast({
          title: '服务不可用',
          icon: 'error'
        });
        return;
      }

      const event = await storyService.generateAIRandomEvent();

      wx.hideLoading();

      if (event) {
        const isAIGenerated = event.source === 'chatanywhere_gpt';

        wx.showModal({
          title: '🎉 新事件出现！',
          content: `${event.icon} ${event.name}\n\n${event.description}\n\n💡 ${event.personalizedReason || ''}`,
          confirmText: '太棒了！',
          showCancel: false,
          success: () => {
            wx.showToast({
              title: isAIGenerated ? '✅ AI事件生成成功' : '⚠️ 使用本地算法',
              icon: 'none',
              duration: 2000
            });

            this.loadStoryData();
          }
        });
      } else {
        wx.showToast({
          title: '暂时没有新事件',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('生成AI随机事件失败:', error);
      wx.showToast({
        title: '生成失败',
        icon: 'error'
      });
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
   * 获取情感颜色
   */
  getEmotionColor(value) {
    if (value >= 80) return '#22c55e'; // 绿色
    if (value >= 60) return '#3b82f6'; // 蓝色
    if (value >= 40) return '#f59e0b'; // 黄色
    if (value >= 20) return '#f97316'; // 橙色
    return '#ef4444'; // 红色
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
   * 切换故事显示模式
   */
  switchStoryMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ storyDisplayMode: mode });
  },

  /**
   * 故事书章节选择事件
   */
  onStoryBookChapterSelect(e) {
    const { chapter } = e.detail;
    this.setData({
      selectedChapter: chapter,
      showChapterModal: true
    });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 空方法，用于阻止事件冒泡
  },







  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadStoryData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
