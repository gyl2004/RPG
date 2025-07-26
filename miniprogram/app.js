// 现实世界RPG应用入口
// 注意：这里不能直接导入认证服务，因为它依赖云开发
// 将在云开发初始化完成后再加载

App({
  onLaunch: function () {
    console.log('现实世界RPG应用启动');

    // 全局数据
    this.globalData = {
      // 云开发环境ID
      env: "cloud1-1gf83xgo315db82d",
      userInfo: null,
      character: null,
      isLoggedIn: false,
      aiService: null, // AI服务实例
      cloudDB: null // 云数据库服务实例
    };

    // 首先初始化云开发
    this.initCloud().then(() => {
      // 云开发初始化完成后，标记为已初始化
      this.cloudInitialized = true;
      console.log('云开发初始化完成，可以使用云服务');

      // 初始化AI服务
      this.initAIService();

      // 初始化云数据库服务
      this.initCloudDatabase();

      // 检查登录状态
      this.checkLoginStatus();
    }).catch((error) => {
      console.error('云开发初始化失败:', error);
      wx.showToast({
        title: '初始化失败',
        icon: 'error'
      });
    });
  },

  // 初始化云开发
  initCloud: function() {
    return new Promise((resolve, reject) => {
      if (!wx.cloud) {
        const error = "请使用 2.2.3 或以上的基础库以使用云能力";
        console.error(error);
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用云开发功能，请升级微信版本',
          showCancel: false
        });
        reject(new Error(error));
        return;
      }

      try {
        wx.cloud.init({
          env: this.globalData.env,
          traceUser: true,
        });
        console.log('云开发初始化成功');
        resolve();
      } catch (error) {
        console.error('云开发初始化失败:', error);
        wx.showToast({
          title: '云服务初始化失败',
          icon: 'none'
        });
        reject(error);
      }
    });
  },

  // 初始化AI服务
  initAIService: function() {
    try {
      // 尝试加载DeepSeek AI服务（实际是ChatAnywhere）
      const aiService = require('./services/deepseek-ai-service.js');
      this.globalData.aiService = aiService;
      console.log('✅ AI服务初始化成功');
    } catch (error) {
      console.error('❌ AI服务初始化失败:', error);
      // 可以在这里设置一个备用的本地AI服务
      this.globalData.aiService = null;
    }
  },

  // 初始化云数据库服务
  initCloudDatabase: function() {
    try {
      // 使用require加载云数据库服务
      const cloudDB = require('./services/cloud-database-service.js');
      const initResult = cloudDB.init();

      if (initResult) {
        this.globalData.cloudDB = cloudDB;
        console.log('✅ 云数据库服务初始化成功');
      } else {
        console.error('❌ 云数据库服务初始化失败');
        this.globalData.cloudDB = null;
      }
    } catch (error) {
      console.error('❌ 云数据库服务初始化异常:', error);
      this.globalData.cloudDB = null;
    }
  },

  // 获取认证服务（延迟加载）
  getAuthService: function() {
    if (!this.cloudInitialized) {
      console.warn('云开发尚未初始化，无法使用认证服务');
      return null;
    }

    if (!this.authService) {
      try {
        // 直接创建认证服务实例
        this.authService = this.createAuthService();
        console.log('认证服务加载完成');
      } catch (error) {
        console.error('认证服务加载失败:', error);
        return null;
      }
    }

    return this.authService;
  },

  // 创建认证服务实例
  createAuthService: function() {
    // 内联认证服务的核心功能
    return {
      isLoggedIn: false,
      currentUser: null,
      currentCharacter: null,

      // 检查登录状态
      checkLoginStatus: function() {
        const isLoggedIn = wx.getStorageSync('isLoggedIn');
        const userInfo = wx.getStorageSync('userInfo');
        const characterInfo = wx.getStorageSync('characterInfo');

        if (isLoggedIn && userInfo) {
          this.isLoggedIn = true;
          this.currentUser = userInfo;
          this.currentCharacter = characterInfo;

          // 更新全局状态
          const app = getApp();
          if (app) {
            app.globalData.userInfo = userInfo;
            app.globalData.character = characterInfo;
            app.globalData.isLoggedIn = true;
          }

          return true;
        }

        return false;
      },

      // 获取当前用户
      getCurrentUser: function() {
        return this.currentUser;
      },

      // 获取当前角色
      getCurrentCharacter: function() {
        return this.currentCharacter;
      },

      // 获取登录状态
      getLoginStatus: function() {
        return this.isLoggedIn;
      },

      // 微信登录（简化版）
      wxLogin: async function(userInfo) {
        try {
          wx.showLoading({ title: '登录中...' });

          // 1. 调用微信登录API获取code
          const loginResult = await this.getWxLoginCode();
          if (!loginResult.success) {
            throw new Error(loginResult.error);
          }

          // 2. 尝试调用云函数获取openid
          let openid = null;
          try {
            const openidResult = await this.getOpenId(loginResult.code);
            if (openidResult.success) {
              openid = openidResult.openid;
            }
          } catch (error) {
            console.warn('云函数获取openid失败，使用备用方案:', error);
          }

          // 3. 如果云函数失败，使用本地生成的临时ID
          if (!openid) {
            openid = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            console.log('使用临时openid:', openid);
          }

          // 4. 使用传入的用户信息或默认信息
          const nickname = userInfo?.nickName || '冒险者';
          const avatarUrl = userInfo?.avatarUrl || '';

          // 5. 创建用户数据
          const userData = {
            _id: openid,
            openid: openid,
            nickname: nickname,
            avatarUrl: avatarUrl,
            gender: userInfo?.gender || 0,
            country: userInfo?.country || '',
            province: userInfo?.province || '',
            city: userInfo?.city || '',
            registrationDate: new Date().toISOString(),
            lastLoginDate: new Date().toISOString(),
            settings: {
              notifications: true,
              soundEffects: true,
              theme: 'dark',
              language: 'zh-CN',
              autoBackup: true,
              privacyMode: false
            },
            statistics: {
              tasksCompleted: 0,
              habitsFormed: 0,
              achievementsUnlocked: 0,
              experienceGained: 0,
              loginDays: 1
            }
          };

          // 6. 创建默认角色数据
          const characterData = {
            _id: 'char_' + openid,
            userId: openid,
            name: nickname,
            class: '新手冒险者',
            level: 1,
            experience: 0,
            expPercent: 0,
            availableAttributePoints: 0,
            availableSkillPoints: 0,
            attributes: {
              strength: 10,
              intelligence: 10,
              charisma: 10,
              creativity: 10,
              discipline: 10,
              vitality: 10
            },
            skills: {},
            equipment: [],
            coins: 100, // 初始金币
            ownedAppearance: {
              theme: ['default'],
              avatarFrame: ['none'],
              equipment: ['basic_sword', 'basic_armor']
            },
            appearance: {
              avatar: avatarUrl,
              theme: 'default',
              avatarFrame: 'none',
              title: 'newbie',
              equipment: {
                weapon: 'basic_sword',
                armor: 'basic_armor'
              }
            },
            status: []
          };

          // 7. 设置登录状态
          this.setLoginState(userData, characterData);

          wx.hideLoading();
          wx.showToast({ title: '登录成功', icon: 'success' });

          return {
            success: true,
            user: this.currentUser,
            character: this.currentCharacter
          };

        } catch (error) {
          wx.hideLoading();
          wx.showToast({ title: error.message || '登录失败', icon: 'error' });
          console.error('微信登录失败:', error);

          return {
            success: false,
            error: error.message
          };
        }
      },

      // 获取微信登录code
      getWxLoginCode: function() {
        return new Promise((resolve) => {
          wx.login({
            success: (res) => {
              if (res.code) {
                resolve({ success: true, code: res.code });
              } else {
                resolve({ success: false, error: '获取登录code失败' });
              }
            },
            fail: (error) => {
              resolve({ success: false, error: error.errMsg || '微信登录失败' });
            }
          });
        });
      },

      // 通过云函数获取openid
      getOpenId: async function(code) {
        try {
          const result = await wx.cloud.callFunction({
            name: 'rpgFunctions',
            data: {
              type: 'getOpenId',
              data: { code }
            }
          });

          if (result.result && result.result.success) {
            return {
              success: true,
              openid: result.result.data.openid
            };
          } else {
            return {
              success: false,
              error: result.result?.error || '获取openid失败'
            };
          }
        } catch (error) {
          return {
            success: false,
            error: error.message || '云函数调用失败'
          };
        }
      },





      // 设置登录状态
      setLoginState: function(user, character) {
        this.isLoggedIn = true;
        this.currentUser = user;
        this.currentCharacter = character;

        // 保存到本地存储
        wx.setStorageSync('userInfo', user);
        wx.setStorageSync('characterInfo', character);
        wx.setStorageSync('isLoggedIn', true);

        // 更新全局状态
        const app = getApp();
        if (app) {
          app.globalData.userInfo = user;
          app.globalData.character = character;
          app.globalData.isLoggedIn = true;
        }
      },

      // 登出
      logout: async function() {
        try {
          // 清除本地状态
          this.isLoggedIn = false;
          this.currentUser = null;
          this.currentCharacter = null;

          // 清除本地存储
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('characterInfo');
          wx.removeStorageSync('isLoggedIn');

          // 清除全局状态
          const app = getApp();
          if (app) {
            app.globalData.userInfo = null;
            app.globalData.character = null;
            app.globalData.isLoggedIn = false;
          }

          wx.showToast({ title: '已退出登录', icon: 'success' });

          return { success: true };
        } catch (error) {
          wx.showToast({ title: '退出登录失败', icon: 'error' });
          return { success: false, error: error.message };
        }
      }
    };
  },

  // 检查登录状态
  checkLoginStatus: function() {
    // 确保云开发已初始化
    if (!this.cloudInitialized) {
      console.log('云开发尚未初始化，延迟检查登录状态');
      setTimeout(() => {
        this.checkLoginStatus();
      }, 500);
      return;
    }

    const authService = this.getAuthService();
    if (!authService) {
      console.log('认证服务不可用');
      return;
    }

    const isLoggedIn = authService.checkLoginStatus();
    if (isLoggedIn) {
      this.globalData.userInfo = authService.getCurrentUser();
      this.globalData.character = authService.getCurrentCharacter();
      this.globalData.isLoggedIn = true;
      console.log('用户已登录:', this.globalData.userInfo?.nickname);

      // 登录成功后尝试从云端加载数据
      this.loadCloudDataAfterLogin();
    } else {
      console.log('用户未登录');
      // 如果当前不在登录页面，跳转到登录页面
      this.redirectToLogin();
    }
  },

  // 登录后加载云端数据
  loadCloudDataAfterLogin: function() {
    // 延迟执行，确保云数据库服务已初始化
    setTimeout(async () => {
      try {
        const characterService = require('./services/character-service.js');
        const loadResult = await characterService.loadFromCloud();

        if (loadResult) {
          console.log('✅ 云端数据加载成功，界面将自动更新');

          // 通知所有页面数据已更新
          const pages = getCurrentPages();
          pages.forEach(page => {
            if (page.onCloudDataLoaded && typeof page.onCloudDataLoaded === 'function') {
              page.onCloudDataLoaded();
            }
          });
        } else {
          console.log('ℹ️ 使用本地数据或已同步到云端');
        }
      } catch (error) {
        console.error('❌ 加载云端数据失败:', error);
      }
    }, 2000); // 等待2秒确保服务初始化完成
  },

  // 重定向到登录页面
  redirectToLogin: function() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];

    // 如果当前页面不是登录页面，则跳转
    if (currentPage && currentPage.route !== 'pages/login/login') {
      wx.redirectTo({
        url: '/pages/login/login',
        fail: () => {
          console.error('跳转到登录页面失败');
        }
      });
    }
  },

  // 用户登录（由认证服务调用）
  login: function(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    console.log('全局登录状态已更新');
  },

  // 同步用户信息到云数据库
  syncUserToCloud: function(userInfo) {
    const db = wx.cloud.database();
    const users = db.collection('users');

    users.where({
      openid: userInfo.openid || '{openid}'
    }).get().then(res => {
      if (res.data.length === 0) {
        // 新用户，创建记录
        users.add({
          data: {
            ...userInfo,
            registrationDate: new Date(),
            lastLoginDate: new Date(),
            statistics: {
              tasksCompleted: 0,
              habitsFormed: 0,
              achievementsUnlocked: 0,
              experienceGained: 0
            }
          }
        }).then(() => {
          console.log('新用户信息已保存');
          this.createDefaultCharacter();
        }).catch(err => {
          console.error('保存用户信息失败:', err);
        });
      } else {
        // 老用户，更新最后登录时间
        users.doc(res.data[0]._id).update({
          data: {
            lastLoginDate: new Date(),
            ...userInfo
          }
        }).then(() => {
          console.log('用户信息已更新');
        });
      }
    }).catch(err => {
      console.error('查询用户信息失败:', err);
    });
  },

  // 创建默认角色
  createDefaultCharacter: function() {
    const db = wx.cloud.database();
    const characters = db.collection('characters');

    characters.add({
      data: {
        name: this.globalData.userInfo.nickName || '冒险者',
        class: '新手冒险者',
        level: 1,
        experience: 0,
        attributes: {
          strength: 10,
          intelligence: 10,
          charisma: 10,
          creativity: 10,
          discipline: 10,
          vitality: 10
        },
        skills: [],
        equipment: [],
        appearance: {},
        status: []
      }
    }).then(() => {
      console.log('默认角色已创建');
    }).catch(err => {
      console.error('创建角色失败:', err);
    });
  },

  // 用户登出（由认证服务调用）
  logout: function() {
    this.globalData.userInfo = null;
    this.globalData.character = null;
    this.globalData.isLoggedIn = false;
    console.log('全局登录状态已清除');

    // 跳转到登录页面
    this.redirectToLogin();
  },

  // 检查云开发是否已初始化
  isCloudInitialized: function() {
    return this.cloudInitialized || false;
  }
});
