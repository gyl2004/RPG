// DeepSeek R1 AI服务
class DeepSeekAIService {
  constructor() {
    // ChatAnywhere API配置
    this.apiKey = 'sk-e5g8BTyjj4MUzyw8iA6NL0JDcOGzTbN7a3xHhShoKrESWgxu'; // 需要替换为实际的API密钥
    this.baseURL = 'https://api.chatanywhere.tech/v1'; // ChatAnywhere API端点
    this.model = 'gpt-3.5-turbo'; // 使用GPT-3.5 Turbo模型
    this.lastRequestTime = 0; // 记录上次请求时间
    this.rateLimitDelay = 1000; // ChatAnywhere限制相对宽松，1秒间隔

    // 初始化时检查配置
    this.initializeConfig();
  }

  /**
   * 初始化配置
   */
  initializeConfig() {
    try {
      // 从本地存储或配置文件读取API密钥
      const storedApiKey = wx.getStorageSync('chatanywhere_api_key');
      if (storedApiKey) {
        this.apiKey = storedApiKey;
      }

      console.log('🔧 ChatAnywhere AI服务初始化:', {
        baseURL: this.baseURL,
        model: this.model,
        hasApiKey: !!this.apiKey && this.apiKey !== 'sk-your-api-key-here'
      });

      // 如果没有有效的API密钥，提供降级方案
      if (!this.apiKey || this.apiKey === 'sk-your-api-key-here') {
        console.warn('⚠️ ChatAnywhere API密钥未配置，将使用本地智能算法作为降级方案');
      }
    } catch (error) {
      console.error('❌ ChatAnywhere AI服务初始化失败:', error);
    }
  }

  /**
   * 检查API是否可用
   */
  isApiAvailable() {
    return this.apiKey && this.apiKey !== 'sk-your-api-key-here' && this.baseURL;
  }

  /**
   * 设置API密钥
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    wx.setStorageSync('chatanywhere_api_key', apiKey);
    console.log('✅ ChatAnywhere API密钥已更新');
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

      // 检查API是否可用
      if (!this.isApiAvailable()) {
        console.warn('⚠️ ChatAnywhere API不可用，使用本地智能算法');
        return this.generateLocalTaskRecommendations(userProfile, emotionalState, characterGrowth, userStats);
      }

      // 检查速率限制
      const rateLimitCheck = this.checkRateLimit();
      if (!rateLimitCheck.canRequest) {
        console.warn('⏰ 速率限制:', rateLimitCheck.message);
        console.warn('⚠️ 降级到本地智能算法');
        return this.generateLocalTaskRecommendations(userProfile, emotionalState, characterGrowth, userStats);
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
      console.error('ChatAnywhere AI任务推荐失败:', error);

      // 网络错误或API错误时降级到本地算法
      console.warn('⚠️ AI服务失败，降级到本地智能算法');
      return this.generateLocalTaskRecommendations(userProfile, emotionalState, characterGrowth, userStats);

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
   * 本地智能算法生成任务推荐（降级方案）
   */
  generateLocalTaskRecommendations(userProfile, emotionalState, characterGrowth, userStats) {
    try {
      console.log('🧠 使用本地智能算法生成任务推荐...');

      const recommendations = [];
      const currentHour = new Date().getHours();
      const dayOfWeek = new Date().getDay();

      // 基础任务模板
      const taskTemplates = {
        morning: [
          { title: '晨间阅读', category: '学习', difficulty: 2, estimatedTime: 30, priority: 3 },
          { title: '制定今日计划', category: '规划', difficulty: 1, estimatedTime: 15, priority: 4 },
          { title: '晨练运动', category: '健康', difficulty: 3, estimatedTime: 45, priority: 3 }
        ],
        afternoon: [
          { title: '技能学习', category: '学习', difficulty: 4, estimatedTime: 60, priority: 3 },
          { title: '整理工作空间', category: '生活', difficulty: 2, estimatedTime: 20, priority: 2 },
          { title: '社交联系', category: '社交', difficulty: 2, estimatedTime: 30, priority: 2 }
        ],
        evening: [
          { title: '反思总结', category: '成长', difficulty: 2, estimatedTime: 20, priority: 4 },
          { title: '放松冥想', category: '健康', difficulty: 1, estimatedTime: 15, priority: 3 },
          { title: '准备明日', category: '规划', difficulty: 1, estimatedTime: 10, priority: 3 }
        ],
        weekend: [
          { title: '深度学习项目', category: '学习', difficulty: 5, estimatedTime: 120, priority: 4 },
          { title: '户外活动', category: '健康', difficulty: 3, estimatedTime: 90, priority: 3 },
          { title: '家庭时间', category: '生活', difficulty: 1, estimatedTime: 60, priority: 4 }
        ]
      };

      // 根据时间选择合适的任务模板
      let selectedTemplates = [];
      if (dayOfWeek === 0 || dayOfWeek === 6) { // 周末
        selectedTemplates = taskTemplates.weekend;
      } else if (currentHour < 12) { // 上午
        selectedTemplates = taskTemplates.morning;
      } else if (currentHour < 18) { // 下午
        selectedTemplates = taskTemplates.afternoon;
      } else { // 晚上
        selectedTemplates = taskTemplates.evening;
      }

      // 根据用户属性调整任务
      selectedTemplates.forEach((template, index) => {
        if (index >= 3) return; // 最多3个任务

        const task = {
          id: `local_${Date.now()}_${index}`,
          title: template.title,
          description: this.generateTaskDescription(template),
          category: template.category,
          difficulty: template.difficulty,
          estimatedTime: template.estimatedTime,
          priority: template.priority,
          expectedBenefits: this.generateExpectedBenefits(template.category),
          source: 'local_algorithm',
          generatedAt: new Date().toISOString(),
          estimatedReward: this.calculateReward(template.difficulty, template.estimatedTime),
          personalizedReason: this.generatePersonalizedReason(template, emotionalState)
        };

        recommendations.push(task);
      });

      console.log('✅ 本地智能算法生成任务推荐成功:', recommendations.length, '个任务');
      return recommendations;

    } catch (error) {
      console.error('❌ 本地智能算法失败:', error);

      // 返回基础任务作为最后的降级方案
      return [{
        id: `fallback_${Date.now()}`,
        title: '制定今日目标',
        description: '花几分钟时间思考并写下今天想要完成的3件重要事情',
        category: '规划',
        difficulty: 1,
        estimatedTime: 10,
        priority: 4,
        expectedBenefits: '提升专注力和执行力',
        source: 'fallback',
        generatedAt: new Date().toISOString(),
        estimatedReward: { experience: 20, coins: 5 },
        personalizedReason: '良好的规划是成功的开始'
      }];
    }
  }

  /**
   * 生成任务描述
   */
  generateTaskDescription(template) {
    const descriptions = {
      '晨间阅读': '选择一本有益的书籍，专注阅读30分钟，记录感想',
      '制定今日计划': '列出今天的重要任务，按优先级排序，制定时间安排',
      '晨练运动': '进行适度的晨间运动，如慢跑、瑜伽或拉伸',
      '技能学习': '学习一项新技能或深化现有技能，可以是编程、语言或其他',
      '整理工作空间': '清理桌面，整理文件，创造一个舒适的工作环境',
      '社交联系': '主动联系朋友或家人，维护重要的人际关系',
      '反思总结': '回顾今天的收获和不足，思考明天的改进方向',
      '放松冥想': '进行深呼吸或冥想练习，放松身心',
      '准备明日': '整理明天需要的物品，预览明天的日程安排',
      '深度学习项目': '投入时间进行深度学习或完成重要项目',
      '户外活动': '到户外走走，享受自然，进行体育活动',
      '家庭时间': '与家人共度美好时光，增进感情'
    };

    return descriptions[template.title] || '完成这个有意义的任务，提升自己';
  }

  /**
   * 生成预期收益
   */
  generateExpectedBenefits(category) {
    const benefits = {
      '学习': '提升知识水平和认知能力',
      '健康': '改善身体状况和精神状态',
      '规划': '提高效率和目标达成率',
      '生活': '改善生活质量和环境',
      '社交': '增强人际关系和社交能力',
      '成长': '促进自我反思和个人成长'
    };

    return benefits[category] || '提升个人综合能力';
  }

  /**
   * 生成个性化原因
   */
  generatePersonalizedReason(template, emotionalState) {
    const reasons = [
      '根据你当前的状态，这个任务能帮助你获得成就感',
      '这是一个适合你现在完成的任务',
      '完成这个任务将对你的成长很有帮助',
      '这个任务符合你的当前需求',
      '建议你尝试这个任务来提升自己'
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
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
        max_tokens: 1500,
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

    return `你是一位资深的奇幻小说作家和RPG游戏设计师，擅长创作引人入胜的冒险故事。请基于用户的真实生活行为，创作一个充满想象力和沉浸感的RPG冒险故事章节。

🎭 角色档案：
- 冒险者姓名：${characterData.name}
- 职业身份：${characterData.class || '神秘冒险者'}
- 冒险等级：第${characterData.level}级
- 积累经验：${characterData.experience}点冒险经验
- 角色特质：根据完成的任务和习惯展现出的性格特点

📋 今日现实成就转化为冒险行为：
${todayTasks.length > 0 ? todayTasks.map(task => `🎯 【${task.title}】- 在奇幻世界中可能对应：完成了一项重要的冒险任务或挑战`).join('\n') : '🎯 今日虽无具体任务完成，但冒险者在默默积蓄力量...'}

🔄 今日习惯养成转化为能力提升：
${todayHabits.length > 0 ? todayHabits.map(habit => `💪 【${habit.name}】- 通过持续的修炼，${characterData.name}的某项核心能力得到了强化`).join('\n') : '💪 今日虽无习惯完成，但内在的潜力正在悄然觉醒...'}

🎒 神秘收藏品的力量：
${recentItems.length > 0 ? recentItems.map(item => `✨ 【${item.name}】(${item.category || '未知类别'}) - ${item.description || '这件物品散发着神秘的魔法光芒，似乎蕴含着特殊的力量'}`).join('\n') : '✨ 虽然暂无特殊收藏，但${characterData.name}敏锐的直觉告诉他，重要的发现即将到来...'}

${previousStory ? `📖 前情回顾：
在上一次的冒险中：${previousStory.content}

现在，故事将在此基础上继续发展，展现${characterData.name}面临的新挑战和机遇...` : `📖 全新冒险的开端：
这是${characterData.name}冒险传奇的新篇章，一个充满无限可能的开始...`}

🎨 创作指导原则：
1. 【现实映射】：巧妙地将用户的现实任务转化为奇幻世界中的具体冒险情节，让每个完成的任务都成为故事中的英雄行为
2. 【物品赋能】：让用户收藏的物品在故事中扮演关键角色，赋予它们神奇的属性和重要的剧情作用
3. 【成长体现】：通过完成的习惯展现角色的能力提升、性格塑造和内在成长
4. 【情节张力】：构建有起伏的故事节奏，包含挑战、转折、高潮和收获
5. 【选择分支】：在故事结尾提供3个各具特色的选择，每个选择都应该有明确的风险和收益
6. 【丰富描写】：使用生动的环境描写、细腻的心理刻画和精彩的动作场面
7. 【字数要求】：故事内容应达到500-600字，确保情节饱满、描写细致
8. 【情感共鸣】：让读者能感受到成就感、冒险的刺激和角色成长的喜悦

🎯 故事风格要求：
- 语言风格：生动活泼，富有画面感，适合中文读者的表达习惯
- 情节节奏：开头引人入胜，中间波澜起伏，结尾留有悬念
- 角色塑造：突出${characterData.name}的个人特色和成长轨迹
- 世界观：构建一个既熟悉又新奇的奇幻世界，融合现代元素和古典魔法

请严格按照以下JSON格式返回，确保所有字段都完整填写：

{
  "title": "富有诗意和吸引力的章节标题（10-20字）",
  "content": "详细生动的故事内容（500-600字，包含环境描写、对话、心理活动、动作场面等丰富元素）",
  "mood": "故事整体氛围（从以下选择：exciting兴奋刺激, mysterious神秘莫测, triumphant胜利凯旋, challenging充满挑战, inspiring鼓舞人心, adventurous冒险刺激, peaceful宁静祥和, empowering力量觉醒）",
  "choices": [
    {
      "id": "choice1",
      "text": "第一个选择的具体描述（20-30字，要有吸引力）",
      "consequence": "选择后可能的结果和风险提示（30-50字）"
    },
    {
      "id": "choice2", 
      "text": "第二个选择的具体描述（20-30字，与第一个形成对比）",
      "consequence": "选择后可能的结果和风险提示（30-50字）"
    },
    {
      "id": "choice3",
      "text": "第三个选择的具体描述（20-30字，提供另一种可能）", 
      "consequence": "选择后可能的结果和风险提示（30-50字）"
    }
  ],
  "rewards": {
    "experience": 根据完成任务和习惯数量计算的经验值（数字），
    "items": ["根据故事情节可能获得的1-3件物品"],
    "skills": ["通过这次冒险提升的2-4项技能或能力"]
  },
  "nextHints": "对下一章节发展的神秘预告（50-80字，要有悬念和期待感）"
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

      const prompt = `你是一位经验丰富的RPG故事编剧，现在需要基于玩家的选择继续编写精彩的冒险故事分支。

📖 故事背景回顾：
【上一章节】：${previousStory.title}
【故事内容】：${previousStory.content}

🎯 玩家的关键决定：
【选择内容】：${userChoice.text}
【预期后果】：${userChoice.consequence}

👤 冒险者档案：
- 英雄姓名：${characterData.name}
- 当前等级：第${characterData.level}级
- 角色职业：${characterData.class || '神秘冒险者'}
- 当前章节：第${previousStory.chapter || 1}章
- 总章节数：${previousStory.totalChapters || 4}章
- 成长状态：通过这次选择展现出的新特质

🎨 故事续写要求：
1. 【选择后果】：详细展现用户选择带来的直接影响和连锁反应
2. 【情节连贯】：与前一章节无缝衔接，保持世界观和角色设定的一致性
3. 【冲突升级】：引入新的挑战、谜团或机遇，推动故事向前发展
4. 【角色成长】：通过这次经历展现${characterData.name}的能力提升或性格变化
5. 【环境描写】：丰富的场景描述，让读者身临其境
6. 【对话互动】：适当加入角色对话或内心独白，增强代入感
7. 【悬念设置】：在结尾留下钩子，为下一次选择做铺垫
8. 【字数控制】：故事内容500字左右，确保情节饱满而不冗长

🌟 创作风格指导：
- 语言风格：生动形象，富有节奏感，符合中文表达习惯
- 情感色彩：根据选择的性质调整故事氛围（紧张、温馨、神秘等）
- 细节刻画：注重动作描写、环境渲染和心理活动的细腻表现
- 想象力：在合理范围内发挥创意，让故事充满奇幻色彩
- 章节意识：${previousStory.chapter >= 3 ? '这是接近尾声的章节，要为故事的结束做铺垫' : '这是故事发展的重要阶段，要推动情节向前发展'}

请严格按照以下JSON格式返回完整的故事数据，不要添加任何格式说明或其他文字：

{
  "title": "富有吸引力的新章节标题（12-25字，体现这次选择的核心主题）",
  "content": "详细生动的故事续写内容（500字左右，包含丰富的描写和情节发展）",
  "mood": "故事氛围（选择：exciting兴奋刺激, mysterious神秘莫测, triumphant胜利凯旋, challenging充满挑战, inspiring鼓舞人心, adventurous冒险刺激, peaceful宁静祥和, empowering力量觉醒, dramatic戏剧性转折）",
  "choices": [
    {
      "id": "choice1",
      "text": "第一个新选择的描述（25-35字，要有吸引力和挑战性）",
      "consequence": "这个选择可能带来的结果预告（40-60字，要有悬念）"
    },
    {
      "id": "choice2",
      "text": "第二个新选择的描述（25-35字，与第一个形成鲜明对比）",
      "consequence": "这个选择可能带来的结果预告（40-60字，要有悬念）"
    },
    {
      "id": "choice3",
      "text": "第三个新选择的描述（25-35字，提供独特的解决方案）",
      "consequence": "这个选择可能带来的结果预告（40-60字，要有悬念）"
    }
  ],
  "rewards": {
    "experience": 根据故事发展给予的经验值（50-150之间的数字），
    "items": ["根据剧情可能获得的1-2件新物品或道具"],
    "skills": ["通过这次经历提升的2-3项具体技能或能力"]
  },
  "nextHints": "对下一章节发展的神秘预告（60-100字，要充满悬念和期待感）"
}`;

      const response = await this.callDeepSeek([{
        role: "user",
        content: prompt
      }], {
        max_tokens: 1200,
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
