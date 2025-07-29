// 习惯管理服务
class HabitService {
  constructor() {
    // 习惯分类定义
    this.habitCategories = {
      'health': {
        id: 'health',
        name: '健康生活',
        icon: '🏃‍♂️',
        color: '#22c55e',
        description: '运动、饮食、睡眠等健康习惯'
      },
      'learning': {
        id: 'learning',
        name: '学习成长',
        icon: '📚',
        color: '#3b82f6',
        description: '阅读、学习、技能提升等习惯'
      },
      'productivity': {
        id: 'productivity',
        name: '效率提升',
        icon: '⚡',
        color: '#f59e0b',
        description: '时间管理、工作效率等习惯'
      },
      'mindfulness': {
        id: 'mindfulness',
        name: '正念冥想',
        icon: '🧘‍♀️',
        color: '#8b5cf6',
        description: '冥想、正念、情绪管理等习惯'
      },
      'social': {
        id: 'social',
        name: '社交关系',
        icon: '👥',
        color: '#ec4899',
        description: '人际交往、家庭关系等习惯'
      },
      'creative': {
        id: 'creative',
        name: '创意表达',
        icon: '🎨',
        color: '#06b6d4',
        description: '艺术创作、写作、音乐等习惯'
      }
    };

    // 习惯频率定义
    this.habitFrequencies = {
      'daily': {
        id: 'daily',
        name: '每日',
        icon: '📅',
        description: '每天执行一次'
      },
      'weekly': {
        id: 'weekly',
        name: '每周',
        icon: '📆',
        description: '每周执行指定次数'
      },
      'custom': {
        id: 'custom',
        name: '自定义',
        icon: '⚙️',
        description: '自定义执行频率'
      }
    };

    // 习惯状态定义
    this.habitStatuses = {
      'active': {
        id: 'active',
        name: '进行中',
        icon: '🔥',
        color: '#22c55e'
      },
      'paused': {
        id: 'paused',
        name: '已暂停',
        icon: '⏸️',
        color: '#f59e0b'
      },
      'completed': {
        id: 'completed',
        name: '已完成',
        icon: '✅',
        color: '#3b82f6'
      },
      'archived': {
        id: 'archived',
        name: '已归档',
        icon: '📦',
        color: '#6b7280'
      }
    };
  }

  /**
   * 创建新习惯
   */
  createHabit(habitData) {
    try {
      console.log('HabitService.createHabit 被调用:', habitData);

      if (!habitData.name || !habitData.category || !habitData.frequency) {
        return { success: false, error: '请填写完整的习惯信息' };
      }

      const habits = wx.getStorageSync('userHabits') || [];
      console.log('当前习惯数量:', habits.length);

      const habitId = 'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      console.log('生成的习惯ID:', habitId);
      
      const habit = {
        id: habitId,
        name: habitData.name,
        description: habitData.description || '',
        category: habitData.category,
        frequency: habitData.frequency,
        targetCount: habitData.targetCount || 1,
        targetDays: habitData.targetDays || [],
        reminderTime: habitData.reminderTime || null,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startDate: habitData.startDate || new Date().toISOString().split('T')[0],
        endDate: habitData.endDate || null,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        checkIns: [],
        notes: habitData.notes || ''
      };

      habits.unshift(habit);
      console.log('添加习惯后数量:', habits.length);

      wx.setStorageSync('userHabits', habits);
      console.log('习惯已保存到存储');

      return {
        success: true,
        habit: habit,
        message: '习惯创建成功'
      };
    } catch (error) {
      console.error('创建习惯失败:', error);
      return { success: false, error: '创建习惯失败' };
    }
  }

  /**
   * 获取用户习惯列表
   */
  getUserHabits(filter = {}) {
    try {
      let habits = wx.getStorageSync('userHabits') || [];
      
      if (filter.status) {
        habits = habits.filter(habit => habit.status === filter.status);
      }
      
      if (filter.category) {
        habits = habits.filter(habit => habit.category === filter.category);
      }
      
      return habits;
    } catch (error) {
      console.error('获取习惯列表失败:', error);
      return [];
    }
  }

  /**
   * 根据ID获取习惯
   */
  getHabitById(habitId) {
    try {
      const habits = wx.getStorageSync('userHabits') || [];
      return habits.find(habit => habit.id === habitId) || null;
    } catch (error) {
      console.error('获取习惯失败:', error);
      return null;
    }
  }

  /**
   * 获取习惯分类信息
   */
  getHabitCategories() {
    return this.habitCategories;
  }

  /**
   * 获取习惯频率信息
   */
  getHabitFrequencies() {
    return this.habitFrequencies;
  }

  /**
   * 获取习惯状态信息
   */
  getHabitStatuses() {
    return this.habitStatuses;
  }

  /**
   * 习惯打卡
   */
  checkInHabit(habitId, checkInData = {}) {
    try {
      const habits = wx.getStorageSync('userHabits') || [];
      const habitIndex = habits.findIndex(habit => habit.id === habitId);
      
      if (habitIndex === -1) {
        return { success: false, error: '习惯不存在' };
      }
      
      const habit = habits[habitIndex];
      const today = new Date().toISOString().split('T')[0];
      
      // 检查今天是否已经打卡
      const todayCheckIn = habit.checkIns.find(checkIn => 
        checkIn.date === today
      );
      
      if (todayCheckIn) {
        return { success: false, error: '今天已经打卡过了' };
      }
      
      // 创建打卡记录
      const checkIn = {
        id: 'checkin_' + Date.now(),
        date: today,
        timestamp: new Date().toISOString(),
        count: checkInData.count || 1,
        notes: checkInData.notes || '',
        mood: checkInData.mood || null
      };
      
      // 添加打卡记录
      habit.checkIns.unshift(checkIn);
      habit.totalCompletions += checkIn.count;
      habit.updatedAt = new Date().toISOString();
      
      // 更新连续天数
      this.updateStreak(habit);

      // 给予习惯打卡奖励到角色系统（不使用await）
      try {
        const characterService = require('./character-service.js');
        const rewards = {
          coins: 10 + habit.currentStreak * 2, // 基础10金币 + 连续天数奖励
          experience: 5 + habit.currentStreak // 基础5经验 + 连续天数奖励
        };
        
        // 给予奖励（不等待结果）
        if (rewards.experience) {
          characterService.addExperience(rewards.experience);
        }
        if (rewards.coins) {
          characterService.addCoins(rewards.coins);
        }

        // 记录用户活动
        const userService = require('./user-service.js');
        userService.recordUserActivity('habit_checkin', {
          habitId: habit.id,
          habitName: habit.name,
          currentStreak: habit.currentStreak,
          rewards: rewards
        });

        // 更新故事进度
        try {
          const storyService = require('./story-service.js');
          storyService.updateStoryProgress();
        } catch (error) {
          console.error('更新故事进度失败:', error);
        }
      } catch (error) {
        console.error('给予习惯奖励失败:', error);
      }

      habits[habitIndex] = habit;
      wx.setStorageSync('userHabits', habits);

      return {
        success: true,
        habit: habit,
        checkIn: checkIn,
        message: '打卡成功'
      };
    } catch (error) {
      console.error('习惯打卡失败:', error);
      return { success: false, error: '打卡失败' };
    }
  }

  /**
   * 更新连续天数
   */
  updateStreak(habit) {
    const checkIns = habit.checkIns.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    let checkDate = new Date(today);
    
    // 计算当前连续天数
    for (let i = 0; i < checkIns.length; i++) {
      const checkInDate = new Date(checkIns[i].date);
      const expectedDate = new Date(checkDate);
      
      if (checkInDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
        tempStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // 计算最长连续天数
    tempStreak = 0;
    for (let i = 0; i < checkIns.length; i++) {
      const currentDate = new Date(checkIns[i].date);
      const nextDate = i < checkIns.length - 1 ? new Date(checkIns[i + 1].date) : null;
      
      tempStreak++;
      
      if (!nextDate || (currentDate - nextDate) / (1000 * 60 * 60 * 24) > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    
    habit.currentStreak = currentStreak;
    habit.longestStreak = Math.max(longestStreak, currentStreak);
  }

  /**
   * 获取习惯统计信息
   */
  getHabitStatistics() {
    try {
      const habits = wx.getStorageSync('userHabits') || [];
      
      if (habits.length === 0) {
        return {
          total: 0,
          active: 0,
          paused: 0,
          completed: 0,
          totalCheckIns: 0,
          averageStreak: 0,
          byCategory: {}
        };
      }
      
      const stats = {
        total: habits.length,
        active: habits.filter(h => h.status === 'active').length,
        paused: habits.filter(h => h.status === 'paused').length,
        completed: habits.filter(h => h.status === 'completed').length,
        totalCheckIns: habits.reduce((sum, h) => sum + h.totalCompletions, 0),
        averageStreak: Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length),
        byCategory: {}
      };
      
      // 按分类统计
      Object.keys(this.habitCategories).forEach(categoryId => {
        const categoryHabits = habits.filter(h => h.category === categoryId);
        stats.byCategory[categoryId] = {
          total: categoryHabits.length,
          active: categoryHabits.filter(h => h.status === 'active').length
        };
      });
      
      return stats;
    } catch (error) {
      console.error('获取习惯统计失败:', error);
      return {
        total: 0,
        active: 0,
        paused: 0,
        completed: 0,
        totalCheckIns: 0,
        averageStreak: 0,
        byCategory: {}
      };
    }
  }

  /**
   * 删除习惯
   */
  deleteHabit(habitId) {
    try {
      console.log('HabitService.deleteHabit 被调用:', habitId);

      const habits = wx.getStorageSync('userHabits') || [];
      const habitIndex = habits.findIndex(habit => habit.id === habitId);

      if (habitIndex === -1) {
        return { success: false, error: '习惯不存在' };
      }

      const deletedHabit = habits[habitIndex];
      habits.splice(habitIndex, 1);

      wx.setStorageSync('userHabits', habits);
      console.log('习惯删除成功，剩余数量:', habits.length);

      return {
        success: true,
        deletedHabit: deletedHabit,
        message: '习惯删除成功'
      };
    } catch (error) {
      console.error('删除习惯失败:', error);
      return { success: false, error: '删除习惯失败' };
    }
  }

  /**
   * 更新习惯状态
   */
  updateHabitStatus(habitId, status) {
    try {
      const habits = wx.getStorageSync('userHabits') || [];
      const habitIndex = habits.findIndex(habit => habit.id === habitId);

      if (habitIndex === -1) {
        return { success: false, error: '习惯不存在' };
      }

      habits[habitIndex].status = status;
      habits[habitIndex].updatedAt = new Date().toISOString();

      wx.setStorageSync('userHabits', habits);

      return {
        success: true,
        habit: habits[habitIndex],
        message: '习惯状态更新成功'
      };
    } catch (error) {
      console.error('更新习惯状态失败:', error);
      return { success: false, error: '更新习惯状态失败' };
    }
  }
}

// 导出单例实例
const habitService = new HabitService();
module.exports = habitService;