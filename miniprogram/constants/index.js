// 现实世界RPG常量定义

// 等级经验值配置
const LEVEL_EXP_CONFIG = {
  1: 100,
  2: 250,
  3: 450,
  4: 700,
  5: 1000,
  6: 1350,
  7: 1750,
  8: 2200,
  9: 2700,
  10: 3250
};

// 默认奖励配置
const DEFAULT_REWARDS = {
  TASK_COMPLETION: {
    experience: 10,
    currency: 5
  },
  HABIT_COMPLETION: {
    experience: 5,
    currency: 2
  },
  LEVEL_UP: {
    currency: 50
  }
};

// 导出常量
module.exports = {
  LEVEL_EXP_CONFIG,
  DEFAULT_REWARDS
};
