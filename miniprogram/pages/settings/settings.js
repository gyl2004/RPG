// 用户设置页面
import { checkLoginAndRedirect, getAuthService, getCurrentUser } from '../../utils/auth-helper.js';
import { updateUserSettings, exportUserData, deleteUserAccount } from '../../utils/user-helper.js';

Page({
  data: {
    userInfo: null,
    settings: {
      notifications: true,
      soundEffects: true,
      theme: 'dark',
      language: 'zh-CN',
      autoBackup: true,
      privacyMode: false
    },
    statistics: {},
    loading: false
  },

  onLoad: function() {
    this.loadUserData();
  },

  onShow: function() {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/settings/settings')) {
      return;
    }
  },

  /**
   * 加载用户数据
   */
  async loadUserData() {
    try {
      this.setData({ loading: true });

      const user = getCurrentUser();
      if (user) {
        this.setData({
          userInfo: user,
          settings: user.settings || this.data.settings,
          statistics: user.statistics || {}
        });
      }

      this.setData({ loading: false });
    } catch (error) {
      console.error('加载用户数据失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 更新设置项
   */
  async updateSetting(e) {
    const { key, value } = e.currentTarget.dataset;
    
    try {
      const newSettings = {
        ...this.data.settings,
        [key]: value
      };

      this.setData({ settings: newSettings });

      const result = await updateUserSettings(newSettings);
      
      if (!result.success) {
        // 如果更新失败，恢复原设置
        this.setData({ settings: this.data.userInfo.settings });
        wx.showToast({
          title: '设置失败',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('更新设置失败:', error);
      wx.showToast({
        title: '设置失败',
        icon: 'error'
      });
    }
  },

  /**
   * 切换开关设置
   */
  onSwitchChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    
    this.updateSetting({
      currentTarget: {
        dataset: { key, value }
      }
    });
  },

  /**
   * 选择主题
   */
  selectTheme(e) {
    const theme = e.currentTarget.dataset.theme;
    
    this.updateSetting({
      currentTarget: {
        dataset: { key: 'theme', value: theme }
      }
    });
  },

  /**
   * 选择语言
   */
  selectLanguage(e) {
    const language = e.currentTarget.dataset.language;
    
    this.updateSetting({
      currentTarget: {
        dataset: { key: 'language', value: language }
      }
    });
  },

  /**
   * 编辑用户资料
   */
  editProfile() {
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit'
    });
  },

  /**
   * 查看用户统计
   */
  viewStatistics() {
    const stats = this.data.statistics;
    const content = `任务完成: ${stats.tasksCompleted || 0}\n习惯养成: ${stats.habitsFormed || 0}\n成就解锁: ${stats.achievementsUnlocked || 0}\n经验获得: ${stats.experienceGained || 0}\n登录天数: ${stats.loginDays || 0}`;
    
    wx.showModal({
      title: '我的统计',
      content: content,
      showCancel: false
    });
  },

  /**
   * 导出数据
   */
  async exportData() {
    try {
      this.setData({ loading: true });
      
      const result = await exportUserData();
      
      if (result.success) {
        wx.showModal({
          title: '导出成功',
          content: '用户数据已复制到剪贴板，您可以保存到安全的地方作为备份。',
          showCancel: false
        });
      } else {
        wx.showToast({
          title: '导出失败',
          icon: 'error'
        });
      }

      this.setData({ loading: false });
    } catch (error) {
      console.error('导出数据失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '导出失败',
        icon: 'error'
      });
    }
  },

  /**
   * 清除缓存
   */
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？这不会影响云端数据。',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            wx.showToast({
              title: '缓存已清除',
              icon: 'success'
            });
            
            // 重新加载用户数据
            setTimeout(() => {
              this.loadUserData();
            }, 1000);
          } catch (error) {
            wx.showToast({
              title: '清除失败',
              icon: 'error'
            });
          }
        }
      }
    });
  },

  /**
   * 删除账户
   */
  async deleteAccount() {
    try {
      const result = await deleteUserAccount();
      
      if (result.success) {
        // 账户删除成功，会自动跳转到登录页面
      }
    } catch (error) {
      console.error('删除账户失败:', error);
    }
  },

  /**
   * 退出登录
   */
  async logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const authService = getAuthService();
            if (authService) {
              await authService.logout();
            }
            // 退出成功会自动跳转到登录页面
          } catch (error) {
            console.error('退出登录失败:', error);
            wx.showToast({
              title: '退出失败',
              icon: 'error'
            });
          }
        }
      }
    });
  },

  /**
   * 关于应用
   */
  aboutApp() {
    wx.showModal({
      title: '关于现实世界RPG',
      content: '版本: 1.0.0\n\n这是一款将现实生活游戏化的应用，帮助您通过完成任务和培养习惯来提升自己。\n\n感谢您的使用！',
      showCancel: false
    });
  },

  /**
   * 联系客服
   */
  contactSupport() {
    wx.showModal({
      title: '联系客服',
      content: '如有问题或建议，请通过以下方式联系我们：\n\n邮箱: support@example.com\n微信群: 搜索"现实世界RPG"',
      showCancel: false
    });
  },

  /**
   * 分享应用
   */
  onShareAppMessage() {
    return {
      title: '现实世界RPG - 让生活变成游戏',
      desc: '一起来体验游戏化的生活方式吧！',
      path: '/pages/login/login'
    };
  }
});
