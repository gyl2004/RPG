// 百度文心一言AI服务
class BaiduAIService {
  constructor() {
    this.apiKey = ''; // 百度API Key
    this.secretKey = ''; // 百度Secret Key
    this.accessToken = '';
    this.baseURL = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat';
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken() {
    if (this.accessToken) {
      return this.accessToken;
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://aip.baidubce.com/oauth/2.0/token`,
        method: 'POST',
        data: {
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.secretKey
        },
        success: (res) => {
          if (res.data.access_token) {
            this.accessToken = res.data.access_token;
            resolve(this.accessToken);
          } else {
            reject(new Error('获取访问令牌失败'));
          }
        },
        fail: reject
      });
    });
  }

  /**
   * 调用文心一言API
   */
  async callWenxin(messages, options = {}) {
    try {
      const accessToken = await this.getAccessToken();
      
      return new Promise((resolve, reject) => {
        wx.request({
          url: `${this.baseURL}/completions?access_token=${accessToken}`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: {
            messages: messages,
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.8,
            penalty_score: options.penalty_score || 1.0
          },
          success: (res) => {
            if (res.statusCode === 200 && res.data.result) {
              resolve(res.data.result);
            } else {
              reject(new Error(`API调用失败: ${JSON.stringify(res.data)}`));
            }
          },
          fail: reject
        });
      });
    } catch (error) {
      throw new Error(`文心一言API调用失败: ${error.message}`);
    }
  }

  /**
   * 生成AI任务推荐
   */
  async generateTaskRecommendations(userProfile, emotionalState, characterGrowth, userStats) {
    try {
      const messages = [
        {
          role: "user",
          content: this.buildTaskRecommendationPrompt(userProfile, emotionalState, characterGrowth, userStats)
        }
      ];

      const response = await this.callWenxin(messages, {
        temperature: 0.7
      });

      return this.parseTaskRecommendations(response);
    } catch (error) {
      console.error('百度AI任务推荐失败:', error);
      // 降级到本地算法
      return this.fallbackToLocalRecommendations();
    }
  }

  /**
   * 构建任务推荐提示词
   */
  buildTaskRecommendationPrompt(userProfile, emotionalState, characterGrowth, userStats) {
    return `你是一个专业的生活教练。请为用户生成5个个性化任务推荐。

用户信息：
角色类型：${userProfile.characterType || '探险家'}
情感状态：幸福度${emotionalState.metrics?.happiness || 50}，动力值${emotionalState.metrics?.motivation || 50}
成长指标：力量${characterGrowth.growthMetrics?.strength || 50}，智慧${characterGrowth.growthMetrics?.wisdom || 50}
用户等级：${userStats.level || 1}，完成任务：${userStats.tasksCompleted || 0}

请返回JSON格式，包含5个任务，每个任务包含：
- title: 任务标题
- description: 详细描述  
- category: 分类(wellness/productivity/learning/creative/social/fitness)
- difficulty: 难度(easy/medium/hard)
- estimatedTime: 预计时间(分钟)
- personalizedReason: 推荐理由
- tags: 标签数组
- priority: 优先级(1-10)

格式：{"recommendations": [任务数组]}`;
  }

  /**
   * 解析AI响应
   */
  parseTaskRecommendations(response) {
    try {
      // 尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        if (data.recommendations) {
          return data.recommendations.map(task => ({
            ...task,
            id: 'ai_baidu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            source: 'ai_generated_baidu',
            generatedAt: new Date().toISOString(),
            estimatedReward: this.calculateReward(task.difficulty, task.estimatedTime)
          }));
        }
      }
      
      // 如果JSON解析失败，返回空数组
      return [];
    } catch (error) {
      console.error('解析百度AI响应失败:', error);
      return [];
    }
  }

  /**
   * 计算奖励
   */
  calculateReward(difficulty, estimatedTime) {
    const baseReward = { coins: 20, experience: 50 };
    const difficultyMultiplier = { 'easy': 1, 'medium': 1.5, 'hard': 2 };
    const multiplier = (difficultyMultiplier[difficulty] || 1) * Math.max(1, estimatedTime / 30);

    return {
      coins: Math.floor(baseReward.coins * multiplier),
      experience: Math.floor(baseReward.experience * multiplier)
    };
  }

  /**
   * 降级到本地算法
   */
  fallbackToLocalRecommendations() {
    return [
      {
        id: 'fallback_1',
        title: '15分钟冥想练习',
        description: '找一个安静的地方，进行15分钟的正念冥想',
        category: 'wellness',
        difficulty: 'easy',
        estimatedTime: 15,
        personalizedReason: '基于当前状态，冥想可以帮助你放松心情',
        tags: ['冥想', '放松'],
        priority: 8,
        estimatedReward: { coins: 30, experience: 50 }
      }
    ];
  }
}

module.exports = new BaiduAIService();
