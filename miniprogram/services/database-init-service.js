// 数据库初始化服务
class DatabaseInitService {
  constructor() {
    this.db = null;
    this.collections = {
      users: 'users',
      characters: 'characters', 
      stories: 'stories',
      tasks: 'tasks',
      habits: 'habits',
      items: 'items'
    };
  }

  /**
   * 初始化数据库连接
   */
  init() {
    try {
      if (!wx.cloud) {
        throw new Error('云开发未初始化');
      }
      
      this.db = wx.cloud.database();
      console.log('✅ 数据库初始化服务准备就绪');
      return true;
    } catch (error) {
      console.error('❌ 数据库初始化服务失败:', error);
      return false;
    }
  }

  /**
   * 检查集合是否存在（使用云函数）
   */
  async checkCollectionExists(collectionName) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'initDatabase',
        data: {
          action: 'checkCollections'
        }
      });

      if (result.result.success) {
        const collections = result.result.collections;
        for (const [key, collection] of Object.entries(collections)) {
          if (collection.name === collectionName) {
            return collection.exists;
          }
        }
      }
      return false;
    } catch (error) {
      console.error(`❌ 检查集合 ${collectionName} 失败:`, error);
      throw error;
    }
  }

  /**
   * 创建集合（使用云函数）
   */
  async createCollection(collectionName) {
    try {
      console.log(`🔨 开始创建集合: ${collectionName}`);

      const result = await wx.cloud.callFunction({
        name: 'initDatabase',
        data: {
          action: 'createCollection',
          collectionName: collectionName
        }
      });

      if (result.result.success) {
        console.log(`✅ 集合 ${collectionName} 创建成功`);
        return { success: true, _id: result.result.tempDocId };
      } else {
        console.error(`❌ 创建集合 ${collectionName} 失败:`, result.result.error);
        return { success: false, error: result.result.error };
      }
    } catch (error) {
      console.error(`❌ 创建集合 ${collectionName} 失败:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 初始化所有必需的集合（使用云函数）
   */
  async initializeAllCollections() {
    try {
      console.log('🔨 开始初始化所有集合...');

      const result = await wx.cloud.callFunction({
        name: 'initDatabase',
        data: {
          action: 'createAllCollections'
        }
      });

      if (result.result.success) {
        console.log('✅ 所有集合初始化成功:', result.result.summary);
        return result.result.results;
      } else {
        console.error('❌ 集合初始化失败:', result.result.error);
        return result.result.results || {};
      }
    } catch (error) {
      console.error('❌ 初始化集合失败:', error);
      throw error;
    }
  }

  /**
   * 获取数据库状态（使用云函数）
   */
  async getDatabaseStatus() {
    const status = {
      connected: false,
      collections: {},
      totalCollections: 0,
      existingCollections: 0
    };

    try {
      // 先测试连接
      const connectionResult = await wx.cloud.callFunction({
        name: 'initDatabase',
        data: {
          action: 'testConnection'
        }
      });

      status.connected = connectionResult.result.success;

      if (status.connected) {
        // 检查所有集合状态
        const collectionsResult = await wx.cloud.callFunction({
          name: 'initDatabase',
          data: {
            action: 'checkCollections'
          }
        });

        if (collectionsResult.result.success) {
          status.collections = collectionsResult.result.collections;

          // 计算存在的集合数量
          for (const [key, collection] of Object.entries(status.collections)) {
            if (collection.exists) {
              status.existingCollections++;
            }
          }
        }
      }

      status.totalCollections = Object.keys(this.collections).length;

    } catch (error) {
      console.error('获取数据库状态失败:', error);
      status.error = error.message;
    }

    return status;
  }

  /**
   * 清空集合（仅用于测试）
   */
  async clearCollection(collectionName) {
    try {
      console.log(`🗑️ 开始清空集合: ${collectionName}`);
      
      // 获取所有文档
      const result = await this.db.collection(collectionName).get();
      
      if (result.data.length === 0) {
        console.log(`ℹ️ 集合 ${collectionName} 已经是空的`);
        return { success: true, deletedCount: 0 };
      }

      // 批量删除
      let deletedCount = 0;
      for (const doc of result.data) {
        await this.db.collection(collectionName).doc(doc._id).remove();
        deletedCount++;
      }

      console.log(`✅ 集合 ${collectionName} 清空完成，删除了 ${deletedCount} 条记录`);
      return { success: true, deletedCount };

    } catch (error) {
      console.error(`❌ 清空集合 ${collectionName} 失败:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 插入示例数据（使用云函数）
   */
  async insertSampleData() {
    try {
      console.log('📝 开始插入示例数据...');

      const result = await wx.cloud.callFunction({
        name: 'initDatabase',
        data: {
          action: 'insertSampleData'
        }
      });

      if (result.result.success) {
        console.log('✅ 示例数据插入完成:', result.result.results);
        return { success: true, results: result.result.results };
      } else {
        console.error('❌ 插入示例数据失败:', result.result.error);
        return { success: false, error: result.result.error };
      }

    } catch (error) {
      console.error('❌ 插入示例数据失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 删除示例数据（使用云函数）
   */
  async removeSampleData() {
    try {
      console.log('🗑️ 开始删除示例数据...');

      const result = await wx.cloud.callFunction({
        name: 'initDatabase',
        data: {
          action: 'removeSampleData'
        }
      });

      if (result.result.success) {
        console.log('✅ 示例数据删除完成:', result.result.results);
        return { success: true, results: result.result.results };
      } else {
        console.error('❌ 删除示例数据失败:', result.result.error);
        return { success: false, error: result.result.error };
      }

    } catch (error) {
      console.error('❌ 删除示例数据失败:', error);
      return { success: false, error: error.message };
    }
  }
}

// 导出单例
const databaseInitService = new DatabaseInitService();
module.exports = databaseInitService;
