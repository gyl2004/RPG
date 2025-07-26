// 故事线和个性化系统服务
class StoryService {
  constructor() {
    try {
      // 先定义基础数据结构
      this.initializeBaseData();

      // 然后加载生成的章节
      this.initializeStoryChapters();
    } catch (error) {
      console.error('故事服务初始化失败:', error);
      // 提供默认的基础数据
      this.storyTypes = {};
      this.characterTypes = {};
      this.storyChapters = {};
      this.recommendationRules = {};
    }
  }

  /**
   * 初始化基础数据
   */
  initializeBaseData() {
    // 故事线类型定义
    this.storyTypes = {
      'main': {
        id: 'main',
        name: '主线故事',
        icon: '📖',
        description: '跟随主角的成长历程'
      },
      'side': {
        id: 'side',
        name: '支线故事',
        icon: '📚',
        description: '探索更多有趣的故事'
      },
      'daily': {
        id: 'daily',
        name: '日常故事',
        icon: '📝',
        description: '记录每日的点滴成长'
      },
      'achievement': {
        id: 'achievement',
        name: '成就故事',
        icon: '🏆',
        description: '庆祝重要的里程碑'
      }
    };

    // 角色类型定义
    this.characterTypes = {
      'warrior': {
        id: 'warrior',
        name: '勇士',
        icon: '⚔️',
        description: '勇敢面对挑战的战士',
        attributes: { strength: 5, wisdom: 3, creativity: 2, social: 3 },
        preferredTasks: ['fitness', 'challenge', 'competition']
      },
      'scholar': {
        id: 'scholar',
        name: '学者',
        icon: '📚',
        description: '追求知识的智者',
        attributes: { strength: 2, wisdom: 5, creativity: 3, social: 3 },
        preferredTasks: ['study', 'reading', 'research']
      },
      'artist': {
        id: 'artist',
        name: '艺术家',
        icon: '🎨',
        description: '富有创造力的创作者',
        attributes: { strength: 2, wisdom: 3, creativity: 5, social: 3 },
        preferredTasks: ['creative', 'art', 'music']
      },
      'socialite': {
        id: 'socialite',
        name: '社交家',
        icon: '👥',
        description: '善于交际的沟通者',
        attributes: { strength: 3, wisdom: 3, creativity: 2, social: 5 },
        preferredTasks: ['social', 'communication', 'teamwork']
      },
      'explorer': {
        id: 'explorer',
        name: '探险家',
        icon: '🗺️',
        description: '热爱冒险的探索者',
        attributes: { strength: 4, wisdom: 3, creativity: 4, social: 2 },
        preferredTasks: ['adventure', 'travel', 'discovery']
      }
    };

    // 预定义故事章节
    this.storyChapters = {
      'prologue': {
        id: 'prologue',
        title: '序章：新的开始',
        type: 'main',
        order: 1,
        description: '欢迎来到你的成长之旅！',
        content: '在这个充满可能性的世界里，你即将开始一段属于自己的冒险。每一个任务的完成，每一个习惯的坚持，都将成为你成长故事中的重要篇章。',
        unlockConditions: {},
        rewards: { coins: 100, experience: 50 },
        isUnlocked: true,
        isCompleted: false
      },
      'first_steps': {
        id: 'first_steps',
        title: '第一章：初出茅庐',
        type: 'main',
        order: 2,
        description: '完成你的第一个任务',
        content: '每个伟大的冒险都始于第一步。你勇敢地接受了第一个挑战，这标志着你成长之旅的正式开始。虽然路还很长，但你已经迈出了最重要的一步。',
        unlockConditions: { tasksCompleted: 1 },
        rewards: { coins: 200, experience: 100 },
        isUnlocked: false,
        isCompleted: false
      },
      'habit_formation': {
        id: 'habit_formation',
        title: '第二章：习惯的力量',
        type: 'main',
        order: 3,
        description: '坚持一个习惯7天',
        content: '你发现了习惯的神奇力量。通过持续的努力和坚持，你开始感受到微小改变带来的巨大影响。这种坚持不懈的精神将成为你最宝贵的财富。',
        unlockConditions: { maxHabitStreak: 7 },
        rewards: { coins: 300, experience: 150 },
        isUnlocked: false,
        isCompleted: false
      },
      'social_connection': {
        id: 'social_connection',
        title: '第三章：友谊的纽带',
        type: 'main',
        order: 4,
        description: '添加你的第一个好友',
        content: '在成长的路上，你遇到了志同道合的伙伴。友谊的力量让你的旅程不再孤单，你们可以互相鼓励，共同进步，一起创造更美好的故事。',
        unlockConditions: { friendsCount: 1 },
        rewards: { coins: 250, experience: 125 },
        isUnlocked: false,
        isCompleted: false
      },
      'level_mastery': {
        id: 'level_mastery',
        title: '第四章：实力的证明',
        type: 'main',
        order: 5,
        description: '达到5级',
        content: '通过不断的努力和积累，你的实力得到了显著提升。5级不仅仅是一个数字，它代表着你在成长道路上的坚持和进步。你已经从新手蜕变为有经验的冒险者。',
        unlockConditions: { level: 5 },
        rewards: { coins: 500, experience: 250 },
        isUnlocked: false,
        isCompleted: false
      }
    };

    // 个性化推荐规则
    this.recommendationRules = {
      'morning_person': {
        condition: (userProfile) => userProfile.preferences.activeTime === 'morning',
        recommendations: {
          tasks: ['早晨锻炼', '晨读', '冥想'],
          habits: ['早起', '晨练', '阅读'],
          tips: '早晨是一天中精力最充沛的时候，适合进行重要的任务。'
        }
      },
      'night_owl': {
        condition: (userProfile) => userProfile.preferences.activeTime === 'night',
        recommendations: {
          tasks: ['夜间学习', '创作', '规划'],
          habits: ['夜读', '写日记', '反思'],
          tips: '夜晚的宁静适合深度思考和创作，利用这个时间进行学习和规划。'
        }
      },
      'social_focused': {
        condition: (userProfile) => userProfile.characterType === 'socialite',
        recommendations: {
          tasks: ['团队合作', '社交活动', '沟通练习'],
          habits: ['与朋友聊天', '参加活动', '练习演讲'],
          tips: '你的社交天赋是你的优势，多参与团队活动能让你发挥所长。'
        }
      },
      'knowledge_seeker': {
        condition: (userProfile) => userProfile.characterType === 'scholar',
        recommendations: {
          tasks: ['学习新技能', '阅读书籍', '研究项目'],
          habits: ['每日阅读', '学习笔记', '知识整理'],
          tips: '知识是你最宝贵的财富，保持学习的习惯能让你不断成长。'
        }
      }
    };
  }

  /**
   * 初始化故事章节
   */
  initializeStoryChapters() {
    try {
      // 加载生成的章节
      const loadedCount = this.loadGeneratedChapters();
      console.log('已加载生成的章节数量:', loadedCount);
    } catch (error) {
      console.error('初始化故事章节失败:', error);
    }
  }

  /**
   * 获取用户故事进度
   */
  getUserStoryProgress() {
    try {
      const defaultProgress = {
        currentChapter: 'prologue',
        completedChapters: [],
        unlockedChapters: ['prologue'],
        totalProgress: 0,
        storyPoints: 0,
        personalizedContent: [],
        lastUpdated: new Date().toISOString()
      };

      const progress = wx.getStorageSync('userStoryProgress') || defaultProgress;

      // 确保序章始终解锁
      if (!progress.unlockedChapters || !progress.unlockedChapters.includes('prologue')) {
        progress.unlockedChapters = progress.unlockedChapters || [];
        progress.unlockedChapters.push('prologue');
      }

      return {
        ...defaultProgress,
        ...progress
      };
    } catch (error) {
      console.error('获取用户故事进度失败:', error);
      return {
        currentChapter: 'prologue',
        completedChapters: [],
        unlockedChapters: ['prologue'],
        totalProgress: 0,
        storyPoints: 0,
        personalizedContent: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * 保存用户故事进度
   */
  saveUserStoryProgress(progress) {
    try {
      progress.lastUpdated = new Date().toISOString();
      wx.setStorageSync('userStoryProgress', progress);
      return true;
    } catch (error) {
      console.error('保存用户故事进度失败:', error);
      return false;
    }
  }

  /**
   * 获取用户个性化配置
   */
  getUserProfile() {
    try {
      const defaultProfile = {
        characterType: 'explorer',
        preferences: {
          activeTime: 'morning',
          difficulty: 'medium',
          focusAreas: ['health', 'learning'],
          reminderStyle: 'gentle'
        },
        interests: [],
        goals: [],
        personalityTraits: {
          motivation: 'achievement',
          style: 'balanced',
          social: 'moderate'
        },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      const profile = wx.getStorageSync('userProfile') || defaultProfile;
      
      return {
        ...defaultProfile,
        ...profile,
        preferences: {
          ...defaultProfile.preferences,
          ...profile.preferences
        },
        personalityTraits: {
          ...defaultProfile.personalityTraits,
          ...profile.personalityTraits
        }
      };
    } catch (error) {
      console.error('获取用户配置失败:', error);
      return {
        characterType: 'explorer',
        preferences: {
          activeTime: 'morning',
          difficulty: 'medium',
          focusAreas: ['health', 'learning'],
          reminderStyle: 'gentle'
        },
        interests: [],
        goals: [],
        personalityTraits: {
          motivation: 'achievement',
          style: 'balanced',
          social: 'moderate'
        },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * 保存用户个性化配置
   */
  saveUserProfile(profile) {
    try {
      profile.lastUpdated = new Date().toISOString();
      wx.setStorageSync('userProfile', profile);
      return true;
    } catch (error) {
      console.error('保存用户配置失败:', error);
      return false;
    }
  }

  /**
   * 检查并更新故事进度
   */
  updateStoryProgress() {
    try {
      const progress = this.getUserStoryProgress();
      const userStats = this.getUserStats();
      const userProfile = this.getUserProfile();
      let hasUpdates = false;

      // 检查预定义章节的解锁条件
      Object.values(this.storyChapters).forEach(chapter => {
        if (!progress.unlockedChapters.includes(chapter.id) &&
            this.checkUnlockConditions(chapter.unlockConditions, userStats)) {
          progress.unlockedChapters.push(chapter.id);
          hasUpdates = true;

          // 记录解锁活动
          try {
            const userService = require('./user-service.js');
            if (userService && typeof userService.recordUserActivity === 'function') {
              userService.recordUserActivity('story_unlocked', {
                chapterId: chapter.id,
                chapterTitle: chapter.title,
                chapterType: chapter.type
              });
            }
          } catch (error) {
            console.error('记录故事解锁活动失败:', error);
          }
        }
      });

      // 检查是否需要生成新的个性化章节
      const shouldGenerateNewChapter = this.shouldGenerateNewChapter(userStats, progress);
      if (shouldGenerateNewChapter) {
        const newChapter = this.generatePersonalizedChapter(userStats, userProfile);
        if (newChapter) {
          // 添加到故事章节中
          this.storyChapters[newChapter.id] = newChapter;
          progress.unlockedChapters.push(newChapter.id);
          hasUpdates = true;

          // 保存生成的章节
          this.saveGeneratedChapter(newChapter);

          // 记录生成活动
          try {
            const userService = require('./user-service.js');
            if (userService && typeof userService.recordUserActivity === 'function') {
              userService.recordUserActivity('story_generated', {
                chapterId: newChapter.id,
                chapterTitle: newChapter.title,
                chapterType: newChapter.type
              });
            }
          } catch (error) {
            console.error('记录故事生成活动失败:', error);
          }
        }
      }

      // 计算总进度
      const totalChapters = Object.keys(this.storyChapters).length;
      progress.totalProgress = Math.floor((progress.completedChapters.length / totalChapters) * 100);

      if (hasUpdates) {
        this.saveUserStoryProgress(progress);
      }

      return {
        success: true,
        progress: progress,
        hasUpdates: hasUpdates
      };
    } catch (error) {
      console.error('更新故事进度失败:', error);
      return { success: false, error: '更新故事进度失败' };
    }
  }

  /**
   * 判断是否应该生成新章节
   */
  shouldGenerateNewChapter(userStats, progress) {
    // 获取已生成的章节数量
    const generatedChapters = Object.values(this.storyChapters).filter(chapter => chapter.isGenerated);

    // 基于用户成就判断是否生成新章节
    const achievements = this.analyzeUserAchievements(userStats);
    const significantAchievements = achievements.filter(a => a.level >= 2);

    // 如果有重要成就且最近没有生成章节，则生成新章节
    if (significantAchievements.length > 0 && generatedChapters.length < Math.floor(userStats.level / 2)) {
      return true;
    }

    // 如果完成了大部分预定义章节，生成更多内容
    const predefinedCompleted = progress.completedChapters.filter(id =>
      this.storyChapters[id] && !this.storyChapters[id].isGenerated
    ).length;

    if (predefinedCompleted >= 3 && generatedChapters.length === 0) {
      return true;
    }

    return false;
  }

  /**
   * 保存生成的章节
   */
  saveGeneratedChapter(chapter) {
    try {
      const generatedChapters = wx.getStorageSync('generatedChapters') || {};
      generatedChapters[chapter.id] = chapter;
      wx.setStorageSync('generatedChapters', generatedChapters);
      return true;
    } catch (error) {
      console.error('保存生成章节失败:', error);
      return false;
    }
  }

  /**
   * 加载生成的章节
   */
  loadGeneratedChapters() {
    try {
      const generatedChapters = wx.getStorageSync('generatedChapters') || {};

      // 将生成的章节合并到故事章节中
      Object.values(generatedChapters).forEach(chapter => {
        this.storyChapters[chapter.id] = chapter;
      });

      return Object.keys(generatedChapters).length;
    } catch (error) {
      console.error('加载生成章节失败:', error);
      return 0;
    }
  }

  /**
   * 检查是否需要生成每日故事片段
   */
  checkDailyStoryGeneration() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastGeneration = wx.getStorageSync('lastStoryGeneration') || '';

      if (lastGeneration !== today) {
        const userStats = this.getUserStats();
        const userProfile = this.getUserProfile();

        // 生成每日故事片段
        const dailyStory = this.generateDailyStoryFragment(userStats, userProfile);

        if (dailyStory) {
          // 保存每日故事
          this.saveDailyStory(dailyStory);

          // 更新生成日期
          wx.setStorageSync('lastStoryGeneration', today);

          return {
            success: true,
            story: dailyStory,
            isNew: true
          };
        }
      }

      return {
        success: true,
        isNew: false
      };
    } catch (error) {
      console.error('检查每日故事生成失败:', error);
      return { success: false, error: '检查每日故事生成失败' };
    }
  }

  /**
   * 生成每日故事片段
   */
  generateDailyStoryFragment(userStats, userProfile) {
    try {
      const characterType = this.characterTypes[userProfile.characterType];
      const today = new Date();
      const dayOfWeek = today.getDay();

      const fragment = {
        id: 'daily_' + today.toISOString().split('T')[0],
        type: 'daily',
        title: this.generateDailyTitle(characterType, dayOfWeek),
        content: this.generateDailyContent(userStats, characterType, dayOfWeek),
        mood: this.generateDailyMood(userStats),
        date: today.toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      return fragment;
    } catch (error) {
      console.error('生成每日故事片段失败:', error);
      return null;
    }
  }

  /**
   * 生成每日标题
   */
  generateDailyTitle(characterType, dayOfWeek) {
    const weeklyTitles = {
      0: ['新的开始', '周日的宁静', '休息与反思'],
      1: ['周一的动力', '新周的挑战', '重新出发'],
      2: ['持续前进', '周二的坚持', '稳步成长'],
      3: ['中周的力量', '周三的突破', '继续努力'],
      4: ['接近目标', '周四的冲刺', '即将收获'],
      5: ['周五的成就', '一周的总结', '收获满满'],
      6: ['周六的放松', '享受成果', '准备新周']
    };

    const characterTitles = {
      'warrior': ['勇者', '战士', '斗士'],
      'scholar': ['学者', '智者', '求知者'],
      'artist': ['艺术家', '创作者', '梦想家'],
      'socialite': ['社交家', '沟通者', '连接者'],
      'explorer': ['探险家', '发现者', '冒险者']
    };

    const dayTitles = weeklyTitles[dayOfWeek] || weeklyTitles[0];
    const charTitles = characterTitles[characterType.id] || characterTitles['explorer'];

    const dayTitle = dayTitles[Math.floor(Math.random() * dayTitles.length)];
    const charTitle = charTitles[Math.floor(Math.random() * charTitles.length)];

    return `${charTitle}的${dayTitle}`;
  }

  /**
   * 生成每日内容
   */
  generateDailyContent(userStats, characterType, dayOfWeek) {
    const baseContent = this.getDailyBaseContent(dayOfWeek);
    const characterContent = this.getCharacterDailyContent(characterType);
    const statsContent = this.getStatsDailyContent(userStats);

    return `${baseContent} ${characterContent} ${statsContent}`;
  }

  /**
   * 获取基于星期的基础内容
   */
  getDailyBaseContent(dayOfWeek) {
    const weeklyContent = {
      0: '在这个宁静的周日，你有时间回顾过去一周的成长。',
      1: '新的一周开始了，充满了无限的可能性。',
      2: '周二的阳光照亮了你前进的道路。',
      3: '周三是一周的中点，你已经走过了一半的路程。',
      4: '周四的你更加接近本周的目标。',
      5: '周五到了，一周的努力即将收获成果。',
      6: '周六是放松和享受成就的时光。'
    };

    return weeklyContent[dayOfWeek] || weeklyContent[1];
  }

  /**
   * 获取基于角色的每日内容
   */
  getCharacterDailyContent(characterType) {
    const characterContent = {
      'warrior': '作为勇敢的战士，你面对每一个挑战都毫不退缩。',
      'scholar': '作为智慧的学者，你在知识的海洋中不断探索。',
      'artist': '作为富有创意的艺术家，你用独特的视角看待世界。',
      'socialite': '作为魅力四射的社交家，你在人际关系中游刃有余。',
      'explorer': '作为无畏的探险家，你总是渴望发现新的奇迹。'
    };

    return characterContent[characterType.id] || characterContent['explorer'];
  }

  /**
   * 获取基于统计的每日内容
   */
  getStatsDailyContent(userStats) {
    const contents = [];

    if (userStats.tasksCompleted > 0) {
      contents.push(`你已经完成了${userStats.tasksCompleted}个任务，展现了出色的执行力。`);
    }

    if (userStats.maxHabitStreak > 0) {
      contents.push(`${userStats.maxHabitStreak}天的习惯坚持证明了你的毅力。`);
    }

    if (userStats.friendsCount > 0) {
      contents.push(`${userStats.friendsCount}个好友与你同行，让旅程不再孤单。`);
    }

    if (contents.length === 0) {
      contents.push('每一天都是新的开始，每一步都让你更加强大。');
    }

    return contents[Math.floor(Math.random() * contents.length)];
  }

  /**
   * 生成每日心情
   */
  generateDailyMood(userStats) {
    const moods = ['积极', '平静', '充满希望', '自信', '感激'];

    // 根据用户成就调整心情
    if (userStats.level >= 5) {
      moods.push('自豪', '成就感满满');
    }

    if (userStats.maxHabitStreak >= 7) {
      moods.push('坚定', '有条不紊');
    }

    return moods[Math.floor(Math.random() * moods.length)];
  }

  /**
   * 保存每日故事
   */
  saveDailyStory(story) {
    try {
      const dailyStories = wx.getStorageSync('dailyStories') || {};
      dailyStories[story.date] = story;

      // 只保留最近30天的故事
      const dates = Object.keys(dailyStories).sort();
      if (dates.length > 30) {
        const toDelete = dates.slice(0, dates.length - 30);
        toDelete.forEach(date => delete dailyStories[date]);
      }

      wx.setStorageSync('dailyStories', dailyStories);
      return true;
    } catch (error) {
      console.error('保存每日故事失败:', error);
      return false;
    }
  }

  /**
   * 获取每日故事
   */
  getDailyStories(limit = 7) {
    try {
      const dailyStories = wx.getStorageSync('dailyStories') || {};
      const stories = Object.values(dailyStories)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);

      return stories;
    } catch (error) {
      console.error('获取每日故事失败:', error);
      return [];
    }
  }

  /**
   * 季节性活动系统
   */
  getSeasonalEvents() {
    try {
      const now = new Date();
      const month = now.getMonth() + 1; // 1-12
      const day = now.getDate();

      const seasonalEvents = {
        // 春季活动 (3-5月)
        spring: {
          months: [3, 4, 5],
          events: [
            {
              id: 'spring_awakening',
              name: '春日觉醒',
              description: '万物复苏的季节，是开始新习惯的最佳时机',
              icon: '🌸',
              bonusType: 'habit_formation',
              bonusValue: 1.2,
              duration: 7 // 天数
            },
            {
              id: 'growth_festival',
              name: '成长节',
              description: '庆祝个人成长的特殊时期',
              icon: '🌱',
              bonusType: 'experience',
              bonusValue: 1.5,
              duration: 3
            }
          ]
        },
        // 夏季活动 (6-8月)
        summer: {
          months: [6, 7, 8],
          events: [
            {
              id: 'energy_boost',
              name: '活力夏日',
              description: '充满活力的季节，完成任务获得额外奖励',
              icon: '☀️',
              bonusType: 'task_completion',
              bonusValue: 1.3,
              duration: 10
            },
            {
              id: 'social_gathering',
              name: '夏日聚会',
              description: '社交活动的黄金时期',
              icon: '🏖️',
              bonusType: 'social_points',
              bonusValue: 2.0,
              duration: 5
            }
          ]
        },
        // 秋季活动 (9-11月)
        autumn: {
          months: [9, 10, 11],
          events: [
            {
              id: 'harvest_time',
              name: '收获季节',
              description: '收获一年努力成果的时刻',
              icon: '🍂',
              bonusType: 'coins',
              bonusValue: 1.5,
              duration: 14
            },
            {
              id: 'wisdom_month',
              name: '智慧月',
              description: '学习和反思的最佳时期',
              icon: '📚',
              bonusType: 'learning_tasks',
              bonusValue: 1.4,
              duration: 30
            }
          ]
        },
        // 冬季活动 (12-2月)
        winter: {
          months: [12, 1, 2],
          events: [
            {
              id: 'reflection_period',
              name: '反思时光',
              description: '回顾过去，规划未来的宁静时期',
              icon: '❄️',
              bonusType: 'story_generation',
              bonusValue: 1.0,
              duration: 21
            },
            {
              id: 'new_year_resolution',
              name: '新年决心',
              description: '新的开始，新的目标',
              icon: '🎊',
              bonusType: 'goal_setting',
              bonusValue: 1.6,
              duration: 7
            }
          ]
        }
      };

      // 确定当前季节
      let currentSeason = 'spring';
      if ([6, 7, 8].includes(month)) currentSeason = 'summer';
      else if ([9, 10, 11].includes(month)) currentSeason = 'autumn';
      else if ([12, 1, 2].includes(month)) currentSeason = 'winter';

      const seasonData = seasonalEvents[currentSeason];
      const activeEvents = this.getActiveSeasonalEvents(seasonData.events, now);

      return {
        currentSeason,
        seasonData,
        activeEvents,
        upcomingEvents: this.getUpcomingEvents(seasonData.events, now)
      };
    } catch (error) {
      console.error('获取季节性活动失败:', error);
      return {
        currentSeason: 'spring',
        seasonData: null,
        activeEvents: [],
        upcomingEvents: []
      };
    }
  }

  /**
   * 获取当前活跃的季节性活动
   */
  getActiveSeasonalEvents(events, now) {
    const activeEvents = wx.getStorageSync('activeSeasonalEvents') || {};
    const currentEvents = [];

    events.forEach(event => {
      const eventKey = `${event.id}_${now.getFullYear()}_${now.getMonth()}`;
      const eventData = activeEvents[eventKey];

      if (eventData && eventData.endTime > now.getTime()) {
        currentEvents.push({
          ...event,
          ...eventData,
          isActive: true,
          remainingDays: Math.ceil((eventData.endTime - now.getTime()) / (1000 * 60 * 60 * 24))
        });
      }
    });

    return currentEvents;
  }

  /**
   * 获取即将到来的活动
   */
  getUpcomingEvents(events, now) {
    // 简化实现：返回当前季节的其他活动
    return events.filter(event => {
      const activeEvents = wx.getStorageSync('activeSeasonalEvents') || {};
      const eventKey = `${event.id}_${now.getFullYear()}_${now.getMonth()}`;
      return !activeEvents[eventKey];
    }).slice(0, 2);
  }

  /**
   * 激活季节性活动
   */
  activateSeasonalEvent(eventId) {
    try {
      const seasonalData = this.getSeasonalEvents();
      const event = seasonalData.seasonData.events.find(e => e.id === eventId);

      if (!event) {
        return { success: false, error: '活动不存在' };
      }

      const now = new Date();
      const eventKey = `${event.id}_${now.getFullYear()}_${now.getMonth()}`;
      const activeEvents = wx.getStorageSync('activeSeasonalEvents') || {};

      // 检查是否已经激活
      if (activeEvents[eventKey] && activeEvents[eventKey].endTime > now.getTime()) {
        return { success: false, error: '活动已经激活' };
      }

      // 激活活动
      activeEvents[eventKey] = {
        startTime: now.getTime(),
        endTime: now.getTime() + (event.duration * 24 * 60 * 60 * 1000),
        participantCount: 1
      };

      wx.setStorageSync('activeSeasonalEvents', activeEvents);

      // 记录活动参与
      try {
        const userService = require('./user-service.js');
        if (userService && typeof userService.recordUserActivity === 'function') {
          userService.recordUserActivity('seasonal_event_joined', {
            eventId: event.id,
            eventName: event.name,
            duration: event.duration
          });
        }
      } catch (activityError) {
        console.error('记录季节性活动参与失败:', activityError);
      }

      return {
        success: true,
        event: {
          ...event,
          ...activeEvents[eventKey],
          isActive: true
        }
      };
    } catch (error) {
      console.error('激活季节性活动失败:', error);
      return { success: false, error: '激活活动失败' };
    }
  }

  /**
   * 随机事件系统
   */
  generateRandomEvent() {
    try {
      const userStats = this.getUserStats();
      const userProfile = this.getUserProfile();

      // 基于用户数据计算随机事件概率
      const eventProbability = this.calculateEventProbability(userStats);

      if (Math.random() > eventProbability) {
        return null; // 不触发随机事件
      }

      const randomEvents = this.getRandomEventTemplates();
      const suitableEvents = randomEvents.filter(event =>
        this.checkEventConditions(event, userStats, userProfile)
      );

      if (suitableEvents.length === 0) {
        return null;
      }

      const selectedEvent = suitableEvents[Math.floor(Math.random() * suitableEvents.length)];
      const generatedEvent = this.createRandomEventInstance(selectedEvent, userStats, userProfile);

      // 保存随机事件
      this.saveRandomEvent(generatedEvent);

      return generatedEvent;
    } catch (error) {
      console.error('生成随机事件失败:', error);
      return null;
    }
  }

  /**
   * 生成AI驱动的随机事件
   */
  async generateAIRandomEvent() {
    try {
      const userStats = this.getUserStats();
      const userProfile = this.getUserProfile();
      const emotionalState = this.getEmotionalState();

      // 基于用户数据计算随机事件概率
      const eventProbability = this.calculateEventProbability(userStats);

      if (Math.random() > eventProbability) {
        return null; // 不触发随机事件
      }

      // 尝试使用AI生成随机事件
      const aiService = require('./ai-service.js');
      const aiResult = await aiService.generateAIRandomEvent(userProfile, userStats, emotionalState);

      let eventData;
      if (aiResult.success) {
        eventData = aiResult.event;
        console.log('✅ AI生成随机事件成功');
      } else {
        console.warn('⚠️ AI生成失败，使用降级方案:', aiResult.error);
        eventData = aiResult.fallback || this.generateFallbackRandomEvent(userProfile, userStats);
      }

      // 创建事件实例
      const generatedEvent = this.createAIRandomEventInstance(eventData, userStats, userProfile, aiResult.source);

      // 保存随机事件
      this.saveRandomEvent(generatedEvent);

      return generatedEvent;
    } catch (error) {
      console.error('生成AI随机事件失败:', error);
      // 降级到传统随机事件
      return this.generateRandomEvent();
    }
  }

  /**
   * 创建AI随机事件实例
   */
  createAIRandomEventInstance(eventData, userStats, userProfile, source = 'local') {
    const now = new Date();

    return {
      id: `ai_random_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: 'ai_generated',
      name: eventData.name,
      description: eventData.description,
      icon: eventData.icon,
      type: eventData.type || 'positive',
      effects: eventData.effects || { coins: 50, experience: 25 },
      rarity: eventData.rarity || 'common',
      personalizedReason: eventData.personalizedReason || '基于你的当前状态生成',
      source: source,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
      isCompleted: false,
      userLevel: userStats.level,
      characterType: userProfile.characterType,
      isAIGenerated: true
    };
  }

  /**
   * 获取角色类型名称
   */
  getCharacterTypeName(characterType) {
    const characterTypes = {
      'warrior': '⚔️ 勇士',
      'scholar': '📚 学者',
      'artist': '🎨 艺术家',
      'socialite': '👥 社交家',
      'explorer': '🗺️ 探险家'
    };
    return characterTypes[characterType] || '🗺️ 探险家';
  }

  /**
   * 生成降级随机事件
   */
  generateFallbackRandomEvent(userProfile, userStats) {
    const characterType = userProfile.characterType || 'explorer';
    const level = userStats.level || 1;

    const fallbackEvents = [
      {
        name: '神秘礼物',
        description: `一个神秘的包裹出现在你面前，里面装着适合${this.getCharacterTypeName(characterType)}的珍贵物品。`,
        icon: '🎁',
        type: 'positive',
        rarity: level > 5 ? 'uncommon' : 'common',
        effects: {
          coins: Math.floor(50 + level * 10),
          experience: Math.floor(30 + level * 5)
        },
        personalizedReason: `作为${this.getCharacterTypeName(characterType)}，你更容易吸引这样的机遇`
      },
      {
        name: '智慧启发',
        description: '在冥想或思考的过程中，你突然获得了深刻的人生感悟。',
        icon: '🧠',
        type: 'discovery',
        rarity: 'uncommon',
        effects: {
          coins: Math.floor(40 + level * 8),
          experience: Math.floor(60 + level * 10),
          specialReward: '智慧提升'
        },
        personalizedReason: '你的思维深度让你更容易获得这样的启发'
      },
      {
        name: '幸运邂逅',
        description: '你遇到了一位志同道合的朋友，你们的交流让彼此都受益匪浅。',
        icon: '🤝',
        type: 'positive',
        rarity: 'common',
        effects: {
          coins: Math.floor(60 + level * 12),
          experience: Math.floor(40 + level * 8)
        },
        personalizedReason: '你的人格魅力吸引了这次美好的相遇'
      }
    ];

    const randomIndex = Math.floor(Math.random() * fallbackEvents.length);
    return fallbackEvents[randomIndex];
  }

  /**
   * 计算随机事件概率
   */
  calculateEventProbability(userStats) {
    let baseProbability = 0.1; // 基础10%概率

    // 根据用户活跃度调整概率
    if (userStats.tasksCompleted > 10) baseProbability += 0.05;
    if (userStats.maxHabitStreak > 7) baseProbability += 0.05;
    if (userStats.level > 3) baseProbability += 0.03;
    if (userStats.friendsCount > 0) baseProbability += 0.02;

    return Math.min(baseProbability, 0.3); // 最高30%概率
  }

  /**
   * 获取随机事件模板
   */
  getRandomEventTemplates() {
    return [
      {
        id: 'mysterious_mentor',
        name: '神秘导师',
        description: '一位神秘的导师出现，愿意传授你宝贵的经验',
        icon: '🧙‍♂️',
        type: 'positive',
        conditions: { level: 2 },
        effects: {
          experience: 200,
          coins: 100,
          specialReward: 'wisdom_boost'
        },
        rarity: 'rare'
      },
      {
        id: 'lucky_discovery',
        name: '幸运发现',
        description: '你在日常活动中发现了意外的收获',
        icon: '🍀',
        type: 'positive',
        conditions: { tasksCompleted: 5 },
        effects: {
          coins: 150,
          experience: 50
        },
        rarity: 'common'
      },
      {
        id: 'inspiration_strike',
        name: '灵感闪现',
        description: '突然的灵感让你对未来有了新的想法',
        icon: '💡',
        type: 'positive',
        conditions: { characterType: ['artist', 'scholar'] },
        effects: {
          experience: 100,
          storyPoints: 50,
          specialReward: 'creativity_boost'
        },
        rarity: 'uncommon'
      },
      {
        id: 'social_opportunity',
        name: '社交机会',
        description: '一个意外的社交机会让你结识了新朋友',
        icon: '🤝',
        type: 'positive',
        conditions: { characterType: ['socialite'], friendsCount: 1 },
        effects: {
          socialPoints: 100,
          experience: 75,
          specialReward: 'charisma_boost'
        },
        rarity: 'uncommon'
      },
      {
        id: 'challenge_appears',
        name: '挑战出现',
        description: '一个新的挑战出现，完成它将获得丰厚奖励',
        icon: '⚔️',
        type: 'challenge',
        conditions: { level: 3, characterType: ['warrior', 'explorer'] },
        effects: {
          experience: 300,
          coins: 200,
          specialReward: 'courage_boost'
        },
        rarity: 'rare'
      }
    ];
  }

  /**
   * 检查事件触发条件
   */
  checkEventConditions(event, userStats, userProfile) {
    const conditions = event.conditions;

    // 检查等级条件
    if (conditions.level && userStats.level < conditions.level) {
      return false;
    }

    // 检查任务完成数条件
    if (conditions.tasksCompleted && userStats.tasksCompleted < conditions.tasksCompleted) {
      return false;
    }

    // 检查好友数条件
    if (conditions.friendsCount && userStats.friendsCount < conditions.friendsCount) {
      return false;
    }

    // 检查角色类型条件
    if (conditions.characterType && !conditions.characterType.includes(userProfile.characterType)) {
      return false;
    }

    return true;
  }

  /**
   * 创建随机事件实例
   */
  createRandomEventInstance(template, userStats, userProfile) {
    const now = new Date();

    return {
      id: `random_${template.id}_${now.getTime()}`,
      templateId: template.id,
      name: template.name,
      description: template.description,
      icon: template.icon,
      type: template.type,
      effects: template.effects,
      rarity: template.rarity,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
      isCompleted: false,
      userLevel: userStats.level,
      characterType: userProfile.characterType
    };
  }

  /**
   * 保存随机事件
   */
  saveRandomEvent(event) {
    try {
      const randomEvents = wx.getStorageSync('randomEvents') || [];
      randomEvents.unshift(event);

      // 只保留最近10个事件
      if (randomEvents.length > 10) {
        randomEvents.splice(10);
      }

      wx.setStorageSync('randomEvents', randomEvents);
      return true;
    } catch (error) {
      console.error('保存随机事件失败:', error);
      return false;
    }
  }

  /**
   * 获取活跃的随机事件
   */
  getActiveRandomEvents() {
    try {
      const randomEvents = wx.getStorageSync('randomEvents') || [];
      const now = new Date();

      return randomEvents.filter(event =>
        !event.isCompleted && new Date(event.expiresAt) > now
      );
    } catch (error) {
      console.error('获取活跃随机事件失败:', error);
      return [];
    }
  }

  /**
   * 完成随机事件
   */
  completeRandomEvent(eventId) {
    try {
      const randomEvents = wx.getStorageSync('randomEvents') || [];
      const eventIndex = randomEvents.findIndex(event => event.id === eventId);

      if (eventIndex === -1) {
        return { success: false, error: '事件不存在' };
      }

      const event = randomEvents[eventIndex];
      if (event.isCompleted) {
        return { success: false, error: '事件已完成' };
      }

      // 标记为已完成
      event.isCompleted = true;
      event.completedAt = new Date().toISOString();

      // 给予奖励
      if (event.effects) {
        try {
          const rewardService = require('./reward-service.js');
          if (rewardService && typeof rewardService.giveRewards === 'function') {
            rewardService.giveRewards(event.effects);
          }
        } catch (rewardError) {
          console.error('给予随机事件奖励失败:', rewardError);
        }
      }

      wx.setStorageSync('randomEvents', randomEvents);

      // 记录事件完成
      try {
        const userService = require('./user-service.js');
        if (userService && typeof userService.recordUserActivity === 'function') {
          userService.recordUserActivity('random_event_completed', {
            eventId: event.id,
            eventName: event.name,
            rarity: event.rarity,
            effects: event.effects
          });
        }
      } catch (activityError) {
        console.error('记录随机事件完成活动失败:', activityError);
      }

      return {
        success: true,
        event: event,
        message: '事件完成！'
      };
    } catch (error) {
      console.error('完成随机事件失败:', error);
      return { success: false, error: '完成事件失败' };
    }
  }

  /**
   * 情感系统 - 追踪用户的情感状态
   */
  getEmotionalState() {
    try {
      const userStats = this.getUserStats();
      const recentActivities = this.getRecentUserActivities();

      // 计算情感指标
      const emotionalMetrics = {
        happiness: this.calculateHappiness(userStats, recentActivities),
        motivation: this.calculateMotivation(userStats, recentActivities),
        confidence: this.calculateConfidence(userStats),
        stress: this.calculateStress(userStats, recentActivities),
        satisfaction: this.calculateSatisfaction(userStats)
      };

      // 确定主要情感状态
      const primaryEmotion = this.determinePrimaryEmotion(emotionalMetrics);

      // 生成情感建议
      const emotionalAdvice = this.generateEmotionalAdvice(emotionalMetrics, primaryEmotion);

      return {
        metrics: emotionalMetrics,
        primaryEmotion,
        advice: emotionalAdvice,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('获取情感状态失败:', error);
      return {
        metrics: { happiness: 50, motivation: 50, confidence: 50, stress: 30, satisfaction: 50 },
        primaryEmotion: 'neutral',
        advice: '保持积极的心态，继续你的成长之旅！',
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * 计算幸福度
   */
  calculateHappiness(userStats, recentActivities) {
    let happiness = 50; // 基础值

    // 基于成就的幸福度
    happiness += Math.min(userStats.tasksCompleted * 2, 30);
    happiness += Math.min(userStats.maxHabitStreak, 20);
    happiness += Math.min(userStats.friendsCount * 5, 25);

    // 基于最近活动的幸福度
    const positiveActivities = recentActivities.filter(activity =>
      ['task_completed', 'habit_checkin', 'level_up', 'friend_added'].includes(activity.type)
    );
    happiness += Math.min(positiveActivities.length * 3, 15);

    return Math.min(Math.max(happiness, 0), 100);
  }

  /**
   * 计算动力值
   */
  calculateMotivation(userStats, recentActivities) {
    let motivation = 50;

    // 基于最近活动频率
    const recentTasksCount = recentActivities.filter(activity =>
      activity.type === 'task_completed' &&
      new Date(activity.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    motivation += Math.min(recentTasksCount * 5, 30);

    // 基于连续习惯
    if (userStats.maxHabitStreak > 0) {
      motivation += Math.min(userStats.maxHabitStreak * 2, 20);
    }

    // 基于等级进展
    motivation += Math.min(userStats.level * 3, 15);

    return Math.min(Math.max(motivation, 0), 100);
  }

  /**
   * 计算自信度
   */
  calculateConfidence(userStats) {
    let confidence = 50;

    // 基于总体成就
    confidence += Math.min(userStats.level * 5, 25);
    confidence += Math.min(userStats.tasksCompleted, 20);
    confidence += Math.min(userStats.achievementsUnlocked * 3, 15);

    return Math.min(Math.max(confidence, 0), 100);
  }

  /**
   * 计算压力值
   */
  calculateStress(userStats, recentActivities) {
    let stress = 20; // 基础压力值

    // 基于未完成任务（模拟）
    const incompleteTasks = Math.max(0, 10 - recentActivities.filter(a => a.type === 'task_completed').length);
    stress += incompleteTasks * 3;

    // 基于社交压力
    if (userStats.friendsCount === 0) {
      stress += 10;
    }

    return Math.min(Math.max(stress, 0), 100);
  }

  /**
   * 计算满意度
   */
  calculateSatisfaction(userStats) {
    let satisfaction = 50;

    // 基于平衡发展
    const achievements = [
      userStats.tasksCompleted > 5 ? 1 : 0,
      userStats.maxHabitStreak > 3 ? 1 : 0,
      userStats.level > 2 ? 1 : 0,
      userStats.friendsCount > 0 ? 1 : 0
    ];

    satisfaction += achievements.reduce((sum, val) => sum + val, 0) * 10;

    return Math.min(Math.max(satisfaction, 0), 100);
  }

  /**
   * 确定主要情感状态
   */
  determinePrimaryEmotion(metrics) {
    if (metrics.happiness > 80) return 'joyful';
    if (metrics.motivation > 80) return 'energetic';
    if (metrics.confidence > 80) return 'confident';
    if (metrics.stress > 70) return 'stressed';
    if (metrics.happiness < 30) return 'sad';
    if (metrics.motivation < 30) return 'unmotivated';
    return 'balanced';
  }

  /**
   * 生成情感建议
   */
  generateEmotionalAdvice(metrics, primaryEmotion) {
    const adviceMap = {
      'joyful': '你现在状态很好！继续保持这种积极的心态，可以尝试挑战更高的目标。',
      'energetic': '你充满动力！这是完成重要任务和培养新习惯的绝佳时机。',
      'confident': '你的自信心很强！可以尝试一些之前不敢尝试的挑战。',
      'stressed': '感觉有些压力？试着放慢节奏，专注于一些简单的任务来重建信心。',
      'sad': '情绪有些低落？不妨做一些让你开心的小事，或者和朋友聊聊天。',
      'unmotivated': '缺乏动力？从最简单的任务开始，小步前进也是进步。',
      'balanced': '你的情感状态很平衡，这是稳步成长的好状态。'
    };

    return adviceMap[primaryEmotion] || '保持积极的心态，继续你的成长之旅！';
  }

  /**
   * 获取最近的用户活动
   */
  getRecentUserActivities() {
    try {
      let userService;
      try {
        userService = require('./user-service.js');
      } catch (requireError) {
        console.error('无法加载用户服务:', requireError);
        return [];
      }

      if (!userService || typeof userService.getUserActivities !== 'function') {
        console.log('用户服务不可用或方法不存在');
        return [];
      }

      return userService.getUserActivities(null, 20);
    } catch (error) {
      console.error('获取最近活动失败:', error);
      return [];
    }
  }

  /**
   * 角色成长追踪系统
   */
  getCharacterGrowthTracking() {
    try {
      const userProfile = this.getUserProfile();
      const userStats = this.getUserStats();
      const characterType = this.characterTypes[userProfile.characterType];

      // 计算角色特定的成长指标
      const growthMetrics = this.calculateCharacterGrowthMetrics(characterType, userStats);

      // 生成成长建议
      const growthAdvice = this.generateCharacterGrowthAdvice(characterType, growthMetrics);

      // 计算下一个成长里程碑
      const nextMilestone = this.calculateNextMilestone(characterType, growthMetrics);

      return {
        characterType: characterType,
        growthMetrics,
        growthAdvice,
        nextMilestone,
        overallProgress: this.calculateOverallProgress(growthMetrics),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('获取角色成长追踪失败:', error);
      return null;
    }
  }

  /**
   * 计算角色特定的成长指标
   */
  calculateCharacterGrowthMetrics(characterType, userStats) {
    const baseMetrics = {
      strength: 0,
      wisdom: 0,
      creativity: 0,
      social: 0,
      discipline: 0
    };

    // 基于角色类型的基础属性
    Object.keys(characterType.attributes).forEach(attr => {
      if (baseMetrics.hasOwnProperty(attr)) {
        baseMetrics[attr] = characterType.attributes[attr] * 10;
      }
    });

    // 基于用户统计数据调整
    baseMetrics.strength += Math.min(userStats.tasksCompleted * 2, 40);
    baseMetrics.wisdom += Math.min(userStats.level * 5, 30);
    baseMetrics.creativity += Math.min(userStats.achievementsUnlocked * 3, 25);
    baseMetrics.social += Math.min(userStats.friendsCount * 8, 35);
    baseMetrics.discipline += Math.min(userStats.maxHabitStreak * 3, 45);

    // 确保值在0-100范围内
    Object.keys(baseMetrics).forEach(key => {
      baseMetrics[key] = Math.min(Math.max(baseMetrics[key], 0), 100);
    });

    return baseMetrics;
  }

  /**
   * 生成角色成长建议
   */
  generateCharacterGrowthAdvice(characterType, growthMetrics) {
    const advice = [];

    // 找出最弱的属性
    const weakestAttr = Object.keys(growthMetrics).reduce((a, b) =>
      growthMetrics[a] < growthMetrics[b] ? a : b
    );

    // 找出最强的属性
    const strongestAttr = Object.keys(growthMetrics).reduce((a, b) =>
      growthMetrics[a] > growthMetrics[b] ? a : b
    );

    const attrAdvice = {
      strength: '多完成一些挑战性的任务来提升执行力',
      wisdom: '通过学习和反思来增长智慧',
      creativity: '尝试一些创新的方法和想法',
      social: '多与朋友互动，扩展社交圈',
      discipline: '坚持良好的习惯来提升自律性'
    };

    advice.push(`你的${strongestAttr}很出色，继续发挥这个优势！`);
    advice.push(`建议重点提升${weakestAttr}：${attrAdvice[weakestAttr]}`);

    // 基于角色类型的特殊建议
    const roleAdvice = {
      'warrior': '作为勇士，多接受挑战性任务能让你更快成长',
      'scholar': '作为学者，保持学习习惯是你成长的关键',
      'artist': '作为艺术家，多尝试创新能激发你的潜能',

      'explorer': '作为探险家，勇于尝试新事物是你的天性'
    };

    advice.push(roleAdvice[characterType.id] || '继续按照自己的节奏成长');

    return advice;
  }

  /**
   * 计算下一个成长里程碑
   */
  calculateNextMilestone(characterType, growthMetrics) {
    const milestones = [
      { level: 25, name: '初学者', description: '刚刚开始成长之旅' },
      { level: 50, name: '进步者', description: '已经有了明显的进步' },
      { level: 75, name: '熟练者', description: '在多个方面都很出色' },
      { level: 90, name: '专家', description: '接近完美的状态' },
      { level: 100, name: '大师', description: '达到了巅峰状态' }
    ];

    const averageGrowth = Object.values(growthMetrics).reduce((sum, val) => sum + val, 0) / 5;

    const nextMilestone = milestones.find(milestone => milestone.level > averageGrowth);

    return nextMilestone || milestones[milestones.length - 1];
  }

  /**
   * 计算总体进度
   */
  calculateOverallProgress(growthMetrics) {
    const totalProgress = Object.values(growthMetrics).reduce((sum, val) => sum + val, 0);
    return Math.round(totalProgress / 5); // 平均值
  }

  /**
   * AI任务生成系统
   */
  generateAITasks() {
    try {
      const userProfile = this.getUserProfile();
      const userStats = this.getUserStats();
      const emotionalState = this.getEmotionalState();
      const characterGrowth = this.getCharacterGrowthTracking();

      // 基于多维度数据生成任务
      const aiTasks = [];

      // 基于情感状态生成任务
      const emotionBasedTasks = this.generateEmotionBasedTasks(emotionalState);
      aiTasks.push(...emotionBasedTasks);

      // 基于角色成长生成任务
      const growthBasedTasks = this.generateGrowthBasedTasks(characterGrowth);
      aiTasks.push(...growthBasedTasks);

      // 基于角色类型生成任务
      const characterBasedTasks = this.generateCharacterBasedTasks(userProfile);
      aiTasks.push(...characterBasedTasks);

      // 基于用户历史行为生成任务
      const behaviorBasedTasks = this.generateBehaviorBasedTasks(userStats);
      aiTasks.push(...behaviorBasedTasks);

      // 基于季节性活动生成任务
      const seasonalTasks = this.generateSeasonalTasks();
      aiTasks.push(...seasonalTasks);

      // 去重并排序
      const uniqueTasks = this.deduplicateAndRankTasks(aiTasks, userProfile, userStats);

      return uniqueTasks.slice(0, 10); // 返回前10个最相关的任务
    } catch (error) {
      console.error('AI任务生成失败:', error);
      return [];
    }
  }

  /**
   * 基于情感状态生成任务
   */
  generateEmotionBasedTasks(emotionalState) {
    const tasks = [];
    const metrics = emotionalState.metrics;

    // 低幸福度时的任务
    if (metrics.happiness < 50) {
      tasks.push({
        title: '做一件让自己开心的小事',
        description: '花15分钟做一件能让你微笑的事情',
        category: 'wellness',
        difficulty: 'easy',
        estimatedTime: 15,
        aiReason: '提升幸福感',
        priority: 8,
        tags: ['情感调节', '自我关爱']
      });
    }

    // 低动力时的任务
    if (metrics.motivation < 50) {
      tasks.push({
        title: '制定今日小目标',
        description: '设定一个简单易达成的小目标并完成它',
        category: 'productivity',
        difficulty: 'easy',
        estimatedTime: 30,
        aiReason: '重建动力和成就感',
        priority: 9,
        tags: ['目标设定', '动力提升']
      });
    }

    // 低自信时的任务
    if (metrics.confidence < 50) {
      tasks.push({
        title: '回顾近期成就',
        description: '写下最近完成的3件事情，为自己感到骄傲',
        category: 'reflection',
        difficulty: 'easy',
        estimatedTime: 20,
        aiReason: '增强自信心',
        priority: 7,
        tags: ['自我肯定', '反思']
      });
    }

    // 高压力时的任务
    if (metrics.stress > 70) {
      tasks.push({
        title: '深呼吸放松练习',
        description: '进行5分钟的深呼吸或冥想练习',
        category: 'wellness',
        difficulty: 'easy',
        estimatedTime: 5,
        aiReason: '缓解压力',
        priority: 10,
        tags: ['压力管理', '放松']
      });
    }

    return tasks;
  }

  /**
   * 基于角色成长生成任务
   */
  generateGrowthBasedTasks(characterGrowth) {
    const tasks = [];
    const metrics = characterGrowth.growthMetrics;

    // 找出最需要提升的属性
    const weakestAttr = Object.keys(metrics).reduce((a, b) =>
      metrics[a] < metrics[b] ? a : b
    );

    const attrTasks = {
      strength: [
        {
          title: '完成一项体能挑战',
          description: '做20个俯卧撑或其他体能训练',
          category: 'fitness',
          difficulty: 'medium',
          estimatedTime: 15,
          aiReason: '提升力量属性',
          priority: 8,
          tags: ['体能训练', '力量提升']
        }
      ],
      wisdom: [
        {
          title: '学习新知识',
          description: '阅读一篇有趣的文章或观看教育视频',
          category: 'learning',
          difficulty: 'easy',
          estimatedTime: 30,
          aiReason: '提升智慧属性',
          priority: 7,
          tags: ['学习', '知识获取']
        }
      ],
      creativity: [
        {
          title: '创意表达时间',
          description: '画画、写作或进行其他创意活动',
          category: 'creative',
          difficulty: 'medium',
          estimatedTime: 45,
          aiReason: '提升创造力属性',
          priority: 6,
          tags: ['创意', '艺术表达']
        }
      ],
      social: [
        {
          title: '主动联系朋友',
          description: '给一位朋友发消息，关心他们的近况',
          category: 'social',
          difficulty: 'easy',
          estimatedTime: 10,
          aiReason: '提升社交属性',
          priority: 8,
          tags: ['社交', '友谊维护']
        }
      ],
      discipline: [
        {
          title: '坚持一个好习惯',
          description: '选择一个想要培养的习惯并坚持一天',
          category: 'habit',
          difficulty: 'medium',
          estimatedTime: 60,
          aiReason: '提升自律属性',
          priority: 9,
          tags: ['习惯培养', '自律']
        }
      ]
    };

    if (attrTasks[weakestAttr]) {
      tasks.push(...attrTasks[weakestAttr]);
    }

    return tasks;
  }

  /**
   * 基于角色类型生成任务
   */
  generateCharacterBasedTasks(userProfile) {
    const tasks = [];
    const characterType = userProfile.characterType;

    const characterTasks = {
      warrior: [
        {
          title: '接受今日挑战',
          description: '选择一个有挑战性的任务并勇敢面对',
          category: 'challenge',
          difficulty: 'hard',
          estimatedTime: 60,
          aiReason: '符合勇士特质',
          priority: 8,
          tags: ['挑战', '勇气']
        }
      ],
      scholar: [
        {
          title: '深度学习时间',
          description: '专注学习一个新概念或技能30分钟',
          category: 'learning',
          difficulty: 'medium',
          estimatedTime: 30,
          aiReason: '符合学者特质',
          priority: 9,
          tags: ['深度学习', '知识探索']
        }
      ],
      artist: [
        {
          title: '创作灵感实现',
          description: '将一个创意想法转化为实际作品',
          category: 'creative',
          difficulty: 'medium',
          estimatedTime: 90,
          aiReason: '符合艺术家特质',
          priority: 8,
          tags: ['创作', '灵感实现']
        }
      ],
      socialite: [
        {
          title: '组织社交活动',
          description: '计划或参与一次社交聚会或活动',
          category: 'social',
          difficulty: 'medium',
          estimatedTime: 120,
          aiReason: '符合社交家特质',
          priority: 7,
          tags: ['社交活动', '人际交往']
        }
      ],
      explorer: [
        {
          title: '探索新地方',
          description: '去一个从未去过的地方或尝试新的路线',
          category: 'adventure',
          difficulty: 'medium',
          estimatedTime: 60,
          aiReason: '符合探险家特质',
          priority: 8,
          tags: ['探索', '冒险']
        }
      ]
    };

    if (characterTasks[characterType]) {
      tasks.push(...characterTasks[characterType]);
    }

    return tasks;
  }

  /**
   * 基于用户历史行为生成任务
   */
  generateBehaviorBasedTasks(userStats) {
    const tasks = [];

    // 基于任务完成情况
    if (userStats.tasksCompleted < 5) {
      tasks.push({
        title: '建立任务完成习惯',
        description: '今天至少完成2个小任务',
        category: 'productivity',
        difficulty: 'easy',
        estimatedTime: 45,
        aiReason: '建立任务完成习惯',
        priority: 9,
        tags: ['习惯建立', '生产力']
      });
    }

    // 基于习惯坚持情况
    if (userStats.maxHabitStreak < 7) {
      tasks.push({
        title: '习惯坚持挑战',
        description: '选择一个习惯并连续坚持3天',
        category: 'habit',
        difficulty: 'medium',
        estimatedTime: 30,
        aiReason: '提升习惯坚持能力',
        priority: 8,
        tags: ['习惯坚持', '毅力培养']
      });
    }

    // 社交功能已移除

    return tasks;
  }

  /**
   * 基于季节性活动生成任务
   */
  generateSeasonalTasks() {
    const tasks = [];
    const seasonalEvents = this.getSeasonalEvents();
    const currentSeason = seasonalEvents.currentSeason;

    const seasonalTaskTemplates = {
      spring: [
        {
          title: '春季大扫除',
          description: '整理房间或工作空间，迎接新的开始',
          category: 'organization',
          difficulty: 'medium',
          estimatedTime: 60,
          aiReason: '春季清新开始',
          priority: 6,
          tags: ['整理', '新开始']
        }
      ],
      summer: [
        {
          title: '户外活动时间',
          description: '在阳光下进行30分钟的户外活动',
          category: 'fitness',
          difficulty: 'easy',
          estimatedTime: 30,
          aiReason: '享受夏日阳光',
          priority: 7,
          tags: ['户外', '阳光']
        }
      ],
      autumn: [
        {
          title: '收获总结时刻',
          description: '回顾并记录这个月的成长和收获',
          category: 'reflection',
          difficulty: 'easy',
          estimatedTime: 20,
          aiReason: '秋季收获反思',
          priority: 6,
          tags: ['反思', '总结']
        }
      ],
      winter: [
        {
          title: '温暖的室内时光',
          description: '在家中进行一项温馨的活动，如阅读或手工',
          category: 'wellness',
          difficulty: 'easy',
          estimatedTime: 45,
          aiReason: '冬日温暖时光',
          priority: 5,
          tags: ['温暖', '室内活动']
        }
      ]
    };

    if (seasonalTaskTemplates[currentSeason]) {
      tasks.push(...seasonalTaskTemplates[currentSeason]);
    }

    return tasks;
  }

  /**
   * 去重并排序任务
   */
  deduplicateAndRankTasks(tasks, userProfile, userStats) {
    // 去重（基于标题）
    const uniqueTasks = tasks.filter((task, index, self) =>
      index === self.findIndex(t => t.title === task.title)
    );

    // 基于用户偏好调整优先级
    uniqueTasks.forEach(task => {
      // 基于活跃时间调整优先级
      if (userProfile.preferences.activeTime === 'morning' && task.estimatedTime <= 30) {
        task.priority += 1;
      }

      // 基于难度偏好调整优先级
      if (userProfile.preferences.difficulty === 'easy' && task.difficulty === 'easy') {
        task.priority += 1;
      } else if (userProfile.preferences.difficulty === 'hard' && task.difficulty === 'hard') {
        task.priority += 1;
      }

      // 基于关注领域调整优先级
      if (userProfile.preferences.focusAreas.includes(task.category)) {
        task.priority += 2;
      }
    });

    // 按优先级排序
    return uniqueTasks.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 获取AI任务推荐
   */
  getAITaskRecommendations() {
    try {
      // 降级到本地算法
      const aiTasks = this.generateAITasks();

      // 添加推荐理由和个性化说明
      const recommendations = aiTasks.map(task => ({
        ...task,
        id: 'ai_task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        source: 'ai_generated',
        generatedAt: new Date().toISOString(),
        personalizedReason: this.generatePersonalizedReason(task),
        estimatedReward: this.calculateTaskReward(task)
      }));

      return recommendations;
    } catch (error) {
      console.error('获取AI任务推荐失败:', error);
      return [];
    }
  }

  /**
   * 生成个性化推荐理由
   */
  generatePersonalizedReason(task) {
    const reasons = [
      `基于你的${task.aiReason}需求，这个任务很适合你`,
      `根据你的行为模式分析，建议尝试这个任务`,
      `这个任务能帮助你在${task.category}方面取得进步`,
      `考虑到你的当前状态，这是一个很好的选择`
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  /**
   * 计算任务奖励
   */
  calculateTaskReward(task) {
    const baseReward = {
      experience: 50,
      coins: 20
    };

    // 基于难度调整奖励
    const difficultyMultiplier = {
      'easy': 1,
      'medium': 1.5,
      'hard': 2
    };

    const multiplier = difficultyMultiplier[task.difficulty] || 1;

    return {
      experience: Math.floor(baseReward.experience * multiplier),
      coins: Math.floor(baseReward.coins * multiplier)
    };
  }

  /**
   * 获取用户统计数据
   */
  getUserStats() {
    try {
      // 获取各种服务的统计数据
      let rewardService, socialService;

      try {
        rewardService = require('./reward-service.js');
      } catch (error) {
        console.error('无法加载奖励服务:', error);
        rewardService = null;
      }

      // 社交服务已移除
      socialService = null;

      const userRewards = rewardService ? rewardService.getUserRewards() : {
        level: 1,
        experience: 0,
        statistics: {
          totalTasksCompleted: 0,
          maxHabitStreak: 0,
          achievementsUnlocked: 0
        }
      };

      const socialData = socialService ? socialService.getUserSocialData() : {
        statistics: {
          totalFriends: 0,
          socialPoints: 0
        }
      };

      return {
        level: userRewards.level || 1,
        experience: userRewards.experience || 0,
        tasksCompleted: userRewards.statistics?.totalTasksCompleted || 0,
        maxHabitStreak: userRewards.statistics?.maxHabitStreak || 0,
        friendsCount: socialData.statistics?.totalFriends || 0,
        achievementsUnlocked: userRewards.statistics?.achievementsUnlocked || 0,
        socialPoints: socialData.statistics?.socialPoints || 0
      };
    } catch (error) {
      console.error('获取用户统计数据失败:', error);
      return {
        level: 1,
        experience: 0,
        tasksCompleted: 0,
        maxHabitStreak: 0,
        friendsCount: 0,
        achievementsUnlocked: 0,
        socialPoints: 0
      };
    }
  }

  /**
   * 检查解锁条件
   */
  checkUnlockConditions(conditions, userStats) {
    for (const [key, value] of Object.entries(conditions)) {
      if (userStats[key] < value) {
        return false;
      }
    }
    return true;
  }

  /**
   * 获取故事类型信息
   */
  getStoryTypes() {
    return this.storyTypes;
  }

  /**
   * 获取角色类型信息
   */
  getCharacterTypes() {
    return this.characterTypes;
  }

  /**
   * 获取故事章节信息
   */
  getStoryChapters() {
    return this.storyChapters;
  }

  /**
   * 完成故事章节
   */
  completeChapter(chapterId) {
    try {
      const progress = this.getUserStoryProgress();
      const chapter = this.storyChapters[chapterId];

      if (!chapter) {
        return { success: false, error: '章节不存在' };
      }

      if (!progress.unlockedChapters.includes(chapterId)) {
        return { success: false, error: '章节未解锁' };
      }

      if (progress.completedChapters.includes(chapterId)) {
        return { success: false, error: '章节已完成' };
      }

      // 标记章节为已完成
      progress.completedChapters.push(chapterId);
      progress.storyPoints += 100;

      // 给予章节奖励
      if (chapter.rewards) {
        try {
          const rewardService = require('./reward-service.js');
          if (rewardService && typeof rewardService.giveRewards === 'function') {
            rewardService.giveRewards(chapter.rewards);
          }
        } catch (error) {
          console.error('给予章节奖励失败:', error);
        }
      }

      // 记录完成活动
      try {
        const userService = require('./user-service.js');
        if (userService && typeof userService.recordUserActivity === 'function') {
          userService.recordUserActivity('story_completed', {
            chapterId: chapterId,
            chapterTitle: chapter.title,
            chapterType: chapter.type,
            rewards: chapter.rewards
          });
        }
      } catch (error) {
        console.error('记录故事完成活动失败:', error);
      }

      this.saveUserStoryProgress(progress);

      return {
        success: true,
        chapter: chapter,
        progress: progress,
        message: '章节完成！'
      };
    } catch (error) {
      console.error('完成章节失败:', error);
      return { success: false, error: '完成章节失败' };
    }
  }

  /**
   * 获取个性化推荐
   */
  getPersonalizedRecommendations() {
    try {
      // 尝试使用AI生成个性化推荐
      return this.getAIPersonalizedRecommendationsSync();
    } catch (error) {
      console.error('AI个性化推荐失败，使用本地算法:', error);
      return this.getLocalPersonalizedRecommendations();
    }
  }

  /**
   * 获取AI驱动的个性化推荐（同步版本）
   */
  getAIPersonalizedRecommendationsSync() {
    const userProfile = this.getUserProfile();
    const userStats = this.getUserStats();
    const emotionalState = this.getEmotionalState();
    const characterGrowth = this.getCharacterGrowthTracking();

    // 基于AI任务推荐生成个性化推荐
    const aiTasks = this.getAITaskRecommendations();

    const recommendations = {
      tasks: [],
      habits: [],
      tips: [],
      characterAdvice: ''
    };

    // 从AI任务中提取推荐任务
    if (aiTasks && aiTasks.length > 0) {
      recommendations.tasks = aiTasks.slice(0, 3).map(task => task.title);
    }

    // 生成AI驱动的习惯推荐
    recommendations.habits = this.generateAIHabits(userProfile, emotionalState, characterGrowth);

    // 生成AI驱动的提示
    recommendations.tips = this.generateAITips(userProfile, emotionalState, characterGrowth);

    // 生成AI驱动的角色建议
    recommendations.characterAdvice = this.generateAICharacterAdvice(userProfile, characterGrowth);

    return recommendations;
  }

  /**
   * 获取本地个性化推荐（降级方案）
   */
  getLocalPersonalizedRecommendations() {
    try {
      const userProfile = this.getUserProfile();
      const userStats = this.getUserStats();
      const recommendations = {
        tasks: [],
        habits: [],
        tips: [],
        characterAdvice: ''
      };

      // 基于用户配置生成推荐
      Object.values(this.recommendationRules).forEach(rule => {
        if (rule.condition(userProfile)) {
          recommendations.tasks.push(...rule.recommendations.tasks);
          recommendations.habits.push(...rule.recommendations.habits);
          recommendations.tips.push(rule.recommendations.tips);
        }
      });

      // 基于角色类型的建议
      const characterType = this.characterTypes[userProfile.characterType];
      if (characterType) {
        recommendations.characterAdvice = `作为${characterType.name}，你的优势在于${this.getCharacterStrengths(characterType)}。建议多尝试${characterType.preferredTasks.join('、')}类型的任务。`;
      }

      // 去重并限制数量
      recommendations.tasks = [...new Set(recommendations.tasks)].slice(0, 5);
      recommendations.habits = [...new Set(recommendations.habits)].slice(0, 5);
      recommendations.tips = [...new Set(recommendations.tips)].slice(0, 3);

      return recommendations;
    } catch (error) {
      console.error('获取个性化推荐失败:', error);
      return {
        tasks: [],
        habits: [],
        tips: [],
        characterAdvice: ''
      };
    }
  }

  /**
   * 生成AI驱动的习惯推荐
   */
  generateAIHabits(userProfile, emotionalState, characterGrowth) {
    const habits = [];

    // 基于情感状态推荐习惯
    if (emotionalState.metrics.stress > 60) {
      habits.push('每日10分钟冥想', '睡前深呼吸练习');
    }

    if (emotionalState.metrics.motivation < 50) {
      habits.push('晨间积极肯定', '每日记录三件好事');
    }

    // 基于角色成长推荐习惯
    if (characterGrowth.growthMetrics.discipline < 60) {
      habits.push('制定每日计划', '番茄工作法练习');
    }

    if (characterGrowth.growthMetrics.creativity < 60) {
      habits.push('每日创意写作', '尝试新的艺术形式');
    }

    // 基于角色类型推荐习惯
    if (userProfile.characterType === 'explorer') {
      habits.push('每周尝试新事物', '记录探索日志');
    } else if (userProfile.characterType === 'achiever') {
      habits.push('设定周目标', '追踪成就进度');
    } else if (userProfile.characterType === 'socializer') {
      habits.push('每日社交互动', '分享学习心得');
    } else if (userProfile.characterType === 'thinker') {
      habits.push('每日反思时间', '知识点总结');
    }

    return [...new Set(habits)].slice(0, 4);
  }

  /**
   * 生成AI驱动的提示
   */
  generateAITips(userProfile, emotionalState, characterGrowth) {
    const tips = [];

    // 基于当前状态的智能提示
    if (emotionalState.primaryEmotion === 'stressed') {
      tips.push('压力过大时，试试4-7-8呼吸法：吸气4秒，憋气7秒，呼气8秒');
    }

    if (characterGrowth.overallProgress < 30) {
      tips.push('成长是一个渐进的过程，每天进步一点点就是巨大的成功');
    }

    // 基于时间的智能提示
    const hour = new Date().getHours();
    if (hour < 12) {
      tips.push('早晨是大脑最活跃的时候，适合处理重要任务');
    } else if (hour < 18) {
      tips.push('下午适合进行创造性工作和学习新技能');
    } else {
      tips.push('晚上是反思和规划的好时机，为明天做准备');
    }

    return tips.slice(0, 3);
  }

  /**
   * 生成AI驱动的角色建议
   */
  generateAICharacterAdvice(userProfile, characterGrowth) {
    const characterType = this.characterTypes[userProfile.characterType];
    if (!characterType) {
      return '继续保持你的成长节奏，每一步都在让你变得更好！';
    }

    const strengths = this.getCharacterStrengths(characterType);
    const weakestMetric = Object.entries(characterGrowth.growthMetrics)
      .sort(([,a], [,b]) => a - b)[0];

    if (weakestMetric) {
      const [metric, value] = weakestMetric;
      const metricNames = {
        strength: '力量',
        wisdom: '智慧',
        creativity: '创造力',
        social: '社交能力',
        discipline: '自律性'
      };

      return `作为${characterType.name}，你的${strengths}很出色！建议重点提升${metricNames[metric] || metric}，这将让你的成长更加均衡。`;
    }

    return `作为${characterType.name}，你在${strengths}方面表现优秀，继续发挥这些优势，同时保持全面发展！`;
  }

  /**
   * 异步获取AI个性化推荐
   */
  async getPersonalizedRecommendationsAsync() {
    try {
      console.log('🤖 开始生成AI个性化推荐...');

      const userProfile = this.getUserProfile();
      const userStats = this.getUserStats();
      const emotionalState = this.getEmotionalState();
      const characterGrowth = this.getCharacterGrowthTracking();

      // 获取AI任务推荐
      let aiTasks = [];
      try {
        aiTasks = await this.getAITaskRecommendationsAsync();
      } catch (error) {
        console.error('获取AI任务失败，使用本地任务:', error);
        aiTasks = this.getAITaskRecommendations();
      }

      const recommendations = {
        tasks: [],
        habits: [],
        tips: [],
        characterAdvice: ''
      };

      // 从AI任务中提取推荐任务
      if (aiTasks && aiTasks.length > 0) {
        recommendations.tasks = aiTasks.slice(0, 4).map(task => task.title);
      } else {
        // 降级到本地任务推荐
        recommendations.tasks = [
          '完成一个小目标',
          '学习新知识15分钟',
          '整理个人空间',
          '进行体能锻炼'
        ];
      }

      // 生成AI驱动的习惯推荐
      recommendations.habits = this.generateAIHabits(userProfile, emotionalState, characterGrowth);

      // 生成AI驱动的提示
      recommendations.tips = this.generateAITips(userProfile, emotionalState, characterGrowth);

      // 生成AI驱动的角色建议
      recommendations.characterAdvice = this.generateAICharacterAdvice(userProfile, characterGrowth);

      console.log('✅ AI个性化推荐生成成功');
      return recommendations;

    } catch (error) {
      console.error('❌ AI个性化推荐失败，降级到本地算法:', error);
      return this.getLocalPersonalizedRecommendations();
    }
  }

  /**
   * 获取角色优势描述
   */
  getCharacterStrengths(characterType) {
    const attributes = characterType.attributes;
    const maxAttr = Object.keys(attributes).reduce((a, b) =>
      attributes[a] > attributes[b] ? a : b
    );

    const strengthMap = {
      strength: '坚韧不拔和执行力',
      wisdom: '学习能力和深度思考',
      creativity: '创新思维和艺术感知',
      social: '人际交往和团队协作'
    };

    return strengthMap[maxAttr] || '全面发展';
  }

  /**
   * 生成每日个性化内容
   */
  generateDailyContent() {
    try {
      const userProfile = this.getUserProfile();
      const userStats = this.getUserStats();
      const progress = this.getUserStoryProgress();

      const dailyContent = {
        greeting: this.generatePersonalizedGreeting(userProfile, userStats),
        motivation: this.generateMotivationalMessage(userProfile, userStats),
        suggestion: this.generateDailySuggestion(userProfile, userStats),
        storyUpdate: this.generateStoryUpdate(progress),
        date: new Date().toISOString().split('T')[0]
      };

      return dailyContent;
    } catch (error) {
      console.error('生成每日内容失败:', error);
      return {
        greeting: '早上好，冒险者！',
        motivation: '今天也要加油哦！',
        suggestion: '记得完成你的日常任务。',
        storyUpdate: '',
        date: new Date().toISOString().split('T')[0]
      };
    }
  }

  /**
   * 生成个性化问候语
   */
  generatePersonalizedGreeting(userProfile, userStats) {
    const characterType = this.characterTypes[userProfile.characterType];
    const timeOfDay = new Date().getHours();

    let timeGreeting = '';
    if (timeOfDay < 12) {
      timeGreeting = '早上好';
    } else if (timeOfDay < 18) {
      timeGreeting = '下午好';
    } else {
      timeGreeting = '晚上好';
    }

    const characterGreetings = {
      'warrior': `${timeGreeting}，勇敢的战士！准备好迎接新的挑战了吗？`,
      'scholar': `${timeGreeting}，智慧的学者！今天又有什么新知识等待你去探索呢？`,
      'artist': `${timeGreeting}，富有创意的艺术家！让我们用创造力点亮这一天吧！`,

      'explorer': `${timeGreeting}，无畏的探险家！新的冒险正在前方等待着你！`
    };

    return characterGreetings[userProfile.characterType] || `${timeGreeting}，冒险者！`;
  }

  /**
   * 生成激励消息
   */
  generateMotivationalMessage(userProfile, userStats) {
    const messages = [
      `你已经完成了${userStats.tasksCompleted}个任务，每一步都让你更强大！`,
      `${userStats.level}级的实力不是一天练成的，继续保持这份坚持！`,
      `最长连续${userStats.maxHabitStreak}天的习惯坚持，证明了你的毅力！`,
      `${userStats.friendsCount}个好友与你同行，你并不孤单！`,
      '每一个小小的进步，都是通往成功的重要一步。'
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * 生成每日建议
   */
  generateDailySuggestion(userProfile, userStats) {
    const suggestions = {
      'morning': '早晨是一天中精力最充沛的时候，适合处理重要任务。',
      'afternoon': '下午适合进行需要专注的学习和工作。',
      'night': '夜晚是反思和规划的好时机，记得整理今天的收获。'
    };

    const timeOfDay = new Date().getHours();
    let period = 'morning';
    if (timeOfDay >= 12 && timeOfDay < 18) {
      period = 'afternoon';
    } else if (timeOfDay >= 18) {
      period = 'night';
    }

    return suggestions[period];
  }

  /**
   * 生成故事更新
   */
  generateStoryUpdate(progress) {
    const unlockedCount = progress.unlockedChapters.length;
    const completedCount = progress.completedChapters.length;

    if (completedCount === 0) {
      return '你的冒险故事即将开始，准备好了吗？';
    } else if (unlockedCount > completedCount) {
      return `你有${unlockedCount - completedCount}个新章节等待探索！`;
    } else {
      return `你已经完成了${completedCount}个章节，继续你的精彩故事吧！`;
    }
  }

  /**
   * 动态生成个性化故事章节
   */
  generatePersonalizedChapter(userStats, userProfile) {
    try {
      const characterType = this.characterTypes[userProfile.characterType];
      const storyTemplates = this.getStoryTemplates();

      // 根据用户成就生成故事
      const achievements = this.analyzeUserAchievements(userStats);
      const storyType = this.determineStoryType(achievements, userStats);

      const chapter = {
        id: 'generated_' + Date.now(),
        title: this.generateChapterTitle(achievements, characterType),
        type: storyType,
        order: Object.keys(this.storyChapters).length + 1,
        description: this.generateChapterDescription(achievements, characterType),
        content: this.generateChapterContent(achievements, characterType, userStats),
        unlockConditions: this.generateUnlockConditions(userStats),
        rewards: this.generateChapterRewards(achievements),
        isUnlocked: true,
        isCompleted: false,
        isGenerated: true,
        generatedAt: new Date().toISOString()
      };

      return chapter;
    } catch (error) {
      console.error('生成个性化章节失败:', error);
      return null;
    }
  }

  /**
   * 分析用户成就
   */
  analyzeUserAchievements(userStats) {
    const achievements = [];

    // 任务成就
    if (userStats.tasksCompleted >= 10) {
      achievements.push({ type: 'task_master', level: Math.floor(userStats.tasksCompleted / 10) });
    }

    // 习惯成就
    if (userStats.maxHabitStreak >= 7) {
      achievements.push({ type: 'habit_keeper', level: Math.floor(userStats.maxHabitStreak / 7) });
    }

    // 等级成就
    if (userStats.level >= 3) {
      achievements.push({ type: 'level_achiever', level: userStats.level });
    }

    // 社交成就
    if (userStats.friendsCount >= 1) {
      achievements.push({ type: 'social_connector', level: userStats.friendsCount });
    }

    return achievements;
  }

  /**
   * 确定故事类型
   */
  determineStoryType(achievements, userStats) {
    if (achievements.length >= 3) return 'achievement';
    if (userStats.friendsCount > 0) return 'side';
    if (userStats.maxHabitStreak >= 7) return 'daily';
    return 'main';
  }

  /**
   * 生成章节标题
   */
  generateChapterTitle(achievements, characterType) {
    const titleTemplates = {
      'warrior': [
        '勇者的试炼',
        '战士的荣耀',
        '不屈的意志',
        '胜利的号角'
      ],
      'scholar': [
        '智慧的光芒',
        '知识的宝库',
        '学者的觉醒',
        '真理的追求'
      ],
      'artist': [
        '创意的火花',
        '艺术的绽放',
        '灵感的源泉',
        '美的创造'
      ],
      'socialite': [
        '友谊的桥梁',
        '社交的艺术',
        '人际的和谐',
        '团队的力量'
      ],
      'explorer': [
        '未知的征程',
        '探索的勇气',
        '发现的喜悦',
        '冒险的召唤'
      ]
    };

    const templates = titleTemplates[characterType.id] || titleTemplates['explorer'];
    const randomTitle = templates[Math.floor(Math.random() * templates.length)];

    // 根据成就添加前缀
    if (achievements.length >= 3) {
      return `传奇篇：${randomTitle}`;
    } else if (achievements.length >= 2) {
      return `进阶篇：${randomTitle}`;
    } else {
      return `成长篇：${randomTitle}`;
    }
  }

  /**
   * 生成章节描述
   */
  generateChapterDescription(achievements, characterType) {
    const achievementTexts = achievements.map(achievement => {
      switch (achievement.type) {
        case 'task_master':
          return `完成了${achievement.level * 10}个任务`;
        case 'habit_keeper':
          return `坚持习惯${achievement.level * 7}天`;
        case 'level_achiever':
          return `达到${achievement.level}级`;
        case 'social_connector':
          return `结交了${achievement.level}个好友`;
        default:
          return '取得了重要进展';
      }
    });

    if (achievementTexts.length > 0) {
      return `你${achievementTexts.join('，')}，展现了${characterType.name}的品质。`;
    } else {
      return `作为${characterType.name}，你正在书写属于自己的传奇。`;
    }
  }

  /**
   * 生成章节内容
   */
  generateChapterContent(achievements, characterType, userStats) {
    const contentTemplates = {
      'warrior': {
        opening: '在成长的战场上，你如同一位勇敢的战士，',
        middle: '每一次挑战都让你变得更加强大，每一个困难都成为你前进的动力。',
        ending: '你的坚韧不拔和勇敢无畏，正是真正勇士的品质。继续前行，更大的胜利在等待着你！'
      },
      'scholar': {
        opening: '在知识的海洋中，你如同一位睿智的学者，',
        middle: '每一次学习都让你的智慧更加深邃，每一个发现都拓展着你的视野。',
        ending: '你对知识的渴望和深度思考的能力，正是真正学者的特质。继续探索，更多的真理等待你去发现！'
      },
      'artist': {
        opening: '在创造的世界里，你如同一位富有灵感的艺术家，',
        middle: '每一次创作都展现着你独特的视角，每一个作品都诉说着你内心的故事。',
        ending: '你的创造力和艺术感知，正是真正艺术家的天赋。继续创作，更美的作品等待你去完成！'
      },
      'socialite': {
        opening: '在人际的舞台上，你如同一位魅力四射的社交家，',
        middle: '每一次交流都建立着新的联系，每一个朋友都丰富着你的人生。',
        ending: '你的沟通能力和人际魅力，正是真正社交家的优势。继续连接，更多的友谊等待你去建立！'
      },
      'explorer': {
        opening: '在未知的道路上，你如同一位无畏的探险家，',
        middle: '每一次探索都带来新的发现，每一个未知都激发着你的好奇心。',
        ending: '你的冒险精神和探索勇气，正是真正探险家的品格。继续前行，更多的奇迹等待你去发现！'
      }
    };

    const template = contentTemplates[characterType.id] || contentTemplates['explorer'];

    // 根据成就生成中间内容
    let middleContent = template.middle;
    if (achievements.length > 0) {
      const achievementDescriptions = achievements.map(achievement => {
        switch (achievement.type) {
          case 'task_master':
            return `你已经完成了${achievement.level * 10}个任务，展现了出色的执行力`;
          case 'habit_keeper':
            return `你坚持习惯${achievement.level * 7}天，体现了强大的自律性`;
          case 'level_achiever':
            return `你达到了${achievement.level}级，证明了持续的成长`;
          case 'social_connector':
            return `你结交了${achievement.level}个好友，建立了珍贵的友谊`;
          default:
            return '你取得了重要的进展';
        }
      });

      middleContent = achievementDescriptions.join('。') + '。' + template.middle;
    }

    return template.opening + middleContent + template.ending;
  }

  /**
   * 生成解锁条件
   */
  generateUnlockConditions(userStats) {
    // 动态生成的章节通常基于当前成就，所以解锁条件相对宽松
    return {
      tasksCompleted: Math.max(1, userStats.tasksCompleted - 2),
      level: Math.max(1, userStats.level - 1)
    };
  }

  /**
   * 生成章节奖励
   */
  generateChapterRewards(achievements) {
    const baseReward = { coins: 200, experience: 100 };

    // 根据成就数量增加奖励
    const multiplier = 1 + (achievements.length * 0.5);

    return {
      coins: Math.floor(baseReward.coins * multiplier),
      experience: Math.floor(baseReward.experience * multiplier)
    };
  }

  /**
   * 获取故事模板
   */
  getStoryTemplates() {
    return {
      achievement: {
        themes: ['成就', '荣耀', '突破', '里程碑'],
        moods: ['激励', '庆祝', '自豪', '感激']
      },
      growth: {
        themes: ['成长', '进步', '蜕变', '觉醒'],
        moods: ['温暖', '鼓励', '希望', '坚定']
      },
      adventure: {
        themes: ['冒险', '探索', '发现', '挑战'],
        moods: ['兴奋', '好奇', '勇敢', '期待']
      }
    };
  }

  /**
   * 异步获取AI任务推荐
   */
  async getAITaskRecommendationsAsync() {
    try {
      console.log('🤖 尝试使用ChatAnywhere AI生成任务推荐...');

      // 获取用户数据
      const userProfile = this.getUserProfile();
      const userStats = this.getUserStats();
      const emotionalState = this.getEmotionalState();
      const characterGrowth = this.getCharacterGrowthTracking();

      // 尝试加载ChatAnywhere AI服务
      let chatAnywhereAI;
      try {
        chatAnywhereAI = require('./deepseek-ai-service.js'); // 文件名保持不变，但实际是ChatAnywhere服务
      } catch (requireError) {
        console.error('无法加载ChatAnywhere AI服务:', requireError);
        throw new Error('AI服务不可用');
      }

      // 调用AI服务生成推荐
      const aiRecommendations = await chatAnywhereAI.generateTaskRecommendations(
        userProfile,
        emotionalState,
        characterGrowth,
        userStats
      );

      if (aiRecommendations && aiRecommendations.length > 0) {
        console.log('✅ ChatAnywhere AI推荐生成成功:', aiRecommendations.length, '个任务');
        return aiRecommendations;
      } else {
        throw new Error('AI返回空推荐');
      }

    } catch (error) {
      console.error('❌ AI任务推荐失败，降级到本地算法:', error);

      // 降级到本地算法
      const localTasks = this.generateAITasks();

      // 添加AI标识，区分不同的降级原因
      const aiNote = error.message.includes('请等待') || error.message.includes('Rate limit') ?
        'API调用频率限制，已使用本地智能算法' :
        '当前使用本地算法，AI服务暂不可用';

      return localTasks.map(task => ({
        ...task,
        source: 'local_fallback',
        aiNote: aiNote
      }));
    }
  }
}

// 导出单例实例
try {
  const storyService = new StoryService();
  module.exports = storyService;
} catch (error) {
  console.error('故事服务创建失败:', error);
  // 导出一个空的服务对象，避免require失败
  module.exports = {
    getUserStoryProgress: () => ({ completedChapters: [], unlockedChapters: ['prologue'], totalProgress: 0 }),
    getStoryChapters: () => ({}),
    getStoryTypes: () => ({}),
    getCharacterTypes: () => ({}),
    generateDailyContent: () => ({ greeting: '欢迎回来！', motivation: '继续加油！' }),
    getPersonalizedRecommendations: () => ({ tasks: [], habits: [], tips: [] }),
    getSeasonalEvents: () => ({ currentSeason: 'spring', activeEvents: [], upcomingEvents: [] }),
    getActiveRandomEvents: () => [],
    getEmotionalState: () => ({ metrics: {}, primaryEmotion: 'balanced', advice: '' }),
    getCharacterGrowthTracking: () => ({ growthMetrics: {}, overallProgress: 0 }),
    getAITaskRecommendations: () => [],
    updateStoryProgress: () => ({ success: true, hasUpdates: false }),
    generateRandomEvent: () => null,
    completeRandomEvent: () => ({ success: false, error: '服务不可用' }),
    activateSeasonalEvent: () => ({ success: false, error: '服务不可用' }),
    completeChapter: () => ({ success: false, error: '服务不可用' }),
    generatePersonalizedChapter: () => null,
    saveGeneratedChapter: () => false,
    getUserProfile: () => ({ characterType: 'explorer', preferences: {} }),
    saveUserProfile: () => false,
    getUserStats: () => ({ level: 1, experience: 0, tasksCompleted: 0, maxHabitStreak: 0, friendsCount: 0 })
  };
}

// 导出单例实例
try {
  const storyService = new StoryService();
  module.exports = storyService;
} catch (error) {
  console.error('故事服务创建失败:', error);
  // 导出一个空的服务对象，避免require失败
  module.exports = {
    getUserStoryProgress: () => ({ completedChapters: [], unlockedChapters: ['prologue'], totalProgress: 0 }),
    getStoryChapters: () => ({}),
    getStoryTypes: () => ({}),
    getCharacterTypes: () => ({}),
    generateDailyContent: () => ({ greeting: '欢迎回来！', motivation: '继续加油！' }),
    getPersonalizedRecommendations: () => ({
      tasks: [
        '完成一个小目标',
        '学习新知识15分钟',
        '整理个人空间',
        '进行体能锻炼'
      ],
      habits: [
        '每日10分钟冥想',
        '制定每日计划',
        '记录三件好事',
        '晨间积极肯定'
      ],
      tips: [
        '成长是一个渐进的过程，每天进步一点点就是巨大的成功',
        '早晨是大脑最活跃的时候，适合处理重要任务',
        '压力过大时，试试深呼吸放松'
      ],
      characterAdvice: '继续保持你的成长节奏，每一步都在让你变得更好！'
    }),
    getPersonalizedRecommendationsAsync: async () => ({
      tasks: [
        '完成一个小目标',
        '学习新知识15分钟',
        '整理个人空间',
        '进行体能锻炼'
      ],
      habits: [
        '每日10分钟冥想',
        '制定每日计划',
        '记录三件好事',
        '晨间积极肯定'
      ],
      tips: [
        '成长是一个渐进的过程，每天进步一点点就是巨大的成功',
        '早晨是大脑最活跃的时候，适合处理重要任务',
        '压力过大时，试试深呼吸放松'
      ],
      characterAdvice: '继续保持你的成长节奏，每一步都在让你变得更好！'
    }),
    getSeasonalEvents: () => ({ currentSeason: 'spring', activeEvents: [], upcomingEvents: [] }),
    getActiveRandomEvents: () => [],
    getEmotionalState: () => ({ metrics: {}, primaryEmotion: 'balanced', advice: '' }),
    getCharacterGrowthTracking: () => ({ growthMetrics: {}, overallProgress: 0 }),
    getAITaskRecommendations: () => [],
    getAITaskRecommendationsAsync: async () => [],
    updateStoryProgress: () => ({ success: true, hasUpdates: false }),
    generateRandomEvent: () => null,
    completeRandomEvent: () => ({ success: false, error: '服务不可用' }),
    activateSeasonalEvent: () => ({ success: false, error: '服务不可用' }),
    completeChapter: () => ({ success: false, error: '服务不可用' }),
    generatePersonalizedChapter: () => null,
    saveGeneratedChapter: () => false,
    getUserProfile: () => ({ characterType: 'explorer', preferences: {} }),
    saveUserProfile: () => false,
    getUserStats: () => ({ level: 1, experience: 0, tasksCompleted: 0, maxHabitStreak: 0, friendsCount: 0 })
  };
}
