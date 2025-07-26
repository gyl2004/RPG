// 认证服务辅助工具
// 用于在页面中安全地获取认证服务

/**
 * 获取认证服务实例
 * @returns {object|null} 认证服务实例
 */
function getAuthService() {
  try {
    const app = getApp();
    if (!app) {
      console.warn('App实例不可用');
      return null;
    }

    if (!app.isCloudInitialized()) {
      console.warn('云开发尚未初始化');
      return null;
    }

    return app.getAuthService();
  } catch (error) {
    console.error('获取认证服务失败:', error);
    return null;
  }
}

/**
 * 检查登录状态
 * @returns {boolean} 是否已登录
 */
function checkLoginStatus() {
  const authService = getAuthService();
  return authService ? authService.getLoginStatus() : false;
}

/**
 * 获取当前用户
 * @returns {object|null} 当前用户信息
 */
function getCurrentUser() {
  const authService = getAuthService();
  return authService ? authService.getCurrentUser() : null;
}

/**
 * 获取当前角色
 * @returns {object|null} 当前角色信息
 */
function getCurrentCharacter() {
  const authService = getAuthService();
  return authService ? authService.getCurrentCharacter() : null;
}

/**
 * 重定向到登录页面
 * @param {string} redirectUrl 登录成功后的重定向URL
 */
function redirectToLogin(redirectUrl) {
  const url = redirectUrl 
    ? `/pages/login/login?redirect=${encodeURIComponent(redirectUrl)}`
    : '/pages/login/login';
    
  wx.redirectTo({
    url: url,
    fail: () => {
      console.error('跳转到登录页面失败');
    }
  });
}

/**
 * 检查登录状态并重定向（如果未登录）
 * @param {string} currentPageUrl 当前页面URL
 * @returns {boolean} 是否已登录
 */
function checkLoginAndRedirect(currentPageUrl) {
  if (!checkLoginStatus()) {
    redirectToLogin(currentPageUrl);
    return false;
  }
  return true;
}

// 导出所有函数
module.exports = {
  getAuthService,
  checkLoginStatus,
  getCurrentUser,
  getCurrentCharacter,
  redirectToLogin,
  checkLoginAndRedirect
};
