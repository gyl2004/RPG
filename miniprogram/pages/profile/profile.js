// 个人资料页面
import { checkLoginAndRedirect, getCurrentUser, getCurrentCharacter } from '../../utils/auth-helper.js';

Page({
  data: {
    userInfo: null,
    character: null,
    statistics: {},
    loading: false,
    characterTypeInfo: {},
    characterTitle: '',
    expPercent: 0,
    attributesList: [],
    recentActivities: []
  },

  onLoad: function() {
    this.checkLoginAndLoadData();
  },

  onShow: function() {
    this.checkLoginAndLoadData();
  },

  /**
   * 检查登录状态并加载数据
   */
  checkLoginAndLoadData: function() {
    if (!checkLoginAndRedirect('/pages/profile/profile')) {
      return;
    }

    this.loadUserData();
  },

  /**
   * 加载用户数据
   */
  async loadUserData() {
    try {
      this.setData({ loading: true });

      const user = getCurrentUser();
      const character = getCurrentCharacter();

      if (user && character) {
        // 计算角色类型信息
        const characterTypeInfo = this.getCharacterTypeInfo(character.characterType);

        // 计算角色称号
        const characterTitle = this.calculateCharacterTitle(character);

        // 计算经验百分比
        const expPercent = this.calculateExpPercent(character);

        // 获取属性列表
        const attributesList = this.getAttributesList(character);

        // 获取最近活动
        const recentActivities = this.getRecentActivities();

        this.setData({
          userInfo: user,
          character: character,
          statistics: user.statistics || {},
          characterTypeInfo,
          characterTitle,
          expPercent,
          attributesList,
          recentActivities
        });
      }

      this.setData({ loading: false });
    } catch (error) {
      console.error('加载用户数据失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  /**
   * 获取角色类型信息
   */
  getCharacterTypeInfo(characterType) {
    const characterTypes = {
      'warrior': { name: '⚔️ 勇士', icon: '⚔️', color: '#ef4444' },
      'scholar': { name: '📚 学者', icon: '📚', color: '#3b82f6' },
      'artist': { name: '🎨 艺术家', icon: '🎨', color: '#8b5cf6' },
      'socialite': { name: '👥 社交家', icon: '👥', color: '#f59e0b' },
      'explorer': { name: '🗺️ 探险家', icon: '🗺️', color: '#10b981' }
    };
    return characterTypes[characterType] || characterTypes['explorer'];
  },

  /**
   * 计算角色称号
   */
  calculateCharacterTitle(character) {
    const level = character.level || 1;
    const characterType = character.characterType || 'explorer';

    const titles = {
      'warrior': ['新兵', '战士', '勇士', '英雄', '传奇战神'],
      'scholar': ['学徒', '学者', '智者', '博学家', '智慧贤者'],
      'artist': ['新手', '艺术家', '创作者', '大师', '艺术传奇'],
      'socialite': ['新人', '社交达人', '人气王', '魅力领袖', '社交传奇'],
      'explorer': ['新手', '探险者', '冒险家', '探索大师', '传奇探险家']
    };

    const titleIndex = Math.min(Math.floor(level / 10), 4);
    return titles[characterType][titleIndex] || '冒险者';
  },

  /**
   * 计算经验百分比
   */
  calculateExpPercent(character) {
    const currentExp = character.currentExp || 0;
    const nextLevelExp = character.nextLevelExp || 100;
    return Math.min((currentExp / nextLevelExp) * 100, 100);
  },

  /**
   * 获取属性列表
   */
  getAttributesList(character) {
    const attributes = character.attributes || {};
    const attributeDefinitions = {
      'strength': { name: '力量', icon: '💪', color: '#ef4444', description: '体力活动和运动能力' },
      'intelligence': { name: '智力', icon: '🧠', color: '#3b82f6', description: '学习和思考能力' },
      'charisma': { name: '魅力', icon: '✨', color: '#f59e0b', description: '社交和沟通能力' },
      'creativity': { name: '创造力', icon: '🎨', color: '#8b5cf6', description: '艺术和创新能力' },
      'discipline': { name: '纪律性', icon: '⚖️', color: '#059669', description: '自控和坚持能力' },
      'vitality': { name: '活力', icon: '🌟', color: '#ec4899', description: '精神状态和生活热情' }
    };

    return Object.keys(attributeDefinitions).map(key => {
      const value = attributes[key] || 0;
      const maxValue = 100; // 假设最大值为100
      return {
        id: key,
        ...attributeDefinitions[key],
        value: value,
        percent: Math.min((value / maxValue) * 100, 100)
      };
    });
  },

  /**
   * 获取最近活动
   */
  getRecentActivities() {
    // 从本地存储获取最近活动
    const activities = wx.getStorageSync('recentActivities') || [];

    // 添加时间显示
    return activities.slice(0, 5).map(activity => ({
      ...activity,
      timeAgo: this.getTimeAgo(activity.timestamp)
    }));
  },

  /**
   * 计算时间差
   */
  getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  },

  /**
   * 跳转到设置页面
   */
  goToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  /**
   * 跳转到角色页面
   */
  goToCharacter: function() {
    wx.switchTab({
      url: '/pages/character/character'
    });
  },

  /**
   * 查看成就
   */
  viewAchievements: function() {
    wx.navigateTo({
      url: '/pages/achievements/achievements'
    });
  },

  /**
   * 跳转到技能页面
   */
  goToSkills: function() {
    wx.navigateTo({
      url: '/pages/skills/skills'
    });
  },

  /**
   * 跳转到外观定制页面
   */
  goToAppearance: function() {
    wx.navigateTo({
      url: '/pages/appearance/appearance'
    });
  },

  /**
   * 分配属性点
   */
  allocateAttributes: function() {
    wx.navigateTo({
      url: '/pages/character/character'
    });
  },

  /**
   * 跳转到物品收藏页面
   */
  goToItemCollection: function() {
    wx.navigateTo({
      url: '/pages/item-collection/item-collection'
    });
  },

  /**
   * 查看属性详情
   */
  viewAttributeDetail: function(e) {
    const attribute = e.currentTarget.dataset.attribute;
    const attributeInfo = this.data.attributesList.find(attr => attr.id === attribute);

    if (attributeInfo) {
      wx.showModal({
        title: `${attributeInfo.icon} ${attributeInfo.name}`,
        content: `当前值: ${attributeInfo.value}\n\n${attributeInfo.description}`,
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  /**
   * 查看统计详情
   */
  viewStatistics: function() {
    const stats = this.data.statistics;
    const content = `任务完成: ${stats.tasksCompleted || 0}\n习惯养成: ${stats.habitsFormed || 0}\n成就解锁: ${stats.achievementsUnlocked || 0}\n经验获得: ${stats.experienceGained || 0}\n登录天数: ${stats.loginDays || 0}`;

    wx.showModal({
      title: '我的统计',
      content: content,
      showCancel: false
    });
  },

  /**
   * 分享个人资料
   */
  onShareAppMessage: function() {
    return {
      title: `我在现实世界RPG中已经是${this.data.character?.level || 1}级${this.data.character?.class || '冒险者'}了！`,
      desc: '一起来体验游戏化的生活方式吧！',
      path: '/pages/login/login'
    };
  }
});
