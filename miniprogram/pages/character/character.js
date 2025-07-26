// 角色页面
import { checkLoginAndRedirect, getCurrentUser, getCurrentCharacter } from '../../utils/auth-helper.js';
import characterService from '../../services/character-service.js';

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
    this.loadCharacterData();
  },

  onShow: function() {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/character/character')) {
      return;
    }

    this.loadCharacterData();
  },

  /**
   * 加载角色数据
   */
  async loadCharacterData() {
    try {
      this.setData({ loading: true });

      const character = getCurrentCharacter();
      const user = getCurrentUser();

      if (character) {
        // 计算角色相关数据
        const powerLevel = characterService.calculatePowerLevel(character);
        const expProgress = characterService.calculateExpProgress(character);
        const characterTitle = characterService.getCharacterTitle(character);
        const attributesInfo = characterService.getAllAttributesInfo();
        const expToNextLevel = characterService.getExpRemaining(character);
        const levelTier = characterService.getLevelTier(character.level || 1);

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

        // 转换属性信息为数组格式，便于在WXML中遍历
        const attributesList = Object.keys(attributesInfo).map(key => ({
          id: key,
          ...attributesInfo[key],
          value: character.attributes[key] || 0
        }));

        // 调试信息
        console.log('属性信息:', attributesInfo);
        console.log('属性列表:', attributesList);
        console.log('角色属性:', character.attributes);

        // 临时给用户一些属性点用于测试
        const availablePoints = character.availableAttributePoints || 5;

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
    const attributeName = e.currentTarget.dataset.attribute;
    const points = parseInt(e.currentTarget.dataset.points) || 1;

    console.log('分配属性:', attributeName, '点数:', points);
    console.log('可用属性:', Object.keys(characterService.attributes));

    try {
      // 确保characterService有最新的角色数据
      characterService.currentCharacter = this.data.character;

      const result = characterService.allocateAttributePoints(attributeName, points);

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
    }
  },

  /**
   * 测试获得经验值
   */
  async testGainExp() {
    try {
      const result = characterService.addExperience(150);

      if (result.success) {
        if (result.leveledUp) {
          // 获取升级奖励
          const rewards = characterService.getLevelUpRewards(result.newLevel);

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

      const expGain = characterService.calculateTaskExp(randomTask, randomDifficulty, this.data.character);
      const result = characterService.addExperience(expGain);

      if (result.success) {
        if (result.leveledUp) {
          const rewards = characterService.getLevelUpRewards(result.newLevel);
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

      const resetResult = characterService.resetAttributePoints('full');

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
      // 增加属性
      if (this.data.availablePoints > 0 && currentValue < 100) {
        character.attributes[attribute] = currentValue + 1;

        // 更新attributesList
        const attributesList = this.data.attributesList.map(attr => {
          if (attr.id === attribute) {
            return { ...attr, value: currentValue + 1 };
          }
          return attr;
        });

        this.setData({
          character: character,
          attributesList: attributesList,
          availablePoints: this.data.availablePoints - 1
        });

        // 更新战斗力
        this.updatePowerLevel();
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
      const powerLevel = characterService.calculatePowerLevel(this.data.character);

      this.setData({
        powerLevel: powerLevel
      });
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
