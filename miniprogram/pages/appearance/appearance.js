// 角色外观定制页面
const { checkLoginAndRedirect, getCurrentCharacter } = require('../../utils/auth-helper.js');

Page({
  data: {
    character: null,
    currentCategory: 'theme',
    themes: {},

    titles: {},
    equipmentSkins: {},
    currentAppearance: {},
    loading: false,
    showItemModal: false,
    selectedItem: null,
    previewMode: false
  },

  onLoad: function() {
    this.loadAppearanceData();
  },

  onShow: function() {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/appearance/appearance')) {
      return;
    }
    
    this.loadAppearanceData();
  },

  /**
   * 加载外观数据
   */
  async loadAppearanceData() {
    try {
      this.setData({ loading: true });

      // 获取外观服务
      const appearanceService = await this.getAppearanceService();
      if (!appearanceService) {
        throw new Error('外观服务不可用');
      }

      const character = getCurrentCharacter();
      if (character) {
        const themes = appearanceService.getAllThemes();

        const titles = appearanceService.getAllTitles();
        const equipmentSkins = appearanceService.getAllEquipmentSkins();
        const currentAppearance = appearanceService.getCurrentAppearance();

        // 转换对象为数组，供WXML使用
        const themesArray = Object.values(themes);

        const titlesArray = Object.values(titles);
        const equipmentSkinsArray = Object.values(equipmentSkins);

        this.setData({
          character,
          themes,

          titles,
          equipmentSkins,
          themesArray,

          titlesArray,
          equipmentSkinsArray,
          currentAppearance
        });
      }

      this.setData({ loading: false });
    } catch (error) {
      console.error('加载外观数据失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  /**
   * 获取外观服务
   */
  async getAppearanceService() {
    try {
      const appearanceServiceModule = require('../../services/appearance-service.js');
      return appearanceServiceModule.default;
    } catch (error) {
      console.error('获取外观服务失败:', error);
      return null;
    }
  },

  /**
   * 切换分类
   */
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });
  },

  /**
   * 显示物品详情
   */
  showItemDetail(e) {
    console.log('showItemDetail 被调用', e);

    const itemId = e.currentTarget.dataset.item;
    const category = this.data.currentCategory;

    console.log('itemId:', itemId, 'category:', category);

    let item, itemType;
    switch (category) {
      case 'theme':
        item = this.data.themes[itemId];
        itemType = 'theme';
        break;

      case 'title':
        item = this.data.titles[itemId];
        itemType = 'title';
        break;
      case 'equipment':
        item = this.data.equipmentSkins[itemId];
        itemType = 'equipment';
        break;
      default:
        console.log('未知分类:', category);
        return;
    }

    console.log('找到物品:', item);

    if (item) {
      this.checkItemStatus(item, itemType).then(status => {
        console.log('物品状态:', status);
        this.setData({
          selectedItem: {
            ...item,
            itemType,
            ...status
          },
          showItemModal: true
        });
      }).catch(error => {
        console.error('检查物品状态失败:', error);
        // 即使检查失败也显示基本信息
        this.setData({
          selectedItem: {
            ...item,
            itemType,
            unlocked: true,
            canPurchase: false,
            canEquip: false
          },
          showItemModal: true
        });
      });
    } else {
      console.log('未找到物品');
    }
  },

  /**
   * 检查物品状态
   */
  async checkItemStatus(item, itemType) {
    try {
      const appearanceService = await this.getAppearanceService();
      if (!appearanceService) {
        return { canPurchase: false, canEquip: false, reason: '服务不可用' };
      }

      const unlockCheck = appearanceService.checkUnlockCondition(item, this.data.character);
      const isOwned = appearanceService.isItemOwned(itemType, item.id);
      const isEquipped = this.isItemEquipped(itemType, item.id);

      return {
        unlocked: unlockCheck.unlocked,
        unlockReason: unlockCheck.reason,
        isOwned,
        isEquipped,
        canPurchase: unlockCheck.unlocked && !isOwned && item.price > 0,
        canEquip: isOwned && !isEquipped
      };
    } catch (error) {
      console.error('检查物品状态失败:', error);
      return { canPurchase: false, canEquip: false, reason: '检查失败' };
    }
  },

  /**
   * 检查物品是否已装备
   */
  isItemEquipped(itemType, itemId) {
    const appearance = this.data.currentAppearance;
    
    switch (itemType) {
      case 'theme':
        return appearance.theme === itemId;

      case 'title':
        return appearance.title === itemId;
      case 'equipment':
        const equipmentItem = this.data.equipmentSkins[itemId];
        return appearance.equipment?.[equipmentItem.category] === itemId;
      default:
        return false;
    }
  },

  /**
   * 关闭物品模态框
   */
  closeItemModal() {
    this.setData({
      showItemModal: false,
      selectedItem: null,
      previewMode: false
    });
  },

  /**
   * 购买物品
   */
  async purchaseItem() {
    try {
      const appearanceService = await this.getAppearanceService();
      if (!appearanceService) {
        throw new Error('外观服务不可用');
      }

      const result = appearanceService.purchaseItem(
        this.data.selectedItem.itemType,
        this.data.selectedItem.id
      );
      
      if (result.success) {
        wx.showToast({
          title: `购买${result.itemName}成功！`,
          icon: 'success'
        });

        // 询问是否记录到收藏
        this.askToRecordItem(result);

        // 重新加载数据
        this.loadAppearanceData();
        this.closeItemModal();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('购买物品失败:', error);
      wx.showToast({
        title: '购买失败',
        icon: 'error'
      });
    }
  },

  /**
   * 装备物品
   */
  async equipItem() {
    try {
      const appearanceService = await this.getAppearanceService();
      if (!appearanceService) {
        throw new Error('外观服务不可用');
      }

      const result = appearanceService.equipItem(
        this.data.selectedItem.itemType,
        this.data.selectedItem.id
      );
      
      if (result.success) {
        wx.showToast({
          title: '装备成功！',
          icon: 'success'
        });
        
        // 重新加载数据
        this.loadAppearanceData();
        this.closeItemModal();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('装备物品失败:', error);
      wx.showToast({
        title: '装备失败',
        icon: 'error'
      });
    }
  },

  /**
   * 预览物品
   */
  previewItem() {
    this.setData({ previewMode: true });
    
    // 这里可以添加预览逻辑
    wx.showToast({
      title: '预览功能开发中',
      icon: 'none'
    });
  },

  /**
   * 获得金币（测试功能）
   */
  async gainCoins() {
    try {
      const character = getCurrentCharacter();
      if (!character) return;

      const updatedCharacter = {
        ...character,
        coins: (character.coins || 0) + 500
      };

      wx.setStorageSync('characterInfo', updatedCharacter);

      // 更新全局状态
      const app = getApp();
      if (app) {
        app.globalData.character = updatedCharacter;
      }

      wx.showToast({
        title: '获得500金币',
        icon: 'success'
      });

      this.loadAppearanceData();
    } catch (error) {
      console.error('获得金币失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 获取分类显示名称
   */
  getCategoryName(category) {
    const names = {
      'theme': '主题',

      'title': '称号',
      'equipment': '装备'
    };
    return names[category] || category;
  },

  /**
   * 获取当前分类的物品列表
   */
  getCurrentCategoryItems() {
    const category = this.data.currentCategory;
    switch (category) {
      case 'theme':
        return Object.values(this.data.themes);

      case 'title':
        return Object.values(this.data.titles);
      case 'equipment':
        return Object.values(this.data.equipmentSkins);
      default:
        return [];
    }
  },

  /**
   * 获取物品状态样式类
   */
  getItemStatusClass(item) {
    const itemType = this.data.currentCategory;

    // 简化状态检查，避免异步调用
    const isEquipped = this.isItemEquipped(itemType, item.id);
    if (isEquipped) return 'item-equipped';

    // 检查是否拥有（简化版本）
    const character = this.data.character;
    if (!character) return 'item-locked';

    const ownedItems = character.ownedAppearance || {};
    let isOwned = false;

    // 免费物品默认拥有
    if (item.price === 0) {
      isOwned = true;
    } else if (ownedItems[itemType] && ownedItems[itemType].includes(item.id)) {
      isOwned = true;
    }

    if (isOwned) return 'item-owned';

    // 简化解锁检查
    if (character.level >= (item.unlockLevel || 1)) {
      return 'item-available';
    }

    return 'item-locked';
  },

  /**
   * 询问是否记录购买的物品
   */
  askToRecordItem(purchaseResult) {
    wx.showModal({
      title: '记录购买',
      content: `是否将"${purchaseResult.itemName}"记录到你的物品收藏中？可以让AI为它创造魔幻故事！`,
      confirmText: '记录',
      cancelText: '跳过',
      success: (res) => {
        if (res.confirm) {
          this.recordPurchasedItem(purchaseResult);
        }
      }
    });
  },

  /**
   * 记录购买的物品到收藏
   */
  recordPurchasedItem(purchaseResult) {
    try {
      const characterService = require('../../services/character-service.js').default;
      const character = characterService.getCurrentCharacter();

      if (!character.collectedItems) {
        character.collectedItems = [];
      }

      // 创建物品记录
      const item = {
        id: Date.now().toString(),
        name: purchaseResult.itemName,
        category: this.getCategoryDisplayName(purchaseResult.itemType),
        icon: this.getItemIcon(purchaseResult.itemType),
        price: purchaseResult.price || null,
        description: `在外观商店购买的${this.getCategoryDisplayName(purchaseResult.itemType)}`,
        purchaseDate: new Date().toLocaleDateString('zh-CN'),
        aiDescription: null,
        createdAt: new Date().toISOString(),
        source: 'appearance_shop'
      };

      character.collectedItems.push(item);
      characterService.updateCharacter(character);

      wx.showToast({
        title: '已记录到收藏！',
        icon: 'success'
      });

    } catch (error) {
      console.error('记录物品失败:', error);
      wx.showToast({
        title: '记录失败',
        icon: 'error'
      });
    }
  },

  /**
   * 获取分类显示名称
   */
  getCategoryDisplayName(itemType) {
    const names = {
      'theme': '主题装饰',
      'title': '角色称号',
      'equipment': '装备皮肤'
    };
    return names[itemType] || '未知物品';
  },

  /**
   * 获取物品图标
   */
  getItemIcon(itemType) {
    const icons = {
      'theme': '🎨',
      'title': '👑',
      'equipment': '⚔️'
    };
    return icons[itemType] || '📦';
  }
});
