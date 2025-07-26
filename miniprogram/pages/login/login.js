// 登录页面
import { getAuthService, checkLoginStatus } from '../../utils/auth-helper.js';

Page({
  data: {
    loading: false,
    loginStep: 'welcome', // welcome, authorizing, success
    userInfo: {
      nickName: '',
      avatarUrl: ''
    },
    appInfo: {
      name: '现实世界RPG',
      version: '1.0.0',
      description: '将你的生活变成一场精彩的冒险'
    }
  },

  onLoad: function(options) {
    // 检查是否已经登录
    if (checkLoginStatus()) {
      this.navigateToMain();
      return;
    }

    // 检查是否从其他页面跳转过来
    if (options.redirect) {
      this.setData({
        redirectUrl: decodeURIComponent(options.redirect)
      });
    }
  },

  onShow: function() {
    // 重置登录状态
    this.setData({
      loginStep: 'welcome',
      loading: false
    });
  },

  /**
   * 开始微信登录
   */
  async startWxLogin() {
    if (this.data.loading) return;

    this.setData({ 
      loading: true,
      loginStep: 'authorizing'
    });

    try {
      const authService = getAuthService();
      if (!authService) {
        throw new Error('认证服务未初始化');
      }

      // 传入用户信息
      const result = await authService.wxLogin(this.data.userInfo);
      
      if (result.success) {
        this.setData({
          loginStep: 'success',
          userInfo: result.user
        });

        // 延迟跳转，让用户看到成功状态
        setTimeout(() => {
          this.navigateToMain();
        }, 1500);
      } else {
        this.handleLoginError(result.error);
      }
    } catch (error) {
      this.handleLoginError(error.message);
    }
  },

  /**
   * 处理登录错误
   */
  handleLoginError(errorMessage) {
    this.setData({
      loading: false,
      loginStep: 'welcome'
    });

    wx.showModal({
      title: '登录失败',
      content: errorMessage || '登录过程中出现错误，请重试',
      showCancel: true,
      cancelText: '取消',
      confirmText: '重试',
      success: (res) => {
        if (res.confirm) {
          this.startWxLogin();
        }
      }
    });
  },

  /**
   * 跳转到主页面
   */
  navigateToMain() {
    const redirectUrl = this.data.redirectUrl;
    
    if (redirectUrl) {
      // 如果有重定向URL，跳转到指定页面
      wx.redirectTo({
        url: redirectUrl,
        fail: () => {
          // 如果跳转失败，回到首页
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    } else {
      // 默认跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  /**
   * 查看隐私政策
   */
  viewPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们承诺保护您的隐私安全。您的个人信息仅用于提供更好的游戏体验，不会泄露给第三方。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 查看用户协议
   */
  viewUserAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '使用本应用即表示您同意我们的用户协议。请合理使用应用功能，共同维护良好的使用环境。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 游客模式（暂不实现）
   */
  guestMode() {
    wx.showToast({
      title: '游客模式暂未开放',
      icon: 'none'
    });
  },

  /**
   * 查看应用介绍
   */
  viewAppIntro() {
    wx.showModal({
      title: '关于现实世界RPG',
      content: '这是一款将现实生活游戏化的应用。通过完成日常任务、培养良好习惯来提升你的虚拟角色，让生活变得更有趣、更有动力！',
      showCancel: false,
      confirmText: '开始冒险'
    });
  },

  /**
   * 分享应用
   */
  onShareAppMessage() {
    return {
      title: '现实世界RPG - 让生活变成游戏',
      desc: '将你的日常生活变成一场精彩的RPG冒险！',
      path: '/pages/login/login'
    };
  },

  /**
   * 选择头像
   */
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    });
  },

  /**
   * 输入昵称
   */
  onNicknameInput(e) {
    const nickName = e.detail.value;
    this.setData({
      'userInfo.nickName': nickName
    });
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '现实世界RPG - 让生活变成游戏',
      query: 'from=timeline'
    };
  }
});
