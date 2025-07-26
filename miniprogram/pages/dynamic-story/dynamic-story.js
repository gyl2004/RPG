// 动态故事页面
const characterService = require('../../services/character-service.js');

Page({
  data: {
    character: null,
    currentStory: null,
    storyHistory: [],
    todayActions: {
      completedTasks: [],
      completedHabits: []
    },
    collectedItems: [],
    generating: false,
    showHistoryModal: false,
    showDataSource: false
  },

  onLoad() {
    this.loadUserData();
    this.loadStoryHistory();
  },

  onShow() {
    this.loadUserData();
  },

  /**
   * 加载用户数据
   */
  loadUserData() {
    try {
      const character = characterService.getCurrentCharacter();
      if (character) {
        // 获取今日行为数据
        const todayActions = this.getTodayActions(character);
        const collectedItems = character.collectedItems || [];

        this.setData({
          character,
          todayActions,
          collectedItems
        });
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'error'
      });
    }
  },

  /**
   * 获取今日行为数据
   */
  getTodayActions(character) {
    const today = new Date().toDateString();
    
    // 从角色数据中获取今日完成的任务和习惯
    const todayTasks = (character.completedTasks || []).filter(task => 
      new Date(task.completedAt).toDateString() === today
    );
    
    const todayHabits = (character.completedHabits || []).filter(habit => 
      new Date(habit.completedAt).toDateString() === today
    );

    return {
      completedTasks: todayTasks,
      completedHabits: todayHabits
    };
  },

  /**
   * 加载故事历史
   */
  loadStoryHistory() {
    try {
      const character = characterService.getCurrentCharacter();
      console.log('当前角色数据:', character);

      if (character && character.storyHistory) {
        console.log('故事历史数据:', character.storyHistory);

        const sortedHistory = character.storyHistory.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        console.log('排序后的故事历史:', sortedHistory);

        this.setData({
          storyHistory: sortedHistory
        });
      } else {
        console.log('没有故事历史数据');
      }
    } catch (error) {
      console.error('加载故事历史失败:', error);
    }
  },



  /**
   * 生成今日故事
   */
  async generateTodayStory() {
    if (this.data.generating) return;

    try {
      this.setData({ generating: true });

      const { character, todayActions, collectedItems, storyHistory } = this.data;
      
      // 检查是否有足够的数据生成故事
      if (todayActions.completedTasks.length === 0 && 
          todayActions.completedHabits.length === 0 && 
          collectedItems.length === 0) {
        wx.showModal({
          title: '提示',
          content: '你今天还没有完成任何任务或收藏物品，先去体验一些冒险再来生成故事吧！',
          showCancel: false
        });
        return;
      }

      wx.showLoading({ title: '正在编织你的冒险故事...' });

      // 获取AI服务
      const app = getApp();
      const aiService = app.globalData.aiService;

      let storyResult;
      
      if (aiService) {
        // 使用AI生成故事
        const previousStory = storyHistory.length > 0 ? storyHistory[0] : null;
        
        storyResult = await aiService.generateDynamicStory(
          todayActions,
          character.achievements || [],
          collectedItems,
          character,
          previousStory
        );
      }

      let story;
      if (storyResult && storyResult.success) {
        story = storyResult.story;
        console.log('✅ AI故事生成成功');
      } else {
        console.warn('⚠️ AI生成失败，使用备选方案');
        // 使用备选故事
        story = storyResult?.fallback || this.generateLocalStory();
      }

      // 保存故事到历史
      this.saveStoryToHistory(story);

      this.setData({
        currentStory: story
      });

      wx.showToast({
        title: '故事生成成功！',
        icon: 'success'
      });

    } catch (error) {
      console.error('生成故事失败:', error);
      wx.showToast({
        title: '故事生成失败',
        icon: 'error'
      });
      
      // 使用本地备选故事
      const localStory = this.generateLocalStory();
      this.setData({
        currentStory: localStory
      });

    } finally {
      this.setData({ generating: false });
      wx.hideLoading();
    }
  },

  /**
   * 生成本地故事（备选方案）
   */
  generateLocalStory() {
    const { character, todayActions, collectedItems } = this.data;
    
    const templates = [
      {
        title: '平凡中的不凡',
        content: `${character.name}在今天的冒险中展现了真正的勇者精神。${todayActions.completedTasks.length > 0 ? `通过完成${todayActions.completedTasks.length}个重要任务，你证明了自己的能力和决心。` : ''}${todayActions.completedHabits.length > 0 ? `坚持${todayActions.completedHabits.length}个良好习惯，让你的内在力量不断增长。` : ''}${collectedItems.length > 0 ? `而你收藏的珍贵物品${collectedItems.slice(0, 2).map(item => item.name).join('、')}，似乎都在为即将到来的大冒险做准备。` : ''}在这个充满奇迹的世界里，每一个小小的行动都在编织着属于你的传奇故事。`,
        mood: 'triumphant'
      },
      {
        title: '成长的轨迹',
        content: `在魔法与现实交织的世界中，${character.name}正在书写属于自己的英雄传说。${todayActions.completedTasks.length > 0 ? `今天完成的${todayActions.completedTasks.length}个任务让你在冒险者公会中声名鹊起，` : ''}${todayActions.completedHabits.length > 0 ? `而持续的好习惯为你积累了强大的内在魔力。` : ''}${collectedItems.length > 0 ? `特别是你最近发现的${collectedItems[0]?.name}，它散发着神秘的光芒，预示着更大的冒险即将开始。` : ''}每一天的努力都在为更宏大的命运做准备，你的传奇故事正在徐徐展开。`,
        mood: 'inspiring'
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: Date.now().toString(),
      title: template.title,
      content: template.content,
      mood: template.mood,
      choices: [
        {
          id: 'explore',
          text: '探索神秘的新区域',
          consequence: '可能发现隐藏的宝藏或遇到强大的敌人'
        },
        {
          id: 'social',
          text: '与其他冒险者交流',
          consequence: '获得宝贵的情报和可能的合作机会'
        },
        {
          id: 'training',
          text: '专注于技能提升',
          consequence: '增强能力，为更大的挑战做准备'
        }
      ],
      rewards: {
        experience: Math.max(50, todayActions.completedTasks.length * 25 + todayActions.completedHabits.length * 20),
        items: collectedItems.length > 0 ? [`强化的${collectedItems[0]?.name}`] : ['神秘的护符'],
        skills: ['坚持', '勇气', '智慧']
      },
      nextHints: '你的选择将开启新的冒险篇章，每个决定都将影响你的命运走向...',
      createdAt: new Date().toISOString(),
      type: 'local_generated'
    };
  },

  /**
   * 保存故事到历史
   */
  async saveStoryToHistory(story) {
    try {
      console.log('保存故事到历史:', story);

      const character = characterService.getCurrentCharacter();
      if (!character.storyHistory) {
        character.storyHistory = [];
      }

      // 添加到历史记录
      character.storyHistory.unshift(story);

      // 只保留最近20个故事
      if (character.storyHistory.length > 20) {
        character.storyHistory = character.storyHistory.slice(0, 20);
      }

      await characterService.updateCharacter(character);

      // 同步单个故事到云端
      try {
        await characterService.syncStoryToCloud(story);
      } catch (cloudError) {
        console.warn('云端同步失败，但本地保存成功:', cloudError);
      }

      // 更新本地数据
      this.setData({
        storyHistory: character.storyHistory
      });

      console.log('故事历史更新完成，当前历史数量:', character.storyHistory.length);

    } catch (error) {
      console.error('保存故事历史失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  /**
   * 用户做出选择
   */
  async makeChoice(e) {
    const choice = e.currentTarget.dataset.choice;
    const { currentStory, character } = this.data;

    if (!choice || !currentStory) {
      wx.showToast({
        title: '选择数据错误',
        icon: 'error'
      });
      return;
    }

    try {
      wx.showLoading({ title: '故事发展中...' });

      console.log('用户选择:', choice);
      console.log('当前故事:', currentStory);

      // 获取AI服务
      const app = getApp();
      const aiService = app.globalData.aiService;
      console.log('AI服务状态:', aiService ? '已初始化' : '未初始化');

      let branchResult;

      if (aiService) {
        console.log('调用AI服务生成故事分支...');
        console.log('传入参数 - 当前故事:', currentStory);
        console.log('传入参数 - 用户选择:', choice);
        console.log('传入参数 - 角色数据:', character);

        branchResult = await aiService.generateStoryBranch(
          currentStory,
          choice,
          this.data.todayActions,
          character
        );
        console.log('AI服务返回结果:', branchResult);

        if (branchResult && branchResult.success) {
          console.log('AI生成的故事详情:', branchResult.story);
        } else {
          console.log('AI生成失败，错误信息:', branchResult ? branchResult.error : '无返回结果');
        }
      } else {
        console.log('AI服务未初始化，将使用本地分支');
      }

      let newStory;
      if (branchResult && branchResult.success) {
        // 深拷贝AI生成的故事数据，避免修改原始数据
        newStory = JSON.parse(JSON.stringify(branchResult.story));
        newStory.type = 'ai_generated';
        console.log('✅ AI生成的故事分支 (深拷贝后):', newStory);
        console.log('🔍 AI故事内容长度:', newStory.content ? newStory.content.length : 0);
      } else {
        // 使用备选分支
        console.log('使用本地备选分支...');
        if (branchResult && branchResult.fallback) {
          newStory = branchResult.fallback;
          console.log('✅ 使用AI服务的备选分支:', newStory);
        } else {
          newStory = this.generateLocalBranch(choice);
          console.log('✅ 本地生成的故事分支:', newStory);
        }
        newStory.type = 'local_branch';
      }

      // 验证新故事数据结构
      if (!newStory) {
        throw new Error('故事生成失败');
      }

      // 确保基本字段存在
      if (!newStory.title) {
        newStory.title = '未知的冒险';
      }
      if (!newStory.content) {
        newStory.content = '冒险正在继续...';
      }
      if (!newStory.id) {
        newStory.id = Date.now().toString();
      }
      if (!newStory.createdAt) {
        newStory.createdAt = new Date().toISOString();
      }

      console.log('✅ 故事数据验证通过:', newStory);

      // 保存新故事
      console.log('保存故事到历史...');
      await this.saveStoryToHistory(newStory);

      // 更新当前故事
      console.log('更新当前故事显示...');
      this.setData({
        currentStory: newStory
      });

      console.log('✅ 故事更新完成，当前故事:', this.data.currentStory);

      // 强制刷新页面数据
      setTimeout(() => {
        this.setData({
          currentStory: newStory,
          showDataSource: true  // 显示调试信息
        });
        console.log('🔄 强制刷新页面数据完成');
      }, 100);

      wx.showToast({
        title: '故事继续发展！',
        icon: 'success'
      });

    } catch (error) {
      console.error('生成故事分支失败:', error);
      wx.showToast({
        title: '故事发展失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 生成本地故事分支
   */
  generateLocalBranch(choice) {
    const { character } = this.data;

    console.log('生成本地分支，选择:', choice);

    const branchTemplates = {
      explore: {
        title: '未知的发现',
        content: `${character.name}选择了探索未知的道路。在神秘的迷雾中，你发现了一个古老的遗迹，石墙上刻着远古的符文。你的冒险者直觉告诉你，这里隐藏着重要的秘密。`,
        mood: 'mysterious'
      },
      social: {
        title: '意外的相遇',
        content: `${character.name}选择与其他冒险者交流。在热闹的酒馆里，你遇到了一群经验丰富的冒险者，从他们那里获得了宝贵的建议和线索。`,
        mood: 'friendly'
      },
      training: {
        title: '力量的觉醒',
        content: `${character.name}选择了专注训练。在刻苦的练习中，你感受到了前所未有的力量觉醒，技能得到了显著提升。`,
        mood: 'empowering'
      },
      continue: {
        title: '勇敢前行',
        content: `${character.name}决定继续前进。前方的道路充满未知，但你的决心如钢铁般坚定。每一步都让你更加接近真正的冒险者。`,
        mood: 'determined'
      },
      rest: {
        title: '智慧的休息',
        content: `${character.name}选择了休息恢复。在宁静的时光中，你整理思绪，恢复体力，为即将到来的挑战做好充分准备。`,
        mood: 'peaceful'
      }
    };

    // 获取选择ID，支持字符串或对象格式
    const choiceId = typeof choice === 'string' ? choice : choice.id;
    const template = branchTemplates[choiceId] || branchTemplates.explore;

    console.log('使用模板:', choiceId, template);
    
    const newStory = {
      id: Date.now().toString(),
      title: template.title,
      content: template.content,
      mood: template.mood,
      choices: [
        {
          id: 'continue',
          text: '继续冒险',
          consequence: '迎接新的挑战'
        },
        {
          id: 'rest',
          text: '休息恢复',
          consequence: '为下次冒险做准备'
        },
        {
          id: 'explore_more',
          text: '深入探索',
          consequence: '发现更多秘密'
        }
      ],
      rewards: {
        experience: 75,
        skills: ['决策能力', '适应性']
      },
      nextHints: '你的冒险还在继续，每个选择都将开启新的可能性...',
      createdAt: new Date().toISOString(),
      type: 'local_branch'
    };

    console.log('生成的新故事:', newStory);
    return newStory;
  },

  /**
   * 重新生成故事
   */
  regenerateStory() {
    this.setData({
      currentStory: null
    });
    this.generateTodayStory();
  },

  /**
   * 显示故事历史
   */
  showStoryHistory() {
    this.setData({
      showHistoryModal: true
    });
  },

  /**
   * 关闭故事历史模态框
   */
  closeHistoryModal() {
    this.setData({
      showHistoryModal: false
    });
  },

  /**
   * 选择历史故事
   */
  selectHistoryStory(e) {
    const story = e.currentTarget.dataset.story;
    if (story) {
      console.log('选择历史故事:', story);
      this.setData({
        currentStory: story,
        showHistoryModal: false
      });

      wx.showToast({
        title: '故事已加载',
        icon: 'success'
      });
    }
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止点击模态框内容时关闭模态框
  },

  /**
   * 格式化日期
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  },

  /**
   * 获取心情文本
   */
  getMoodText(mood) {
    const moodMap = {
      inspiring: '鼓舞人心',
      mysterious: '神秘莫测',
      adventurous: '冒险刺激',
      peaceful: '宁静祥和',
      challenging: '充满挑战',
      friendly: '友好温馨',
      empowering: '力量觉醒',
      determined: '坚定不移'
    };
    return moodMap[mood] || '未知心情';
  },

  /**
   * 切换数据来源显示
   */
  toggleDataSource() {
    this.setData({
      showDataSource: !this.data.showDataSource
    });
  },

  /**
   * 选择历史故事
   */
  selectHistoryStory(e) {
    const story = e.currentTarget.dataset.story;
    if (story) {
      console.log('选择历史故事:', story);
      this.setData({
        currentStory: story,
        showHistoryModal: false
      });

      wx.showToast({
        title: '故事已加载',
        icon: 'success'
      });
    }
  },



  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止点击模态框内容时关闭模态框
  },

  /**
   * 格式化心情文本
   */
  getMoodText(mood) {
    if (!mood) return '📖 冒险故事';

    const moodTexts = {
      'exciting': '🔥 激动人心',
      'mysterious': '🌙 神秘莫测',
      'triumphant': '🏆 胜利凯旋',
      'challenging': '⚔️ 充满挑战',
      'peaceful': '🕊️ 宁静祥和',
      'inspiring': '✨ 鼓舞人心',
      'friendly': '🤝 友好温馨',
      'empowering': '💪 力量觉醒',
      'adventurous': '🗺️ 冒险刺激',
      'determined': '🎯 坚定不移'
    };

    return moodTexts[mood] || `📖 ${mood}`;
  },

  /**
   * 格式化时间
   */
  formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },

  /**
   * 格式化日期
   */
  formatDate(dateString) {
    if (!dateString) return '未知时间';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

      if (diffDays === 0) {
        if (diffHours === 0) {
          return '刚刚';
        } else {
          return `${diffHours}小时前`;
        }
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return date.toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('日期格式化错误:', error);
      return '时间错误';
    }
  }
});
