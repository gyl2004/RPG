// 角色管理服务
/**
 * 角色属性系统服务
 */
class CharacterService {
  constructor() {
    this.currentCharacter = null;
    
    // 六大属性定义
    this.attributes = {
      strength: {
        name: '力量',
        description: '体力活动、运动锻炼的能力',
        icon: '💪',
        color: '#ef4444'
      },
      intelligence: {
        name: '智力',
        description: '学习、思考、解决问题的能力',
        icon: '🧠',
        color: '#3b82f6'
      },
      charisma: {
        name: '魅力',
        description: '社交、沟通、领导力的能力',
        icon: '✨',
        color: '#f59e0b'
      },
      creativity: {
        name: '创造力',
        description: '艺术、创新、想象力的能力',
        icon: '🎨',
        color: '#8b5cf6'
      },
      discipline: {
        name: '纪律性',
        description: '自控、坚持、规律性的能力',
        icon: '⚖️',
        color: '#059669'
      },
      vitality: {
        name: '活力',
        description: '精神状态、生活热情的体现',
        icon: '🌟',
        color: '#ec4899'
      }
    };

    // 等级经验值表
    this.expTable = this.generateExpTable();
  }

  /**
   * 获取当前角色
   * @returns {object|null} 当前角色信息
   */
  getCurrentCharacter() {
    if (!this.currentCharacter) {
      // 尝试多个可能的存储key
      this.currentCharacter = wx.getStorageSync('character') ||
                             wx.getStorageSync('characterInfo') ||
                             wx.getStorageSync('currentCharacter');
    }
    return this.currentCharacter;
  }

  /**
   * 更新角色信息
   * @param {object} characterData 角色数据
   * @returns {boolean} 更新是否成功
   */
  async updateCharacter(characterData) {
    try {
      this.currentCharacter = { ...this.currentCharacter, ...characterData };

      // 确保角色数据完整性
      this.currentCharacter = this.ensureCharacterDataIntegrity(this.currentCharacter);

      // 保存到本地存储
      wx.setStorageSync('characterInfo', this.currentCharacter);

      // 更新全局状态
      const app = getApp();
      if (app) {
        app.globalData.character = this.currentCharacter;

        // 同步到云数据库
        await this.syncToCloud(app);
      }

      return true;
    } catch (error) {
      console.error('更新角色信息失败:', error);
      return false;
    }
  }

  /**
   * 同步数据到云数据库
   */
  async syncToCloud(app) {
    try {
      const cloudDB = app.globalData.cloudDB;
      const userInfo = app.globalData.userInfo;

      if (!cloudDB || !userInfo || !userInfo.openid) {
        console.log('ℹ️ 云数据库或用户信息不可用，跳过同步');
        return;
      }

      // 同步角色数据到云端
      const result = await cloudDB.saveCharacter(this.currentCharacter, userInfo.openid);

      if (result.success) {
        console.log('✅ 角色数据同步到云端成功');
      } else {
        console.error('❌ 角色数据同步到云端失败:', result.error);
      }

    } catch (error) {
      console.error('❌ 同步到云数据库失败:', error);
    }
  }

  /**
   * 清理云端数据中的保留字段
   * @param {object} cloudData 云端数据
   * @returns {object} 清理后的数据
   */
  cleanCloudData(cloudData) {
    const cleanData = { ...cloudData };

    // 移除云数据库保留字段
    delete cleanData._openid;      // 用户标识
    delete cleanData._id;          // 文档ID
    delete cleanData._updateTime;  // 更新时间
    delete cleanData._createTime;  // 创建时间

    return cleanData;
  }

  /**
   * 确保角色数据完整性
   * @param {object} character 角色对象
   * @returns {object} 完整的角色对象
   */
  ensureCharacterDataIntegrity(character) {
    if (!character) return character;

    // 确保必要的数组字段存在
    if (!character.collectedItems) {
      character.collectedItems = [];
    }

    if (!character.storyHistory) {
      character.storyHistory = [];
    }

    if (!character.completedTasks) {
      character.completedTasks = [];
    }

    if (!character.completedHabits) {
      character.completedHabits = [];
    }

    if (!character.achievements) {
      character.achievements = [];
    }

    if (!character.skills) {
      character.skills = [];
    }

    if (!character.equipment) {
      character.equipment = [];
    }

    if (!character.status) {
      character.status = [];
    }

    if (!character.appearance) {
      character.appearance = {};
    }

    return character;
  }

  /**
   * 从云端加载角色数据
   */
  async loadFromCloud() {
    try {
      const app = getApp();
      const cloudDB = app.globalData.cloudDB;
      const userInfo = app.globalData.userInfo;

      if (!cloudDB || !userInfo || !userInfo.openid) {
        console.log('ℹ️ 云数据库或用户信息不可用，使用本地数据');
        return false;
      }

      // 从云端获取角色数据
      const result = await cloudDB.getCharacter(userInfo.openid);

      if (result.success && result.data) {
        // 合并云端数据和本地数据
        const cloudCharacter = result.data;
        const localCharacter = this.getCurrentCharacter();

        // 比较更新时间，使用最新的数据
        const cloudUpdateTime = new Date(cloudCharacter.updatedAt || 0);
        const localUpdateTime = new Date(localCharacter.updatedAt || 0);

        if (cloudUpdateTime > localUpdateTime) {
          console.log('✅ 使用云端数据（更新）');

          // 清理云端数据中的保留字段
          const cleanCloudCharacter = this.cleanCloudData(cloudCharacter);
          this.currentCharacter = this.ensureCharacterDataIntegrity(cleanCloudCharacter);

          // 保存到本地
          wx.setStorageSync('characterInfo', this.currentCharacter);

          // 更新全局状态
          app.globalData.character = this.currentCharacter;

          return true;
        } else {
          console.log('ℹ️ 本地数据更新，同步到云端');
          await this.syncToCloud(app);
          return false;
        }
      } else {
        console.log('ℹ️ 云端无数据，同步本地数据到云端');
        await this.syncToCloud(app);
        return false;
      }

    } catch (error) {
      console.error('❌ 从云端加载数据失败:', error);
      return false;
    }
  }

  /**
   * 同步收藏物品到云端
   */
  async syncCollectedItemToCloud(item) {
    try {
      const app = getApp();
      const cloudDB = app.globalData.cloudDB;
      const userInfo = app.globalData.userInfo;

      if (!cloudDB || !userInfo || !userInfo.openid) {
        console.log('ℹ️ 云数据库或用户信息不可用，跳过物品同步');
        return;
      }

      const result = await cloudDB.saveCollectedItem(item, userInfo.openid);

      if (result.success) {
        console.log('✅ 收藏物品同步到云端成功');
      } else {
        console.error('❌ 收藏物品同步到云端失败:', result.error);
      }

    } catch (error) {
      console.error('❌ 同步收藏物品失败:', error);
    }
  }

  /**
   * 同步故事到云端
   */
  async syncStoryToCloud(story) {
    try {
      const app = getApp();
      const cloudDB = app.globalData.cloudDB;
      const userInfo = app.globalData.userInfo;

      if (!cloudDB || !userInfo || !userInfo.openid) {
        console.log('ℹ️ 云数据库或用户信息不可用，跳过故事同步');
        return;
      }

      const result = await cloudDB.saveStory(story, userInfo.openid);

      if (result.success) {
        console.log('✅ 故事同步到云端成功');
      } else {
        console.error('❌ 故事同步到云端失败:', result.error);
      }

    } catch (error) {
      console.error('❌ 同步故事失败:', error);
    }
  }

  /**
   * 计算属性总值
   * @param {object} attributes 属性对象
   * @returns {number} 属性总值
   */
  calculateTotalAttributes(attributes) {
    return Object.values(attributes || {}).reduce((total, value) => total + (value || 0), 0);
  }

  /**
   * 计算角色战斗力
   * @param {object} character 角色对象
   * @returns {number} 战斗力数值
   */
  calculatePowerLevel(character) {
    if (!character || !character.attributes) return 0;
    
    const attrs = character.attributes;
    const level = character.level || 1;
    
    // 战斗力计算公式：(属性总和 * 等级系数) + 技能加成
    const attributeSum = this.calculateTotalAttributes(attrs);
    const levelBonus = level * 10;
    const skillBonus = (character.skills || []).length * 5;
    
    return Math.floor(attributeSum * 1.5 + levelBonus + skillBonus);
  }

  /**
   * 计算经验值进度百分比
   * @param {object} character 角色对象
   * @returns {number} 经验值百分比 (0-100)
   */
  calculateExpProgress(character) {
    if (!character) return 0;
    
    const currentLevel = character.level || 1;
    const currentExp = character.experience || 0;
    
    const currentLevelExp = this.getExpForLevel(currentLevel);
    const nextLevelExp = this.getExpForLevel(currentLevel + 1);
    
    if (currentLevel >= 100) return 100; // 满级
    
    const expInCurrentLevel = currentExp - currentLevelExp;
    const expNeededForNextLevel = nextLevelExp - currentLevelExp;
    
    return Math.floor((expInCurrentLevel / expNeededForNextLevel) * 100);
  }

  /**
   * 获取指定等级所需的经验值
   * @param {number} level 等级
   * @returns {number} 所需经验值
   */
  getExpForLevel(level) {
    if (level <= 1) return 0;
    if (level > 100) return this.expTable[99]; // 最高100级
    
    return this.expTable[level - 2]; // 数组从0开始，level从1开始
  }

  /**
   * 生成经验值表
   * @returns {Array} 经验值数组
   */
  generateExpTable() {
    const expTable = [];
    let baseExp = 100;
    
    for (let i = 0; i < 99; i++) { // 2级到100级
      expTable.push(baseExp);
      baseExp = Math.floor(baseExp * 1.15); // 每级增长15%
    }
    
    return expTable;
  }

  /**
   * 添加经验值
   * @param {number} expGain 获得的经验值
   * @returns {object} 升级结果
   */
  addExperience(expGain) {
    const character = this.getCurrentCharacter();
    if (!character) return { success: false, error: '角色不存在' };

    const oldLevel = character.level || 1;
    const oldExp = character.experience || 0;
    const newExp = oldExp + expGain;

    // 计算新等级
    let newLevel = oldLevel;
    while (newLevel < 100 && newExp >= this.getExpForLevel(newLevel + 1)) {
      newLevel++;
    }

    const leveledUp = newLevel > oldLevel;
    const levelsGained = newLevel - oldLevel;
    const attributePoints = leveledUp ? levelsGained * 2 : 0; // 每级获得2点属性点
    const skillPoints = leveledUp ? levelsGained * 1 : 0; // 每级获得1点技能点

    // 更新角色数据
    const updateData = {
      experience: newExp,
      level: newLevel,
      expPercent: this.calculateExpProgress({ ...character, experience: newExp, level: newLevel })
    };

    if (leveledUp) {
      updateData.availableAttributePoints = (character.availableAttributePoints || 0) + attributePoints;
      updateData.availableSkillPoints = (character.availableSkillPoints || 0) + skillPoints;
    }

    this.updateCharacter(updateData);

    return {
      success: true,
      leveledUp,
      oldLevel,
      newLevel,
      expGain,
      attributePoints,
      skillPoints,
      newExp
    };
  }

  /**
   * 分配属性点
   * @param {string} attributeName 属性名称
   * @param {number} points 分配的点数
   * @returns {object} 分配结果
   */
  allocateAttributePoints(attributeName, points) {
    const character = this.getCurrentCharacter();
    if (!character) return { success: false, error: '角色不存在' };

    const availablePoints = character.availableAttributePoints || 0;
    if (points > availablePoints) {
      return { success: false, error: '可用属性点不足' };
    }

    if (!this.attributes[attributeName]) {
      return { success: false, error: '无效的属性名称' };
    }

    const currentValue = character.attributes[attributeName] || 0;
    const newValue = currentValue + points;

    // 属性上限检查（每个属性最高100点）
    if (newValue > 100) {
      return { success: false, error: '属性值已达上限' };
    }

    // 更新属性
    const updateData = {
      [`attributes.${attributeName}`]: newValue,
      availableAttributePoints: availablePoints - points
    };

    this.updateCharacter(updateData);

    return {
      success: true,
      attributeName,
      oldValue: currentValue,
      newValue,
      pointsUsed: points,
      remainingPoints: availablePoints - points
    };
  }

  /**
   * 获取属性信息
   * @param {string} attributeName 属性名称
   * @returns {object} 属性信息
   */
  getAttributeInfo(attributeName) {
    return this.attributes[attributeName] || null;
  }

  /**
   * 获取所有属性信息
   * @returns {object} 所有属性信息
   */
  getAllAttributesInfo() {
    return this.attributes;
  }

  /**
   * 计算属性等级
   * @param {number} attributeValue 属性值
   * @returns {string} 属性等级描述
   */
  getAttributeLevel(attributeValue) {
    if (attributeValue >= 80) return 'S级';
    if (attributeValue >= 60) return 'A级';
    if (attributeValue >= 40) return 'B级';
    if (attributeValue >= 20) return 'C级';
    return 'D级';
  }

  /**
   * 获取角色称号
   * @param {object} character 角色对象
   * @returns {string} 角色称号
   */
  getCharacterTitle(character) {
    if (!character || !character.attributes) return '新手冒险者';

    const attrs = character.attributes;
    const level = character.level || 1;

    // 根据最高属性确定称号
    let maxAttr = 'strength';
    let maxValue = attrs.strength || 0;

    Object.keys(attrs).forEach(attr => {
      if (attrs[attr] > maxValue) {
        maxValue = attrs[attr];
        maxAttr = attr;
      }
    });

    const titles = {
      strength: ['健身新手', '力量学徒', '肌肉达人', '力量大师', '钢铁战士'],
      intelligence: ['求知者', '学者', '智者', '博学家', '智慧贤者'],
      charisma: ['社交新人', '魅力使者', '人气王', '社交达人', '魅力领袖'],
      creativity: ['创意萌新', '艺术学徒', '创作者', '艺术家', '创意大师'],
      discipline: ['自律新手', '规律践行者', '自控达人', '纪律大师', '意志钢铁'],
      vitality: ['活力新人', '能量使者', '活力达人', '生命力大师', '永恒之星']
    };

    const titleIndex = Math.min(Math.floor(maxValue / 20), 4);
    return titles[maxAttr][titleIndex] || '冒险者';
  }

  /**
   * 获取升级奖励信息
   * @param {number} newLevel 新等级
   * @returns {object} 升级奖励
   */
  getLevelUpRewards(newLevel) {
    const rewards = {
      attributePoints: 2, // 基础属性点
      experience: 0,
      items: [],
      skills: [],
      titles: []
    };

    // 每5级额外奖励
    if (newLevel % 5 === 0) {
      rewards.attributePoints += 1;
      rewards.items.push({
        id: 'exp_potion_small',
        name: '小型经验药水',
        description: '使用后获得50点经验值',
        icon: '🧪',
        type: 'consumable'
      });
    }

    // 每10级重要奖励
    if (newLevel % 10 === 0) {
      rewards.attributePoints += 2;
      rewards.skills.push({
        id: `skill_level_${newLevel}`,
        name: `${newLevel}级技能点`,
        description: '可用于解锁新技能',
        icon: '⭐'
      });
    }

    // 特殊等级奖励
    const specialRewards = {
      10: { title: '初级冒险者', items: ['health_potion'] },
      20: { title: '经验丰富的冒险者', items: ['mana_potion'] },
      30: { title: '资深冒险者', items: ['rare_gem'] },
      50: { title: '传奇冒险者', items: ['legendary_scroll'] },
      75: { title: '大师级冒险者', items: ['master_crystal'] },
      100: { title: '至尊冒险者', items: ['ultimate_artifact'] }
    };

    if (specialRewards[newLevel]) {
      const special = specialRewards[newLevel];
      if (special.title) {
        rewards.titles.push(special.title);
      }
      if (special.items) {
        rewards.items.push(...special.items.map(itemId => ({
          id: itemId,
          name: this.getItemName(itemId),
          icon: this.getItemIcon(itemId)
        })));
      }
    }

    return rewards;
  }

  /**
   * 获取物品名称
   * @param {string} itemId 物品ID
   * @returns {string} 物品名称
   */
  getItemName(itemId) {
    const itemNames = {
      'health_potion': '生命药水',
      'mana_potion': '魔法药水',
      'rare_gem': '稀有宝石',
      'legendary_scroll': '传奇卷轴',
      'master_crystal': '大师水晶',
      'ultimate_artifact': '至尊神器'
    };
    return itemNames[itemId] || '未知物品';
  }

  /**
   * 获取物品图标
   * @param {string} itemId 物品ID
   * @returns {string} 物品图标
   */
  getItemIcon(itemId) {
    const itemIcons = {
      'health_potion': '❤️',
      'mana_potion': '💙',
      'rare_gem': '💎',
      'legendary_scroll': '📜',
      'master_crystal': '🔮',
      'ultimate_artifact': '👑'
    };
    return itemIcons[itemId] || '📦';
  }

  /**
   * 计算下一级所需经验值
   * @param {number} currentLevel 当前等级
   * @returns {number} 下一级所需经验值
   */
  getExpToNextLevel(currentLevel) {
    if (currentLevel >= 100) return 0;
    return this.getExpForLevel(currentLevel + 1);
  }

  /**
   * 计算当前等级剩余经验值
   * @param {object} character 角色对象
   * @returns {number} 剩余经验值
   */
  getExpRemaining(character) {
    if (!character) return 0;

    const currentLevel = character.level || 1;
    const currentExp = character.experience || 0;
    const nextLevelExp = this.getExpToNextLevel(currentLevel);

    return Math.max(0, nextLevelExp - currentExp);
  }

  /**
   * 获取等级段信息
   * @param {number} level 等级
   * @returns {object} 等级段信息
   */
  getLevelTier(level) {
    if (level >= 90) return { name: '传奇', color: '#fbbf24', icon: '👑' };
    if (level >= 75) return { name: '大师', color: '#8b5cf6', icon: '🔮' };
    if (level >= 60) return { name: '专家', color: '#3b82f6', icon: '⭐' };
    if (level >= 45) return { name: '资深', color: '#059669', icon: '🛡️' };
    if (level >= 30) return { name: '熟练', color: '#dc2626', icon: '⚔️' };
    if (level >= 15) return { name: '进阶', color: '#ea580c', icon: '🗡️' };
    return { name: '新手', color: '#6b7280', icon: '🔰' };
  }

  /**
   * 模拟任务完成获得经验
   * @param {string} taskType 任务类型
   * @param {string} difficulty 难度等级
   * @param {object} character 角色对象
   * @returns {number} 获得的经验值
   */
  calculateTaskExp(taskType, difficulty, character) {
    const baseExp = {
      'daily': 20,
      'weekly': 100,
      'monthly': 500,
      'special': 200,
      'habit': 15
    };

    const difficultyMultiplier = {
      'easy': 0.8,
      'normal': 1.0,
      'hard': 1.5,
      'expert': 2.0,
      'legendary': 3.0
    };

    const levelBonus = Math.floor((character?.level || 1) / 10) * 0.1;
    const attributeBonus = this.getAttributeBonus(taskType, character);

    const exp = (baseExp[taskType] || 20) *
                 (difficultyMultiplier[difficulty] || 1.0) *
                 (1 + levelBonus + attributeBonus);

    return Math.floor(exp);
  }

  /**
   * 根据任务类型获取属性加成
   * @param {string} taskType 任务类型
   * @param {object} character 角色对象
   * @returns {number} 属性加成比例
   */
  getAttributeBonus(taskType, character) {
    if (!character || !character.attributes) return 0;

    const attributeMap = {
      'fitness': 'strength',
      'study': 'intelligence',
      'social': 'charisma',
      'creative': 'creativity',
      'routine': 'discipline',
      'wellness': 'vitality'
    };

    const relevantAttr = attributeMap[taskType];
    if (!relevantAttr) return 0;

    const attrValue = character.attributes[relevantAttr] || 0;
    return Math.min(attrValue / 100 * 0.5, 0.5); // 最多50%加成
  }

  /**
   * 重置角色属性点（需要消耗道具）
   * @param {string} resetType 重置类型：'partial' 或 'full'
   * @returns {object} 重置结果
   */
  resetAttributePoints(resetType = 'partial') {
    const character = this.getCurrentCharacter();
    if (!character) return { success: false, error: '角色不存在' };

    const level = character.level || 1;
    let totalPoints = 0;

    if (resetType === 'full') {
      // 完全重置：回到初始状态
      totalPoints = level * 2; // 每级2点
      const resetAttributes = {
        strength: 10,
        intelligence: 10,
        charisma: 10,
        creativity: 10,
        discipline: 10,
        vitality: 10
      };

      this.updateCharacter({
        attributes: resetAttributes,
        availableAttributePoints: totalPoints
      });
    } else {
      // 部分重置：只重置超过基础值的部分
      const currentAttrs = character.attributes;
      const resetAttributes = { ...currentAttrs };

      Object.keys(currentAttrs).forEach(attr => {
        if (currentAttrs[attr] > 10) {
          totalPoints += currentAttrs[attr] - 10;
          resetAttributes[attr] = 10;
        }
      });

      this.updateCharacter({
        attributes: resetAttributes,
        availableAttributePoints: (character.availableAttributePoints || 0) + totalPoints
      });
    }

    return {
      success: true,
      resetType,
      pointsRecovered: totalPoints,
      message: `成功重置属性，回收了 ${totalPoints} 个属性点`
    };
  }
}

// 导出单例实例
const characterService = new CharacterService();
module.exports = characterService;
