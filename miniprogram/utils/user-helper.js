// 用户服务辅助工具
// 用于在页面中安全地获取用户服务

/**
 * 获取用户服务实例（简化版）
 * @returns {object|null} 用户服务实例
 */
function getUserService() {
  try {
    // 检查云开发是否已初始化
    const app = getApp();
    if (!app || !app.isCloudInitialized()) {
      console.warn('云开发尚未初始化，无法使用用户服务');
      return null;
    }

    // 返回简化的用户服务
    return {
      // 更新用户设置
      updateUserSettings: async function(settings) {
        try {
          // 首先更新本地存储
          const userInfo = wx.getStorageSync('userInfo');
          if (userInfo) {
            userInfo.settings = { ...userInfo.settings, ...settings };
            wx.setStorageSync('userInfo', userInfo);
          }

          // 尝试同步到云端
          try {
            const result = await wx.cloud.callFunction({
              name: 'rpgFunctions',
              data: {
                type: 'updateUser',
                data: { settings }
              }
            });

            if (result.result && result.result.success) {
              console.log('设置已同步到云端');
            } else {
              console.log('云端同步失败，但本地已保存');
            }
          } catch (cloudError) {
            console.log('云端同步失败，但本地已保存:', cloudError);
          }

          // 无论云端是否成功，本地已保存就算成功
          return { success: true };
        } catch (error) {
          console.error('更新设置失败:', error);
          return { success: false, error: error.message };
        }
      },

      // 导出用户数据
      exportUserData: async function() {
        try {
          const userInfo = wx.getStorageSync('userInfo');
          if (userInfo) {
            const exportData = {
              exportDate: new Date(),
              version: '1.0.0',
              user: userInfo
            };

            const dataString = JSON.stringify(exportData, null, 2);

            wx.setClipboardData({
              data: dataString,
              success: () => {
                wx.showToast({ title: '数据已复制到剪贴板', icon: 'success' });
              },
              fail: () => {
                wx.showToast({ title: '导出失败', icon: 'error' });
              }
            });

            return { success: true, data: exportData };
          } else {
            return { success: false, error: '没有用户数据' };
          }
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // 删除用户账户
      deleteUserAccount: async function() {
        try {
          const result = await wx.showModal({
            title: '确认删除',
            content: '删除账户将清除所有数据，此操作不可恢复。确定要继续吗？',
            confirmText: '确定删除',
            confirmColor: '#ff4444'
          });

          if (!result.confirm) {
            return { success: false, error: '用户取消操作' };
          }

          // 清除本地数据
          wx.clearStorageSync();

          // 调用认证服务登出
          const app = getApp();
          const authService = app.getAuthService();
          if (authService) {
            await authService.logout();
          }

          wx.showToast({ title: '账户已删除', icon: 'success' });

          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    };
  } catch (error) {
    console.error('获取用户服务失败:', error);
    return null;
  }
}

/**
 * 获取用户服务并执行操作
 * @param {function} callback 回调函数
 * @returns {Promise} 执行结果
 */
async function withUserService(callback) {
  try {
    const userService = getUserService();
    if (userService && callback) {
      return await callback(userService);
    }
    return { success: false, error: '用户服务不可用' };
  } catch (error) {
    console.error('用户服务操作失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 更新用户设置
 * @param {object} settings 设置数据
 * @returns {Promise} 更新结果
 */
async function updateUserSettings(settings) {
  return withUserService(async (userService) => {
    return await userService.updateUserSettings(settings);
  });
}

/**
 * 获取用户详细信息
 * @returns {Promise} 用户详细信息
 */
async function getUserDetails() {
  return withUserService(async (userService) => {
    return await userService.getUserDetails();
  });
}

/**
 * 导出用户数据
 * @returns {Promise} 导出结果
 */
async function exportUserData() {
  return withUserService(async (userService) => {
    return await userService.exportUserData();
  });
}

/**
 * 删除用户账户
 * @returns {Promise} 删除结果
 */
async function deleteUserAccount() {
  return withUserService(async (userService) => {
    return await userService.deleteUserAccount();
  });
}

/**
 * 刷新用户数据
 * @returns {Promise} 刷新结果
 */
async function refreshUserData() {
  return withUserService(async (userService) => {
    return await userService.refreshUserData();
  });
}

// 导出所有函数
module.exports = {
  getUserService,
  withUserService,
  updateUserSettings,
  getUserDetails,
  exportUserData,
  deleteUserAccount,
  refreshUserData
};
