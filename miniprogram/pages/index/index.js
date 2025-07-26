// 现实世界RPG首页
import { checkLoginAndRedirect, getCurrentUser, getCurrentCharacter } from '../../utils/auth-helper.js';

Page({
  data: {
    userInfo: {},
    currentUser: {},
    character: {
      level: 1,
      experience: 0,
      nextLevelExp: 100,
      expPercent: 0,
      class: '新手冒险者'
    },
    todayTasks: [
      {
        id: 1,
        title: '晨间锻炼30分钟',
        experience: 50,
        completed: false
      },
      {
        id: 2,
        title: '阅读技术文章',
        experience: 30,
        completed: true
      },
      {
        id: 3,
        title: '学习新技能',
        experience: 40,
        completed: false
      }
    ],
    todayHabits: [],
    maxStreak: 7
  },
  onLoad: function() {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/index/index')) {
      return;
    }

    this.loadUserInfo();
    this.loadCurrentUser();
    this.calculateExpPercent();
    this.loadTodayHabits();
  },

  onShow: function() {
    // 每次显示时检查登录状态
    if (!checkLoginAndRedirect('/pages/index/index')) {
      return;
    }

    this.loadTodayData();
    this.checkRandomEvents();
  },

  // 加载用户信息
  loadUserInfo: function() {
    const user = getCurrentUser();
    const character = getCurrentCharacter();

    if (user && character) {
      this.setData({
        userInfo: user,
        character: character
      });
    } else {
      // 如果没有用户信息，重定向到登录页面
      checkLoginAndRedirect('/pages/index/index');
    }
  },

  // 加载当前用户信息
  loadCurrentUser: function() {
    try {
      const userService = require('../../services/user-service.js');
      const currentUser = userService.getCurrentUser();
      this.setData({
        currentUser: currentUser
      });
    } catch (error) {
      console.error('加载当前用户失败:', error);
    }
  },

  // 计算经验值百分比
  calculateExpPercent: function() {
    const { experience, nextLevelExp } = this.data.character;
    const expPercent = Math.floor((experience / nextLevelExp) * 100);
    this.setData({
      'character.expPercent': expPercent
    });
  },

  // 加载今日数据
  loadTodayData: function() {
    // 重新计算经验百分比
    this.calculateExpPercent();

    // 重新加载今日习惯
    this.loadTodayHabits();
  },

  /**
   * 加载今日习惯
   */
  loadTodayHabits() {
    try {
      const habitService = require('../../services/habit-service.js');
      const habits = habitService.getUserHabits({ status: 'active' });

      // 只显示前3个活跃习惯
      const todayHabits = habits.slice(0, 3).map(habit => {
        const today = new Date().toISOString().split('T')[0];
        const todayChecked = habit.checkIns.some(checkIn => checkIn.date === today);

        return {
          id: habit.id,
          name: habit.name,
          streak: habit.currentStreak,
          completed: todayChecked
        };
      });

      // 计算最大连续天数
      const maxStreak = habits.reduce((max, habit) =>
        Math.max(max, habit.longestStreak), 0
      );

      this.setData({
        todayHabits,
        maxStreak
      });
    } catch (error) {
      console.error('加载今日习惯失败:', error);
    }
  },

  // 切换习惯完成状态
  toggleHabit: function(e) {
    const habitId = e.currentTarget.dataset.id;

    try {
      const habitService = require('../../services/habit-service.js');
      const result = habitService.checkInHabit(habitId);

      if (result.success) {
        wx.showToast({
          title: '习惯打卡成功！',
          icon: 'success'
        });

        // 重新加载习惯数据
        this.loadTodayHabits();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('习惯打卡失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  // 导航到角色页面
  navigateToCharacter: function() {
    wx.switchTab({
      url: '/pages/character/character'
    });
  },

  // 导航到任务页面
  navigateToTasks: function() {
    wx.switchTab({
      url: '/pages/tasks/tasks'
    });
  },

  // 导航到习惯页面
  navigateToHabits: function() {
    wx.switchTab({
      url: '/pages/habits/habits'
    });
  },

  // 导航到奖励中心
  navigateToRewards: function() {
    wx.navigateTo({
      url: '/pages/rewards/rewards'
    });
  },

  // 导航到社交页面
  navigateToSocial: function() {
    wx.switchTab({
      url: '/pages/social/social'
    });
  },

  // 导航到故事线页面
  navigateToStory: function() {
    wx.navigateTo({
      url: '/pages/story/story'
    });
  },

  // 导航到AI任务推荐
  navigateToAITasks: function() {
    wx.navigateTo({
      url: '/pages/ai-tasks/ai-tasks'
    });
  },

  // 导航到物品收藏页面
  navigateToItemCollection: function() {
    wx.navigateTo({
      url: '/pages/item-collection/item-collection'
    });
  },



  // 导航到动态故事页面
  navigateToDynamicStory: function() {
    wx.navigateTo({
      url: '/pages/dynamic-story/dynamic-story'
    });
  },





  // 检查随机事件
  checkRandomEvents: function() {
    try {
      // 简化版本：直接检查本地存储的随机事件
      const randomEvents = wx.getStorageSync('randomEvents') || [];
      const now = new Date();

      // 过滤出活跃的事件
      const activeEvents = randomEvents.filter(event =>
        !event.isCompleted && new Date(event.expiresAt) > now
      );

      if (activeEvents.length > 0) {
        // 如果有活跃事件，显示提示
        setTimeout(() => {
          wx.showToast({
            title: `有${activeEvents.length}个事件等待处理`,
            icon: 'none',
            duration: 2000
          });
        }, 1000);
      } else {
        // 尝试生成AI随机事件
        const shouldGenerate = Math.random() < 0.15; // 15%概率
        if (shouldGenerate) {
          this.tryGenerateAIRandomEvent();
        }
      }
    } catch (error) {
      console.error('检查随机事件失败:', error);
      // 不显示错误给用户，静默处理
    }
  },

  // 尝试生成AI随机事件
  async tryGenerateAIRandomEvent() {
    try {
      // 获取故事服务
      const storyService = require('../../services/story-service.js');

      // 尝试生成AI随机事件
      const event = await storyService.generateAIRandomEvent();

      if (event) {
        const isAIGenerated = event.source === 'chatanywhere_gpt';

        setTimeout(() => {
          wx.showModal({
            title: '🎉 意外事件！',
            content: `${event.icon} ${event.name}\n\n${event.description}\n\n💡 ${event.personalizedReason || ''}`,
            confirmText: '查看详情',
            cancelText: '稍后处理',
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/story/story?tab=events'
                });
              }

              // 显示AI生成状态
              if (isAIGenerated) {
                setTimeout(() => {
                  wx.showToast({
                    title: '✨ AI为你定制的事件',
                    icon: 'none',
                    duration: 2000
                  });
                }, 500);
              }
            }
          });
        }, 2000);
      }
    } catch (error) {
      console.error('生成AI随机事件失败:', error);
      // 静默处理，不影响用户体验
    }
  }
});
