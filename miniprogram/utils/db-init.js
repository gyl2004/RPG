// 数据库初始化脚本
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

/**
 * 数据库集合初始化管理器
 */
class DatabaseInitializer {
  constructor() {
    // 延迟初始化，在实际使用时才获取数据库实例
    this.collections = [
      'users',
      'characters', 
      'tasks',
      'habits',
      'items',
      'inventory',
      'socialRelations',
      'teams',
      'moodLogs',
      'storylines',
      'achievements',
      'skills',
      'notifications'
    ];
  }

  get db() {
    return getDatabase();
  }

  /**
   * 初始化所有数据库集合
   */
  async initializeDatabase() {
    console.log('开始初始化数据库...');
    
    try {
      // 创建所有集合
      await this.createCollections();
      
      // 初始化基础数据
      await this.initializeBaseData();
      
      console.log('数据库初始化完成');
      return { success: true, message: '数据库初始化成功' };
    } catch (error) {
      console.error('数据库初始化失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 创建所有集合
   */
  async createCollections() {
    console.log('创建数据库集合...');
    
    for (const collectionName of this.collections) {
      try {
        // 尝试查询集合，如果不存在会自动创建
        await this.db.collection(collectionName).limit(1).get();
        console.log(`集合 ${collectionName} 已就绪`);
      } catch (error) {
        console.log(`创建集合 ${collectionName}:`, error.message);
      }
    }
  }

  /**
   * 初始化基础数据
   */
  async initializeBaseData() {
    console.log('初始化基础数据...');
    
    // 初始化物品数据
    await this.initializeItems();
    
    // 初始化成就数据
    await this.initializeAchievements();
    
    // 初始化技能数据
    await this.initializeSkills();
  }

  /**
   * 初始化物品数据
   */
  async initializeItems() {
    const itemsCollection = this.db.collection('items');
    
    // 检查是否已有数据
    const existingItems = await itemsCollection.limit(1).get();
    if (existingItems.data.length > 0) {
      console.log('物品数据已存在，跳过初始化');
      return;
    }

    const baseItems = [
      {
        _id: 'energy_potion_small',
        name: '小型能量药水',
        description: '恢复少量活力值',
        type: 'consumable',
        rarity: 'common',
        effects: [
          {
            attribute: 'vitality',
            value: 5,
            duration: 60
          }
        ],
        imageUrl: '/images/items/energy_potion_small.png',
        price: 10,
        tradable: true
      },
      {
        _id: 'focus_crystal',
        name: '专注水晶',
        description: '提升智力和专注力',
        type: 'equipment',
        rarity: 'uncommon',
        effects: [
          {
            attribute: 'intelligence',
            value: 3,
            duration: 0
          }
        ],
        imageUrl: '/images/items/focus_crystal.png',
        price: 50,
        tradable: true
      },
      {
        _id: 'motivation_badge',
        name: '激励徽章',
        description: '增强自律和意志力',
        type: 'equipment',
        rarity: 'rare',
        effects: [
          {
            attribute: 'discipline',
            value: 5,
            duration: 0
          }
        ],
        imageUrl: '/images/items/motivation_badge.png',
        price: 100,
        tradable: false
      }
    ];

    for (const item of baseItems) {
      try {
        await itemsCollection.add({ data: item });
        console.log(`添加物品: ${item.name}`);
      } catch (error) {
        console.error(`添加物品失败 ${item.name}:`, error);
      }
    }
  }

  /**
   * 初始化成就数据
   */
  async initializeAchievements() {
    const achievementsCollection = this.db.collection('achievements');
    
    // 检查是否已有数据
    const existingAchievements = await achievementsCollection.limit(1).get();
    if (existingAchievements.data.length > 0) {
      console.log('成就数据已存在，跳过初始化');
      return;
    }

    const baseAchievements = [
      {
        _id: 'first_task',
        name: '初出茅庐',
        description: '完成第一个任务',
        icon: '🎯',
        category: 'milestone',
        requirements: {
          type: 'task_completion',
          target: 1
        },
        rewards: {
          experience: 50,
          currency: 20,
          items: ['energy_potion_small']
        },
        rarity: 'common'
      },
      {
        _id: 'habit_streak_7',
        name: '坚持不懈',
        description: '连续完成习惯7天',
        icon: '🔥',
        category: 'habit',
        requirements: {
          type: 'habit_streak',
          target: 7
        },
        rewards: {
          experience: 100,
          currency: 50,
          items: ['focus_crystal']
        },
        rarity: 'uncommon'
      },
      {
        _id: 'level_10',
        name: '小有成就',
        description: '角色达到10级',
        icon: '⭐',
        category: 'level',
        requirements: {
          type: 'character_level',
          target: 10
        },
        rewards: {
          experience: 200,
          currency: 100,
          items: ['motivation_badge']
        },
        rarity: 'rare'
      }
    ];

    for (const achievement of baseAchievements) {
      try {
        await achievementsCollection.add({ data: achievement });
        console.log(`添加成就: ${achievement.name}`);
      } catch (error) {
        console.error(`添加成就失败 ${achievement.name}:`, error);
      }
    }
  }

  /**
   * 初始化技能数据
   */
  async initializeSkills() {
    const skillsCollection = this.db.collection('skills');
    
    // 检查是否已有数据
    const existingSkills = await skillsCollection.limit(1).get();
    if (existingSkills.data.length > 0) {
      console.log('技能数据已存在，跳过初始化');
      return;
    }

    const baseSkills = [
      {
        _id: 'time_management',
        name: '时间管理',
        description: '提高任务完成效率',
        category: 'mental',
        maxLevel: 10,
        requirements: {
          attribute: 'discipline',
          minValue: 15
        },
        effects: [
          {
            type: 'task_exp_bonus',
            value: 0.1,
            perLevel: 0.05
          }
        ],
        unlockConditions: {
          tasksCompleted: 10
        }
      },
      {
        _id: 'physical_fitness',
        name: '体能训练',
        description: '增强体力和耐力',
        category: 'physical',
        maxLevel: 10,
        requirements: {
          attribute: 'strength',
          minValue: 20
        },
        effects: [
          {
            type: 'vitality_bonus',
            value: 2,
            perLevel: 1
          }
        ],
        unlockConditions: {
          habitsCompleted: 20,
          category: 'fitness'
        }
      },
      {
        _id: 'creative_thinking',
        name: '创意思维',
        description: '激发创造力和想象力',
        category: 'creative',
        maxLevel: 10,
        requirements: {
          attribute: 'creativity',
          minValue: 25
        },
        effects: [
          {
            type: 'creative_task_bonus',
            value: 0.15,
            perLevel: 0.1
          }
        ],
        unlockConditions: {
          tasksCompleted: 15,
          category: 'creative'
        }
      }
    ];

    for (const skill of baseSkills) {
      try {
        await skillsCollection.add({ data: skill });
        console.log(`添加技能: ${skill.name}`);
      } catch (error) {
        console.error(`添加技能失败 ${skill.name}:`, error);
      }
    }
  }

  /**
   * 清空所有集合数据（仅用于开发测试）
   */
  async clearAllData() {
    console.warn('警告：正在清空所有数据库数据！');
    
    for (const collectionName of this.collections) {
      try {
        const collection = this.db.collection(collectionName);
        const result = await collection.get();
        
        for (const doc of result.data) {
          await collection.doc(doc._id).remove();
        }
        
        console.log(`已清空集合: ${collectionName}`);
      } catch (error) {
        console.error(`清空集合失败 ${collectionName}:`, error);
      }
    }
  }

  /**
   * 获取数据库状态
   */
  async getDatabaseStatus() {
    const status = {};
    
    for (const collectionName of this.collections) {
      try {
        const result = await this.db.collection(collectionName).count();
        status[collectionName] = result.total;
      } catch (error) {
        status[collectionName] = 'error';
      }
    }
    
    return status;
  }
}

// 导出单例实例
const dbInitializer = new DatabaseInitializer();
module.exports = dbInitializer;
