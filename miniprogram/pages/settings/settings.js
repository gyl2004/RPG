// 用户设置页面
const { checkLoginAndRedirect, getAuthService, getCurrentUser } = require('../../utils/auth-helper.js');
const { updateUserSettings, exportUserData, deleteUserAccount } = require('../../utils/user-helper.js');
const notificationService = require('../../services/notification-service.js');


Page({
  data: {
    userInfo: null,
    settings: {
      notifications: true,
      autoBackup: true
    },
    loading: false
  },

  onLoad: function () {
    this.loadUserData();
  },

  onShow: function () {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/settings/settings')) {
      return;
    }

    // 调试：打印当前设置状态
    console.log('设置页面显示，当前设置:', this.data.settings);
  },

  /**
   * 加载用户数据
   */
  async loadUserData() {
    try {
      this.setData({ loading: true });

      const user = getCurrentUser();
      if (user) {
        console.log('当前用户数据:', user);

        // 确保用户数据包含必要字段并修复缺失数据
        const completeUser = this.fixUserData(user);

        const userSettings = user.settings || this.data.settings;
        // 格式化显示数据
        const displayUser = {
          ...completeUser,
          formattedId: this.formatUserId(completeUser._id),
          formattedJoinDate: this.formatDate(completeUser.registrationDate)
        };

        this.setData({
          userInfo: displayUser,
          settings: userSettings
        });

        // 根据设置初始化功能
        await this.initializeFeatures(userSettings);
      }

      this.setData({ loading: false });
    } catch (error) {
      console.error('加载用户数据失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 修复用户数据，确保包含必要字段
   */
  fixUserData(user) {
    const now = new Date().toISOString();
    const fixedUser = {
      ...user,
      // 确保有用户ID
      _id: user._id || user.openid || user.id || 'user_' + Date.now(),
      // 确保有注册时间
      registrationDate: user.registrationDate || user.createdAt || user.createTime || now,
      // 确保有最后登录时间
      lastLoginDate: user.lastLoginDate || user.lastLogin || now,
      // 确保有昵称
      nickname: user.nickname || user.nickName || user.name || '冒险者',
      // 确保有头像
      avatarUrl: user.avatarUrl || user.avatar || '/images/default-avatar.png'
    };

    // 如果数据被修复了，保存到本地存储
    if (JSON.stringify(fixedUser) !== JSON.stringify(user)) {
      console.log('用户数据已修复:', fixedUser);
      wx.setStorageSync('userInfo', fixedUser);

      // 更新全局状态
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.userInfo = fixedUser;
      }
    }

    return fixedUser;
  },

  /**
   * 格式化用户ID显示
   */
  formatUserId(id) {
    if (!id) return '未设置';

    // 如果是临时ID，显示更友好的格式
    if (id.startsWith('temp_')) {
      return '临时用户';
    }

    // 如果是稳定生成的ID，显示正常格式
    if (id.startsWith('wx_')) {
      return id.slice(-8).toUpperCase();
    }

    // 如果ID很长，只显示后8位
    if (id.length > 8) {
      return id.slice(-8).toUpperCase();
    }

    return id.toUpperCase();
  },

  /**
   * 格式化日期显示
   */
  formatDate(dateString) {
    if (!dateString) return '今天';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        // 返回格式化的日期
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error('日期格式化失败:', error);
      return '未知';
    }
  },

  /**
   * 根据用户设置初始化功能
   */
  async initializeFeatures(settings) {
    try {
      // 初始化通知功能
      if (settings.notifications) {
        this.setupNotificationSchedule();
      } else {
        this.clearNotificationSchedule();
      }

      // 初始化自动备份功能
      if (settings.autoBackup) {
        this.setupAutoBackupSchedule();
        // 检查是否需要执行备份
        await this.checkAndPerformScheduledBackup();
      } else {
        this.clearAutoBackupSchedule();
      }
    } catch (error) {
      console.error('初始化功能失败:', error);
    }
  },

  /**
   * 检查并执行计划的备份
   */
  async checkAndPerformScheduledBackup() {
    try {
      const lastBackupTime = wx.getStorageSync('lastBackupTime');
      const now = new Date();

      if (!lastBackupTime) {
        // 从未备份过，立即执行一次
        console.log('首次备份');
        await this.performBackup();
        return;
      }

      const lastBackup = new Date(lastBackupTime);
      const timeDiff = now.getTime() - lastBackup.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // 如果距离上次备份超过24小时，执行备份
      if (hoursDiff >= 24) {
        console.log('执行定时备份');
        await this.performBackup();
      }
    } catch (error) {
      console.error('检查定时备份失败:', error);
    }
  },

  /**
   * 更新设置项
   */
  async updateSetting(e) {
    const { key, value } = e.currentTarget.dataset;

    console.log(`更新设置: ${key} = ${value}`);

    try {
      const newSettings = {
        ...this.data.settings,
        [key]: value
      };

      console.log('新设置:', newSettings);

      // 先更新界面
      this.setData({ settings: newSettings });

      // 然后保存设置
      const result = await updateUserSettings(newSettings);

      if (result.success) {
        console.log('设置更新成功');
        // 更新全局状态
        const app = getApp();
        if (app && app.globalData.userInfo) {
          app.globalData.userInfo.settings = newSettings;
        }
      } else {
        console.error('设置更新失败:', result.error);
        // 如果更新失败，恢复原设置
        const originalSettings = this.data.userInfo?.settings || this.data.settings;
        this.setData({ settings: originalSettings });
        wx.showToast({
          title: '设置失败',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('更新设置异常:', error);
      // 恢复原设置
      const originalSettings = this.data.userInfo?.settings || this.data.settings;
      this.setData({ settings: originalSettings });
      wx.showToast({
        title: '设置失败',
        icon: 'error'
      });
    }
  },

  /**
   * 切换开关设置
   */
  async onSwitchChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;

    console.log(`开关变更: ${key} = ${value}`);

    try {
      // 根据不同的设置项执行特定逻辑
      let shouldUpdate = true;

      if (key === 'notifications') {
        shouldUpdate = await this.handleNotificationChange(value);
      } else if (key === 'autoBackup') {
        shouldUpdate = await this.handleAutoBackupChange(value);
      }

      // 只有在特定处理成功时才更新设置
      if (shouldUpdate) {
        await this.updateSetting({
          currentTarget: {
            dataset: { key, value }
          }
        });
      }
    } catch (error) {
      console.error('开关设置失败:', error);
      // 恢复开关状态
      this.setData({
        [`settings.${key}`]: !value
      });
      wx.showToast({
        title: '设置失败',
        icon: 'error'
      });
    }
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
   * 处理消息通知设置变更
   */
  async handleNotificationChange(enabled) {
    try {
      if (enabled) {
        // 开启通知：请求通知权限
        const result = await this.requestNotificationPermission();
        if (result.success) {
          // 设置定时提醒
          this.setupNotificationSchedule();
          wx.showToast({
            title: '通知已开启',
            icon: 'success'
          });
          return true; // 成功，允许更新设置
        } else {
          // 权限被拒绝，不更新设置
          wx.showModal({
            title: '通知权限',
            content: '需要通知权限才能接收任务提醒，请在系统设置中开启。',
            showCancel: false
          });
          return false; // 失败，不更新设置
        }
      } else {
        // 关闭通知：清除所有定时提醒
        this.clearNotificationSchedule();
        wx.showToast({
          title: '通知已关闭',
          icon: 'success'
        });
        return true; // 成功，允许更新设置
      }
    } catch (error) {
      console.error('处理通知设置失败:', error);
      wx.showToast({
        title: '设置失败',
        icon: 'error'
      });
      return false; // 失败，不更新设置
    }
  },

  /**
   * 请求通知权限
   */
  async requestNotificationPermission() {
    try {
      // 在微信小程序中，通知功能通过Toast和Modal实现，不需要特殊权限
      const result = await notificationService.checkNotificationPermission();
      return { success: result.hasPermission };
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return { success: false };
    }
  },

  /**
   * 设置通知计划
   */
  setupNotificationSchedule() {
    try {
      // 清除之前的通知
      this.clearNotificationSchedule();

      // 设置每日任务提醒（上午9点）
      const morningReminder = {
        id: 'daily_task_reminder',
        title: '现实世界RPG',
        content: '新的一天开始了！查看今日任务，开始你的冒险吧！',
        time: '09:00'
      };

      // 设置晚间习惯提醒（晚上8点）
      const eveningReminder = {
        id: 'habit_reminder',
        title: '现实世界RPG',
        content: '别忘了完成今天的习惯打卡哦！',
        time: '20:00'
      };

      // 保存到本地存储
      const notifications = [morningReminder, eveningReminder];
      wx.setStorageSync('scheduledNotifications', notifications);

      console.log('通知计划已设置:', notifications);
    } catch (error) {
      console.error('设置通知计划失败:', error);
    }
  },



  /**
   * 清除通知计划
   */
  clearNotificationSchedule() {
    try {
      wx.removeStorageSync('scheduledNotifications');
      console.log('通知计划已清除');
    } catch (error) {
      console.error('清除通知计划失败:', error);
    }
  },

  /**
   * 处理自动备份设置变更
   */
  async handleAutoBackupChange(enabled) {
    try {
      if (enabled) {
        // 开启自动备份
        const result = await this.performBackup();
        if (result.success) {
          // 设置定时备份
          this.setupAutoBackupSchedule();
          const backupType = result.type === 'cloud' ? '云端' : '本地';
          wx.showToast({
            title: `自动备份已开启(${backupType})`,
            icon: 'success'
          });
          return true; // 成功，允许更新设置
        } else {
          // 备份失败，不更新设置
          wx.showToast({
            title: '备份失败，请检查网络',
            icon: 'error'
          });
          return false; // 失败，不更新设置
        }
      } else {
        // 关闭自动备份
        this.clearAutoBackupSchedule();
        wx.showToast({
          title: '自动备份已关闭',
          icon: 'success'
        });
        return true; // 成功，允许更新设置
      }
    } catch (error) {
      console.error('处理自动备份设置失败:', error);
      wx.showToast({
        title: '设置失败',
        icon: 'error'
      });
      return false; // 失败，不更新设置
    }
  },

  /**
   * 执行数据备份
   */
  async performBackup() {
    try {
      console.log('开始执行数据备份...');

      // 获取需要备份的数据
      const backupData = {
        timestamp: new Date().toISOString(),
        userInfo: wx.getStorageSync('userInfo'),
        characterInfo: wx.getStorageSync('characterInfo'),
        userTasks: wx.getStorageSync('userTasks') || [],
        userHabits: wx.getStorageSync('userHabits') || [],
        userSettings: this.data.settings,
        version: '1.0.0'
      };

      // 检查云开发是否可用
      const app = getApp();
      if (!app || !app.isCloudInitialized()) {
        console.log('云开发不可用，使用本地备份');
        return this.performLocalBackup(backupData);
      }

      // 尝试云端备份
      const result = await wx.cloud.callFunction({
        name: 'rpgFunctions',
        data: {
          type: 'backupUserData',
          data: backupData
        }
      });

      if (result.result && result.result.success) {
        // 更新最后备份时间
        wx.setStorageSync('lastBackupTime', new Date().toISOString());
        console.log('云端备份成功');
        return { success: true, type: 'cloud' };
      } else {
        // 云端备份失败，使用本地备份
        console.log('云端备份失败，使用本地备份');
        return this.performLocalBackup(backupData);
      }
    } catch (error) {
      console.error('备份失败:', error);
      // 尝试本地备份作为降级方案
      return this.performLocalBackup(backupData);
    }
  },

  /**
   * 执行本地备份
   */
  performLocalBackup(backupData) {
    try {
      // 保存到本地存储
      const backupKey = `backup_${Date.now()}`;
      wx.setStorageSync(backupKey, backupData);

      // 保存备份索引
      const backupIndex = wx.getStorageSync('backupIndex') || [];
      backupIndex.push({
        key: backupKey,
        timestamp: backupData.timestamp,
        type: 'local'
      });

      // 只保留最近5个备份
      if (backupIndex.length > 5) {
        const oldBackup = backupIndex.shift();
        wx.removeStorageSync(oldBackup.key);
      }

      wx.setStorageSync('backupIndex', backupIndex);
      wx.setStorageSync('lastBackupTime', new Date().toISOString());

      console.log('本地备份成功');
      return { success: true, type: 'local' };
    } catch (error) {
      console.error('本地备份失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 设置自动备份计划
   */
  setupAutoBackupSchedule() {
    try {
      // 清除之前的备份计划
      this.clearAutoBackupSchedule();

      // 设置每日自动备份（凌晨2点）
      const backupSchedule = {
        id: 'auto_backup',
        time: '02:00',
        enabled: true,
        lastRun: null
      };

      wx.setStorageSync('autoBackupSchedule', backupSchedule);
      console.log('自动备份计划已设置');
    } catch (error) {
      console.error('设置自动备份计划失败:', error);
    }
  },

  /**
   * 清除自动备份计划
   */
  clearAutoBackupSchedule() {
    try {
      wx.removeStorageSync('autoBackupSchedule');
      console.log('自动备份计划已清除');
    } catch (error) {
      console.error('清除自动备份计划失败:', error);
    }
  },

  /**
   * 手动触发备份（用于测试）
   */
  async triggerManualBackup() {
    try {
      this.setData({ loading: true });

      const result = await this.performBackup();

      if (result.success) {
        const backupType = result.type === 'cloud' ? '云端' : '本地';
        wx.showModal({
          title: '备份成功',
          content: `数据已成功备份到${backupType}`,
          showCancel: false
        });
      } else {
        wx.showToast({
          title: '备份失败',
          icon: 'error'
        });
      }

      this.setData({ loading: false });
    } catch (error) {
      console.error('手动备份失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '备份失败',
        icon: 'error'
      });
    }
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
      content: '如有问题或建议，请通过以下方式联系我们：\n\n邮箱: 2004gyl1111@2925.com"',
      showCancel: false
    });
  },

  /**
   * 分享应用
   */
  shareApp() {
    try {
      // 获取用户信息用于个性化分享
      const userInfo = this.data.userInfo;
      const characterInfo = wx.getStorageSync('characterInfo');

      // 构建个性化分享内容
      let shareTitle = '现实世界RPG - 让生活变成游戏';
      let shareDesc = '一起来体验游戏化的生活方式吧！';

      if (userInfo && characterInfo) {
        const level = characterInfo.level || 1;
        const nickname = userInfo.nickname || '冒险者';
        shareTitle = `${nickname}邀请你加入现实世界RPG`;
        shareDesc = `我已经是${level}级冒险者了！一起通过游戏化方式提升自己吧！`;
      }

      // 显示分享选项
      wx.showActionSheet({
        itemList: ['分享给微信好友', '分享到朋友圈', '复制邀请链接'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              // 分享给微信好友
              this.shareToFriend(shareTitle, shareDesc);
              break;
            case 1:
              // 分享到朋友圈
              this.shareToTimeline(shareTitle, shareDesc);
              break;
            case 2:
              // 复制邀请链接
              this.copyInviteLink();
              break;
          }
        },
        fail: (error) => {
          console.log('用户取消分享');
        }
      });
    } catch (error) {
      console.error('分享应用失败:', error);
      wx.showToast({
        title: '分享失败',
        icon: 'error'
      });
    }
  },

  /**
   * 分享给微信好友
   */
  shareToFriend(title, desc) {
    try {
      // 触发微信分享
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage']
      });

      // 设置分享内容
      this.shareData = {
        title: title,
        desc: desc,
        path: '/pages/login/login',
        // imageUrl: '/images/share-cover.png' // 分享封面图（可选）
      };

      wx.showToast({
        title: '请点击右上角分享',
        icon: 'none',
        duration: 2000
      });
    } catch (error) {
      console.error('分享给好友失败:', error);
      wx.showToast({
        title: '分享失败',
        icon: 'error'
      });
    }
  },

  /**
   * 分享到朋友圈
   */
  shareToTimeline(title, desc) {
    try {
      // 微信小程序不能直接分享到朋友圈，提示用户操作
      wx.showModal({
        title: '分享到朋友圈',
        content: '请点击右上角菜单，选择"分享到朋友圈"来分享这个小程序。',
        showCancel: false,
        confirmText: '知道了'
      });

      // 启用朋友圈分享
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareTimeline']
      });
    } catch (error) {
      console.error('分享到朋友圈失败:', error);
      wx.showToast({
        title: '分享失败',
        icon: 'error'
      });
    }
  },

  /**
   * 复制邀请链接
   */
  copyInviteLink() {
    try {
      const userInfo = this.data.userInfo;
      const inviteCode = userInfo?._id?.slice(-8) || 'RPGLIFE';

      // 构建邀请文本
      const inviteText = `🎮 现实世界RPG - 让生活变成游戏！

🌟 通过完成日常任务获得经验值
⚔️ 培养习惯提升角色属性  
🏆 解锁成就获得奖励
🤖 AI智能推荐个性化任务

邀请码：${inviteCode}

一起开始游戏化的人生冒险吧！

#现实世界RPG #游戏化生活 #个人成长`;

      // 复制到剪贴板
      wx.setClipboardData({
        data: inviteText,
        success: () => {
          wx.showToast({
            title: '邀请链接已复制',
            icon: 'success'
          });

          // 记录分享行为
          this.recordShareAction('copy_invite');
        },
        fail: () => {
          wx.showToast({
            title: '复制失败',
            icon: 'error'
          });
        }
      });
    } catch (error) {
      console.error('复制邀请链接失败:', error);
      wx.showToast({
        title: '复制失败',
        icon: 'error'
      });
    }
  },

  /**
   * 微信分享回调
   */
  onShareAppMessage() {
    try {
      const userInfo = this.data.userInfo;
      const characterInfo = wx.getStorageSync('characterInfo');

      let shareTitle = '现实世界RPG - 让生活变成游戏';
      let shareDesc = '一起来体验游戏化的生活方式吧！';

      if (userInfo && characterInfo) {
        const level = characterInfo.level || 1;
        const nickname = userInfo.nickname || '冒险者';
        shareTitle = `${nickname}邀请你加入现实世界RPG`;
        shareDesc = `我已经是${level}级冒险者了！一起通过游戏化方式提升自己吧！`;
      }

      // 记录分享行为
      this.recordShareAction('wechat_friend');

      return this.shareData || {
        title: shareTitle,
        desc: shareDesc,
        path: '/pages/login/login'
        // imageUrl: '/images/share-cover.png' // 分享封面图（可选）
      };
    } catch (error) {
      console.error('微信分享失败:', error);
      return {
        title: '现实世界RPG - 让生活变成游戏',
        desc: '一起来体验游戏化的生活方式吧！',
        path: '/pages/login/login'
      };
    }
  },

  /**
   * 朋友圈分享回调
   */
  onShareTimeline() {
    try {
      const userInfo = this.data.userInfo;
      const characterInfo = wx.getStorageSync('characterInfo');

      let shareTitle = '现实世界RPG - 让生活变成游戏';

      if (userInfo && characterInfo) {
        const level = characterInfo.level || 1;
        const nickname = userInfo.nickname || '冒险者';
        shareTitle = `${nickname}在现实世界RPG中已达到${level}级！`;
      }

      // 记录分享行为
      this.recordShareAction('wechat_timeline');

      return {
        title: shareTitle,
        path: '/pages/login/login'
        // imageUrl: '/images/share-cover.png' // 分享封面图（可选）
      };
    } catch (error) {
      console.error('朋友圈分享失败:', error);
      return {
        title: '现实世界RPG - 让生活变成游戏',
        path: '/pages/login/login'
      };
    }
  },

  /**
   * 记录分享行为
   */
  recordShareAction(shareType) {
    try {
      const shareStats = wx.getStorageSync('shareStats') || {
        totalShares: 0,
        shareTypes: {},
        lastShareTime: null
      };

      shareStats.totalShares += 1;
      shareStats.shareTypes[shareType] = (shareStats.shareTypes[shareType] || 0) + 1;
      shareStats.lastShareTime = new Date().toISOString();

      wx.setStorageSync('shareStats', shareStats);

      console.log('分享行为已记录:', shareType, shareStats);

      // 如果是首次分享，给予奖励
      if (shareStats.totalShares === 1) {
        this.giveShareReward();
      }
    } catch (error) {
      console.error('记录分享行为失败:', error);
    }
  },

  /**
   * 给予分享奖励
   */
  giveShareReward() {
    try {
      const characterInfo = wx.getStorageSync('characterInfo');
      if (characterInfo) {
        // 给予经验值奖励
        characterInfo.experience = (characterInfo.experience || 0) + 50;
        characterInfo.coins = (characterInfo.coins || 0) + 20;

        wx.setStorageSync('characterInfo', characterInfo);

        // 更新全局状态
        const app = getApp();
        if (app && app.globalData.characterInfo) {
          app.globalData.characterInfo = characterInfo;
        }

        // 显示奖励提示
        setTimeout(() => {
          wx.showModal({
            title: '分享奖励',
            content: '感谢分享！获得50经验值和20金币奖励！',
            showCancel: false,
            confirmText: '太棒了'
          });
        }, 1000);
      }
    } catch (error) {
      console.error('给予分享奖励失败:', error);
    }
  },



  /**
   * 主题变更回调（由主题服务调用）
   */
  onThemeChange(themeName, themeConfig) {
    console.log('设置页面收到主题变更通知:', themeName);
    this.setData({
      'settings.theme': themeName,
      currentTheme: themeConfig,
      themeColors: themeConfig.colors
    });
  },

  /**
   * 语言变更回调（由语言服务调用）
   */
  onLanguageChange(languageCode, languageConfig) {
    console.log('设置页面收到语言变更通知:', languageCode);
    this.setData({
      'settings.language': languageCode,
      currentLanguage: languageConfig
    });
  },







  /**
   * 升级账户
   */
  async upgradeAccount() {
    try {
      wx.showModal({
        title: '升级账户',
        content: '将临时账户升级为正式微信账户，数据将同步到云端。是否继续？',
        confirmText: '立即升级',
        cancelText: '暂不升级',
        success: async (res) => {
          if (res.confirm) {
            await this.performAccountUpgrade();
          }
        }
      });
    } catch (error) {
      console.error('升级账户失败:', error);
      wx.showToast({
        title: '升级失败',
        icon: 'error'
      });
    }
  },

  /**
   * 执行账户升级
   */
  async performAccountUpgrade() {
    try {
      wx.showLoading({ title: '升级中...' });

      // 获取认证服务
      const authService = getAuthService();
      if (!authService) {
        throw new Error('认证服务不可用');
      }

      // 重新进行微信登录获取真实openid
      const loginResult = await authService.getWxLoginCode();
      if (!loginResult.success) {
        throw new Error('获取登录code失败');
      }

      // 获取真实openid
      const openidResult = await authService.getOpenId(loginResult.code);
      if (!openidResult.success) {
        throw new Error(`获取openid失败: ${openidResult.error}`);
      }

      const realOpenid = openidResult.openid;
      const currentUser = this.data.userInfo;

      // 创建升级后的用户数据
      const upgradedUser = {
        ...currentUser,
        _id: realOpenid,
        openid: realOpenid,
        isTemporary: false,
        needsUpgrade: false,
        upgradeDate: new Date().toISOString(),
        originalTempId: currentUser._id
      };

      // 尝试将数据同步到云端
      try {
        const result = await wx.cloud.callFunction({
          name: 'rpgFunctions',
          data: {
            type: 'upgradeUser',
            data: upgradedUser
          }
        });

        if (result.result && result.result.success) {
          console.log('用户数据已同步到云端:', result.result.data);
        } else {
          console.warn('云端升级失败:', result.result?.error);
        }
      } catch (cloudError) {
        console.warn('云端同步失败，但本地升级继续:', cloudError);
      }

      // 更新本地存储
      wx.setStorageSync('userInfo', upgradedUser);

      // 更新全局状态
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.userInfo = upgradedUser;
      }

      // 更新页面显示
      const displayUser = {
        ...upgradedUser,
        formattedId: this.formatUserId(upgradedUser._id),
        formattedJoinDate: this.formatDate(upgradedUser.registrationDate)
      };

      this.setData({
        userInfo: displayUser
      });

      wx.hideLoading();
      wx.showModal({
        title: '升级成功',
        content: '账户已成功升级为正式微信账户，数据将自动同步到云端！',
        showCancel: false,
        confirmText: '太好了'
      });

    } catch (error) {
      wx.hideLoading();
      console.error('账户升级失败:', error);
      
      wx.showModal({
        title: '升级失败',
        content: `升级过程中出现错误：${error.message}\n\n请检查网络连接后重试。`,
        showCancel: false,
        confirmText: '知道了'
      });
    }
  }
});
