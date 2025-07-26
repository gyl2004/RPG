// 角色外观定制服务
/**
 * 角色外观定制管理服务
 */
class AppearanceService {
  constructor() {
    // 主题配置
    this.themes = {
      'default': {
        id: 'default',
        name: '经典蓝',
        description: '经典的蓝色主题，稳重而专业',
        primaryColor: '#3b82f6',
        secondaryColor: '#1d4ed8',
        accentColor: '#60a5fa',
        backgroundColor: '#1a1a2e',
        cardColor: 'rgba(59, 130, 246, 0.1)',
        unlockLevel: 1,
        price: 0,
        preview: '/images/themes/default-preview.png'
      },
      'fire': {
        id: 'fire',
        name: '烈焰红',
        description: '充满激情的红色主题，展现你的热情',
        primaryColor: '#ef4444',
        secondaryColor: '#dc2626',
        accentColor: '#f87171',
        backgroundColor: '#2e1a1a',
        cardColor: 'rgba(239, 68, 68, 0.1)',
        unlockLevel: 10,
        price: 100,
        preview: '/images/themes/fire-preview.png'
      },
      'nature': {
        id: 'nature',
        name: '自然绿',
        description: '清新的绿色主题，贴近自然',
        primaryColor: '#22c55e',
        secondaryColor: '#16a34a',
        accentColor: '#4ade80',
        backgroundColor: '#1a2e1a',
        cardColor: 'rgba(34, 197, 94, 0.1)',
        unlockLevel: 15,
        price: 150,
        preview: '/images/themes/nature-preview.png'
      },
      'purple': {
        id: 'purple',
        name: '神秘紫',
        description: '神秘的紫色主题，彰显独特品味',
        primaryColor: '#8b5cf6',
        secondaryColor: '#7c3aed',
        accentColor: '#a78bfa',
        backgroundColor: '#2e1a2e',
        cardColor: 'rgba(139, 92, 246, 0.1)',
        unlockLevel: 20,
        price: 200,
        preview: '/images/themes/purple-preview.png'
      },
      'gold': {
        id: 'gold',
        name: '黄金辉煌',
        description: '奢华的金色主题，展现成功与荣耀',
        primaryColor: '#fbbf24',
        secondaryColor: '#f59e0b',
        accentColor: '#fcd34d',
        backgroundColor: '#2e2a1a',
        cardColor: 'rgba(251, 191, 36, 0.1)',
        unlockLevel: 30,
        price: 500,
        preview: '/images/themes/gold-preview.png'
      },
      'dark': {
        id: 'dark',
        name: '暗夜黑',
        description: '深邃的黑色主题，低调而优雅',
        primaryColor: '#6b7280',
        secondaryColor: '#4b5563',
        accentColor: '#9ca3af',
        backgroundColor: '#0f0f0f',
        cardColor: 'rgba(107, 114, 128, 0.1)',
        unlockLevel: 25,
        price: 300,
        preview: '/images/themes/dark-preview.png'
      }
    };

    // 头像框配置
    this.avatarFrames = {
      'none': {
        id: 'none',
        name: '无边框',
        description: '简洁的无边框样式',
        frameImage: '',
        unlockLevel: 1,
        price: 0
      },
      'bronze': {
        id: 'bronze',
        name: '青铜边框',
        description: '青铜材质的边框，展现坚韧品质',
        frameImage: '/images/frames/bronze-frame.png',
        unlockLevel: 5,
        price: 50
      },
      'silver': {
        id: 'silver',
        name: '白银边框',
        description: '白银材质的边框，彰显优雅气质',
        frameImage: '/images/frames/silver-frame.png',
        unlockLevel: 15,
        price: 150
      },
      'gold': {
        id: 'gold',
        name: '黄金边框',
        description: '黄金材质的边框，象征荣耀与成就',
        frameImage: '/images/frames/gold-frame.png',
        unlockLevel: 25,
        price: 300
      },
      'diamond': {
        id: 'diamond',
        name: '钻石边框',
        description: '钻石材质的边框，至尊无上的象征',
        frameImage: '/images/frames/diamond-frame.png',
        unlockLevel: 40,
        price: 800
      },
      'legendary': {
        id: 'legendary',
        name: '传奇边框',
        description: '传奇级别的边框，只有真正的勇者才能拥有',
        frameImage: '/images/frames/legendary-frame.png',
        unlockLevel: 50,
        price: 1500
      }
    };

    // 称号配置
    this.titles = {
      'newbie': {
        id: 'newbie',
        name: '新手冒险者',
        description: '刚开始冒险旅程的勇者',
        color: '#6b7280',
        unlockLevel: 1,
        unlockCondition: 'level_1'
      },
      'explorer': {
        id: 'explorer',
        name: '探索者',
        description: '勇于探索未知领域的冒险者',
        color: '#3b82f6',
        unlockLevel: 10,
        unlockCondition: 'level_10'
      },
      'warrior': {
        id: 'warrior',
        name: '战士',
        description: '在战斗中证明自己的勇者',
        color: '#ef4444',
        unlockLevel: 20,
        unlockCondition: 'strength_50'
      },
      'scholar': {
        id: 'scholar',
        name: '学者',
        description: '博学多才的智慧之人',
        color: '#8b5cf6',
        unlockLevel: 20,
        unlockCondition: 'intelligence_50'
      },
      'leader': {
        id: 'leader',
        name: '领袖',
        description: '具有卓越领导力的人物',
        color: '#fbbf24',
        unlockLevel: 25,
        unlockCondition: 'charisma_60'
      },
      'master': {
        id: 'master',
        name: '大师',
        description: '在某个领域达到大师级别',
        color: '#22c55e',
        unlockLevel: 30,
        unlockCondition: 'any_attribute_70'
      },
      'legend': {
        id: 'legend',
        name: '传奇',
        description: '传说中的存在，万中无一',
        color: '#f59e0b',
        unlockLevel: 50,
        unlockCondition: 'level_50_all_attributes_60'
      }
    };

    // 装备外观配置
    this.equipmentSkins = {
      'basic_sword': {
        id: 'basic_sword',
        name: '基础剑',
        description: '最基本的武器外观',
        category: 'weapon',
        image: '/images/equipment/basic-sword.png',
        unlockLevel: 1,
        price: 0
      },
      'flame_sword': {
        id: 'flame_sword',
        name: '烈焰剑',
        description: '燃烧着烈焰的强力武器',
        category: 'weapon',
        image: '/images/equipment/flame-sword.png',
        unlockLevel: 20,
        price: 400
      },
      'basic_armor': {
        id: 'basic_armor',
        name: '基础护甲',
        description: '最基本的防具外观',
        category: 'armor',
        image: '/images/equipment/basic-armor.png',
        unlockLevel: 1,
        price: 0
      },
      'knight_armor': {
        id: 'knight_armor',
        name: '骑士护甲',
        description: '骑士专用的重型护甲',
        category: 'armor',
        image: '/images/equipment/knight-armor.png',
        unlockLevel: 25,
        price: 600
      }
    };
  }

  /**
   * 获取当前角色外观
   * @returns {object} 角色外观配置
   */
  getCurrentAppearance() {
    const character = wx.getStorageSync('characterInfo');
    return character?.appearance || {
      theme: 'default',
      avatarFrame: 'none',
      title: 'newbie',
      equipment: {
        weapon: 'basic_sword',
        armor: 'basic_armor'
      }
    };
  }

  /**
   * 获取所有主题
   * @returns {object} 主题配置
   */
  getAllThemes() {
    return this.themes;
  }

  /**
   * 获取所有头像框
   * @returns {object} 头像框配置
   */
  getAllAvatarFrames() {
    return this.avatarFrames;
  }

  /**
   * 获取所有称号
   * @returns {object} 称号配置
   */
  getAllTitles() {
    return this.titles;
  }

  /**
   * 获取所有装备外观
   * @returns {object} 装备外观配置
   */
  getAllEquipmentSkins() {
    return this.equipmentSkins;
  }

  /**
   * 检查物品解锁条件
   * @param {object} item 物品配置
   * @param {object} character 角色对象
   * @returns {object} 检查结果
   */
  checkUnlockCondition(item, character) {
    if (!character) {
      return { unlocked: false, reason: '角色不存在' };
    }

    // 检查等级要求
    if (item.unlockLevel && character.level < item.unlockLevel) {
      return { 
        unlocked: false, 
        reason: `需要等级 ${item.unlockLevel}（当前 ${character.level}）` 
      };
    }

    // 检查特殊解锁条件
    if (item.unlockCondition) {
      const conditionMet = this.checkSpecialCondition(item.unlockCondition, character);
      if (!conditionMet.met) {
        return { unlocked: false, reason: conditionMet.reason };
      }
    }

    return { unlocked: true };
  }

  /**
   * 检查特殊解锁条件
   * @param {string} condition 条件字符串
   * @param {object} character 角色对象
   * @returns {object} 检查结果
   */
  checkSpecialCondition(condition, character) {
    const attrs = character.attributes || {};
    const level = character.level || 1;

    switch (condition) {
      case 'level_1':
        return { met: level >= 1, reason: '需要等级1' };
      case 'level_10':
        return { met: level >= 10, reason: '需要等级10' };
      case 'strength_50':
        return { met: attrs.strength >= 50, reason: '需要力量属性50' };
      case 'intelligence_50':
        return { met: attrs.intelligence >= 50, reason: '需要智力属性50' };
      case 'charisma_60':
        return { met: attrs.charisma >= 60, reason: '需要魅力属性60' };
      case 'any_attribute_70':
        const hasHighAttr = Object.values(attrs).some(value => value >= 70);
        return { met: hasHighAttr, reason: '需要任意属性达到70' };
      case 'level_50_all_attributes_60':
        const allAttrsHigh = Object.values(attrs).every(value => value >= 60);
        return { 
          met: level >= 50 && allAttrsHigh, 
          reason: '需要等级50且所有属性60+' 
        };
      default:
        return { met: true, reason: '' };
    }
  }

  /**
   * 购买外观物品
   * @param {string} itemType 物品类型
   * @param {string} itemId 物品ID
   * @returns {object} 购买结果
   */
  purchaseItem(itemType, itemId) {
    const character = wx.getStorageSync('characterInfo');
    if (!character) {
      return { success: false, error: '角色不存在' };
    }

    let item;
    switch (itemType) {
      case 'theme':
        item = this.themes[itemId];
        break;
      case 'avatarFrame':
        item = this.avatarFrames[itemId];
        break;
      case 'equipment':
        item = this.equipmentSkins[itemId];
        break;
      default:
        return { success: false, error: '无效的物品类型' };
    }

    if (!item) {
      return { success: false, error: '物品不存在' };
    }

    // 检查解锁条件
    const unlockCheck = this.checkUnlockCondition(item, character);
    if (!unlockCheck.unlocked) {
      return { success: false, error: unlockCheck.reason };
    }

    // 检查是否已拥有
    const ownedItems = character.ownedAppearance || {};
    if (ownedItems[itemType] && ownedItems[itemType].includes(itemId)) {
      return { success: false, error: '已拥有此物品' };
    }

    // 检查货币（这里假设使用金币）
    const currentCoins = character.coins || 0;
    if (currentCoins < item.price) {
      return { success: false, error: `金币不足，需要 ${item.price}（当前 ${currentCoins}）` };
    }

    // 购买物品
    const updatedOwnedItems = { ...ownedItems };
    if (!updatedOwnedItems[itemType]) {
      updatedOwnedItems[itemType] = [];
    }
    updatedOwnedItems[itemType].push(itemId);

    const updatedCharacter = {
      ...character,
      coins: currentCoins - item.price,
      ownedAppearance: updatedOwnedItems
    };

    wx.setStorageSync('characterInfo', updatedCharacter);

    // 更新全局状态
    const app = getApp();
    if (app) {
      app.globalData.character = updatedCharacter;
    }

    return {
      success: true,
      itemName: item.name,
      pricePaid: item.price,
      remainingCoins: currentCoins - item.price
    };
  }

  /**
   * 装备外观物品
   * @param {string} itemType 物品类型
   * @param {string} itemId 物品ID
   * @returns {object} 装备结果
   */
  equipItem(itemType, itemId) {
    const character = wx.getStorageSync('characterInfo');
    if (!character) {
      return { success: false, error: '角色不存在' };
    }

    // 检查是否拥有物品
    const ownedItems = character.ownedAppearance || {};
    if (itemType !== 'title' && (!ownedItems[itemType] || !ownedItems[itemType].includes(itemId))) {
      return { success: false, error: '未拥有此物品' };
    }

    // 装备物品
    const updatedAppearance = { ...character.appearance };
    
    if (itemType === 'equipment') {
      const equipmentItem = this.equipmentSkins[itemId];
      if (!equipmentItem) {
        return { success: false, error: '装备不存在' };
      }
      
      if (!updatedAppearance.equipment) {
        updatedAppearance.equipment = {};
      }
      updatedAppearance.equipment[equipmentItem.category] = itemId;
    } else {
      updatedAppearance[itemType] = itemId;
    }

    const updatedCharacter = {
      ...character,
      appearance: updatedAppearance
    };

    wx.setStorageSync('characterInfo', updatedCharacter);

    // 更新全局状态
    const app = getApp();
    if (app) {
      app.globalData.character = updatedCharacter;
    }

    return { success: true };
  }

  /**
   * 检查是否拥有物品
   * @param {string} itemType 物品类型
   * @param {string} itemId 物品ID
   * @returns {boolean} 是否拥有
   */
  isItemOwned(itemType, itemId) {
    const character = wx.getStorageSync('characterInfo');
    if (!character) return false;

    // 免费物品默认拥有
    let item;
    switch (itemType) {
      case 'theme':
        item = this.themes[itemId];
        break;
      case 'avatarFrame':
        item = this.avatarFrames[itemId];
        break;
      case 'equipment':
        item = this.equipmentSkins[itemId];
        break;
      case 'title':
        return this.checkUnlockCondition(this.titles[itemId], character).unlocked;
      default:
        return false;
    }

    if (item && item.price === 0) return true;

    const ownedItems = character.ownedAppearance || {};
    return ownedItems[itemType] && ownedItems[itemType].includes(itemId);
  }

  /**
   * 获取当前装备的物品
   * @param {string} itemType 物品类型
   * @returns {string} 当前装备的物品ID
   */
  getCurrentEquipped(itemType) {
    const appearance = this.getCurrentAppearance();
    
    if (itemType === 'weapon' || itemType === 'armor') {
      return appearance.equipment?.[itemType] || '';
    }
    
    return appearance[itemType] || '';
  }
}

// 导出单例实例
const appearanceService = new AppearanceService();
export default appearanceService;
