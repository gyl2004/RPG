// 奖励中心页面
import { checkLoginAndRedirect } from '../../utils/auth-helper.js';

Page({
  data: {
    userRewards: {},
    predefinedItems: {},
    predefinedAchievements: {},
    itemTypes: {},
    itemRarities: {},
    achievementTypes: {},
    loading: false,
    currentTab: 'overview', // overview, inventory, achievements, shop
    tabs: [
      { id: 'overview', name: '概览', icon: '📊' },
      { id: 'inventory', name: '背包', icon: '🎒' },
      { id: 'achievements', name: '成就', icon: '🏆' },
      { id: 'shop', name: '商店', icon: '🛒' }
    ]
  },

  onLoad: function() {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/rewards/rewards')) {
      return;
    }
    
    this.loadRewardData();
  },

  onShow: function() {
    // 每次显示时刷新数据
    this.loadRewardData();
  },

  /**
   * 加载奖励数据
   */
  loadRewardData() {
    try {
      this.setData({ loading: true });

      const rewardService = this.getRewardService();
      if (!rewardService) {
        throw new Error('奖励服务不可用');
      }

      const userRewards = rewardService.getUserRewards();
      const predefinedItems = rewardService.getPredefinedItems();
      const predefinedAchievements = rewardService.getPredefinedAchievements();
      const itemTypes = rewardService.getItemTypes();
      const itemRarities = rewardService.getItemRarities();
      const achievementTypes = rewardService.getAchievementTypes();

      // 计算等级进度
      const currentLevel = userRewards.level;
      const currentExp = userRewards.experience;
      const expToNext = rewardService.getExpToNextLevel(currentExp, currentLevel);
      
      // 计算当前等级的经验进度
      let currentLevelExp = currentExp;
      for (let i = 1; i < currentLevel; i++) {
        currentLevelExp -= 100 * i;
      }
      const nextLevelRequiredExp = 100 * (currentLevel + 1);
      const levelProgress = Math.floor((currentLevelExp / nextLevelRequiredExp) * 100);

      this.setData({
        userRewards: {
          ...userRewards,
          expToNext,
          levelProgress,
          currentLevelExp,
          nextLevelRequiredExp
        },
        predefinedItems,
        predefinedAchievements,
        itemTypes,
        itemRarities,
        achievementTypes
      });
    } catch (error) {
      console.error('加载奖励数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 获取奖励服务
   */
  getRewardService() {
    try {
      return require('../../services/reward-service.js');
    } catch (error) {
      console.error('获取奖励服务失败:', error);
      return null;
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
   * 获取库存物品列表
   */
  getInventoryItems() {
    const { userRewards, predefinedItems } = this.data;
    const inventoryItems = [];
    
    Object.keys(userRewards.inventory || {}).forEach(itemId => {
      const count = userRewards.inventory[itemId];
      const itemInfo = predefinedItems[itemId];
      
      if (count > 0 && itemInfo) {
        inventoryItems.push({
          ...itemInfo,
          count
        });
      }
    });
    
    return inventoryItems;
  },

  /**
   * 获取成就列表
   */
  getAchievementsList() {
    const { userRewards, predefinedAchievements } = this.data;
    const achievements = [];
    
    Object.keys(predefinedAchievements).forEach(achievementId => {
      const achievement = predefinedAchievements[achievementId];
      const isUnlocked = userRewards.achievements[achievementId] || false;
      
      achievements.push({
        ...achievement,
        isUnlocked,
        progress: this.getAchievementProgress(achievement)
      });
    });
    
    return achievements;
  },

  /**
   * 获取成就进度
   */
  getAchievementProgress(achievement) {
    const { userRewards } = this.data;
    const condition = achievement.condition;
    
    if (condition.taskCompleted) {
      const current = userRewards.statistics.totalTasksCompleted || 0;
      return Math.min(100, Math.floor((current / condition.taskCompleted) * 100));
    }
    
    if (condition.habitCreated) {
      const current = userRewards.statistics.totalHabitsCreated || 0;
      return Math.min(100, Math.floor((current / condition.habitCreated) * 100));
    }
    
    if (condition.maxStreak) {
      const current = userRewards.statistics.maxHabitStreak || 0;
      return Math.min(100, Math.floor((current / condition.maxStreak) * 100));
    }
    
    return 0;
  },

  /**
   * 使用物品
   */
  useItem(e) {
    const itemId = e.currentTarget.dataset.itemId;
    
    wx.showModal({
      title: '使用物品',
      content: '确定要使用这个物品吗？',
      success: (res) => {
        if (res.confirm) {
          this.confirmUseItem(itemId);
        }
      }
    });
  },

  /**
   * 确认使用物品
   */
  confirmUseItem(itemId) {
    try {
      const { userRewards, predefinedItems } = this.data;
      const item = predefinedItems[itemId];
      
      if (!item || !userRewards.inventory[itemId] || userRewards.inventory[itemId] <= 0) {
        wx.showToast({
          title: '物品不足',
          icon: 'error'
        });
        return;
      }

      // 减少物品数量
      userRewards.inventory[itemId]--;
      
      // 应用物品效果（这里简化处理）
      let effectMessage = '物品使用成功';
      if (item.effect.health) {
        effectMessage = `恢复了 ${item.effect.health} 点生命值`;
      } else if (item.effect.expBoost) {
        effectMessage = `下次任务经验将翻倍`;
      } else if (item.effect.luckBoost) {
        effectMessage = `幸运值提升了 ${Math.floor(item.effect.luckBoost * 100)}%`;
      }

      const rewardService = this.getRewardService();
      rewardService.saveUserRewards(userRewards);

      wx.showToast({
        title: effectMessage,
        icon: 'success'
      });

      this.loadRewardData();
    } catch (error) {
      console.error('使用物品失败:', error);
      wx.showToast({
        title: '使用失败',
        icon: 'error'
      });
    }
  },

  /**
   * 购买物品
   */
  buyItem(e) {
    const itemId = e.currentTarget.dataset.itemId;
    const item = this.data.predefinedItems[itemId];
    
    if (!item) return;

    wx.showModal({
      title: '购买物品',
      content: `确定要花费 ${item.price} 金币购买"${item.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.confirmBuyItem(itemId);
        }
      }
    });
  },

  /**
   * 确认购买物品
   */
  confirmBuyItem(itemId) {
    try {
      const { userRewards, predefinedItems } = this.data;
      const item = predefinedItems[itemId];
      
      if (userRewards.coins < item.price) {
        wx.showToast({
          title: '金币不足',
          icon: 'error'
        });
        return;
      }

      // 扣除金币
      userRewards.coins -= item.price;
      
      // 添加物品到库存
      if (!userRewards.inventory[itemId]) {
        userRewards.inventory[itemId] = 0;
      }
      userRewards.inventory[itemId]++;
      userRewards.statistics.itemsCollected++;

      const rewardService = this.getRewardService();
      rewardService.saveUserRewards(userRewards);

      wx.showToast({
        title: '购买成功',
        icon: 'success'
      });

      this.loadRewardData();
    } catch (error) {
      console.error('购买物品失败:', error);
      wx.showToast({
        title: '购买失败',
        icon: 'error'
      });
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadRewardData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
