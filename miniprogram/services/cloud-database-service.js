// 云数据库服务
class CloudDatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
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
   * 初始化云数据库
   */
  init() {
    try {
      if (!wx.cloud) {
        throw new Error('云开发未初始化');
      }
      
      this.db = wx.cloud.database();
      this.isInitialized = true;
      console.log('✅ 云数据库服务初始化成功');
      return true;
    } catch (error) {
      console.error('❌ 云数据库服务初始化失败:', error);
      return false;
    }
  }

  /**
   * 检查服务是否可用
   */
  isAvailable() {
    return this.isInitialized && this.db;
  }

  /**
   * 清理数据中的保留字段
   * @param {Object} data 要清理的数据
   * @returns {Object} 清理后的数据
   */
  cleanReservedFields(data) {
    const cleanData = { ...data };

    // 移除所有云数据库保留字段
    delete cleanData._openid;      // 用户标识，系统自动添加
    delete cleanData._id;          // 文档ID，系统自动生成
    delete cleanData._updateTime;  // 更新时间，系统自动管理
    delete cleanData._createTime;  // 创建时间，系统自动管理

    return cleanData;
  }

  /**
   * 保存或更新角色数据
   */
  async saveCharacter(characterData, openid) {
    try {
      if (!this.isAvailable()) {
        throw new Error('云数据库服务不可用');
      }

      const collection = this.db.collection(this.collections.characters);

      // 查找是否已存在该用户的角色数据（_openid会自动匹配当前用户）
      const existingResult = await collection.get();

      // 准备要保存的数据（移除所有保留字段）
      const dataToSave = this.cleanReservedFields({
        ...characterData,
        updatedAt: new Date()
      });

      if (existingResult.data.length > 0) {
        // 更新现有数据
        const docId = existingResult.data[0]._id;
        const result = await collection.doc(docId).update({
          data: dataToSave
        });

        console.log('✅ 角色数据更新成功:', result);
        return { success: true, action: 'updated', result };
      } else {
        // 创建新数据
        dataToSave.createdAt = new Date();
        const result = await collection.add({
          data: dataToSave
        });

        console.log('✅ 角色数据创建成功:', result);
        return { success: true, action: 'created', result };
      }

    } catch (error) {
      console.error('❌ 保存角色数据失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取角色数据
   */
  async getCharacter(openid) {
    try {
      if (!this.isAvailable()) {
        throw new Error('云数据库服务不可用');
      }

      const collection = this.db.collection(this.collections.characters);
      // 不需要指定_openid，系统会自动过滤当前用户的数据
      const result = await collection.get();

      if (result.data.length > 0) {
        console.log('✅ 获取角色数据成功');
        return { success: true, data: result.data[0] };
      } else {
        console.log('ℹ️ 未找到角色数据');
        return { success: false, error: '未找到角色数据' };
      }

    } catch (error) {
      console.error('❌ 获取角色数据失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 保存故事数据
   */
  async saveStory(storyData, openid) {
    try {
      if (!this.isAvailable()) {
        throw new Error('云数据库服务不可用');
      }

      const collection = this.db.collection(this.collections.stories);
      const dataToSave = this.cleanReservedFields({
        ...storyData,
        createdAt: new Date()
      });

      const result = await collection.add({
        data: dataToSave
      });

      console.log('✅ 故事数据保存成功:', result);
      return { success: true, result };

    } catch (error) {
      console.error('❌ 保存故事数据失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取用户故事历史
   */
  async getStoryHistory(openid, limit = 20) {
    try {
      if (!this.isAvailable()) {
        throw new Error('云数据库服务不可用');
      }

      const collection = this.db.collection(this.collections.stories);
      const result = await collection
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      console.log('✅ 获取故事历史成功:', result.data.length, '条记录');
      return { success: true, data: result.data };

    } catch (error) {
      console.error('❌ 获取故事历史失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 保存任务完成记录
   */
  async saveTaskCompletion(taskData, openid) {
    try {
      if (!this.isAvailable()) {
        throw new Error('云数据库服务不可用');
      }

      const collection = this.db.collection(this.collections.tasks);
      const dataToSave = this.cleanReservedFields({
        ...taskData,
        completedAt: new Date()
      });

      const result = await collection.add({
        data: dataToSave
      });

      console.log('✅ 任务完成记录保存成功:', result);
      return { success: true, result };

    } catch (error) {
      console.error('❌ 保存任务完成记录失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 保存习惯完成记录
   */
  async saveHabitCompletion(habitData, openid) {
    try {
      if (!this.isAvailable()) {
        throw new Error('云数据库服务不可用');
      }

      const collection = this.db.collection(this.collections.habits);
      const dataToSave = this.cleanReservedFields({
        ...habitData,
        completedAt: new Date()
      });

      const result = await collection.add({
        data: dataToSave
      });

      console.log('✅ 习惯完成记录保存成功:', result);
      return { success: true, result };

    } catch (error) {
      console.error('❌ 保存习惯完成记录失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 保存收藏物品
   */
  async saveCollectedItem(itemData, openid) {
    try {
      if (!this.isAvailable()) {
        throw new Error('云数据库服务不可用');
      }

      const collection = this.db.collection(this.collections.items);
      const dataToSave = this.cleanReservedFields({
        ...itemData,
        collectedAt: new Date()
      });

      const result = await collection.add({
        data: dataToSave
      });

      console.log('✅ 收藏物品保存成功:', result);
      return { success: true, result };

    } catch (error) {
      console.error('❌ 保存收藏物品失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取用户收藏物品
   */
  async getCollectedItems(openid, limit = 50) {
    try {
      if (!this.isAvailable()) {
        throw new Error('云数据库服务不可用');
      }

      const collection = this.db.collection(this.collections.items);
      const result = await collection
        .orderBy('collectedAt', 'desc')
        .limit(limit)
        .get();

      console.log('✅ 获取收藏物品成功:', result.data.length, '条记录');
      return { success: true, data: result.data };

    } catch (error) {
      console.error('❌ 获取收藏物品失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取今日完成的任务
   */
  async getTodayTasks(openid) {
    try {
      if (!this.isAvailable()) {
        throw new Error('云数据库服务不可用');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const collection = this.db.collection(this.collections.tasks);
      const result = await collection
        .where({
          completedAt: this.db.command.gte(today).and(this.db.command.lt(tomorrow))
        })
        .orderBy('completedAt', 'desc')
        .get();

      console.log('✅ 获取今日任务成功:', result.data.length, '条记录');
      return { success: true, data: result.data };

    } catch (error) {
      console.error('❌ 获取今日任务失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取今日完成的习惯
   */
  async getTodayHabits(openid) {
    try {
      if (!this.isAvailable()) {
        throw new Error('云数据库服务不可用');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const collection = this.db.collection(this.collections.habits);
      const result = await collection
        .where({
          completedAt: this.db.command.gte(today).and(this.db.command.lt(tomorrow))
        })
        .orderBy('completedAt', 'desc')
        .get();

      console.log('✅ 获取今日习惯成功:', result.data.length, '条记录');
      return { success: true, data: result.data };

    } catch (error) {
      console.error('❌ 获取今日习惯失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 批量同步本地数据到云端
   */
  async syncLocalDataToCloud(localData, openid) {
    try {
      const results = {
        character: null,
        stories: [],
        tasks: [],
        habits: [],
        items: []
      };

      // 同步角色数据
      if (localData.character) {
        results.character = await this.saveCharacter(localData.character, openid);
      }

      // 同步故事历史
      if (localData.storyHistory && localData.storyHistory.length > 0) {
        for (const story of localData.storyHistory) {
          const result = await this.saveStory(story, openid);
          results.stories.push(result);
        }
      }

      // 同步任务记录
      if (localData.completedTasks && localData.completedTasks.length > 0) {
        for (const task of localData.completedTasks) {
          const result = await this.saveTaskCompletion(task, openid);
          results.tasks.push(result);
        }
      }

      // 同步习惯记录
      if (localData.completedHabits && localData.completedHabits.length > 0) {
        for (const habit of localData.completedHabits) {
          const result = await this.saveHabitCompletion(habit, openid);
          results.habits.push(result);
        }
      }

      // 同步收藏物品
      if (localData.collectedItems && localData.collectedItems.length > 0) {
        for (const item of localData.collectedItems) {
          const result = await this.saveCollectedItem(item, openid);
          results.items.push(result);
        }
      }

      console.log('✅ 本地数据同步到云端完成:', results);
      return { success: true, results };

    } catch (error) {
      console.error('❌ 本地数据同步失败:', error);
      return { success: false, error: error.message };
    }
  }
}

// 导出单例
const cloudDatabaseService = new CloudDatabaseService();
module.exports = cloudDatabaseService;
