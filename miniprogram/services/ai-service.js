// AI服务 - 接入真实AI API
class AIService {
  constructor() {
    this.apiKey = ''; // 需要配置真实的API密钥
    this.baseURL = 'https://api.openai.com/v1';
    this.model = 'gpt-3.5-turbo';

    // 引用DeepSeek AI服务
    try {
      const DeepSeekAIService = require('./deepseek-ai-service.js');
      this.deepSeekService = new DeepSeekAIService();
    } catch (error) {
      console.error('无法加载DeepSeek AI服务:', error);
      this.deepSeekService = null;
    }
  }

  /**
   * 生成AI任务推荐
   */
  async generateTaskRecommendations(userProfile, emotionalState, characterGrowth, userStats) {
    try {
      const prompt = this.buildTaskRecommendationPrompt(userProfile, emotionalState, characterGrowth, userStats);

      const response = await this.callOpenAI(prompt, {
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      return this.parseTaskRecommendations(response);
    } catch (error) {
      console.error('AI任务推荐生成失败:', error);
      // 降级到本地算法
      return this.fallbackToLocalRecommendations(userProfile, emotionalState, characterGrowth, userStats);
    }
  }

  /**
   * 构建任务推荐的提示词
   */
  buildTaskRecommendationPrompt(userProfile, emotionalState, characterGrowth, userStats) {
    return `你是一个专业的生活教练和任务规划师。请基于以下用户信息，为用户生成5个个性化的任务推荐。

用户信息：
- 角色类型：${userProfile.characterType}
- 活跃时间偏好：${userProfile.preferences?.activeTime || '未设置'}
- 当前情感状态：
  * 幸福度：${emotionalState.metrics?.happiness || 50}/100
  * 动力值：${emotionalState.metrics?.motivation || 50}/100
  * 自信度：${emotionalState.metrics?.confidence || 50}/100
  * 压力值：${emotionalState.metrics?.stress || 50}/100
- 角色成长指标：
  * 力量：${characterGrowth.growthMetrics?.strength || 50}/100
  * 智慧：${characterGrowth.growthMetrics?.wisdom || 50}/100
  * 创造力：${characterGrowth.growthMetrics?.creativity || 50}/100
  * 社交：${characterGrowth.growthMetrics?.social || 50}/100
  * 自律：${characterGrowth.growthMetrics?.discipline || 50}/100
- 用户统计：
  * 等级：${userStats.level}
  * 已完成任务：${userStats.tasksCompleted}
  * 最长习惯连续天数：${userStats.maxHabitStreak}

请返回JSON格式的任务推荐，包含以下字段：
{
  "recommendations": [
    {
      "title": "任务标题",
      "description": "详细描述",
      "category": "任务分类(wellness/productivity/learning/creative/social/fitness)",
      "difficulty": "难度(easy/medium/hard)",
      "estimatedTime": 预计时间(分钟),
      "personalizedReason": "个性化推荐理由",
      "tags": ["标签1", "标签2"],
      "priority": 优先级(1-10),
      "expectedBenefits": "预期收益"
    }
  ]
}

要求：
1. 任务要具体可执行，不要太抽象
2. 考虑用户当前的情感状态和成长需求
3. 根据角色类型调整任务风格
4. 时间安排要合理（15-90分钟）
5. 提供清晰的个性化理由`;
  }

  /**
   * 调用OpenAI API
   */
  async callOpenAI(prompt, options = {}) {
    const requestData = {
      model: this.model,
      messages: [
        {
          role: "system",
          content: "你是一个专业的生活教练，擅长为用户制定个性化的成长任务。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      ...options
    };

    // 注意：微信小程序中需要使用wx.request，并且需要配置域名白名单
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseURL}/chat/completions`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        data: requestData,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data.choices[0].message.content);
          } else {
            reject(new Error(`API调用失败: ${res.statusCode}`));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * 解析AI返回的任务推荐
   */
  parseTaskRecommendations(response) {
    try {
      const data = JSON.parse(response);
      return data.recommendations.map(task => ({
        ...task,
        id: 'ai_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        source: 'ai_generated',
        generatedAt: new Date().toISOString(),
        estimatedReward: this.calculateReward(task.difficulty, task.estimatedTime)
      }));
    } catch (error) {
      console.error('解析AI响应失败:', error);
      return [];
    }
  }

  /**
   * 计算任务奖励
   */
  calculateReward(difficulty, estimatedTime) {
    const baseReward = { coins: 20, experience: 50 };
    const difficultyMultiplier = {
      'easy': 1,
      'medium': 1.5,
      'hard': 2
    };
    const timeMultiplier = Math.max(1, estimatedTime / 30);
    const multiplier = (difficultyMultiplier[difficulty] || 1) * timeMultiplier;

    return {
      coins: Math.floor(baseReward.coins * multiplier),
      experience: Math.floor(baseReward.experience * multiplier)
    };
  }

  /**
   * 降级到本地推荐算法
   */
  fallbackToLocalRecommendations(userProfile, emotionalState, characterGrowth, userStats) {
    // 使用现有的本地算法作为备选方案
    const storyService = require('./story-service.js');
    return storyService.generateAITasks();
  }

  /**
   * 生成个性化故事内容
   */
  async generatePersonalizedStory(userAchievements, characterType, recentActivities) {
    try {
      const prompt = `基于用户的成就和活动，创作一个个性化的故事章节：

用户信息：
- 角色类型：${characterType}
- 最近成就：${JSON.stringify(userAchievements)}
- 最近活动：${JSON.stringify(recentActivities)}

请创作一个500字左右的故事章节，要求：
1. 体现用户的真实成长
2. 符合角色类型特点
3. 有积极的激励作用
4. 包含具体的成就认可

返回JSON格式：
{
  "title": "章节标题",
  "content": "故事内容",
  "theme": "主题",
  "rewards": {
    "coins": 金币数量,
    "experience": 经验值
  }
}`;

      const response = await this.callOpenAI(prompt, {
        max_tokens: 800,
        temperature: 0.8
      });

      return JSON.parse(response);
    } catch (error) {
      console.error('AI故事生成失败:', error);
      return null;
    }
  }

  /**
   * 生成情感分析和建议
   */
  async generateEmotionalAdvice(userActivities, currentMetrics) {
    try {
      const prompt = `作为心理健康顾问，基于用户的活动和情感指标，提供专业建议：

当前情感指标：
- 幸福度：${currentMetrics.happiness}/100
- 动力值：${currentMetrics.motivation}/100
- 自信度：${currentMetrics.confidence}/100
- 压力值：${currentMetrics.stress}/100

最近活动：${JSON.stringify(userActivities)}

请提供：
1. 情感状态分析
2. 具体的改善建议
3. 推荐的活动类型

返回JSON格式：
{
  "analysis": "情感状态分析",
  "advice": "改善建议",
  "recommendedActivities": ["活动1", "活动2", "活动3"]
}`;

      const response = await this.callOpenAI(prompt, {
        max_tokens: 500,
        temperature: 0.6
      });

      return JSON.parse(response);
    } catch (error) {
      console.error('AI情感分析失败:', error);
      return null;
    }
  }

  /**
   * 生成AI驱动的随机事件
   */
  async generateAIRandomEvent(userProfile, userStats, emotionalState) {
    try {
      const prompt = this.buildRandomEventPrompt(userProfile, userStats, emotionalState);

      const response = await this.callDeepSeek([{ role: 'user', content: prompt }]);

      if (response) {
        // deepseek-ai-service.js 返回的是字符串内容
        const content = typeof response === 'string' ? response : response.choices[0].message.content;
        const eventData = this.parseRandomEventResponse(content);

        if (eventData) {
          return {
            success: true,
            event: eventData,
            source: 'chatanywhere_gpt'
          };
        }
      }

      throw new Error('AI响应格式无效');
    } catch (error) {
      console.error('AI生成随机事件失败:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackRandomEvent(userProfile, userStats)
      };
    }
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
   * 构建随机事件生成的提示词
   */
  buildRandomEventPrompt(userProfile, userStats, emotionalState) {
    return `作为一个RPG游戏的随机事件生成器，请为用户生成一个个性化的随机事件。

用户信息：
- 角色类型：${this.getCharacterTypeName(userProfile.characterType)}
- 等级：${userStats.level || 1}
- 完成任务数：${userStats.tasksCompleted || 0}
- 习惯连击：${userStats.maxHabitStreak || 0}
- 当前情感状态：${emotionalState.primaryEmotion || 'balanced'}
- 压力水平：${emotionalState.metrics?.stress || 50}
- 动机水平：${emotionalState.metrics?.motivation || 50}

请生成一个符合用户当前状态的随机事件，要求：
1. 事件应该与用户的角色类型和当前状态相关
2. 事件类型可以是正面的机遇、挑战、发现或意外收获
3. 奖励应该合理且有吸引力
4. 描述要生动有趣，符合RPG游戏风格
5. 稀有度根据用户等级和活跃度确定

请严格按照以下JSON格式返回：
{
  "name": "事件名称",
  "description": "事件描述（50-100字，生动有趣）",
  "icon": "合适的emoji图标",
  "type": "事件类型(positive/challenge/discovery/neutral)",
  "rarity": "稀有度(common/uncommon/rare/legendary)",
  "effects": {
    "coins": 金币奖励数量,
    "experience": 经验奖励数量,
    "specialReward": "特殊奖励描述（可选）"
  },
  "personalizedReason": "为什么这个事件适合当前用户的个性化解释"
}

示例：
{
  "name": "神秘图书馆",
  "description": "你在城市的角落发现了一座隐秘的古老图书馆，里面藏着珍贵的知识宝藏。管理员愿意与你分享一些智慧。",
  "icon": "📚",
  "type": "discovery",
  "rarity": "rare",
  "effects": {
    "coins": 100,
    "experience": 150,
    "specialReward": "智慧加成"
  },
  "personalizedReason": "作为学者型角色，你对知识的渴求让你更容易发现这样的机会"
}`;
  }

  /**
   * 解析随机事件响应
   */
  parseRandomEventResponse(content) {
    try {
      // 提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('未找到有效的JSON格式');
      }

      const eventData = JSON.parse(jsonMatch[0]);

      // 验证必需字段
      if (!eventData.name || !eventData.description || !eventData.icon || !eventData.type) {
        throw new Error('缺少必需的事件字段');
      }

      // 设置默认值
      eventData.rarity = eventData.rarity || 'common';
      eventData.effects = eventData.effects || { coins: 50, experience: 25 };

      // 确保奖励数值合理
      if (eventData.effects.coins) {
        eventData.effects.coins = Math.max(10, Math.min(500, eventData.effects.coins));
      }
      if (eventData.effects.experience) {
        eventData.effects.experience = Math.max(10, Math.min(300, eventData.effects.experience));
      }

      return eventData;
    } catch (error) {
      console.error('解析随机事件响应失败:', error);
      return null;
    }
  }

  /**
   * 生成降级随机事件
   */
  generateFallbackRandomEvent(userProfile, userStats) {
    const fallbackEvents = [
      {
        name: '幸运发现',
        description: '你在日常活动中发现了一些意外的收获，这让你感到惊喜！',
        icon: '🍀',
        type: 'positive',
        rarity: 'common',
        effects: { coins: 75, experience: 50 },
        personalizedReason: '每个人都有遇到幸运的时候'
      },
      {
        name: '灵感闪现',
        description: '突然的灵感让你对生活有了新的理解和想法。',
        icon: '💡',
        type: 'discovery',
        rarity: 'uncommon',
        effects: { coins: 50, experience: 100, specialReward: '创意提升' },
        personalizedReason: '你的思维活跃度让你更容易获得灵感'
      },
      {
        name: '意外邂逅',
        description: '你遇到了一位有趣的人，从交谈中获得了宝贵的人生经验。',
        icon: '🤝',
        type: 'positive',
        rarity: 'common',
        effects: { coins: 60, experience: 80 },
        personalizedReason: '人际交往总能带来意想不到的收获'
      }
    ];

    const randomIndex = Math.floor(Math.random() * fallbackEvents.length);
    return fallbackEvents[randomIndex];
  }

  /**
   * 调用DeepSeek AI服务
   */
  async callDeepSeek(messages, options = {}) {
    if (!this.deepSeekService) {
      throw new Error('DeepSeek AI服务不可用');
    }
    
    try {
      const response = await this.deepSeekService.callDeepSeek(messages, options);
      return response;
    } catch (error) {
      console.error('调用DeepSeek AI服务失败:', error);
      throw error;
    }
  }
}

// 导出单例
const aiService = new AIService();
module.exports = aiService;
