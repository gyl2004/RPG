// 奖励系统服务
class RewardService {
  constructor() {
    // 物品类型定义
    this.itemTypes = {
      'consumable': {
        id: 'consumable',
        name: '消耗品',
        icon: '🧪',
        description: '可以使用的消耗性物品'
      },
      'equipment': {
        id: 'equipment',
        name: '装备',
        icon: '⚔️',
        description: '可以装备的物品'
      },
      'material': {
        id: 'material',
        name: '材料',
        icon: '🔧',
        description: '用于合成的材料'
      },
      'special': {
        id: 'special',
        name: '特殊',
        icon: '✨',
        description: '特殊功能物品'
      }
    };

    // 物品稀有度定义
    this.itemRarities = {
      'common': {
        id: 'common',
        name: '普通',
        color: '#9ca3af',
        icon: '⚪'
      },
      'uncommon': {
        id: 'uncommon',
        name: '优秀',
        color: '#22c55e',
        icon: '🟢'
      },
      'rare': {
        id: 'rare',
        name: '稀有',
        color: '#3b82f6',
        icon: '🔵'
      },
      'epic': {
        id: 'epic',
        name: '史诗',
        color: '#8b5cf6',
        icon: '🟣'
      },
      'legendary': {
        id: 'legendary',
        name: '传说',
        color: '#f59e0b',
        icon: '🟡'
      }
    };

    // 成就类型定义
    this.achievementTypes = {
      'task': {
        id: 'task',
        name: '任务成就',
        icon: '📋',
        description: '完成任务相关的成就'
      },
      'habit': {
        id: 'habit',
        name: '习惯成就',
        icon: '🌱',
        description: '培养习惯相关的成就'
      },
      'social': {
        id: 'social',
        name: '社交成就',
        icon: '👥',
        description: '社交互动相关的成就'
      },
      'collection': {
        id: 'collection',
        name: '收集成就',
        icon: '🏆',
        description: '收集物品相关的成就'
      },
      'special': {
        id: 'special',
        name: '特殊成就',
        icon: '⭐',
        description: '特殊条件触发的成就'
      }
    };

    // 预定义物品
    this.predefinedItems = {
      'health_potion': {
        id: 'health_potion',
        name: '生命药水',
        description: '恢复少量生命值',
        type: 'consumable',
        rarity: 'common',
        icon: '🧪',
        effect: { health: 20 },
        price: 50
      },
      'exp_boost': {
        id: 'exp_boost',
        name: '经验加速器',
        description: '下次任务经验翻倍',
        type: 'consumable',
        rarity: 'uncommon',
        icon: '⚡',
        effect: { expBoost: 2 },
        price: 100
      },
      'lucky_charm': {
        id: 'lucky_charm',
        name: '幸运符',
        description: '增加获得稀有物品的概率',
        type: 'equipment',
        rarity: 'rare',
        icon: '🍀',
        effect: { luckBoost: 0.2 },
        price: 200
      }
    };

    // 预定义成就
    this.predefinedAchievements = {
      'first_task': {
        id: 'first_task',
        name: '初出茅庐',
        description: '完成第一个任务',
        type: 'task',
        icon: '🎯',
        condition: { taskCompleted: 1 },
        rewards: { coins: 100, exp: 50 }
      },
      'task_master': {
        id: 'task_master',
        name: '任务大师',
        description: '完成100个任务',
        type: 'task',
        icon: '👑',
        condition: { taskCompleted: 100 },
        rewards: { coins: 1000, exp: 500, items: ['lucky_charm'] }
      },
      'habit_starter': {
        id: 'habit_starter',
        name: '习惯养成者',
        description: '创建第一个习惯',
        type: 'habit',
        icon: '🌱',
        condition: { habitCreated: 1 },
        rewards: { coins: 50, exp: 25 }
      },
      'streak_master': {
        id: 'streak_master',
        name: '连击大师',
        description: '习惯连续打卡30天',
        type: 'habit',
        icon: '🔥',
        condition: { maxStreak: 30 },
        rewards: { coins: 500, exp: 300, items: ['exp_boost'] }
      }
    };
  }

  /**
   * 获取用户奖励数据
   */
  getUserRewards() {
    try {
      const defaultRewards = {
        coins: 0,
        experience: 0,
        level: 1,
        inventory: {},
        achievements: {},
        statistics: {
          totalCoinsEarned: 0,
          totalExpEarned: 0,
          totalTasksCompleted: 0,
          totalHabitsCreated: 0,
          maxHabitStreak: 0,
          itemsCollected: 0,
          achievementsUnlocked: 0
        }
      };

      const rewards = wx.getStorageSync('userRewards') || defaultRewards;
      
      // 确保数据结构完整
      return {
        ...defaultRewards,
        ...rewards,
        statistics: {
          ...defaultRewards.statistics,
          ...rewards.statistics
        }
      };
    } catch (error) {
      console.error('获取用户奖励数据失败:', error);
      return {
        coins: 0,
        experience: 0,
        level: 1,
        inventory: {},
        achievements: {},
        statistics: {
          totalCoinsEarned: 0,
          totalExpEarned: 0,
          totalTasksCompleted: 0,
          totalHabitsCreated: 0,
          maxHabitStreak: 0,
          itemsCollected: 0,
          achievementsUnlocked: 0
        }
      };
    }
  }

  /**
   * 保存用户奖励数据
   */
  saveUserRewards(rewards) {
    try {
      wx.setStorageSync('userRewards', rewards);
      return true;
    } catch (error) {
      console.error('保存用户奖励数据失败:', error);
      return false;
    }
  }

  /**
   * 给予奖励
   */
  giveRewards(rewardData) {
    try {
      console.log('给予奖励:', rewardData);
      
      const userRewards = this.getUserRewards();
      let hasChanges = false;

      // 给予金币
      if (rewardData.coins && rewardData.coins > 0) {
        userRewards.coins += rewardData.coins;
        userRewards.statistics.totalCoinsEarned += rewardData.coins;
        hasChanges = true;
      }

      // 给予经验
      if (rewardData.experience && rewardData.experience > 0) {
        const oldLevel = userRewards.level;
        userRewards.experience += rewardData.experience;
        userRewards.statistics.totalExpEarned += rewardData.experience;
        
        // 计算新等级
        const newLevel = this.calculateLevel(userRewards.experience);
        if (newLevel > oldLevel) {
          userRewards.level = newLevel;
          // 升级奖励
          const levelUpRewards = this.getLevelUpRewards(newLevel);
          if (levelUpRewards.coins) {
            userRewards.coins += levelUpRewards.coins;
          }

          // 记录升级活动
          try {
            const userService = require('./user-service.js');
            userService.recordUserActivity('level_up', {
              oldLevel: oldLevel,
              newLevel: newLevel,
              levelUpRewards: levelUpRewards
            });

            // 更新故事进度
            const storyService = require('./story-service.js');
            storyService.updateStoryProgress();
          } catch (error) {
            console.error('记录升级活动失败:', error);
          }
        }
        hasChanges = true;
      }

      // 给予物品
      if (rewardData.items && Array.isArray(rewardData.items)) {
        rewardData.items.forEach(itemId => {
          if (!userRewards.inventory[itemId]) {
            userRewards.inventory[itemId] = 0;
          }
          userRewards.inventory[itemId]++;
          userRewards.statistics.itemsCollected++;
        });
        hasChanges = true;
      }

      if (hasChanges) {
        this.saveUserRewards(userRewards);
      }

      return {
        success: true,
        newRewards: userRewards,
        message: '奖励发放成功'
      };
    } catch (error) {
      console.error('给予奖励失败:', error);
      return { success: false, error: '奖励发放失败' };
    }
  }

  /**
   * 计算等级
   */
  calculateLevel(experience) {
    // 等级计算公式：每级需要的经验 = 100 * level
    let level = 1;
    let requiredExp = 0;
    
    while (experience >= requiredExp) {
      level++;
      requiredExp += 100 * level;
    }
    
    return level - 1;
  }

  /**
   * 获取升级奖励
   */
  getLevelUpRewards(level) {
    return {
      coins: level * 50,
      message: `恭喜升级到 ${level} 级！`
    };
  }

  /**
   * 获取下一级所需经验
   */
  getExpToNextLevel(currentExp, currentLevel) {
    let totalExpForNextLevel = 0;
    for (let i = 1; i <= currentLevel + 1; i++) {
      totalExpForNextLevel += 100 * i;
    }
    return totalExpForNextLevel - currentExp;
  }

  /**
   * 获取物品类型信息
   */
  getItemTypes() {
    return this.itemTypes;
  }

  /**
   * 获取物品稀有度信息
   */
  getItemRarities() {
    return this.itemRarities;
  }

  /**
   * 获取成就类型信息
   */
  getAchievementTypes() {
    return this.achievementTypes;
  }

  /**
   * 获取预定义物品
   */
  getPredefinedItems() {
    return this.predefinedItems;
  }

  /**
   * 获取预定义成就
   */
  getPredefinedAchievements() {
    return this.predefinedAchievements;
  }
}

// 导出单例实例
const rewardService = new RewardService();
module.exports = rewardService;
