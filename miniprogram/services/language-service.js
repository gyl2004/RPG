// 语言管理服务
// 处理应用的多语言支持

const languageService = {
  // 支持的语言配置
  languages: {
    'zh-CN': {
      name: '简体中文',
      nativeName: '简体中文',
      region: '中国大陆',
      code: 'zh-CN'
    },
    'zh-TW': {
      name: '繁體中文',
      nativeName: '繁體中文',
      region: '中国台湾',
      code: 'zh-TW'
    },
    'en-US': {
      name: 'English',
      nativeName: 'English',
      region: 'United States',
      code: 'en-US'
    }
  },

  // 文本资源（简化版本）
  texts: {
    'zh-CN': {
      // 通用
      'common.confirm': '确认',
      'common.cancel': '取消',
      'common.save': '保存',
      'common.delete': '删除',
      'common.edit': '编辑',
      'common.loading': '加载中...',
      'common.success': '成功',
      'common.failed': '失败',
      
      // 设置页面
      'settings.title': '设置',
      'settings.general': '通用设置',
      'settings.appearance': '外观设置',
      'settings.data': '数据管理',
      'settings.help': '帮助与支持',
      'settings.account': '账户管理',
      'settings.notifications': '消息通知',
      'settings.autoBackup': '自动备份',
      'settings.theme': '主题',
      'settings.language': '语言',
      
      // 主题
      'theme.dark': '深色主题',
      'theme.light': '浅色主题',
      'theme.switched': '主题已切换',
      
      // 语言
      'language.switched': '语言已切换',
      'language.restart_required': '语言设置将在重启应用后完全生效'
    },
    
    'zh-TW': {
      // 通用
      'common.confirm': '確認',
      'common.cancel': '取消',
      'common.save': '保存',
      'common.delete': '刪除',
      'common.edit': '編輯',
      'common.loading': '載入中...',
      'common.success': '成功',
      'common.failed': '失敗',
      
      // 設置頁面
      'settings.title': '設置',
      'settings.general': '通用設置',
      'settings.appearance': '外觀設置',
      'settings.data': '數據管理',
      'settings.help': '幫助與支持',
      'settings.account': '賬戶管理',
      'settings.notifications': '消息通知',
      'settings.autoBackup': '自動備份',
      'settings.theme': '主題',
      'settings.language': '語言',
      
      // 主題
      'theme.dark': '深色主題',
      'theme.light': '淺色主題',
      'theme.switched': '主題已切換',
      
      // 語言
      'language.switched': '語言已切換',
      'language.restart_required': '語言設置將在重啟應用後完全生效'
    },
    
    'en-US': {
      // Common
      'common.confirm': 'Confirm',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.loading': 'Loading...',
      'common.success': 'Success',
      'common.failed': 'Failed',
      
      // Settings page
      'settings.title': 'Settings',
      'settings.general': 'General Settings',
      'settings.appearance': 'Appearance',
      'settings.data': 'Data Management',
      'settings.help': 'Help & Support',
      'settings.account': 'Account Management',
      'settings.notifications': 'Notifications',
      'settings.autoBackup': 'Auto Backup',
      'settings.theme': 'Theme',
      'settings.language': 'Language',
      
      // Theme
      'theme.dark': 'Dark Theme',
      'theme.light': 'Light Theme',
      'theme.switched': 'Theme switched',
      
      // Language
      'language.switched': 'Language switched',
      'language.restart_required': 'Language settings will take full effect after restarting the app'
    }
  },

  /**
   * 获取当前语言
   */
  getCurrentLanguage() {
    try {
      const userSettings = wx.getStorageSync('userInfo')?.settings;
      const currentLanguage = userSettings?.language || 'zh-CN';
      return this.languages[currentLanguage] || this.languages['zh-CN'];
    } catch (error) {
      console.error('获取当前语言失败:', error);
      return this.languages['zh-CN'];
    }
  },

  /**
   * 获取当前语言代码
   */
  getCurrentLanguageCode() {
    return this.getCurrentLanguage().code;
  },

  /**
   * 获取所有可用语言
   */
  getAvailableLanguages() {
    return Object.keys(this.languages).map(key => ({
      key,
      ...this.languages[key]
    }));
  },

  /**
   * 获取文本
   */
  getText(key, languageCode = null) {
    try {
      const langCode = languageCode || this.getCurrentLanguageCode();
      const texts = this.texts[langCode] || this.texts['zh-CN'];
      return texts[key] || key;
    } catch (error) {
      console.error('获取文本失败:', error);
      return key;
    }
  },

  /**
   * 批量获取文本
   */
  getTexts(keys, languageCode = null) {
    const result = {};
    keys.forEach(key => {
      result[key] = this.getText(key, languageCode);
    });
    return result;
  },

  /**
   * 切换语言
   */
  async switchLanguage(languageCode) {
    try {
      if (!this.languages[languageCode]) {
        throw new Error(`不支持的语言: ${languageCode}`);
      }

      const language = this.languages[languageCode];
      
      // 更新用户设置
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        userInfo.settings = userInfo.settings || {};
        userInfo.settings.language = languageCode;
        wx.setStorageSync('userInfo', userInfo);
      }

      // 保存到全局存储
      wx.setStorageSync('currentLanguage', languageCode);

      // 通知所有页面语言已变更
      this.notifyLanguageChange(languageCode);

      console.log(`语言已切换到: ${language.name}`);
      return { success: true, language };
    } catch (error) {
      console.error('切换语言失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 通知语言变更
   */
  notifyLanguageChange(languageCode) {
    try {
      // 获取当前所有页面
      const pages = getCurrentPages();
      
      pages.forEach(page => {
        // 如果页面有语言变更处理方法，则调用
        if (page.onLanguageChange && typeof page.onLanguageChange === 'function') {
          page.onLanguageChange(languageCode, this.languages[languageCode]);
        }
      });

      console.log(`语言变更通知已发送给 ${pages.length} 个页面`);
    } catch (error) {
      console.error('通知语言变更失败:', error);
    }
  },

  /**
   * 根据系统语言自动选择
   */
  getSystemLanguage() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      const systemLanguage = systemInfo.language;
      
      // 映射系统语言到支持的语言
      const languageMap = {
        'zh_CN': 'zh-CN',
        'zh-CN': 'zh-CN',
        'zh_TW': 'zh-TW',
        'zh-TW': 'zh-TW',
        'en': 'en-US',
        'en_US': 'en-US',
        'en-US': 'en-US'
      };

      return languageMap[systemLanguage] || 'zh-CN';
    } catch (error) {
      console.error('获取系统语言失败:', error);
      return 'zh-CN';
    }
  },

  /**
   * 初始化语言系统
   */
  initLanguageSystem() {
    try {
      const currentLanguage = this.getCurrentLanguage();
      console.log('语言系统初始化完成，当前语言:', currentLanguage.name);
      return { success: true, language: currentLanguage };
    } catch (error) {
      console.error('语言系统初始化失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 格式化文本（支持参数替换）
   */
  formatText(key, params = {}, languageCode = null) {
    let text = this.getText(key, languageCode);
    
    // 替换参数
    Object.keys(params).forEach(param => {
      const placeholder = `{${param}}`;
      text = text.replace(new RegExp(placeholder, 'g'), params[param]);
    });

    return text;
  }
};

module.exports = languageService;