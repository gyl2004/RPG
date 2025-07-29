// 主题管理服务
// 处理应用的主题切换和样式管理

const themeService = {
  // 主题配置
  themes: {
    dark: {
      name: '深色主题',
      description: '适合夜间使用，护眼舒适',
      colors: {
        primary: '#3b82f6',
        background: '#1a1a2e',
        surface: '#16213e',
        text: '#ffffff',
        textSecondary: '#a0a0a0',
        border: 'rgba(255, 255, 255, 0.1)'
      }
    },
    light: {
      name: '浅色主题',
      description: '适合白天使用，清新明亮',
      colors: {
        primary: '#3b82f6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1f2937',
        textSecondary: '#6b7280',
        border: 'rgba(0, 0, 0, 0.1)'
      }
    }
  },

  /**
   * 获取当前主题
   */
  getCurrentTheme() {
    try {
      const userSettings = wx.getStorageSync('userInfo')?.settings;
      const currentTheme = userSettings?.theme || 'dark';
      return this.themes[currentTheme] || this.themes.dark;
    } catch (error) {
      console.error('获取当前主题失败:', error);
      return this.themes.dark;
    }
  },

  /**
   * 获取主题配置
   */
  getThemeConfig(themeName) {
    return this.themes[themeName] || this.themes.dark;
  },

  /**
   * 获取所有可用主题
   */
  getAvailableThemes() {
    return Object.keys(this.themes).map(key => ({
      key,
      ...this.themes[key]
    }));
  },

  /**
   * 应用主题到页面
   */
  applyThemeToPage(themeName, pageContext) {
    try {
      const theme = this.getThemeConfig(themeName);
      
      if (pageContext && pageContext.setData) {
        pageContext.setData({
          currentTheme: theme,
          themeColors: theme.colors
        });
      }

      // 保存当前主题到全局
      wx.setStorageSync('currentTheme', themeName);
      
      console.log(`主题 ${themeName} 已应用到页面`);
      return { success: true, theme };
    } catch (error) {
      console.error('应用主题失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 切换主题
   */
  async switchTheme(themeName) {
    try {
      if (!this.themes[themeName]) {
        throw new Error(`未知的主题: ${themeName}`);
      }

      const theme = this.themes[themeName];
      
      // 更新用户设置
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        userInfo.settings = userInfo.settings || {};
        userInfo.settings.theme = themeName;
        wx.setStorageSync('userInfo', userInfo);
      }

      // 保存到全局存储
      wx.setStorageSync('currentTheme', themeName);

      // 通知所有页面主题已变更
      this.notifyThemeChange(themeName);

      console.log(`主题已切换到: ${theme.name}`);
      return { success: true, theme };
    } catch (error) {
      console.error('切换主题失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 通知主题变更
   */
  notifyThemeChange(themeName) {
    try {
      // 获取当前所有页面
      const pages = getCurrentPages();
      
      pages.forEach(page => {
        // 如果页面有主题变更处理方法，则调用
        if (page.onThemeChange && typeof page.onThemeChange === 'function') {
          page.onThemeChange(themeName, this.getThemeConfig(themeName));
        }
      });

      console.log(`主题变更通知已发送给 ${pages.length} 个页面`);
    } catch (error) {
      console.error('通知主题变更失败:', error);
    }
  },

  /**
   * 获取主题相关的CSS变量
   */
  getThemeCSSVariables(themeName) {
    const theme = this.getThemeConfig(themeName);
    const cssVars = {};
    
    Object.keys(theme.colors).forEach(key => {
      cssVars[`--theme-${key}`] = theme.colors[key];
    });

    return cssVars;
  },

  /**
   * 根据时间自动选择主题
   */
  getAutoTheme() {
    const hour = new Date().getHours();
    
    // 晚上7点到早上7点使用深色主题
    if (hour >= 19 || hour < 7) {
      return 'dark';
    } else {
      return 'light';
    }
  },

  /**
   * 初始化主题系统
   */
  initThemeSystem() {
    try {
      const currentTheme = this.getCurrentTheme();
      console.log('主题系统初始化完成，当前主题:', currentTheme.name);
      return { success: true, theme: currentTheme };
    } catch (error) {
      console.error('主题系统初始化失败:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = themeService;