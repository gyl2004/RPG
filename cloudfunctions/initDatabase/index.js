// 云函数：数据库初始化
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 定义需要创建的集合
const COLLECTIONS = {
  users: 'users',
  characters: 'characters',
  stories: 'stories',
  tasks: 'tasks',
  habits: 'habits',
  items: 'items'
}

/**
 * 云函数入口函数
 */
exports.main = async (event, context) => {
  const { action, collectionName, data } = event
  
  try {
    switch (action) {
      case 'checkCollections':
        return await checkAllCollections()
      case 'createCollection':
        return await createCollection(collectionName)
      case 'createAllCollections':
        return await createAllCollections()
      case 'insertSampleData':
        return await insertSampleData(context.OPENID)
      case 'removeSampleData':
        return await removeSampleData(context.OPENID)
      case 'testConnection':
        return await testConnection()
      default:
        return {
          success: false,
          error: '未知操作类型'
        }
    }
  } catch (error) {
    console.error('云函数执行失败:', error)
    return {
      success: false,
      error: error.message,
      details: error
    }
  }
}

/**
 * 测试数据库连接
 */
async function testConnection() {
  try {
    // 尝试获取数据库信息
    const result = await db.collection('_openid').limit(1).get()
    return {
      success: true,
      message: '数据库连接正常',
      timestamp: new Date()
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: '数据库连接失败'
    }
  }
}

/**
 * 检查所有集合状态
 */
async function checkAllCollections() {
  const results = {}
  
  for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
    try {
      // 尝试查询集合
      await db.collection(collectionName).limit(1).get()
      results[key] = {
        name: collectionName,
        exists: true
      }
    } catch (error) {
      results[key] = {
        name: collectionName,
        exists: false,
        error: error.message
      }
    }
  }
  
  return {
    success: true,
    collections: results,
    timestamp: new Date()
  }
}

/**
 * 创建单个集合
 */
async function createCollection(collectionName) {
  try {
    console.log(`开始创建集合: ${collectionName}`)
    
    // 创建临时文档来初始化集合
    const tempDoc = {
      _temp: true,
      _created: db.serverDate(),
      _purpose: `初始化集合 ${collectionName}`
    }
    
    const addResult = await db.collection(collectionName).add({
      data: tempDoc
    })
    
    console.log(`集合 ${collectionName} 创建成功，临时文档ID: ${addResult._id}`)
    
    // 删除临时文档
    await db.collection(collectionName).doc(addResult._id).remove()
    console.log(`临时文档已删除`)
    
    return {
      success: true,
      collectionName: collectionName,
      message: '集合创建成功',
      tempDocId: addResult._id
    }
    
  } catch (error) {
    console.error(`创建集合 ${collectionName} 失败:`, error)
    return {
      success: false,
      collectionName: collectionName,
      error: error.message,
      details: error
    }
  }
}

/**
 * 创建所有集合
 */
async function createAllCollections() {
  const results = {}
  let successCount = 0
  let errorCount = 0
  
  for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
    try {
      // 先检查集合是否已存在
      try {
        await db.collection(collectionName).limit(1).get()
        results[key] = {
          name: collectionName,
          existed: true,
          created: false,
          message: '集合已存在'
        }
        successCount++
        continue
      } catch (checkError) {
        // 集合不存在，需要创建
        if (checkError.errCode !== -502005) {
          throw checkError // 如果不是"集合不存在"错误，则抛出
        }
      }
      
      // 创建集合
      const createResult = await createCollection(collectionName)
      results[key] = {
        name: collectionName,
        existed: false,
        created: createResult.success,
        message: createResult.message,
        error: createResult.error
      }
      
      if (createResult.success) {
        successCount++
      } else {
        errorCount++
      }
      
    } catch (error) {
      console.error(`处理集合 ${collectionName} 失败:`, error)
      results[key] = {
        name: collectionName,
        existed: false,
        created: false,
        error: error.message
      }
      errorCount++
    }
  }
  
  return {
    success: errorCount === 0,
    results: results,
    summary: {
      total: Object.keys(COLLECTIONS).length,
      success: successCount,
      error: errorCount
    },
    timestamp: new Date()
  }
}

/**
 * 插入示例数据
 */
async function insertSampleData(openid) {
  if (!openid) {
    return {
      success: false,
      error: '缺少用户标识'
    }
  }
  
  const results = {}
  
  try {
    // 插入示例角色数据
    const sampleCharacter = {
      name: '示例角色',
      level: 1,
      experience: 0,
      attributes: {
        strength: 10,
        agility: 10,
        intelligence: 10,
        vitality: 10
      },
      collectedItems: [],
      storyHistory: [],
      completedTasks: [],
      completedHabits: [],
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
      _sample: true
    }
    
    const characterResult = await db.collection(COLLECTIONS.characters).add({
      data: sampleCharacter
    })
    
    results.character = {
      success: true,
      _id: characterResult._id
    }
    
    // 插入示例故事数据
    const sampleStory = {
      title: '示例冒险故事',
      content: '这是一个示例故事，用于测试数据库功能。在这个神奇的世界里，每个人都有自己的冒险传奇...',
      mood: 'inspiring',
      choices: [
        {
          id: 'choice1',
          text: '继续探索',
          consequence: '发现新的秘密'
        }
      ],
      rewards: {
        experience: 50,
        items: ['示例宝物'],
        skills: ['勇气']
      },
      createdAt: db.serverDate(),
      _sample: true
    }
    
    const storyResult = await db.collection(COLLECTIONS.stories).add({
      data: sampleStory
    })
    
    results.story = {
      success: true,
      _id: storyResult._id
    }
    
    // 插入示例物品数据
    const sampleItem = {
      name: '示例魔法物品',
      category: '魔法道具',
      description: '这是一个充满魔力的示例物品',
      aiDescription: '传说这件物品拥有神秘的力量，能够为持有者带来好运和智慧。',
      collectedAt: db.serverDate(),
      _sample: true
    }
    
    const itemResult = await db.collection(COLLECTIONS.items).add({
      data: sampleItem
    })
    
    results.item = {
      success: true,
      _id: itemResult._id
    }
    
    return {
      success: true,
      results: results,
      message: '示例数据插入成功'
    }
    
  } catch (error) {
    console.error('插入示例数据失败:', error)
    return {
      success: false,
      error: error.message,
      results: results
    }
  }
}

/**
 * 删除示例数据
 */
async function removeSampleData(openid) {
  if (!openid) {
    return {
      success: false,
      error: '缺少用户标识'
    }
  }
  
  const results = {}
  
  for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
    try {
      // 查找并删除示例数据（_openid会自动过滤当前用户数据）
      const sampleData = await db.collection(collectionName)
        .where({
          _sample: true
        })
        .get()
      
      let deletedCount = 0
      for (const doc of sampleData.data) {
        await db.collection(collectionName).doc(doc._id).remove()
        deletedCount++
      }
      
      results[key] = {
        name: collectionName,
        deletedCount: deletedCount
      }
      
    } catch (error) {
      results[key] = {
        name: collectionName,
        deletedCount: 0,
        error: error.message
      }
    }
  }
  
  return {
    success: true,
    results: results,
    message: '示例数据清理完成'
  }
}
