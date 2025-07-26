// 现实世界RPG云函数
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud1-1gf83xgo315db82d
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { type, data } = event;
  const wxContext = cloud.getWXContext();
  
  console.log('RPG云函数调用:', type, data);

  try {
    switch (type) {
      case 'getOpenId':
        return await getOpenId(data);
      case 'getUserInfo':
        return await getUserInfo(wxContext.OPENID);
      case 'createUser':
        return await createUser(data);
      case 'updateUser':
        return await updateUser(wxContext.OPENID, data);
      case 'createCharacter':
        return await createCharacter(wxContext.OPENID, data);
      case 'updateCharacter':
        return await updateCharacter(wxContext.OPENID, data);
      case 'createTask':
        return await createTask(wxContext.OPENID, data);
      case 'completeTask':
        return await completeTask(wxContext.OPENID, data);
      case 'createHabit':
        return await createHabit(wxContext.OPENID, data);
      case 'logHabit':
        return await logHabit(wxContext.OPENID, data);
      case 'calculateRewards':
        return await calculateRewards(data);
      case 'test':
        return await testFunction(data);
      default:
        return {
          success: false,
          error: '未知的函数类型'
        };
    }
  } catch (error) {
    console.error('云函数执行错误:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 获取用户openid
async function getOpenId(data) {
  const { code } = data;

  if (!code) {
    return {
      success: false,
      error: '缺少登录code'
    };
  }

  try {
    // 调用微信接口获取openid
    const result = await cloud.openapi.auth.code2Session({
      jsCode: code
    });

    if (result.openid) {
      return {
        success: true,
        data: {
          openid: result.openid,
          sessionKey: result.session_key
        }
      };
    } else {
      return {
        success: false,
        error: '获取openid失败'
      };
    }
  } catch (error) {
    console.error('获取openid错误:', error);
    return {
      success: false,
      error: error.message || '获取openid失败'
    };
  }
}

// 测试函数
async function testFunction(data) {
  return {
    success: true,
    data: {
      message: '云函数连接正常',
      timestamp: new Date(),
      input: data
    }
  };
}

// 获取用户信息
async function getUserInfo(openid) {
  const userResult = await db.collection('users').where({
    openid: openid
  }).get();

  if (userResult.data.length === 0) {
    return {
      success: false,
      error: '用户不存在'
    };
  }

  const user = userResult.data[0];
  
  // 获取角色信息
  const characterResult = await db.collection('characters').where({
    userId: user._id
  }).get();

  return {
    success: true,
    data: {
      user: user,
      character: characterResult.data[0] || null
    }
  };
}

// 创建用户
async function createUser(data) {
  try {
    const { openid, nickname, avatarUrl, gender, country, province, city } = data;

    if (!openid) {
      return {
        success: false,
        error: '缺少openid'
      };
    }

    // 检查用户是否已存在
    const existingUser = await db.collection('users').where({
      openid: openid
    }).get();

    if (existingUser.data.length > 0) {
      return {
        success: false,
        error: '用户已存在'
      };
    }

    // 创建用户记录
    const userData = {
      openid,
      nickname: nickname || '冒险者',
      avatarUrl: avatarUrl || '',
      gender: gender || 0,
      country: country || '',
      province: province || '',
      city: city || '',
      registrationDate: new Date(),
      lastLoginDate: new Date(),
      settings: {
        notifications: true,
        soundEffects: true,
        theme: 'dark',
        language: 'zh-CN',
        autoBackup: true,
        privacyMode: false
      },
      statistics: {
        tasksCompleted: 0,
        habitsFormed: 0,
        achievementsUnlocked: 0,
        experienceGained: 0,
        loginDays: 1
      }
    };

    const result = await db.collection('users').add({
      data: userData
    });

    return {
      success: true,
      data: {
        _id: result._id,
        ...userData
      }
    };
  } catch (error) {
    console.error('创建用户错误:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 更新用户信息
async function updateUser(openid, data) {
  try {
    // 先获取用户
    const userResult = await db.collection('users').where({
      openid: openid
    }).get();

    if (userResult.data.length === 0) {
      return {
        success: false,
        error: '用户不存在'
      };
    }

    const user = userResult.data[0];

    // 更新用户信息
    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    const result = await db.collection('users').doc(user._id).update({
      data: updateData
    });

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 创建角色
async function createCharacter(openid, characterData) {
  const userResult = await db.collection('users').where({
    openid: openid
  }).get();

  if (userResult.data.length === 0) {
    return {
      success: false,
      error: '用户不存在'
    };
  }

  const userId = userResult.data[0]._id;

  const character = {
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
  };

  const result = await db.collection('characters').add({
    data: character
  });

  return {
    success: true,
    data: {
      characterId: result._id,
      character: character
    }
  };
}

// 更新角色
async function updateCharacter(openid, updateData) {
  const userResult = await db.collection('users').where({
    openid: openid
  }).get();

  if (userResult.data.length === 0) {
    return {
      success: false,
      error: '用户不存在'
    };
  }

  const userId = userResult.data[0]._id;

  const result = await db.collection('characters').where({
    userId: userId
  }).update({
    data: {
      ...updateData,
      updatedAt: new Date()
    }
  });

  return {
    success: true,
    data: result
  };
}

// 创建任务
async function createTask(openid, taskData) {
  const userResult = await db.collection('users').where({
    openid: openid
  }).get();

  if (userResult.data.length === 0) {
    return {
      success: false,
      error: '用户不存在'
    };
  }

  const userId = userResult.data[0]._id;

  const task = {
    creatorId: userId,
    assigneeIds: [userId],
    title: taskData.title,
    description: taskData.description || '',
    category: taskData.category || 'personal',
    type: taskData.type || 'daily',
    difficulty: taskData.difficulty || 1,
    rewards: taskData.rewards || {
      experience: 10,
      currency: 5
    },
    requirements: taskData.requirements || [],
    status: 'pending',
    progress: 0,
    createdAt: new Date()
  };

  const result = await db.collection('tasks').add({
    data: task
  });

  return {
    success: true,
    data: {
      taskId: result._id,
      task: task
    }
  };
}

// 完成任务
async function completeTask(openid, taskData) {
  const { taskId } = taskData;

  // 更新任务状态
  await db.collection('tasks').doc(taskId).update({
    data: {
      status: 'completed',
      progress: 100,
      completedAt: new Date()
    }
  });

  // 获取任务信息计算奖励
  const taskResult = await db.collection('tasks').doc(taskId).get();
  const task = taskResult.data;

  // 发放奖励
  const rewardResult = await grantRewards(openid, task.rewards);

  return {
    success: true,
    data: {
      task: task,
      rewards: rewardResult
    }
  };
}

// 发放奖励
async function grantRewards(openid, rewards) {
  const userResult = await db.collection('users').where({
    openid: openid
  }).get();

  if (userResult.data.length === 0) {
    return {
      success: false,
      error: '用户不存在'
    };
  }

  const userId = userResult.data[0]._id;

  // 更新角色经验值
  if (rewards.experience) {
    await db.collection('characters').where({
      userId: userId
    }).update({
      data: {
        experience: db.command.inc(rewards.experience)
      }
    });
  }

  // 更新虚拟货币
  if (rewards.currency) {
    await db.collection('inventory').where({
      userId: userId
    }).update({
      data: {
        currency: db.command.inc(rewards.currency)
      }
    });
  }

  return {
    success: true,
    data: rewards
  };
}

// 创建习惯
async function createHabit(openid, habitData) {
  const userResult = await db.collection('users').where({
    openid: openid
  }).get();

  if (userResult.data.length === 0) {
    return {
      success: false,
      error: '用户不存在'
    };
  }

  const userId = userResult.data[0]._id;

  const habit = {
    userId: userId,
    title: habitData.title,
    description: habitData.description || '',
    category: habitData.category || 'health',
    frequency: habitData.frequency || {
      type: 'daily',
      days: [1, 2, 3, 4, 5, 6, 7],
      timesPerDay: 1
    },
    timePreference: habitData.timePreference || {},
    reminder: habitData.reminder || false,
    reminderTime: habitData.reminderTime || '',
    skillId: habitData.skillId || '',
    streak: {
      current: 0,
      best: 0
    },
    completionLog: [],
    createdAt: new Date()
  };

  const result = await db.collection('habits').add({
    data: habit
  });

  return {
    success: true,
    data: {
      habitId: result._id,
      habit: habit
    }
  };
}

// 记录习惯完成
async function logHabit(openid, habitData) {
  const { habitId, completed } = habitData;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 记录完成情况
  const logEntry = {
    date: today,
    completed: completed,
    count: completed ? 1 : 0
  };

  await db.collection('habits').doc(habitId).update({
    data: {
      completionLog: db.command.push(logEntry),
      updatedAt: new Date()
    }
  });

  // 更新连续天数
  if (completed) {
    await updateHabitStreak(habitId);
  }

  return {
    success: true,
    data: logEntry
  };
}

// 更新习惯连续天数
async function updateHabitStreak(habitId) {
  const habitResult = await db.collection('habits').doc(habitId).get();
  const habit = habitResult.data;
  
  const completionLog = habit.completionLog || [];
  let currentStreak = 0;
  let bestStreak = habit.streak.best || 0;

  // 计算当前连续天数
  for (let i = completionLog.length - 1; i >= 0; i--) {
    if (completionLog[i].completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  await db.collection('habits').doc(habitId).update({
    data: {
      'streak.current': currentStreak,
      'streak.best': bestStreak
    }
  });
}

// 计算奖励
async function calculateRewards(data) {
  const { taskType, difficulty, timeSpent } = data;
  
  let baseExp = 10;
  let baseCurrency = 5;

  // 根据难度调整奖励
  const difficultyMultiplier = {
    1: 1,
    2: 1.5,
    3: 2,
    4: 2.5,
    5: 3
  };

  const multiplier = difficultyMultiplier[difficulty] || 1;
  
  const rewards = {
    experience: Math.floor(baseExp * multiplier),
    currency: Math.floor(baseCurrency * multiplier)
  };

  return {
    success: true,
    data: rewards
  };
}
