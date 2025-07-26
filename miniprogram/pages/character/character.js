// 角色页面

Page({
  data: {
    character: null,
    user: null,
    attributes: {},
    powerLevel: 0,
    expProgress: 0,
    characterTitle: '',
    availablePoints: 0,
    loading: false,
    showAttributeModal: false,
    selectedAttribute: null,
    showLevelUpModal: false,
    levelUpData: {},
    expToNextLevel: 0,
    levelTier: {},
    allocatingMode: false,
    originalAvailablePoints: 0,
    tempAttributes: {}
  },

  onLoad: function() {
    console.log('📄 角色页面 onLoad');
    this.loadCharacterData();
  },

  onShow: function() {
    console.log('📄 角色页面 onShow');
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    // 重新加载角色数据，以获取最新状态
    this.loadCharacterData();
  },

  /**
   * 获取角色服务
   */
  getCharacterService() {
    try {
      return require('../../services/character-service.js');
    } catch (error) {
      console.error('获取角色服务失败:', error);
      return null;
    }
  },

  /**
   * 安全调用角色服务方法
   */
  safeCallCharacterService(methodName, ...args) {
    try {
      const characterService = this.getCharacterService();
      if (!characterService) {
        console.warn(`角色服务不可用，无法调用 ${methodName}`);
        return null;
      }
      
      if (typeof characterService[methodName] !== 'function') {
        console.warn(`角色服务方法 ${methodName} 不存在`);
        return null;
      }
      
      return characterService[methodName](...args);
    } catch (error) {
      console.error(`调用角色服务方法 ${methodName} 失败:`, error);
      return null;
    }
  },

  /**
   * 加载角色数据
   */
  async loadCharacterData() {
    try {
      console.log('🔄 开始加载角色数据');
      this.setData({ loading: true });

      // 获取角色服务
      const characterService = this.getCharacterService();
      if (!characterService) {
        console.error('❌ 角色服务不可用');
        this.setData({ loading: false });
        return;
      }
      
      // 从多个来源获取角色数据
      const app = getApp();
      let character = app.globalData.character || 
                     wx.getStorageSync('characterInfo') || 
                     wx.getStorageSync('character');
      
      const user = app.globalData.userInfo || wx.getStorageSync('userInfo');
      
      console.log('🔄 获取到的角色数据:', character);
      console.log('🔄 获取到的用户数据:', user);

      if (character) {
        // 计算角色相关数据
        const powerLevel = this.safeCallCharacterService('calculatePowerLevel', character) || 0;
        const expProgress = this.safeCallCharacterService('calculateExpProgress', character) || 0;
        const characterTitle = this.safeCallCharacterService('getCharacterTitle', character) || '新手冒险者';
        const attributesInfo = this.safeCallCharacterService('getAllAttributesInfo') || {};
        const expToNextLevel = this.safeCallCharacterService('getExpRemaining', character) || 0;
        const levelTier = this.safeCallCharacterService('getLevelTier', character.level || 1) || { name: '新手', color: '#gray' };

        // 确保角色有属性数据
        if (!character.attributes) {
          character.attributes = {
            strength: 0,
            intelligence: 0,
            charisma: 0,
            creativity: 0,
            discipline: 0,
            vitality: 0
          };
        }

        // 创建默认属性信息
        const defaultAttributes = {
          strength: { name: '力量', icon: '💪', color: '#ef4444', description: '影响体力和耐力' },
          intelligence: { name: '智力', icon: '🧠', color: '#3b82f6', description: '影响学习和思考能力' },
          charisma: { name: '魅力', icon: '✨', color: '#f59e0b', description: '影响社交和领导力' },
          creativity: { name: '创造力', icon: '🎨', color: '#8b5cf6', description: '影响创新和艺术能力' },
          discipline: { name: '纪律性', icon: '🎯', color: '#10b981', description: '影响自控和执行力' },
          vitality: { name: '活力', icon: '⚡', color: '#f97316', description: '影响精力和恢复力' }
        };

        // 转换属性信息为数组格式，便于在WXML中遍历
        const attributesList = Object.keys(defaultAttributes).map(key => ({
          id: key,
          ...defaultAttributes[key],
          value: character.attributes[key] || 0
        }));

        // 调试信息
        console.log('属性信息:', defaultAttributes);
        console.log('属性列表:', attributesList);
        console.log('角色属性:', character.attributes);

        // 获取可用属性点
        const availablePoints = character.availableAttributePoints || 0;

        console.log('🔄 设置页面数据:');
        console.log('  - 角色数据:', character);
        console.log('  - 属性列表:', attributesList);
        console.log('  - 可用属性点:', availablePoints);

        this.setData({
          character,
          user,
          attributes: attributesInfo,
          attributesList,
          powerLevel,
          expProgress,
          characterTitle,
          availablePoints: availablePoints,
          expToNextLevel,
          levelTier
        });
        
        console.log('✅ 页面数据设置完成');
      }

      this.setData({ loading: false });
    } catch (error) {
      console.error('加载角色数据失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },



  /**
   * 显示属性详情
   */
  showAttributeDetail(e) {
    const attributeName = e.currentTarget.dataset.attribute;
    const attributeInfo = this.data.attributes[attributeName];

    if (attributeInfo) {
      this.setData({
        selectedAttribute: {
          id: attributeName,  // 使用英文key作为id
          name: attributeInfo.name,  // 中文名称
          ...attributeInfo,
          value: this.data.character.attributes[attributeName] || 0
        },
        showAttributeModal: true
      });
    }
  },

  /**
   * 关闭属性模态框
   */
  closeAttributeModal() {
    this.setData({
      showAttributeModal: false,
      selectedAttribute: null
    });
  },

  /**
   * 分配属性点
   */
  async allocateAttribute(e) {
    // 防重复调用
    if (this.allocatingAttribute) {
      console.log('⚠️ 属性分配中，忽略重复调用');
      return;
    }
    
    this.allocatingAttribute = true;
    
    const attributeName = e.currentTarget.dataset.attribute;
    const points = parseInt(e.currentTarget.dataset.points) || 1;

    console.log('🎯 通过allocateAttribute分配属性:', attributeName, '点数:', points);

    try {
      // 获取角色服务
      const characterService = this.getCharacterService();
      if (!characterService) {
        wx.showToast({ title: '服务不可用', icon: 'error' });
        return;
      }
      
      // 确保characterService有最新的角色数据
      if (characterService.currentCharacter) {
        characterService.currentCharacter = this.data.character;
      }

      const result = this.safeCallCharacterService('allocateAttributePoints', attributeName, points) || 
        { success: false, error: '方法不可用' };

      if (result.success) {
        wx.showToast({
          title: '属性提升成功',
          icon: 'success'
        });

        // 重新加载数据
        this.loadCharacterData();
        this.closeAttributeModal();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('分配属性点失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    } finally {
      // 重置防重复调用标记
      this.allocatingAttribute = false;
    }
  },

  /**
   * 测试获得经验值
   */
  async testGainExp() {
    try {
      const characterService = this.getCharacterService();
      if (!characterService) {
        wx.showToast({ title: '服务不可用', icon: 'error' });
        return;
      }
      
      const result = await characterService.addExperience(150);

      if (result.success) {
        if (result.leveledUp) {
          // 获取升级奖励
          const rewards = this.safeCallCharacterService('getLevelUpRewards', result.newLevel) || 
            { attributePoints: 2, skillPoints: 1 };

          // 显示升级动画
          this.setData({
            showLevelUpModal: true,
            levelUpData: {
              ...result,
              rewards
            }
          });
        } else {
          wx.showToast({
            title: `获得 ${result.expGain} 经验值`,
            icon: 'success'
          });
        }

        // 重新加载数据
        this.loadCharacterData();
      }
    } catch (error) {
      console.error('获得经验值失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 关闭升级模态框
   */
  closeLevelUpModal() {
    this.setData({
      showLevelUpModal: false,
      levelUpData: {}
    });
  },

  /**
   * 分享升级成就
   */
  shareLevelUp(e) {
    const { title, desc, path } = e.detail;

    // 这里可以调用分享API
    wx.showToast({
      title: '分享成功',
      icon: 'success'
    });
  },

  /**
   * 模拟完成任务获得经验
   */
  async simulateTaskComplete() {
    try {
      // 模拟不同类型的任务
      const taskTypes = ['daily', 'weekly', 'habit', 'special'];
      const difficulties = ['easy', 'normal', 'hard', 'expert'];

      const randomTask = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

      const characterService = this.getCharacterService();
      if (!characterService) {
        wx.showToast({ title: '服务不可用', icon: 'error' });
        return;
      }
      
      // 简化经验值计算
      const expMultiplier = { easy: 1, normal: 1.5, hard: 2, expert: 3 };
      const expGain = Math.floor(50 * (expMultiplier[randomDifficulty] || 1));
      
      const result = await characterService.addExperience(expGain);

      if (result.success) {
        if (result.leveledUp) {
          const rewards = this.safeCallCharacterService('getLevelUpRewards', result.newLevel) || 
            { attributePoints: 2, skillPoints: 1 };
          this.setData({
            showLevelUpModal: true,
            levelUpData: { ...result, rewards }
          });
        } else {
          wx.showToast({
            title: `完成${randomTask}任务，获得${expGain}经验`,
            icon: 'success'
          });
        }

        this.loadCharacterData();
      }
    } catch (error) {
      console.error('模拟任务失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 重置属性点
   */
  async resetAttributes() {
    try {
      const result = await wx.showModal({
        title: '重置属性',
        content: '确定要重置所有属性点吗？这将把所有属性恢复到初始值，并返还所有已分配的属性点。',
        confirmText: '确定重置',
        confirmColor: '#ef4444'
      });

      if (!result.confirm) return;

      const characterService = this.getCharacterService();
      if (!characterService) {
        wx.showToast({ title: '服务不可用', icon: 'error' });
        return;
      }
      
      const resetResult = this.safeCallCharacterService('resetAttributePoints', 'full') || 
        { success: false, error: '方法不可用' };

      if (resetResult.success) {
        wx.showToast({
          title: resetResult.message,
          icon: 'success',
          duration: 2000
        });

        this.loadCharacterData();
      } else {
        wx.showToast({
          title: resetResult.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('重置属性失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 切换分配模式
   */
  toggleAllocatingMode() {
    const allocatingMode = !this.data.allocatingMode;

    if (allocatingMode) {
      // 进入分配模式，保存当前状态
      this.setData({
        allocatingMode: true,
        originalAvailablePoints: this.data.availablePoints,
        tempAttributes: { ...this.data.character.attributes }
      });
    } else {
      // 退出分配模式，确认分配
      this.confirmAllocation();
    }
  },

  /**
   * 调整属性值
   */
  adjustAttribute(e) {
    const { attribute, action } = e.currentTarget.dataset;
    const character = { ...this.data.character };
    const currentValue = character.attributes[attribute] || 0;

    if (action === 'increase') {
      // 增加属性 - 使用角色服务进行持久化
      if (this.data.availablePoints > 0 && currentValue < 100) {
        console.log('🎯 通过adjustAttribute增加属性:', attribute);
        
        // 调用角色服务分配属性点
        const characterService = this.getCharacterService();
        if (!characterService) {
          wx.showToast({ title: '服务不可用', icon: 'error' });
          return;
        }
        
        // 确保characterService有最新的角色数据
        if (characterService.currentCharacter) {
          characterService.currentCharacter = this.data.character;
        }

        const result = this.safeCallCharacterService('allocateAttributePoints', attribute, 1) || 
          { success: false, error: '方法不可用' };

        if (result.success) {
          // 重新加载数据以反映变化
          this.loadCharacterData();
          
          wx.showToast({
            title: '属性提升成功',
            icon: 'success',
            duration: 1000
          });
        } else {
          wx.showToast({
            title: result.error,
            icon: 'error'
          });
        }
      }
    } else if (action === 'decrease') {
      // 减少属性
      const tempValue = this.data.tempAttributes[attribute] || 0;
      if (currentValue > tempValue) {
        character.attributes[attribute] = currentValue - 1;

        // 更新attributesList
        const attributesList = this.data.attributesList.map(attr => {
          if (attr.id === attribute) {
            return { ...attr, value: currentValue - 1 };
          }
          return attr;
        });

        this.setData({
          character: character,
          attributesList: attributesList,
          availablePoints: this.data.availablePoints + 1
        });

        // 更新战斗力
        this.updatePowerLevel();
      }
    }
  },

  /**
   * 重置分配
   */
  resetAllocation() {
    const character = { ...this.data.character };
    character.attributes = { ...this.data.tempAttributes };

    // 更新attributesList
    const attributesList = this.data.attributesList.map(attr => ({
      ...attr,
      value: this.data.tempAttributes[attr.id] || 0
    }));

    this.setData({
      character: character,
      attributesList: attributesList,
      availablePoints: this.data.originalAvailablePoints
    });

    // 更新战斗力
    this.updatePowerLevel();

    wx.showToast({
      title: '已重置分配',
      icon: 'success'
    });
  },

  /**
   * 确认分配
   */
  confirmAllocation() {
    if (!this.data.allocatingMode) return;

    wx.showModal({
      title: '确认分配',
      content: `确定要应用这些属性分配吗？此操作不可撤销。`,
      success: (res) => {
        if (res.confirm) {
          this.saveAttributeAllocation();
        }
      }
    });
  },

  /**
   * 保存属性分配
   */
  saveAttributeAllocation() {
    try {
      const character = this.data.character;

      // 保存到本地存储
      wx.setStorageSync('character', character);

      // 退出分配模式
      this.setData({
        allocatingMode: false,
        originalAvailablePoints: this.data.availablePoints,
        tempAttributes: { ...character.attributes }
      });

      wx.showToast({
        title: '属性分配成功',
        icon: 'success'
      });

      // 记录活动
      this.recordActivity('属性分配', `分配了 ${this.data.originalAvailablePoints - this.data.availablePoints} 个属性点`);

    } catch (error) {
      console.error('保存属性分配失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  /**
   * 更新战斗力
   */
  updatePowerLevel() {
    try {
      const characterService = this.getCharacterService();
      if (!characterService || !characterService.calculatePowerLevel) {
        // 简化的战斗力计算
        const character = this.data.character;
        if (character && character.attributes) {
          const attrs = character.attributes;
          const powerLevel = (attrs.strength || 0) + (attrs.intelligence || 0) + 
                           (attrs.charisma || 0) + (attrs.creativity || 0) + 
                           (attrs.discipline || 0) + (attrs.vitality || 0);
          this.setData({ powerLevel });
        }
        return;
      }

      const powerLevel = this.safeCallCharacterService('calculatePowerLevel', this.data.character);
      if (powerLevel !== null) {
        this.setData({ powerLevel });
      }
    } catch (error) {
      console.error('更新战斗力失败:', error);
    }
  },

  /**
   * 记录活动
   */
  recordActivity(title, description) {
    try {
      const activities = wx.getStorageSync('recentActivities') || [];
      const newActivity = {
        id: Date.now(),
        icon: '⚡',
        title: title,
        description: description,
        timestamp: Date.now(),
        reward: null
      };

      activities.unshift(newActivity);
      if (activities.length > 20) {
        activities.splice(20);
      }

      wx.setStorageSync('recentActivities', activities);
    } catch (error) {
      console.error('记录活动失败:', error);
    }
  },

  /**
   * 查看角色详情
   */
  viewCharacterDetails() {
    const character = this.data.character;
    const content = `等级: ${character.level}\n经验: ${character.experience}\n战斗力: ${this.data.powerLevel}\n称号: ${this.data.characterTitle}`;

    wx.showModal({
      title: '角色详情',
      content: content,
      showCancel: false
    });
  },

  /**
   * 跳转到外观定制页面
   */
  goToAppearance() {
    wx.navigateTo({
      url: '/pages/appearance/appearance'
    });
  }
});
