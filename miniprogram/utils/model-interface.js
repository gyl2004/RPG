// 数据模型接口管理器
const { User, Character, Task, Habit, Item, Inventory } = require('../models/index.js');
const { validateData } = require('./db-schema.js');

/**
 * 数据模型接口管理器
 * 提供统一的数据模型创建、验证和转换接口
 */
class ModelInterfaceManager {
  constructor() {
    this.modelTypes = {
      user: User,
      character: Character,
      task: Task,
      habit: Habit,
      item: Item,
      inventory: Inventory
    };
  }

  /**
   * 创建模型实例
   * @param {string} modelType 模型类型
   * @param {object} data 数据
   * @returns {object} 模型实例
   */
  createModel(modelType, data = {}) {
    const ModelClass = this.modelTypes[modelType];
    if (!ModelClass) {
      throw new Error(`未知的模型类型: ${modelType}`);
    }

    try {
      return new ModelClass(data);
    } catch (error) {
      throw new Error(`创建${modelType}模型失败: ${error.message}`);
    }
  }

  /**
   * 验证模型数据
   * @param {string} modelType 模型类型
   * @param {object} data 数据
   * @returns {object} 验证结果
   */
  validateModel(modelType, data) {
    // 首先进行数据库结构验证
    const collectionName = this.getCollectionName(modelType);
    const schemaValidation = validateData(collectionName, data);
    
    if (!schemaValidation.valid) {
      return schemaValidation;
    }

    // 然后进行业务逻辑验证
    try {
      const model = this.createModel(modelType, data);
      return this.validateBusinessRules(modelType, model);
    } catch (error) {
      return {
        valid: false,
        errors: [error.message]
      };
    }
  }

  /**
   * 验证业务规则
   * @param {string} modelType 模型类型
   * @param {object} model 模型实例
   * @returns {object} 验证结果
   */
  validateBusinessRules(modelType, model) {
    const errors = [];

    switch (modelType) {
      case 'user':
        if (!model.openid) {
          errors.push('用户必须有openid');
        }
        break;

      case 'character':
        if (!model.userId) {
          errors.push('角色必须关联用户');
        }
        if (model.level < 1 || model.level > 100) {
          errors.push('角色等级必须在1-100之间');
        }
        if (model.experience < 0) {
          errors.push('经验值不能为负数');
        }
        // 验证属性值
        for (const [attr, value] of Object.entries(model.attributes)) {
          if (value < 0 || value > 100) {
            errors.push(`属性${attr}值必须在0-100之间`);
          }
        }
        break;

      case 'task':
        if (!model.title || model.title.trim().length === 0) {
          errors.push('任务标题不能为空');
        }
        if (model.difficulty < 1 || model.difficulty > 5) {
          errors.push('任务难度必须在1-5之间');
        }
        if (model.progress < 0 || model.progress > 100) {
          errors.push('任务进度必须在0-100之间');
        }
        break;

      case 'habit':
        if (!model.title || model.title.trim().length === 0) {
          errors.push('习惯标题不能为空');
        }
        if (!model.userId) {
          errors.push('习惯必须关联用户');
        }
        if (model.streak.current < 0 || model.streak.best < 0) {
          errors.push('连续天数不能为负数');
        }
        break;

      case 'item':
        if (!model.name || model.name.trim().length === 0) {
          errors.push('物品名称不能为空');
        }
        if (model.price < 0) {
          errors.push('物品价格不能为负数');
        }
        break;

      case 'inventory':
        if (!model.userId) {
          errors.push('库存必须关联用户');
        }
        if (model.currency < 0) {
          errors.push('货币数量不能为负数');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 获取集合名称
   * @param {string} modelType 模型类型
   * @returns {string} 集合名称
   */
  getCollectionName(modelType) {
    const mapping = {
      user: 'users',
      character: 'characters',
      task: 'tasks',
      habit: 'habits',
      item: 'items',
      inventory: 'inventory'
    };
    return mapping[modelType] || modelType + 's';
  }

  /**
   * 转换数据库数据为模型实例
   * @param {string} modelType 模型类型
   * @param {object} dbData 数据库数据
   * @returns {object} 模型实例
   */
  fromDatabase(modelType, dbData) {
    if (!dbData) return null;
    
    try {
      return this.createModel(modelType, dbData);
    } catch (error) {
      console.error(`转换数据库数据失败:`, error);
      return null;
    }
  }

  /**
   * 转换模型实例为数据库数据
   * @param {object} model 模型实例
   * @returns {object} 数据库数据
   */
  toDatabase(model) {
    if (!model || typeof model.toJSON !== 'function') {
      throw new Error('无效的模型实例');
    }
    
    return model.toJSON();
  }

  /**
   * 批量转换数据库数据为模型实例
   * @param {string} modelType 模型类型
   * @param {array} dbDataArray 数据库数据数组
   * @returns {array} 模型实例数组
   */
  fromDatabaseArray(modelType, dbDataArray) {
    if (!Array.isArray(dbDataArray)) return [];
    
    return dbDataArray
      .map(data => this.fromDatabase(modelType, data))
      .filter(model => model !== null);
  }

  /**
   * 批量转换模型实例为数据库数据
   * @param {array} modelArray 模型实例数组
   * @returns {array} 数据库数据数组
   */
  toDatabaseArray(modelArray) {
    if (!Array.isArray(modelArray)) return [];
    
    return modelArray.map(model => this.toDatabase(model));
  }

  /**
   * 创建默认模型实例
   * @param {string} modelType 模型类型
   * @param {object} baseData 基础数据
   * @returns {object} 默认模型实例
   */
  createDefault(modelType, baseData = {}) {
    const defaults = this.getDefaultData(modelType);
    const mergedData = { ...defaults, ...baseData };
    return this.createModel(modelType, mergedData);
  }

  /**
   * 获取默认数据
   * @param {string} modelType 模型类型
   * @returns {object} 默认数据
   */
  getDefaultData(modelType) {
    const defaults = {
      user: {
        nickname: '新用户',
        avatarUrl: '',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
        settings: {},
        statistics: {
          tasksCompleted: 0,
          habitsFormed: 0,
          achievementsUnlocked: 0,
          experienceGained: 0
        }
      },
      character: {
        name: '冒险者',
        class: '新手',
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
      },
      task: {
        title: '新任务',
        description: '',
        category: 'personal',
        type: 'daily',
        difficulty: 1,
        rewards: {
          experience: 10,
          currency: 5
        },
        requirements: [],
        status: 'pending',
        progress: 0
      },
      habit: {
        title: '新习惯',
        description: '',
        category: 'health',
        frequency: {
          type: 'daily',
          days: [1, 2, 3, 4, 5, 6, 7],
          timesPerDay: 1
        },
        reminder: false,
        streak: {
          current: 0,
          best: 0
        },
        completionLog: []
      },
      item: {
        name: '新物品',
        description: '',
        type: 'consumable',
        rarity: 'common',
        effects: [],
        price: 0,
        tradable: true
      },
      inventory: {
        currency: 0,
        items: [],
        achievements: [],
        realRewards: []
      }
    };

    return defaults[modelType] || {};
  }

  /**
   * 获取支持的模型类型列表
   * @returns {array} 模型类型列表
   */
  getSupportedModelTypes() {
    return Object.keys(this.modelTypes);
  }

  /**
   * 检查模型类型是否支持
   * @param {string} modelType 模型类型
   * @returns {boolean} 是否支持
   */
  isModelTypeSupported(modelType) {
    return this.modelTypes.hasOwnProperty(modelType);
  }
}

// 导出单例实例
const modelInterface = new ModelInterfaceManager();
module.exports = modelInterface;
