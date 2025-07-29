// 现实世界RPG首页

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
    todayTasks: [],
    todayHabits: [],
    maxStreak: 7
  },
  onLoad: function() {
    console.log('🏠 首页 onLoad 被调用');
    this.loadTodayData();
  },

  onShow: function() {
    console.log('🏠 首页 onShow 被调用');
    
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      console.log('🏠 用户未登录，重定向到登录页面');
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }

    console.log('🏠 用户已登录，开始加载数据');
    // 重新加载数据，以获取最新状态
    this.loadTodayData();
    this.checkRandomEvents();
  },

  /**
   * 获取任务服务
   */
  getTaskService() {
    try {
      return require('../../services/task-service.js');
    } catch (error) {
      console.error('获取任务服务失败:', error);
      return null;
    }
  },

  /**
   * 获取习惯服务
   */
  getHabitService() {
    try {
      return require('../../services/habit-service.js');
    } catch (error) {
      console.error('获取习惯服务失败:', error);
      return null;
    }
  },

  /**
   * 加载今日数据
   */
  loadTodayData() {
    console.log('🏠 加载首页今日数据');
    
    try {
      this.loadUserInfo();
      this.loadTodayTasks();
      this.loadTodayHabits();
      this.calculateExpPercent();
      
      // 调试：检查任务服务状态
      this.debugTaskService();
    } catch (error) {
      console.error('🏠 加载今日数据失败:', error);
    }
  },

  /**
   * 加载今日任务
   */
  loadTodayTasks() {
    try {
      console.log('🏠 加载今日任务');
      
      const taskService = this.getTaskService();
      if (!taskService) {
        console.error('❌ 任务服务不可用');
        return;
      }

      // 直接检查本地存储
      const storedTasks = wx.getStorageSync('userTasks') || [];
      console.log('🏠 本地存储的任务:', storedTasks);
      console.log('🏠 任务数量:', storedTasks.length);

      // 获取所有任务
      const allTasks = taskService.getUserTasks();
      console.log('🏠 获取到的所有任务:', allTasks);
      console.log('🏠 任务数量:', allTasks.length);

      if (allTasks.length === 0) {
        console.log('⚠️ 没有任务数据，设置空数组');
        this.setData({
          todayTasks: []
        });
        return;
      }

      // 打印每个任务的状态
      allTasks.forEach((task, index) => {
        console.log(`🏠 任务${index + 1}: ${task.title} - 状态: ${task.status}`);
      });

      // 筛选今日任务（状态为pending或in_progress的任务）
      const todayTasks = allTasks.filter(task => {
        const isToday = task.status === 'pending' || task.status === 'in_progress';
        console.log(`🏠 任务 "${task.title}" 状态: ${task.status}, 是否今日任务: ${isToday}`);
        return isToday;
      }).slice(0, 5); // 只显示前5个任务

      console.log('🏠 筛选后的今日任务:', todayTasks);

      // 转换任务数据格式以适配首页显示
      const formattedTasks = todayTasks.map(task => ({
        id: task.id,
        title: task.title,
        experience: task.rewards?.experience || 0,
        completed: task.status === 'completed',
        status: task.status,
        statusText: this.getTaskStatusText(task.status),
        priority: task.priority || 'medium'
      }));

      console.log('🏠 格式化后的任务:', formattedTasks);

      this.setData({
        todayTasks: formattedTasks
      });

    } catch (error) {
      console.error('❌ 加载今日任务失败:', error);
    }
  },

  /**
   * 调试任务服务
   */
  debugTaskService() {
    try {
      console.log('🔍 调试任务服务');
      
      // 检查本地存储
      const userTasks = wx.getStorageSync('userTasks');
      console.log('🔍 本地存储 userTasks:', userTasks);
      console.log('🔍 userTasks 类型:', typeof userTasks);
      console.log('🔍 userTasks 是否为数组:', Array.isArray(userTasks));
      
      // 检查任务服务
      const taskService = this.getTaskService();
      console.log('🔍 任务服务:', taskService);
      
      if (taskService) {
        console.log('🔍 任务服务方法:', Object.keys(taskService));
        
        // 测试获取任务
        const tasks = taskService.getUserTasks();
        console.log('🔍 服务返回的任务:', tasks);
        console.log('🔍 任务数量:', tasks ? tasks.length : 'null');
      }
      
    } catch (error) {
      console.error('🔍 调试任务服务失败:', error);
    }
  },

  /**
   * 获取任务状态文本
   */
  getTaskStatusText(status) {
    const statusMap = {
      'pending': '待开始',
      'in_progress': '进行中',
      'completed': '已完成',
      'failed': '已失败',
      'cancelled': '已取消'
    };
    return statusMap[status] || '未知';
  },

  /**
   * 点击任务项，跳转到任务详情
   */
  onTaskTap(e) {
    const taskId = e.currentTarget.dataset.id;
    console.log('🏠 点击任务，ID:', taskId);
    
    if (taskId) {
      wx.navigateTo({
        url: `/pages/task-detail/task-detail?id=${taskId}`
      });
    }
  },



  // 加载用户信息
  loadUserInfo: function() {
    try {
      const app = getApp();
      const user = app.globalData.userInfo || wx.getStorageSync('userInfo');
      const character = app.globalData.character || wx.getStorageSync('characterInfo');

      console.log('🏠 加载用户信息:', { user, character });

      if (user && character) {
        this.setData({
          userInfo: user,
          character: character
        });
      } else {
        console.log('⚠️ 用户信息不完整，重定向到登录页面');
        wx.redirectTo({
          url: '/pages/login/login'
        });
      }
    } catch (error) {
      console.error('❌ 加载用户信息失败:', error);
    }
  },

  // 加载当前用户信息
  loadCurrentUser: function() {
    try {
      const userService = this.getUserService();
      if (!userService) {
        console.error('❌ 用户服务不可用');
        return;
      }
      
      const currentUser = userService.getCurrentUser();
      this.setData({
        currentUser: currentUser
      });
    } catch (error) {
      console.error('❌ 加载当前用户失败:', error);
    }
  },

  /**
   * 获取用户服务
   */
  getUserService() {
    try {
      return require('../../services/user-service.js');
    } catch (error) {
      console.error('获取用户服务失败:', error);
      return null;
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



  /**
   * 加载今日习惯
   */
  loadTodayHabits() {
    try {
      console.log('🏠 加载今日习惯');
      
      const habitService = this.getHabitService();
      if (!habitService) {
        console.error('❌ 习惯服务不可用');
        return;
      }
      
      const habits = habitService.getUserHabits({ status: 'active' });
      console.log('🏠 获取到的习惯:', habits);

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

      console.log('🏠 今日习惯:', todayHabits);
      console.log('🏠 最大连续天数:', maxStreak);

      this.setData({
        todayHabits,
        maxStreak
      });
    } catch (error) {
      console.error('❌ 加载今日习惯失败:', error);
    }
  },

  // 切换习惯完成状态
  toggleHabit: function(e) {
    const habitId = e.currentTarget.dataset.id;
    console.log('🏠 切换习惯状态:', habitId);

    try {
      const habitService = this.getHabitService();
      if (!habitService) {
        wx.showToast({ title: '服务不可用', icon: 'error' });
        return;
      }
      
      const result = habitService.checkInHabit(habitId);
      console.log('🏠 习惯打卡结果:', result);

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

  // 导航到动态故事页面
  navigateToDynamicStory: function() {
    wx.navigateTo({
      url: '/pages/dynamic-story/dynamic-story'
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

  // 导航到设置页面
  navigateToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
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
