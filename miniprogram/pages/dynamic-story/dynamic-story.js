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
    showDataSource: false,
    currentChapter: 1,
    maxChapters: 4,
    storyCompleted: false
  },

  onLoad() {
    this.loadUserData();
    this.loadStoryHistory();
  },

  onShow() {
    this.loadUserData();
    // 强制刷新数据，确保获取最新的任务和习惯状态
    setTimeout(() => {
      this.loadUserData();
    }, 100);
  },

  /**
   * 加载用户数据
   */
  loadUserData() {
    try {
      console.log('🔄 开始加载用户数据...');
      const character = characterService.getCurrentCharacter();
      if (character) {
        console.log('👤 角色数据:', character);
        
        // 获取今日行为数据
        const todayActions = this.getTodayActions(character);
        const collectedItems = character.collectedItems || [];

        console.log('📊 今日行为数据汇总:', {
          completedTasks: todayActions.completedTasks.length,
          completedHabits: todayActions.completedHabits.length,
          collectedItems: collectedItems.length
        });

        this.setData({
          character,
          todayActions,
          collectedItems
        });
        
        console.log('✅ 用户数据加载完成');
      } else {
        console.warn('⚠️ 未找到角色数据');
      }
    } catch (error) {
      console.error('❌ 加载用户数据失败:', error);
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
    const today = new Date().toISOString().split('T')[0]; // 使用YYYY-MM-DD格式
    
    try {
      // 从任务服务获取今日完成的任务
      const taskService = require('../../services/task-service.js');
      const allTasks = taskService.getUserTasks();
      const todayTasks = allTasks.filter(task => {
        if (task.status === 'completed' && task.completedAt) {
          const taskDate = new Date(task.completedAt).toISOString().split('T')[0];
          return taskDate === today;
        }
        return false;
      });

      // 从习惯服务获取今日完成的习惯
      const habitService = require('../../services/habit-service.js');
      const allHabits = habitService.getUserHabits();
      const todayHabits = [];
      
      allHabits.forEach(habit => {
        const todayCheckIn = habit.checkIns.find(checkIn => checkIn.date === today);
        if (todayCheckIn) {
          todayHabits.push({
            id: habit.id,
            name: habit.name,
            completedAt: todayCheckIn.date + 'T12:00:00.000Z', // 添加时间戳
            category: habit.category
          });
        }
      });

      console.log('📊 今日完成任务:', todayTasks.length, todayTasks);
      console.log('📊 今日完成习惯:', todayHabits.length, todayHabits);

      return {
        completedTasks: todayTasks,
        completedHabits: todayHabits
      };
    } catch (error) {
      console.error('获取今日行为数据失败:', error);
      return {
        completedTasks: [],
        completedHabits: []
      };
    }
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

      // 重置章节计数
      this.setData({
        currentChapter: 1,
        storyCompleted: false
      });

      // 添加章节信息到故事
      story.chapter = 1;
      story.totalChapters = this.data.maxChapters;

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
        title: '晨曦中的觉醒',
        content: `当第一缕阳光穿透迷雾森林的树梢时，${character.name}已经在古老的修炼场上开始了新一天的历练。作为一名第${character.level}级的${character.class || '冒险者'}，每一天的成长都让你更加接近传说中的英雄境界。

${todayActions.completedTasks.length > 0 ? `今天，你成功完成了${todayActions.completedTasks.length}项艰难的试炼。每一个任务的完成都如同在你的灵魂深处点亮了一盏明灯，照亮了前进的道路。冒险者公会的长老们都对你刮目相看，纷纷称赞你的毅力和智慧。` : '虽然今天没有具体的任务完成，但你在静默中积蓄着力量，就像暴风雨前的宁静，预示着更大的突破即将到来。'}

${todayActions.completedHabits.length > 0 ? `更令人惊叹的是，你坚持完成了${todayActions.completedHabits.length}项日常修炼。这些看似平凡的习惯，实际上是在锻造你内在的钢铁意志。每一次的坚持都让你的魔法亲和力增强，让你的战斗技巧更加精湛。` : '内在的修炼从未停止，即使在看似平静的日子里，你的潜能也在悄然觉醒。'}

${collectedItems.length > 0 ? `在你的冒险背包中，${collectedItems.slice(0, 2).map(item => item.name).join('和')}散发着神秘的光芒。这些珍贵的收藏品不仅仅是战利品，更像是命运的指引，暗示着即将到来的重大转折。古老的预言书中曾提到，当勇者收集到足够的神器时，通往传说之地的大门就会开启。` : '虽然你的收藏暂时还不丰富，但敏锐的直觉告诉你，真正的宝藏往往隐藏在最不起眼的地方。'}

夜幕降临时，你站在高塔之巅，俯瞰着这片充满奇迹的大陆。远方的地平线上，似乎有什么东西在闪闪发光，那可能是新的冒险，也可能是未知的挑战。但无论如何，你已经准备好了。`,
        mood: 'inspiring'
      },
      {
        title: '命运的十字路口',
        content: `在古老的魔法图书馆深处，${character.name}发现了一本散发着蓝色光芒的神秘典籍。作为一名经验丰富的${character.class || '冒险者'}，你立刻意识到这绝非普通的魔法书。

当你小心翼翼地翻开书页时，里面记录的内容让你震惊不已。这本书详细记载了你最近的所有行为和成长轨迹，仿佛有一双无形的眼睛在默默观察着你的每一步。

${todayActions.completedTasks.length > 0 ? `书中写道："勇敢的冒险者完成了${todayActions.completedTasks.length}项重要的试炼，每一次的成功都在命运之网上留下了金色的丝线。这些丝线正在编织成一幅宏大的图案，预示着更伟大的使命即将降临。"` : `书中写道："在表面的平静之下，真正的力量正在积蓄。有时候，最重要的成长发生在我们看不见的地方。"`}

${todayActions.completedHabits.length > 0 ? `接下来的章节更加令人惊叹："通过${todayActions.completedHabits.length}次持续的修炼，冒险者的内在能量已经达到了一个新的层次。这种坚持不懈的精神，正是传说中的英雄们所共有的品质。"` : `书中继续写道："真正的力量来自于内心的坚持，即使在没有外在成就的日子里，内在的修炼也从未停止。"`}

${collectedItems.length > 0 ? `最神奇的是，书的最后一页竟然出现了你收藏的${collectedItems[0]?.name}的详细介绍。原来这件看似普通的物品，竟然是古代英雄留下的神器碎片！书中预言，当所有碎片聚齐时，将会开启通往失落王国的传送门。` : `书的最后一页空白一片，但隐约可以看到一些若隐若现的文字，似乎在等待着什么特殊的条件才会显现。`}

突然，图书馆外传来了奇怪的声音，似乎有什么东西正在接近。你必须做出选择...`,
        mood: 'mysterious'
      },
      {
        title: '英雄的试炼',
        content: `雷声轰鸣，闪电划破夜空。在这个风雨交加的夜晚，${character.name}接到了一个紧急的求救信号。一个偏远的村庄正遭受着神秘力量的威胁，村民们的生命危在旦夕。

作为一名第${character.level}级的${character.class || '冒险者'}，你毫不犹豫地踏上了救援之路。这不仅仅是一次普通的任务，更是对你近期成长的终极考验。

${todayActions.completedTasks.length > 0 ? `在赶往村庄的路上，你回想起今天完成的${todayActions.completedTasks.length}项挑战。每一次的成功都让你更加自信，每一个困难的克服都为你积累了宝贵的经验。现在，这些经验将成为你拯救无辜村民的关键武器。` : `虽然今天没有完成具体的任务，但你内心的正义感和责任心从未减弱。有时候，最重要的准备是精神上的准备。`}

${todayActions.completedHabits.length > 0 ? `更重要的是，你长期坚持的${todayActions.completedHabits.length}项修炼在此刻发挥了关键作用。持续的训练让你的反应速度更快，意志力更强，魔法控制更加精准。这些看似平凡的日常练习，现在成了你最可靠的力量源泉。` : `你的内在修炼从未停止，即使在最危急的时刻，内心的平静和专注也是你最大的优势。`}

${collectedItems.length > 0 ? `当你到达村庄边缘时，背包中的${collectedItems[0]?.name}突然发出了强烈的光芒。这件神秘的收藏品似乎感应到了什么，它的力量正在觉醒。也许，这正是命运安排你收集这些物品的真正原因。` : `虽然你没有特殊的神器，但多年的冒险经历告诉你，真正的力量来自于内心的勇气和智慧。`}

村庄的轮廓在闪电中若隐若现，你可以看到一些奇怪的阴影在建筑物之间游荡。空气中弥漫着不祥的气息，但你的决心如钢铁般坚定。

这将是一场真正的英雄试炼，你的选择将决定整个村庄的命运...`,
        mood: 'challenging'
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: Date.now().toString(),
      title: template.title,
      content: template.content,
      mood: template.mood,
      choices: this.generateDynamicChoices(template.mood, todayActions, collectedItems),
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
   * 根据故事情况生成动态选择
   */
  generateDynamicChoices(mood, todayActions, collectedItems) {
    const baseChoices = {
      inspiring: [
        {
          id: 'advance_boldly',
          text: '勇敢地向前推进，迎接新的挑战',
          consequence: '可能遇到强大的敌人，但也有机会获得珍贵的奖励和经验'
        },
        {
          id: 'seek_wisdom',
          text: '寻找智者的指导，深入了解当前的情况',
          consequence: '获得宝贵的知识和策略，但可能错过一些时机'
        },
        {
          id: 'gather_allies',
          text: '召集志同道合的伙伴，组建冒险小队',
          consequence: '增强团队力量，但需要分享荣誉和奖励'
        }
      ],
      mysterious: [
        {
          id: 'investigate_mystery',
          text: '深入调查神秘现象的真相',
          consequence: '可能揭开重大秘密，但也可能触发未知的危险'
        },
        {
          id: 'use_magic_item',
          text: collectedItems.length > 0 ? `使用${collectedItems[0]?.name}的神秘力量` : '尝试使用魔法感知周围的异常',
          consequence: '神秘力量可能带来意想不到的效果，结果难以预料'
        },
        {
          id: 'retreat_observe',
          text: '暂时撤退，观察情况的发展',
          consequence: '保持安全距离，但可能错过关键的行动时机'
        }
      ],
      challenging: [
        {
          id: 'direct_confrontation',
          text: '直接面对挑战，展现真正的勇者精神',
          consequence: '高风险高回报，成功将获得巨大成就，失败则后果严重'
        },
        {
          id: 'strategic_approach',
          text: '制定周密的策略，寻找敌人的弱点',
          consequence: '降低风险但需要更多时间，成功率较高但奖励可能减少'
        },
        {
          id: 'seek_alternative',
          text: '寻找创新的解决方案，避免正面冲突',
          consequence: '可能发现意想不到的解决方法，但也可能陷入更复杂的局面'
        }
      ]
    };

    return baseChoices[mood] || baseChoices.inspiring;
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

    // 处理故事结束
    if (choice.id === 'end_story') {
      this.endCurrentStory();
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

      // 更新章节信息
      const nextChapter = this.data.currentChapter + 1;
      const isLastChapter = nextChapter >= this.data.maxChapters;

      // 确保基本字段存在
      if (!newStory.title) {
        newStory.title = isLastChapter ? '传奇的终章' : `第${nextChapter}章：未知的冒险`;
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

      // 添加章节信息
      newStory.chapter = nextChapter;
      newStory.totalChapters = this.data.maxChapters;

      // 如果是最后一章，修改选择和结束故事
      if (isLastChapter) {
        newStory.choices = [
          {
            id: 'end_story',
            text: '完成这次冒险，回到现实世界',
            consequence: '结束当前的冒险故事，获得所有奖励'
          }
        ];
        newStory.isLastChapter = true;
        
        // 添加结束语
        if (newStory.content) {
          newStory.content += '\n\n经过了四个章节的精彩冒险，你的传奇故事即将落下帷幕。这次的经历让你收获满满，不仅获得了宝贵的经验和技能，更重要的是内心的成长和蜕变。';
        }
      }

      console.log('✅ 故事数据验证通过:', newStory);

      // 保存新故事
      console.log('保存故事到历史...');
      await this.saveStoryToHistory(newStory);

      // 更新当前故事和章节状态
      console.log('更新当前故事显示...');
      this.setData({
        currentStory: newStory,
        currentChapter: nextChapter,
        storyCompleted: isLastChapter
      });

      console.log('✅ 故事更新完成，当前故事:', this.data.currentStory);

      // 强制刷新页面数据
      setTimeout(() => {
        this.setData({
          currentStory: newStory,
          currentChapter: nextChapter,
          storyCompleted: isLastChapter,
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
   * 结束当前故事
   */
  endCurrentStory() {
    const { currentStory } = this.data;
    
    wx.showModal({
      title: '🎉 冒险完成！',
      content: `恭喜你完成了这次精彩的冒险！\n\n📖 故事章节：${this.data.maxChapters}章\n⭐ 总经验获得：${(currentStory.rewards?.experience || 0) * this.data.maxChapters}\n🎒 收获物品：${currentStory.rewards?.items?.length || 0}件\n💪 技能提升：${currentStory.rewards?.skills?.length || 0}项`,
      confirmText: '开始新冒险',
      cancelText: '查看历史',
      success: (res) => {
        if (res.confirm) {
          // 重置状态，开始新故事
          this.setData({
            currentStory: null,
            currentChapter: 1,
            storyCompleted: false
          });
        } else {
          // 显示故事历史
          this.showStoryHistory();
        }
      }
    });
  },

  /**
   * 重新生成故事
   */
  regenerateStory() {
    this.setData({
      currentStory: null,
      currentChapter: 1,
      storyCompleted: false
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
