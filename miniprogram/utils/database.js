// 数据库工具类
import modelInterface from './model-interface.js';

// 延迟初始化数据库连接
let db = null;

function getDatabase() {
  if (!db) {
    try {
      db = wx.cloud.database();
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw new Error('请先初始化云开发环境');
    }
  }
  return db;
}

class DatabaseManager {
  constructor() {
    // 延迟初始化，在实际使用时才获取数据库实例
  }

  get db() {
    return getDatabase();
  }

  // 初始化数据库集合
  async initCollections() {
    try {
      console.log('开始初始化数据库集合...');
      
      // 创建用户集合
      await this.createCollection('users');
      
      // 创建角色集合
      await this.createCollection('characters');
      
      // 创建任务集合
      await this.createCollection('tasks');
      
      // 创建习惯集合
      await this.createCollection('habits');
      
      // 创建物品集合
      await this.createCollection('items');
      
      // 创建库存集合
      await this.createCollection('inventory');
      
      // 创建社交关系集合
      await this.createCollection('socialRelations');
      
      // 创建团队集合
      await this.createCollection('teams');
      
      // 创建情绪记录集合
      await this.createCollection('moodLogs');
      
      // 创建故事线集合
      await this.createCollection('storylines');
      
      console.log('数据库集合初始化完成');
      return { success: true };
    } catch (error) {
      console.error('数据库初始化失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 创建集合
  async createCollection(collectionName) {
    try {
      // 尝试获取集合，如果不存在会自动创建
      await this.db.collection(collectionName).limit(1).get();
      console.log(`集合 ${collectionName} 已就绪`);
    } catch (error) {
      console.log(`创建集合 ${collectionName}:`, error);
    }
  }

  // 用户相关操作
  async createUser(userData) {
    try {
      const result = await this.db.collection('users').add({
        data: {
          ...userData,
          registrationDate: new Date(),
          lastLoginDate: new Date(),
          statistics: {
            tasksCompleted: 0,
            habitsFormed: 0,
            achievementsUnlocked: 0,
            experienceGained: 0
          }
        }
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserByOpenId(openid) {
    try {
      const result = await this.db.collection('users').where({
        openid: openid
      }).get();
      return { success: true, data: result.data[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 角色相关操作
  async createCharacter(userId, characterData) {
    try {
      const result = await this.db.collection('characters').add({
        data: {
          userId: userId,
          name: characterData.name || '冒险者',
          class: characterData.class || '新手',
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
          appearance: characterData.appearance || {},
          status: [],
          createdAt: new Date()
        }
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCharacterByUserId(userId) {
    try {
      const result = await this.db.collection('characters').where({
        userId: userId
      }).get();
      return { success: true, data: result.data[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 任务相关操作
  async createTask(taskData) {
    try {
      const result = await this.db.collection('tasks').add({
        data: {
          ...taskData,
          status: 'pending',
          progress: 0,
          createdAt: new Date()
        }
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserTasks(userId, filters = {}) {
    try {
      let query = this.db.collection('tasks').where({
        assigneeIds: this.db.command.in([userId])
      });

      if (filters.status) {
        query = query.where({
          status: filters.status
        });
      }

      if (filters.category) {
        query = query.where({
          category: filters.category
        });
      }

      const result = await query.orderBy('createdAt', 'desc').get();
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 习惯相关操作
  async createHabit(habitData) {
    try {
      const result = await this.db.collection('habits').add({
        data: {
          ...habitData,
          streak: {
            current: 0,
            best: 0
          },
          completionLog: [],
          createdAt: new Date()
        }
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserHabits(userId) {
    try {
      const result = await this.db.collection('habits').where({
        userId: userId
      }).orderBy('createdAt', 'desc').get();
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 库存相关操作
  async createInventory(userId) {
    try {
      const result = await this.db.collection('inventory').add({
        data: {
          userId: userId,
          currency: 0,
          items: [],
          achievements: [],
          realRewards: []
        }
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getInventoryByUserId(userId) {
    try {
      const result = await this.db.collection('inventory').where({
        userId: userId
      }).get();
      return { success: true, data: result.data[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 通用查询方法
  async query(collection, conditions = {}, options = {}) {
    try {
      let query = this.db.collection(collection);
      
      if (Object.keys(conditions).length > 0) {
        query = query.where(conditions);
      }
      
      if (options.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.order || 'asc');
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.skip) {
        query = query.skip(options.skip);
      }
      
      const result = await query.get();
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 通用更新方法
  async update(collection, docId, updateData) {
    try {
      const result = await this.db.collection(collection).doc(docId).update({
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 通用删除方法
  async delete(collection, docId) {
    try {
      const result = await this.db.collection(collection).doc(docId).remove();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 模型相关方法

  /**
   * 创建模型记录
   * @param {string} modelType 模型类型
   * @param {object} data 数据
   * @returns {Promise} 创建结果
   */
  async createModel(modelType, data) {
    try {
      // 验证数据
      const validation = modelInterface.validateModel(modelType, data);
      if (!validation.valid) {
        return {
          success: false,
          error: `数据验证失败: ${validation.errors.join(', ')}`
        };
      }

      // 创建模型实例
      const model = modelInterface.createModel(modelType, data);

      // 转换为数据库格式
      const dbData = modelInterface.toDatabase(model);

      // 保存到数据库
      const collectionName = modelInterface.getCollectionName(modelType);
      const result = await this.db.collection(collectionName).add({
        data: dbData
      });

      return {
        success: true,
        data: {
          id: result._id,
          model: model
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取模型记录
   * @param {string} modelType 模型类型
   * @param {string} docId 文档ID
   * @returns {Promise} 查询结果
   */
  async getModel(modelType, docId) {
    try {
      const collectionName = modelInterface.getCollectionName(modelType);
      const result = await this.db.collection(collectionName).doc(docId).get();

      if (result.data) {
        const model = modelInterface.fromDatabase(modelType, result.data);
        return { success: true, data: model };
      } else {
        return { success: false, error: '记录不存在' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 查询模型记录
   * @param {string} modelType 模型类型
   * @param {object} conditions 查询条件
   * @param {object} options 查询选项
   * @returns {Promise} 查询结果
   */
  async queryModels(modelType, conditions = {}, options = {}) {
    try {
      const collectionName = modelInterface.getCollectionName(modelType);
      let query = this.db.collection(collectionName);

      if (Object.keys(conditions).length > 0) {
        query = query.where(conditions);
      }

      if (options.orderBy) {
        query = query.orderBy(options.orderBy.field, options.orderBy.order || 'asc');
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.skip) {
        query = query.skip(options.skip);
      }

      const result = await query.get();
      const models = modelInterface.fromDatabaseArray(modelType, result.data);

      return { success: true, data: models };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 更新模型记录
   * @param {string} modelType 模型类型
   * @param {string} docId 文档ID
   * @param {object} updateData 更新数据
   * @returns {Promise} 更新结果
   */
  async updateModel(modelType, docId, updateData) {
    try {
      // 先获取现有数据
      const existingResult = await this.getModel(modelType, docId);
      if (!existingResult.success) {
        return existingResult;
      }

      // 合并数据
      const existingData = modelInterface.toDatabase(existingResult.data);
      const mergedData = { ...existingData, ...updateData };

      // 验证合并后的数据
      const validation = modelInterface.validateModel(modelType, mergedData);
      if (!validation.valid) {
        return {
          success: false,
          error: `数据验证失败: ${validation.errors.join(', ')}`
        };
      }

      // 更新数据库
      const collectionName = modelInterface.getCollectionName(modelType);
      const result = await this.db.collection(collectionName).doc(docId).update({
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      // 返回更新后的模型
      const updatedModel = modelInterface.createModel(modelType, mergedData);
      return {
        success: true,
        data: {
          stats: result.stats,
          model: updatedModel
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 删除模型记录
   * @param {string} modelType 模型类型
   * @param {string} docId 文档ID
   * @returns {Promise} 删除结果
   */
  async deleteModel(modelType, docId) {
    try {
      const collectionName = modelInterface.getCollectionName(modelType);
      const result = await this.db.collection(collectionName).doc(docId).remove();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 批量创建模型记录
   * @param {string} modelType 模型类型
   * @param {array} dataArray 数据数组
   * @returns {Promise} 创建结果
   */
  async createModels(modelType, dataArray) {
    try {
      const results = [];

      for (const data of dataArray) {
        const result = await this.createModel(modelType, data);
        results.push(result);
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      return {
        success: failCount === 0,
        data: {
          total: results.length,
          success: successCount,
          failed: failCount,
          results: results
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 统计模型记录数量
   * @param {string} modelType 模型类型
   * @param {object} conditions 查询条件
   * @returns {Promise} 统计结果
   */
  async countModels(modelType, conditions = {}) {
    try {
      const collectionName = modelInterface.getCollectionName(modelType);
      let query = this.db.collection(collectionName);

      if (Object.keys(conditions).length > 0) {
        query = query.where(conditions);
      }

      const result = await query.count();
      return { success: true, data: result.total };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// 导出单例实例
const databaseManager = new DatabaseManager();
module.exports = databaseManager;
