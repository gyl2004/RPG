// 现实世界RPG数据模型

/**
 * 用户模型
 */
export class User {
  constructor(data = {}) {
    this._id = data._id || '';
    this.openid = data.openid || '';
    this.nickname = data.nickname || '';
    this.avatarUrl = data.avatarUrl || '';
    this.registrationDate = data.registrationDate || new Date();
    this.lastLoginDate = data.lastLoginDate || new Date();
    this.settings = data.settings || {};
    this.statistics = data.statistics || {
      tasksCompleted: 0,
      habitsFormed: 0,
      achievementsUnlocked: 0,
      experienceGained: 0
    };
  }

  toJSON() {
    return {
      _id: this._id,
      openid: this.openid,
      nickname: this.nickname,
      avatarUrl: this.avatarUrl,
      registrationDate: this.registrationDate,
      lastLoginDate: this.lastLoginDate,
      settings: this.settings,
      statistics: this.statistics
    };
  }
}

/**
 * 角色模型
 */
export class Character {
  constructor(data = {}) {
    this._id = data._id || '';
    this.userId = data.userId || '';
    this.name = data.name || '冒险者';
    this.class = data.class || '新手';
    this.level = data.level || 1;
    this.experience = data.experience || 0;
    this.attributes = data.attributes || {
      strength: 10,
      intelligence: 10,
      charisma: 10,
      creativity: 10,
      discipline: 10,
      vitality: 10
    };
    this.skills = data.skills || [];
    this.equipment = data.equipment || [];
    this.appearance = data.appearance || {};
    this.status = data.status || [];
  }

  // 计算等级进度
  getExpProgress() {
    const nextLevelExp = this.getNextLevelExp();
    return Math.floor((this.experience / nextLevelExp) * 100);
  }

  // 获取下一等级所需经验
  getNextLevelExp() {
    return this.level * 100 + Math.pow(this.level, 2) * 50;
  }

  // 添加经验值
  addExperience(exp) {
    this.experience += exp;
    this.checkLevelUp();
  }

  // 检查是否升级
  checkLevelUp() {
    const nextLevelExp = this.getNextLevelExp();
    if (this.experience >= nextLevelExp) {
      this.level++;
      this.experience -= nextLevelExp;
      return true;
    }
    return false;
  }

  toJSON() {
    return {
      _id: this._id,
      userId: this.userId,
      name: this.name,
      class: this.class,
      level: this.level,
      experience: this.experience,
      attributes: this.attributes,
      skills: this.skills,
      equipment: this.equipment,
      appearance: this.appearance,
      status: this.status
    };
  }
}

/**
 * 任务模型
 */
export class Task {
  constructor(data = {}) {
    this._id = data._id || '';
    this.creatorId = data.creatorId || '';
    this.assigneeIds = data.assigneeIds || [];
    this.title = data.title || '';
    this.description = data.description || '';
    this.category = data.category || 'personal';
    this.type = data.type || 'daily';
    this.difficulty = data.difficulty || 1;
    this.rewards = data.rewards || {
      experience: 10,
      currency: 5
    };
    this.requirements = data.requirements || [];
    this.verification = data.verification || {};
    this.location = data.location || null;
    this.timeConstraints = data.timeConstraints || null;
    this.status = data.status || 'pending';
    this.progress = data.progress || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.completedAt = data.completedAt || null;
    this.parentTaskId = data.parentTaskId || null;
    this.childTaskIds = data.childTaskIds || [];
    this.storyElements = data.storyElements || {};
  }

  // 检查是否已完成
  isCompleted() {
    return this.status === 'completed';
  }

  // 检查是否已过期
  isExpired() {
    if (!this.timeConstraints?.endTime) return false;
    return new Date() > new Date(this.timeConstraints.endTime);
  }

  // 更新进度
  updateProgress(progress) {
    this.progress = Math.max(0, Math.min(100, progress));
    this.updatedAt = new Date();

    if (this.progress >= 100) {
      this.status = 'completed';
      this.completedAt = new Date();
    }
  }

  toJSON() {
    return {
      _id: this._id,
      creatorId: this.creatorId,
      assigneeIds: this.assigneeIds,
      title: this.title,
      description: this.description,
      category: this.category,
      type: this.type,
      difficulty: this.difficulty,
      rewards: this.rewards,
      requirements: this.requirements,
      verification: this.verification,
      location: this.location,
      timeConstraints: this.timeConstraints,
      status: this.status,
      progress: this.progress,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
      parentTaskId: this.parentTaskId,
      childTaskIds: this.childTaskIds,
      storyElements: this.storyElements
    };
  }
}

/**
 * 习惯模型
 */
export class Habit {
  constructor(data = {}) {
    this._id = data._id || '';
    this.userId = data.userId || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.category = data.category || 'health';
    this.frequency = data.frequency || {
      type: 'daily',
      days: [1, 2, 3, 4, 5, 6, 7],
      timesPerDay: 1
    };
    this.timePreference = data.timePreference || {};
    this.reminder = data.reminder || false;
    this.reminderTime = data.reminderTime || '';
    this.skillId = data.skillId || '';
    this.streak = data.streak || {
      current: 0,
      best: 0
    };
    this.completionLog = data.completionLog || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // 检查今天是否已完成
  isCompletedToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.completionLog.some(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime() && log.completed;
    });
  }

  // 记录完成
  logCompletion(completed = true) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 检查今天是否已有记录
    const existingLogIndex = this.completionLog.findIndex(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });

    const logEntry = {
      date: today,
      completed: completed,
      count: completed ? 1 : 0
    };

    if (existingLogIndex >= 0) {
      this.completionLog[existingLogIndex] = logEntry;
    } else {
      this.completionLog.push(logEntry);
    }

    this.updateStreak();
    this.updatedAt = new Date();
  }

  // 更新连续天数
  updateStreak() {
    let currentStreak = 0;
    const sortedLog = this.completionLog
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    for (const log of sortedLog) {
      if (log.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    this.streak.current = currentStreak;
    if (currentStreak > this.streak.best) {
      this.streak.best = currentStreak;
    }
  }

  toJSON() {
    return {
      _id: this._id,
      userId: this.userId,
      title: this.title,
      description: this.description,
      category: this.category,
      frequency: this.frequency,
      timePreference: this.timePreference,
      reminder: this.reminder,
      reminderTime: this.reminderTime,
      skillId: this.skillId,
      streak: this.streak,
      completionLog: this.completionLog,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * 物品模型
 */
export class Item {
  constructor(data = {}) {
    this._id = data._id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.type = data.type || 'consumable';
    this.rarity = data.rarity || 'common';
    this.effects = data.effects || [];
    this.imageUrl = data.imageUrl || '';
    this.price = data.price || 0;
    this.tradable = data.tradable || true;
    this.expiresAt = data.expiresAt || null;
  }

  // 检查是否已过期
  isExpired() {
    if (!this.expiresAt) return false;
    return new Date() > new Date(this.expiresAt);
  }

  toJSON() {
    return {
      _id: this._id,
      name: this.name,
      description: this.description,
      type: this.type,
      rarity: this.rarity,
      effects: this.effects,
      imageUrl: this.imageUrl,
      price: this.price,
      tradable: this.tradable,
      expiresAt: this.expiresAt
    };
  }
}

/**
 * 库存模型
 */
export class Inventory {
  constructor(data = {}) {
    this._id = data._id || '';
    this.userId = data.userId || '';
    this.currency = data.currency || 0;
    this.items = data.items || [];
    this.achievements = data.achievements || [];
    this.realRewards = data.realRewards || [];
  }

  // 添加货币
  addCurrency(amount) {
    this.currency += amount;
  }

  // 扣除货币
  deductCurrency(amount) {
    if (this.currency >= amount) {
      this.currency -= amount;
      return true;
    }
    return false;
  }

  // 添加物品
  addItem(itemId, quantity = 1) {
    const existingItem = this.items.find(item => item.itemId === itemId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        itemId,
        quantity,
        acquiredAt: new Date()
      });
    }
  }

  // 移除物品
  removeItem(itemId, quantity = 1) {
    const itemIndex = this.items.findIndex(item => item.itemId === itemId);
    if (itemIndex >= 0) {
      const item = this.items[itemIndex];
      if (item.quantity > quantity) {
        item.quantity -= quantity;
        return true;
      } else if (item.quantity === quantity) {
        this.items.splice(itemIndex, 1);
        return true;
      }
    }
    return false;
  }

  toJSON() {
    return {
      _id: this._id,
      userId: this.userId,
      currency: this.currency,
      items: this.items,
      achievements: this.achievements,
      realRewards: this.realRewards
    };
  }
}
