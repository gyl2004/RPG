// 数据库集合结构定义
// 基于design.md设计文档的数据模型

/**
 * 数据库集合结构定义
 */
const DATABASE_SCHEMA = {
  
  // 用户集合
  users: {
    description: '用户基本信息',
    fields: {
      _id: { type: 'string', description: '用户ID' },
      openid: { type: 'string', description: '微信OpenID', required: true, unique: true },
      nickname: { type: 'string', description: '昵称' },
      avatarUrl: { type: 'string', description: '头像URL' },
      registrationDate: { type: 'date', description: '注册日期', default: 'now' },
      lastLoginDate: { type: 'date', description: '最后登录日期', default: 'now' },
      settings: { type: 'object', description: '用户设置', default: {} },
      statistics: {
        type: 'object',
        description: '用户统计数据',
        default: {
          tasksCompleted: 0,
          habitsFormed: 0,
          achievementsUnlocked: 0,
          experienceGained: 0
        }
      }
    },
    indexes: ['openid', 'registrationDate', 'lastLoginDate']
  },

  // 角色集合
  characters: {
    description: '角色信息',
    fields: {
      _id: { type: 'string', description: '角色ID' },
      userId: { type: 'string', description: '关联的用户ID', required: true },
      name: { type: 'string', description: '角色名称', required: true },
      class: { type: 'string', description: '职业类型', default: '新手' },
      level: { type: 'number', description: '等级', default: 1 },
      experience: { type: 'number', description: '经验值', default: 0 },
      attributes: {
        type: 'object',
        description: '属性值',
        default: {
          strength: 10,
          intelligence: 10,
          charisma: 10,
          creativity: 10,
          discipline: 10,
          vitality: 10
        }
      },
      skills: { type: 'array', description: '技能列表', default: [] },
      equipment: { type: 'array', description: '装备列表', default: [] },
      appearance: { type: 'object', description: '外观设置', default: {} },
      status: { type: 'array', description: '状态效果', default: [] },
      createdAt: { type: 'date', description: '创建时间', default: 'now' },
      updatedAt: { type: 'date', description: '更新时间', default: 'now' }
    },
    indexes: ['userId', 'level', 'experience', 'createdAt']
  },

  // 任务集合
  tasks: {
    description: '任务信息',
    fields: {
      _id: { type: 'string', description: '任务ID' },
      creatorId: { type: 'string', description: '创建者ID', required: true },
      assigneeIds: { type: 'array', description: '指派给的用户ID列表', default: [] },
      title: { type: 'string', description: '任务标题', required: true },
      description: { type: 'string', description: '任务描述', default: '' },
      category: { type: 'string', description: '任务类别', default: 'personal' },
      type: { type: 'string', description: '任务类型', default: 'daily' },
      difficulty: { type: 'number', description: '难度级别（1-5）', default: 1 },
      rewards: {
        type: 'object',
        description: '奖励',
        default: {
          experience: 10,
          currency: 5,
          items: [],
          attributes: {}
        }
      },
      requirements: { type: 'array', description: '完成要求', default: [] },
      verification: { type: 'object', description: '验证方式', default: {} },
      location: { type: 'object', description: '位置信息（可选）' },
      timeConstraints: { type: 'object', description: '时间限制（可选）' },
      status: { type: 'string', description: '状态', default: 'pending' },
      progress: { type: 'number', description: '进度百分比', default: 0 },
      createdAt: { type: 'date', description: '创建时间', default: 'now' },
      updatedAt: { type: 'date', description: '更新时间', default: 'now' },
      completedAt: { type: 'date', description: '完成时间' },
      parentTaskId: { type: 'string', description: '父任务ID（可选）' },
      childTaskIds: { type: 'array', description: '子任务ID列表（可选）', default: [] },
      storyElements: { type: 'object', description: '故事元素（可选）', default: {} }
    },
    indexes: ['creatorId', 'assigneeIds', 'category', 'type', 'status', 'createdAt', 'completedAt']
  },

  // 习惯集合
  habits: {
    description: '习惯信息',
    fields: {
      _id: { type: 'string', description: '习惯ID' },
      userId: { type: 'string', description: '用户ID', required: true },
      title: { type: 'string', description: '习惯标题', required: true },
      description: { type: 'string', description: '习惯描述', default: '' },
      category: { type: 'string', description: '习惯类别', default: 'health' },
      frequency: {
        type: 'object',
        description: '频率设置',
        default: {
          type: 'daily',
          days: [1, 2, 3, 4, 5, 6, 7],
          timesPerDay: 1
        }
      },
      timePreference: { type: 'object', description: '时间偏好', default: {} },
      reminder: { type: 'boolean', description: '是否提醒', default: false },
      reminderTime: { type: 'string', description: '提醒时间', default: '' },
      skillId: { type: 'string', description: '关联的技能ID', default: '' },
      streak: {
        type: 'object',
        description: '连续记录',
        default: {
          current: 0,
          best: 0
        }
      },
      completionLog: { type: 'array', description: '完成记录', default: [] },
      createdAt: { type: 'date', description: '创建时间', default: 'now' },
      updatedAt: { type: 'date', description: '更新时间', default: 'now' }
    },
    indexes: ['userId', 'category', 'createdAt', 'streak.current']
  },

  // 物品集合
  items: {
    description: '物品信息',
    fields: {
      _id: { type: 'string', description: '物品ID' },
      name: { type: 'string', description: '物品名称', required: true },
      description: { type: 'string', description: '物品描述', default: '' },
      type: { type: 'string', description: '物品类型', default: 'consumable' },
      rarity: { type: 'string', description: '稀有度', default: 'common' },
      effects: { type: 'array', description: '效果列表', default: [] },
      imageUrl: { type: 'string', description: '图片URL', default: '' },
      price: { type: 'number', description: '价格', default: 0 },
      tradable: { type: 'boolean', description: '是否可交易', default: true },
      expiresAt: { type: 'date', description: '过期时间（可选）' }
    },
    indexes: ['type', 'rarity', 'price']
  },

  // 用户库存集合
  inventory: {
    description: '用户库存',
    fields: {
      _id: { type: 'string', description: '库存ID' },
      userId: { type: 'string', description: '用户ID', required: true, unique: true },
      currency: { type: 'number', description: '虚拟货币数量', default: 0 },
      items: { type: 'array', description: '物品列表', default: [] },
      achievements: { type: 'array', description: '成就列表', default: [] },
      realRewards: { type: 'array', description: '现实奖励', default: [] }
    },
    indexes: ['userId']
  },

  // 社交关系集合
  socialRelations: {
    description: '社交关系',
    fields: {
      _id: { type: 'string', description: '关系ID' },
      userId: { type: 'string', description: '用户ID', required: true },
      friendId: { type: 'string', description: '好友ID', required: true },
      relationshipType: { type: 'string', description: '关系类型', default: 'friend' },
      status: { type: 'string', description: '状态', default: 'pending' },
      createdAt: { type: 'date', description: '创建时间', default: 'now' },
      lastInteractionAt: { type: 'date', description: '最后互动时间', default: 'now' }
    },
    indexes: ['userId', 'friendId', 'relationshipType', 'status']
  },

  // 团队集合
  teams: {
    description: '团队信息',
    fields: {
      _id: { type: 'string', description: '团队ID' },
      name: { type: 'string', description: '团队名称', required: true },
      description: { type: 'string', description: '团队描述', default: '' },
      creatorId: { type: 'string', description: '创建者ID', required: true },
      members: { type: 'array', description: '成员列表', default: [] },
      tasks: { type: 'array', description: '团队任务ID列表', default: [] },
      achievements: { type: 'array', description: '团队成就', default: [] },
      level: { type: 'number', description: '团队等级', default: 1 },
      experience: { type: 'number', description: '团队经验', default: 0 },
      createdAt: { type: 'date', description: '创建时间', default: 'now' },
      updatedAt: { type: 'date', description: '更新时间', default: 'now' }
    },
    indexes: ['creatorId', 'level', 'createdAt']
  },

  // 情绪记录集合
  moodLogs: {
    description: '情绪记录',
    fields: {
      _id: { type: 'string', description: '记录ID' },
      userId: { type: 'string', description: '用户ID', required: true },
      mood: { type: 'string', description: '情绪类型', required: true },
      intensity: { type: 'number', description: '强度（1-5）', default: 3 },
      notes: { type: 'string', description: '备注', default: '' },
      factors: { type: 'array', description: '影响因素', default: [] },
      timestamp: { type: 'date', description: '记录时间', default: 'now' },
      characterEffects: { type: 'array', description: '角色效果', default: [] }
    },
    indexes: ['userId', 'mood', 'timestamp']
  },

  // 故事线集合
  storylines: {
    description: '故事线',
    fields: {
      _id: { type: 'string', description: '故事线ID' },
      userId: { type: 'string', description: '用户ID', required: true },
      title: { type: 'string', description: '故事线标题', required: true },
      description: { type: 'string', description: '故事线描述', default: '' },
      chapters: { type: 'array', description: '章节列表', default: [] },
      progress: { type: 'number', description: '进度百分比', default: 0 },
      createdAt: { type: 'date', description: '创建时间', default: 'now' },
      updatedAt: { type: 'date', description: '更新时间', default: 'now' }
    },
    indexes: ['userId', 'progress', 'createdAt']
  },

  // 成就集合
  achievements: {
    description: '成就定义',
    fields: {
      _id: { type: 'string', description: '成就ID' },
      name: { type: 'string', description: '成就名称', required: true },
      description: { type: 'string', description: '成就描述', required: true },
      icon: { type: 'string', description: '成就图标', default: '🏆' },
      category: { type: 'string', description: '成就类别', default: 'general' },
      requirements: { type: 'object', description: '解锁条件', required: true },
      rewards: { type: 'object', description: '奖励', default: {} },
      rarity: { type: 'string', description: '稀有度', default: 'common' },
      hidden: { type: 'boolean', description: '是否隐藏', default: false }
    },
    indexes: ['category', 'rarity']
  },

  // 技能集合
  skills: {
    description: '技能定义',
    fields: {
      _id: { type: 'string', description: '技能ID' },
      name: { type: 'string', description: '技能名称', required: true },
      description: { type: 'string', description: '技能描述', required: true },
      category: { type: 'string', description: '技能类别', required: true },
      maxLevel: { type: 'number', description: '最大等级', default: 10 },
      requirements: { type: 'object', description: '学习要求', default: {} },
      effects: { type: 'array', description: '技能效果', default: [] },
      unlockConditions: { type: 'object', description: '解锁条件', default: {} }
    },
    indexes: ['category']
  },

  // 通知集合
  notifications: {
    description: '用户通知',
    fields: {
      _id: { type: 'string', description: '通知ID' },
      userId: { type: 'string', description: '用户ID', required: true },
      type: { type: 'string', description: '通知类型', required: true },
      title: { type: 'string', description: '通知标题', required: true },
      content: { type: 'string', description: '通知内容', required: true },
      data: { type: 'object', description: '附加数据', default: {} },
      read: { type: 'boolean', description: '是否已读', default: false },
      createdAt: { type: 'date', description: '创建时间', default: 'now' },
      expiresAt: { type: 'date', description: '过期时间' }
    },
    indexes: ['userId', 'type', 'read', 'createdAt']
  }
};

/**
 * 获取集合的索引配置
 */
function getCollectionIndexes(collectionName) {
  const schema = DATABASE_SCHEMA[collectionName];
  return schema ? schema.indexes : [];
}

/**
 * 获取集合的字段定义
 */
function getCollectionFields(collectionName) {
  const schema = DATABASE_SCHEMA[collectionName];
  return schema ? schema.fields : {};
}

/**
 * 验证数据是否符合集合结构
 */
function validateData(collectionName, data) {
  const fields = getCollectionFields(collectionName);
  const errors = [];

  for (const [fieldName, fieldConfig] of Object.entries(fields)) {
    if (fieldConfig.required && !data.hasOwnProperty(fieldName)) {
      errors.push(`缺少必需字段: ${fieldName}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 导出所有函数
module.exports = {
  DATABASE_SCHEMA,
  getCollectionIndexes,
  getCollectionFields,
  validateData
};
