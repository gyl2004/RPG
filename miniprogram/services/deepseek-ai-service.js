// DeepSeek R1 AI服务
class DeepSeekAIService {
  constructor() {
    this.apiKey = '';
    this.baseURL = 'https://api.chatanywhere.tech/v1';
    this.model = 'gpt-3.5-turbo'; // 使用GPT-3.5 Turbo模型
    this.lastRequestTime = 0; // 记录上次请求时间
    this.rateLimitDelay = 1000; // ChatAnywhere限制相对宽松，1秒间隔
  }

  /**
   * 检查速率限制
   */
  checkRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      const waitSeconds = Math.ceil(waitTime / 1000);
      return {
        canRequest: false,
        waitTime: waitTime,
        waitSeconds: waitSeconds,
        message: `请等待 ${waitSeconds} 秒后再试`
      };
    }

    return { canRequest: true };
  }

  /**
   * 更新请求时间
   */
  updateRequestTime() {
    this.lastRequestTime = Date.now();
  }

  /**
   * 测试API连接
   */
  async testConnection() {
    try {
      console.log('🧪 测试ChatAnywhere API连接...');
      console.log('🔧 API配置:', {
        baseURL: this.baseURL,
        model: this.model,
        apiKeyLength: this.apiKey.length
      });

      const testPrompt = "请简单回复'连接成功'来测试API";
      const response = await this.callDeepSeek([
        {
          role: "user",
          content: testPrompt
        }
      ], {
        max_tokens: 50,
        temperature: 0.1
      });

      console.log('✅ ChatAnywhere API测试成功:', response);
      return { success: true, response: response };
    } catch (error) {
      console.error('❌ ChatAnywhere API测试失败:', error);

      // 检查是否是域名白名单问题
      if (error.message.includes('request:fail') || error.message.includes('域名')) {
        return {
          success: false,
          error: `域名白名单问题: 请在微信小程序后台添加 ${this.baseURL} 到request合法域名。原始错误: ${error.message}`
        };
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * 简化的网络测试
   */
  async testNetworkConnection() {
    try {
      console.log('🌐 测试基础网络连接...');

      return new Promise((resolve, reject) => {
        wx.request({
          url: `${this.baseURL}/models`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 10000,
          success: (res) => {
            console.log('✅ 网络连接成功:', res.statusCode);
            resolve({ success: true, statusCode: res.statusCode });
          },
          fail: (error) => {
            console.error('❌ 网络连接失败:', error);
            reject({ success: false, error: error.errMsg || error.message });
          }
        });
      });
    } catch (error) {
      console.error('❌ 网络测试异常:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 生成AI任务推荐
   */
  async generateTaskRecommendations(userProfile, emotionalState, characterGrowth, userStats) {
    try {
      console.log('🤖 开始生成AI任务推荐...');

      // 检查速率限制
      const rateLimitCheck = this.checkRateLimit();
      if (!rateLimitCheck.canRequest) {
        console.warn('⏰ 速率限制:', rateLimitCheck.message);
        throw new Error(rateLimitCheck.message);
      }

      const prompt = this.buildTaskRecommendationPrompt(userProfile, emotionalState, characterGrowth, userStats);
      
      const response = await this.callDeepSeek([
        {
          role: "system",
          content: "你是一个专业的生活教练和任务规划师，擅长为用户制定个性化的成长任务。请仔细分析用户的情况，提供有针对性的建议。"
        },
        {
          role: "user", 
          content: prompt
        }
      ], {
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      // 更新请求时间
      this.updateRequestTime();

      const recommendations = this.parseTaskRecommendations(response);
      console.log('✅ ChatAnywhere AI任务推荐生成成功:', recommendations.length, '个任务');

      return recommendations;
    } catch (error) {
      console.error('DeepSeek AI任务推荐失败:', error);

      // 特别处理速率限制错误
      if (error.message.includes('429') || error.message.includes('Rate limit')) {
        console.warn('⏰ 遇到速率限制，降级到本地算法');
        // 从错误信息中提取等待时间
        const match = error.message.match(/(\d+)\s*requests?\s*per\s*minute/);
        if (match) {
          console.log('📊 速率限制信息: 每分钟', match[1], '次请求');
        }
      }

      // 降级到本地算法
      return this.fallbackToLocalRecommendations(userProfile, emotionalState, characterGrowth, userStats);
    }
  }

  /**
   * 构建任务推荐的提示词
   */
  buildTaskRecommendationPrompt(userProfile, emotionalState, characterGrowth, userStats) {
    const characterTypeMap = {
      'warrior': '勇士 - 喜欢挑战和竞争',
      'scholar': '学者 - 热爱学习和知识',
      'artist': '艺术家 - 富有创造力和想象力',
      'socialite': '社交家 - 善于交际和合作',
      'explorer': '探险家 - 喜欢探索和冒险'
    };

    const activeTimeMap = {
      'morning': '早晨型 - 早上精力充沛',
      'afternoon': '下午型 - 下午状态最佳',
      'night': '夜晚型 - 晚上思维活跃'
    };

    return `请基于以下用户信息，为用户生成5个个性化的任务推荐。

## 用户档案分析
**角色类型**: ${characterTypeMap[userProfile.characterType] || '探险家'}
**活跃时间偏好**: ${activeTimeMap[userProfile.preferences?.activeTime] || '未设置'}
**用户等级**: ${userStats.level || 1}级
**历史表现**: 已完成${userStats.tasksCompleted || 0}个任务，最长习惯坚持${userStats.maxHabitStreak || 0}天

## 当前状态评估
**情感指标**:
- 幸福度: ${emotionalState.metrics?.happiness || 50}/100
- 动力值: ${emotionalState.metrics?.motivation || 50}/100  
- 自信度: ${emotionalState.metrics?.confidence || 50}/100
- 压力值: ${emotionalState.metrics?.stress || 50}/100

**成长指标**:
- 💪 力量: ${characterGrowth.growthMetrics?.strength || 50}/100
- 🧠 智慧: ${characterGrowth.growthMetrics?.wisdom || 50}/100
- 🎨 创造力: ${characterGrowth.growthMetrics?.creativity || 50}/100
- 👥 社交: ${characterGrowth.growthMetrics?.social || 50}/100
- 🎯 自律: ${characterGrowth.growthMetrics?.discipline || 50}/100

## 任务推荐要求
请分析用户的整体状况，重点关注：
1. 情感状态的改善需求
2. 成长指标中的薄弱环节
3. 角色类型的特点匹配
4. 时间偏好的考虑

请返回JSON格式的推荐结果：

\`\`\`json
{
  "analysis": "用户状态分析总结（100字内）",
  "recommendations": [
    {
      "title": "具体可执行的任务标题",
      "description": "详细的任务描述，包含具体步骤",
      "category": "任务分类：wellness(健康)/productivity(效率)/learning(学习)/creative(创意)/social(社交)/fitness(健身)",
      "difficulty": "难度：easy(简单)/medium(中等)/hard(困难)",
      "estimatedTime": "预计完成时间（分钟数，15-90之间）",
      "personalizedReason": "基于用户具体情况的个性化推荐理由",
      "targetImprovement": "主要改善的指标（如：幸福度、创造力等）",
      "tags": ["相关标签1", "相关标签2"],
      "priority": "优先级数字（1-10，10最高）",
      "expectedBenefits": "预期收益和效果"
    }
  ]
}
\`\`\`

注意事项：
- 任务要具体可行，避免抽象概念
- 考虑用户的时间偏好安排任务时长
- 针对较低的指标提供改善建议
- 结合角色类型特点设计任务内容
- 确保任务有明确的完成标准`;
  }

  /**
   * 调用DeepSeek API
   */
  async callDeepSeek(messages, options = {}) {
    const requestData = {
      model: this.model,
      messages: messages,
      max_tokens: options.max_tokens || 1500,
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 0.9,
      stream: false,
      ...options
    };

    console.log('📤 发送请求到ChatAnywhere:', {
      url: `${this.baseURL}/chat/completions`,
      model: this.model,
      messagesCount: messages.length,
      options: options
    });

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseURL}/chat/completions`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        data: requestData,
        timeout: 30000,
        success: (res) => {
          console.log('📥 ChatAnywhere API响应状态:', res.statusCode);
          console.log('📥 ChatAnywhere API响应数据:', res.data);

          if (res.statusCode === 200 && res.data.choices && res.data.choices[0]) {
            const content = res.data.choices[0].message.content;
            console.log('✅ ChatAnywhere API调用成功，内容长度:', content.length);
            resolve(content);
          } else {
            console.error('❌ ChatAnywhere API响应格式错误:', res.data);
            reject(new Error(`API响应错误: ${res.statusCode} - ${JSON.stringify(res.data)}`));
          }
        },
        fail: (error) => {
          console.error('❌ ChatAnywhere API网络请求失败:', error);
          console.error('错误详情:', {
            errMsg: error.errMsg,
            errno: error.errno,
            errCode: error.errCode
          });
          reject(new Error(`网络请求失败: ${error.errMsg || error.message || '未知错误'}`));
        }
      });
    });
  }

  /**
   * 解析AI返回的任务推荐
   */
  parseTaskRecommendations(response) {
    try {
      console.log('DeepSeek原始响应:', response);
      
      // 尝试提取JSON部分
      let jsonStr = response;
      
      // 如果响应包含代码块，提取其中的JSON
      const codeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }
      
      // 如果响应包含大括号，提取JSON对象
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const data = JSON.parse(jsonStr);
      
      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('响应格式不正确，缺少recommendations数组');
      }

      return data.recommendations.map((task, index) => ({
        id: 'gpt_' + Date.now() + '_' + index,
        title: task.title || '未命名任务',
        description: task.description || '暂无描述',
        category: task.category || 'wellness',
        difficulty: task.difficulty || 'medium',
        estimatedTime: parseInt(task.estimatedTime) || 30,
        personalizedReason: task.personalizedReason || '基于AI分析推荐',
        targetImprovement: task.targetImprovement || '综合提升',
        tags: Array.isArray(task.tags) ? task.tags : ['AI推荐'],
        priority: parseInt(task.priority) || 5,
        expectedBenefits: task.expectedBenefits || '提升个人能力',
        source: 'chatanywhere_gpt',
        generatedAt: new Date().toISOString(),
        estimatedReward: this.calculateReward(task.difficulty, parseInt(task.estimatedTime) || 30),
        aiAnalysis: data.analysis || '基于用户状态的智能分析'
      }));
    } catch (error) {
      console.error('解析DeepSeek响应失败:', error);
      console.error('原始响应:', response);
      return [];
    }
  }

  /**
   * 计算任务奖励
   */
  calculateReward(difficulty, estimatedTime) {
    const baseReward = { coins: 30, experience: 60 };
    const difficultyMultiplier = {
      'easy': 1,
      'medium': 1.5,
      'hard': 2.2
    };
    const timeMultiplier = Math.max(1, estimatedTime / 30);
    const multiplier = (difficultyMultiplier[difficulty] || 1.5) * timeMultiplier;

    return {
      coins: Math.floor(baseReward.coins * multiplier),
      experience: Math.floor(baseReward.experience * multiplier)
    };
  }

  /**
   * 降级到本地推荐算法
   */
  fallbackToLocalRecommendations(userProfile, emotionalState, characterGrowth, userStats) {
    console.log('使用本地备选推荐算法');
    
    const localTasks = [
      {
        id: 'local_1',
        title: '深呼吸放松练习',
        description: '找一个安静的地方，进行5分钟的深呼吸练习，专注于呼吸的节奏',
        category: 'wellness',
        difficulty: 'easy',
        estimatedTime: 5,
        personalizedReason: '基于当前压力状态，深呼吸可以快速缓解紧张情绪',
        targetImprovement: '压力缓解',
        tags: ['放松', '冥想'],
        priority: 9,
        expectedBenefits: '降低压力，提升专注力',
        source: 'local_fallback',
        estimatedReward: { coins: 25, experience: 40 }
      },
      {
        id: 'local_2', 
        title: '整理工作空间',
        description: '花15分钟整理你的桌面或工作区域，让环境更加整洁有序',
        category: 'productivity',
        difficulty: 'easy',
        estimatedTime: 15,
        personalizedReason: '整洁的环境有助于提升工作效率和心情',
        targetImprovement: '环境优化',
        tags: ['整理', '效率'],
        priority: 7,
        expectedBenefits: '提升工作效率，改善心情',
        source: 'local_fallback',
        estimatedReward: { coins: 35, experience: 55 }
      }
    ];

    return localTasks;
  }

  /**
   * 通用文本生成方法
   */
  async generateText(prompt, options = {}) {
    try {
      console.log('🤖 开始生成AI文本...');

      // 检查速率限制
      const rateLimitCheck = this.checkRateLimit();
      if (!rateLimitCheck.canRequest) {
        return {
          success: false,
          error: rateLimitCheck.message,
          waitTime: rateLimitCheck.waitTime
        };
      }

      const messages = [
        {
          role: "user",
          content: prompt
        }
      ];

      const response = await this.callDeepSeek(messages, {
        max_tokens: options.max_tokens || 800,
        temperature: options.temperature || 0.8
      });

      this.lastRequestTime = Date.now();

      return {
        success: true,
        content: response
      };

    } catch (error) {
      console.error('AI文本生成失败:', error);
      return {
        success: false,
        error: error.message || 'AI生成失败'
      };
    }
  }

  /**
   * 生成基于用户行为的动态RPG故事
   */
  async generateDynamicStory(userActions, achievements, collectedItems, characterData, previousStory = null) {
    try {
      console.log('🎭 开始生成动态RPG故事...');

      // 检查速率限制
      const rateLimitCheck = this.checkRateLimit();
      if (!rateLimitCheck.canRequest) {
        return {
          success: false,
          error: rateLimitCheck.message,
          waitTime: rateLimitCheck.waitTime
        };
      }

      const prompt = this.buildDynamicStoryPrompt(userActions, achievements, collectedItems, characterData, previousStory);

      const response = await this.callDeepSeek([{
        role: "user",
        content: prompt
      }], {
        max_tokens: 1000,
        temperature: 0.8
      });

      this.lastRequestTime = Date.now();

      // 解析故事响应
      const storyData = this.parseStoryResponse(response);

      return {
        success: true,
        story: storyData
      };

    } catch (error) {
      console.error('动态故事生成失败:', error);
      return {
        success: false,
        error: error.message || '故事生成失败',
        fallback: this.generateFallbackStory(userActions, achievements, collectedItems, characterData)
      };
    }
  }

  /**
   * 构建动态故事提示词
   */
  buildDynamicStoryPrompt(userActions, achievements, collectedItems, characterData, previousStory) {
    const todayTasks = userActions.completedTasks || [];
    const todayHabits = userActions.completedHabits || [];
    const recentItems = collectedItems.slice(0, 3); // 最近3个物品

    return `你是一个专业的RPG故事创作者。请基于用户的真实行为创作一个个性化的RPG冒险故事章节。

角色信息：
- 角色名称：${characterData.name}
- 角色职业：${characterData.class}
- 角色等级：${characterData.level}
- 当前经验：${characterData.experience}

今日完成的现实任务：
${todayTasks.map(task => `- ${task.title}: ${task.description}`).join('\n') || '- 今日暂无完成的任务'}

今日完成的习惯：
${todayHabits.map(habit => `- ${habit.name}`).join('\n') || '- 今日暂无完成的习惯'}

最近收藏的物品：
${recentItems.map(item => `- ${item.name}（${item.category}）: ${item.description || '神秘物品'}`).join('\n') || '- 暂无收藏物品'}

${previousStory ? `上一章节故事：\n${previousStory.content}\n\n基于上一章节继续发展故事。` : '这是一个全新的冒险开始。'}

创作要求：
1. 将用户的现实任务转化为RPG世界中的冒险行为
2. 让收藏的物品在故事中发挥重要作用
3. 根据完成的习惯体现角色的成长和能力提升
4. 故事要有明确的情节发展和转折点
5. 在故事结尾提供2-3个选择分支，让用户决定下一步行动
6. 故事长度控制在400-600字
7. 语言要生动有趣，充满冒险感和成就感

请返回JSON格式：
{
  "title": "章节标题",
  "content": "故事内容",
  "mood": "故事氛围（如：exciting, mysterious, triumphant, challenging）",
  "choices": [
    {
      "id": "choice1",
      "text": "选择1的描述",
      "consequence": "选择1可能的后果提示"
    },
    {
      "id": "choice2",
      "text": "选择2的描述",
      "consequence": "选择2可能的后果提示"
    },
    {
      "id": "choice3",
      "text": "选择3的描述",
      "consequence": "选择3可能的后果提示"
    }
  ],
  "rewards": {
    "experience": "获得的经验值",
    "items": ["可能获得的物品"],
    "skills": ["提升的技能"]
  },
  "nextHints": "下一章节的发展提示"
}`;
  }

  /**
   * 解析故事响应
   */
  parseStoryResponse(response) {
    try {
      console.log('🔍 开始解析AI响应 (长度:', response.length, ')');
      console.log('🔍 AI响应前200字符:', response.substring(0, 200));

      // 尝试直接解析JSON响应
      let storyData;
      try {
        console.log('🔄 尝试直接JSON解析...');
        storyData = JSON.parse(response);
        console.log('✅ 直接JSON解析成功');
      } catch (jsonError) {
        console.log('❌ 直接JSON解析失败:', jsonError.message);
        console.log('🔄 尝试提取JSON片段...');

        // 尝试从响应中提取JSON片段
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('✅ 找到JSON片段，长度:', jsonMatch[0].length);
          console.log('📄 JSON片段内容:', jsonMatch[0]);
          storyData = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON片段解析成功');
        } else {
          throw new Error('无法找到有效的JSON数据');
        }
      }

      console.log('📊 解析得到的原始数据:', storyData);

      // 支持中文和英文字段名
      const title = storyData.title || storyData.标题 || storyData.故事标题 || '神秘的冒险';
      const content = storyData.content || storyData.内容 || storyData.故事 || storyData.故事内容 || '冒险正在继续发展...';
      const mood = storyData.mood || storyData.心情 || storyData.氛围 || 'mysterious';
      const choices = storyData.choices || storyData.选择 || storyData.选项 || [];
      const rewards = storyData.rewards || storyData.奖励 || { experience: 50 };

      console.log('📝 提取的title:', title);
      console.log('📝 提取的content:', content);
      console.log('📝 提取的content长度:', content ? content.length : 0);
      console.log('📝 提取的choices:', choices);

      // 处理choices数组
      let processedChoices = [];
      if (Array.isArray(choices) && choices.length > 0) {
        processedChoices = choices.map((choice, index) => {
          if (typeof choice === 'string') {
            // 如果是字符串，转换为标准格式
            return {
              id: `choice_${index + 1}`,
              text: choice,
              consequence: '未知后果'
            };
          } else if (choice && typeof choice === 'object') {
            // 如果是对象，标准化字段名
            return {
              id: choice.id || choice.编号 || `choice_${index + 1}`,
              text: choice.text || choice.文本 || choice.选择 || choice.内容 || `选择${index + 1}`,
              consequence: choice.consequence || choice.后果 || choice.结果 || '未知后果'
            };
          }
          return {
            id: `choice_${index + 1}`,
            text: `选择${index + 1}`,
            consequence: '未知后果'
          };
        });
      } else {
        // 默认选择
        processedChoices = [
          {
            id: 'continue',
            text: '继续冒险',
            consequence: '迎接新的挑战'
          }
        ];
      }

      console.log('🔄 处理后的choices:', processedChoices);

      // 构建标准化的故事数据结构
      const standardizedStory = {
        id: Date.now().toString(),
        title: title,
        content: content,
        mood: mood,
        choices: processedChoices,
        rewards: rewards,
        nextHints: storyData.nextHints || storyData.提示 || '你的冒险还在继续...',
        createdAt: new Date().toISOString(),
        type: 'ai_generated'
      };

      console.log('✅ 标准化后的故事数据:', standardizedStory);
      return standardizedStory;

    } catch (error) {
      console.error('❌ 解析故事响应失败:', error);
      console.log('📝 原始响应内容:', response);

      // 返回备用故事数据
      const fallbackStory = {
        id: Date.now().toString(),
        title: '意外的发现',
        content: '在这次冒险中，你遇到了一些意想不到的情况。虽然过程充满挑战，但你的勇气和智慧帮助你克服了困难。现在，新的机遇正在等待着你。',
        mood: 'mysterious',
        choices: [
          {
            id: 'continue',
            text: '继续探索',
            consequence: '发现更多秘密'
          },
          {
            id: 'rest',
            text: '休息恢复',
            consequence: '为下次冒险做准备'
          }
        ],
        rewards: { experience: 50, skills: ['适应能力'] },
        nextHints: '每个选择都将开启新的可能性...',
        createdAt: new Date().toISOString(),
        type: 'ai_generated_fallback'
      };

      console.log('🔄 使用备用故事数据:', fallbackStory);
      return fallbackStory;
    }
  }

  /**
   * 生成备选故事（当AI不可用时）
   */
  generateFallbackStory(userActions, achievements, collectedItems, characterData) {
    const todayTasks = userActions.completedTasks || [];
    const todayHabits = userActions.completedHabits || [];
    const recentItems = collectedItems.slice(0, 2);

    const templates = [
      {
        title: '日常的奇迹',
        content: `${characterData.name}在今天的冒险中展现了非凡的毅力。${todayTasks.length > 0 ? `通过完成${todayTasks.length}个重要任务，` : ''}${todayHabits.length > 0 ? `坚持${todayHabits.length}个良好习惯，` : ''}你的角色获得了宝贵的经验。${recentItems.length > 0 ? `特别是发现的${recentItems[0]?.name}，为接下来的冒险增添了神秘色彩。` : ''}在这个充满可能性的世界里，每一个小小的行动都在编织着属于你的传奇故事。`,
        mood: 'triumphant'
      },
      {
        title: '成长的足迹',
        content: `在这个魔法与现实交织的世界中，${characterData.name}正在书写属于自己的传奇。${todayTasks.length > 0 ? `今天完成的任务让你在冒险者公会中声名鹊起，` : ''}${todayHabits.length > 0 ? `持续的好习惯为你积累了强大的内在力量。` : ''}${recentItems.length > 0 ? `而你收藏的${recentItems.map(item => item.name).join('、')}似乎都在暗示着即将到来的重大发现。` : ''}每一天的努力都在为更大的冒险做准备。`,
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
          text: '探索新的区域',
          consequence: '可能发现隐藏的宝藏或遇到新的挑战'
        },
        {
          id: 'rest',
          text: '在旅店休息恢复',
          consequence: '恢复体力，可能遇到有趣的旅行者'
        },
        {
          id: 'training',
          text: '进行技能训练',
          consequence: '提升能力，为未来的冒险做准备'
        }
      ],
      rewards: {
        experience: Math.max(50, todayTasks.length * 20 + todayHabits.length * 15),
        items: recentItems.length > 0 ? [`强化的${recentItems[0]?.name}`] : [],
        skills: todayHabits.length > 0 ? ['坚持', '自律'] : []
      },
      nextHints: '你的选择将影响接下来的冒险方向...',
      createdAt: new Date().toISOString(),
      type: 'fallback'
    };
  }

  /**
   * 生成故事分支
   */
  async generateStoryBranch(previousStory, userChoice, userActions, characterData) {
    try {
      console.log('🌿 生成故事分支...');

      const rateLimitCheck = this.checkRateLimit();
      if (!rateLimitCheck.canRequest) {
        return {
          success: false,
          error: rateLimitCheck.message
        };
      }

      const prompt = `基于用户的选择继续RPG故事：

上一章节：${previousStory.title}
故事内容：${previousStory.content}

用户选择：${userChoice.text}
选择后果：${userChoice.consequence}

角色信息：
- 角色名称：${characterData.name}
- 角色等级：${characterData.level}
- 当前状态：基于选择的发展

请继续故事发展，要求：
1. 基于用户选择的后果展开情节
2. 保持故事的连贯性和逻辑性
3. 引入新的挑战或机遇
4. 提供新的选择分支
5. 故事长度300-500字

请严格按照以下JSON格式返回，不要添加任何其他文字：
{
  "title": "故事标题",
  "content": "详细的故事内容（300-500字）",
  "mood": "mysterious/exciting/peaceful等",
  "choices": [
    {
      "id": "choice1",
      "text": "选择1的描述",
      "consequence": "选择1的后果"
    },
    {
      "id": "choice2",
      "text": "选择2的描述",
      "consequence": "选择2的后果"
    }
  ],
  "rewards": {
    "experience": 数值,
    "skills": ["技能1", "技能2"]
  }
}`;

      const response = await this.callDeepSeek([{
        role: "user",
        content: prompt
      }], {
        max_tokens: 800,
        temperature: 0.8
      });

      this.lastRequestTime = Date.now();
      console.log('🤖 AI原始响应:', response);

      const storyData = this.parseStoryResponse(response);
      console.log('📖 解析后的故事数据:', storyData);

      return {
        success: true,
        story: storyData
      };

    } catch (error) {
      console.error('故事分支生成失败:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackBranch(previousStory, userChoice, characterData)
      };
    }
  }

  /**
   * 生成备选故事分支
   */
  generateFallbackBranch(previousStory, userChoice, characterData) {
    const branchTemplates = {
      explore: {
        title: '未知的发现',
        content: `${characterData.name}选择了探索的道路。在神秘的迷雾中，你发现了一个古老的遗迹。石墙上刻着古老的符文，似乎在诉说着远古的秘密。你的冒险者直觉告诉你，这里隐藏着重要的宝藏，但同时也可能潜伏着危险。`,
        mood: 'mysterious'
      },
      rest: {
        title: '旅店的奇遇',
        content: `${characterData.name}来到了温馨的旅店。在炉火旁，你遇到了一位神秘的老者，他似乎知道很多关于这个世界的秘密。通过与他的交谈，你获得了宝贵的智慧和线索，这将对你未来的冒险大有帮助。`,
        mood: 'peaceful'
      },
      training: {
        title: '力量的觉醒',
        content: `${characterData.name}选择了刻苦训练。在专注的练习中，你感受到了内在力量的增长。不仅技能得到了提升，更重要的是，你对自己的能力有了更深的理解。这种成长将在未来的挑战中发挥重要作用。`,
        mood: 'empowering'
      }
    };

    const template = branchTemplates[userChoice.id] || branchTemplates.explore;

    return {
      id: Date.now().toString(),
      title: template.title,
      content: template.content,
      mood: template.mood,
      choices: [
        {
          id: 'advance',
          text: '继续前进',
          consequence: '迎接新的挑战和机遇'
        },
        {
          id: 'investigate',
          text: '深入调查',
          consequence: '可能发现更多秘密'
        },
        {
          id: 'return',
          text: '暂时返回',
          consequence: '保存进展，为下次冒险做准备'
        }
      ],
      rewards: {
        experience: 75,
        skills: ['决策能力', '适应能力']
      },
      nextHints: '你的选择塑造着冒险的方向...',
      createdAt: new Date().toISOString(),
      type: 'fallback_branch'
    };
  }

  /**
   * 生成个性化故事内容
   */
  async generatePersonalizedStory(userAchievements, characterType, recentActivities) {
    try {
      const prompt = `请基于用户的成就和活动，创作一个个性化的成长故事章节。

用户信息：
- 角色类型：${characterType}
- 最近成就：${JSON.stringify(userAchievements)}
- 最近活动：${JSON.stringify(recentActivities)}

请创作一个400-600字的励志故事章节，要求：
1. 体现用户的真实成长历程
2. 符合${characterType}角色类型的特点
3. 有积极的激励作用
4. 包含对具体成就的认可

请返回JSON格式：
{
  "title": "章节标题",
  "content": "故事内容",
  "theme": "故事主题",
  "inspiration": "激励要点",
  "rewards": {
    "coins": 100,
    "experience": 200
  }
}`;

      const response = await this.callDeepSeek([
        {
          role: "system",
          content: "你是一个优秀的故事创作者，擅长创作激励人心的个人成长故事。"
        },
        {
          role: "user",
          content: prompt
        }
      ], {
        max_tokens: 1000,
        temperature: 0.8
      });

      return this.parseStoryResponse(response);
    } catch (error) {
      console.error('DeepSeek故事生成失败:', error);
      return null;
    }
  }


}

// 导出单例
const deepSeekAIService = new DeepSeekAIService();
module.exports = deepSeekAIService;
