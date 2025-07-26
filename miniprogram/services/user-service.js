// 用户服务
class UserService {
  constructor() {
    // 用户状态定义
    this.userStatuses = {
      'active': {
        id: 'active',
        name: '活跃',
        icon: '🟢',
        color: '#22c55e'
      },
      'away': {
        id: 'away',
        name: '离开',
        icon: '🟡',
        color: '#f59e0b'
      },
      'offline': {
        id: 'offline',
        name: '离线',
        icon: '⚫',
        color: '#6b7280'
      }
    };
  }

  /**
   * 生成8位用户ID
   */
  generateUserId() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 检查用户ID是否已存在
   */
  isUserIdExists(userId) {
    try {
      // 这里应该检查服务器或本地存储中是否已存在该ID
      // 目前简化处理，假设不存在重复
      const existingUsers = wx.getStorageSync('allUsers') || {};
      return existingUsers.hasOwnProperty(userId);
    } catch (error) {
      console.error('检查用户ID失败:', error);
      return false;
    }
  }

  /**
   * 生成唯一的用户ID
   */
  generateUniqueUserId() {
    let userId;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      userId = this.generateUserId();
      attempts++;
    } while (this.isUserIdExists(userId) && attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      // 如果10次都重复，使用时间戳确保唯一性
      userId = this.generateUserId() + Date.now().toString().slice(-2);
      userId = userId.substring(0, 8);
    }
    
    return userId;
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser() {
    try {
      const defaultUser = {
        id: '',
        name: '冒险者',
        avatar: '👤',
        level: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

      let currentUser = wx.getStorageSync('currentUser') || defaultUser;
      
      // 如果用户没有ID，生成一个
      if (!currentUser.id) {
        currentUser.id = this.generateUniqueUserId();
        this.saveCurrentUser(currentUser);
        this.registerUser(currentUser);
      }
      
      return currentUser;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return {
        id: this.generateUniqueUserId(),
        name: '冒险者',
        avatar: '👤',
        level: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
    }
  }

  /**
   * 保存当前用户信息
   */
  saveCurrentUser(user) {
    try {
      user.lastActive = new Date().toISOString();
      wx.setStorageSync('currentUser', user);
      
      // 同时更新全局用户列表
      this.updateUserInGlobalList(user);
      
      return true;
    } catch (error) {
      console.error('保存当前用户失败:', error);
      return false;
    }
  }

  /**
   * 注册用户到全局列表
   */
  registerUser(user) {
    try {
      const allUsers = wx.getStorageSync('allUsers') || {};
      allUsers[user.id] = {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        level: user.level,
        status: user.status,
        lastActive: user.lastActive
      };
      wx.setStorageSync('allUsers', allUsers);
      return true;
    } catch (error) {
      console.error('注册用户失败:', error);
      return false;
    }
  }

  /**
   * 更新全局用户列表中的用户信息
   */
  updateUserInGlobalList(user) {
    try {
      const allUsers = wx.getStorageSync('allUsers') || {};
      if (allUsers[user.id]) {
        allUsers[user.id] = {
          ...allUsers[user.id],
          name: user.name,
          avatar: user.avatar,
          level: user.level,
          status: user.status,
          lastActive: user.lastActive
        };
        wx.setStorageSync('allUsers', allUsers);
      }
      return true;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return false;
    }
  }

  /**
   * 更新用户状态
   */
  updateUserStatus(status) {
    try {
      const currentUser = this.getCurrentUser();
      currentUser.status = status;
      return this.saveCurrentUser(currentUser);
    } catch (error) {
      console.error('更新用户状态失败:', error);
      return false;
    }
  }

  /**
   * 获取用户状态信息
   */
  getUserStatuses() {
    return this.userStatuses;
  }

  /**
   * 格式化用户ID显示
   */
  formatUserId(userId) {
    if (!userId || userId.length !== 8) return userId;
    return userId.substring(0, 4) + '-' + userId.substring(4);
  }

  /**
   * 记录用户活动
   */
  recordUserActivity(activityType, activityData) {
    try {
      const currentUser = this.getCurrentUser();
      const activity = {
        id: 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        type: activityType,
        data: activityData,
        timestamp: new Date().toISOString(),
        isPublic: true
      };

      // 获取用户活动记录
      const userActivities = wx.getStorageSync('userActivities') || [];
      userActivities.unshift(activity);

      // 只保留最近50条活动
      if (userActivities.length > 50) {
        userActivities.splice(50);
      }

      wx.setStorageSync('userActivities', userActivities);

      // 更新用户最后活跃时间
      currentUser.lastActive = new Date().toISOString();
      this.saveCurrentUser(currentUser);

      return {
        success: true,
        activity: activity
      };
    } catch (error) {
      console.error('记录用户活动失败:', error);
      return { success: false, error: '记录活动失败' };
    }
  }

  /**
   * 获取用户活动记录
   */
  getUserActivities(userId = null, limit = 20) {
    try {
      const allActivities = wx.getStorageSync('userActivities') || [];

      let activities = allActivities;
      if (userId) {
        activities = allActivities.filter(activity => activity.userId === userId);
      }

      return activities.slice(0, limit);
    } catch (error) {
      console.error('获取用户活动失败:', error);
      return [];
    }
  }


}

// 导出单例实例
const userService = new UserService();
module.exports = userService;
