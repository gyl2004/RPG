// AI测试页面
Page({
  data: {
    testResults: [],
    testing: false
  },

  onLoad: function() {
    console.log('AI测试页面加载');
    this.testServiceLoad();
  },

  /**
   * 测试服务加载
   */
  testServiceLoad() {
    try {
      const deepSeekAI = require('../../services/deepseek-ai-service.js');
      this.addTestResult('✅ DeepSeek AI服务加载成功', 'success');
      console.log('DeepSeek AI服务:', deepSeekAI);
    } catch (error) {
      this.addTestResult(`❌ DeepSeek AI服务加载失败: ${error.message}`, 'error');
      console.error('服务加载错误:', error);
    }


  },

  /**
   * 测试网络连接
   */
  async testNetworkConnection() {
    this.setData({ testing: true });
    this.addTestResult('开始测试网络连接...', 'info');

    try {
      const deepSeekAI = require('../../services/deepseek-ai-service.js');

      this.addTestResult('正在测试基础网络连接...', 'info');
      const result = await deepSeekAI.testNetworkConnection();

      if (result.success) {
        this.addTestResult(`✅ 网络连接成功: HTTP ${result.statusCode}`, 'success');
      } else {
        this.addTestResult(`❌ 网络连接失败: ${result.error}`, 'error');
      }
    } catch (error) {
      this.addTestResult(`❌ 网络测试异常: ${error.message}`, 'error');
    }

    this.setData({ testing: false });
  },

  /**
   * 测试DeepSeek AI连接
   */
  async testAIConnection() {
    this.setData({ testing: true });
    this.addTestResult('开始测试DeepSeek R1 API连接...', 'info');

    try {
      const deepSeekAI = require('../../services/deepseek-ai-service.js');
      
      this.addTestResult('正在调用API...', 'info');
      const result = await deepSeekAI.testConnection();
      
      if (result.success) {
        this.addTestResult(`✅ 连接成功: ${result.response}`, 'success');
      } else {
        this.addTestResult(`❌ 连接失败: ${result.error}`, 'error');
      }
    } catch (error) {
      this.addTestResult(`❌ 测试异常: ${error.message}`, 'error');
    }

    this.setData({ testing: false });
  },

  /**
   * 测试AI任务推荐
   */
  async testAIRecommendations() {
    this.setData({ testing: true });
    this.addTestResult('开始测试AI任务推荐...', 'info');

    try {
      const deepSeekAI = require('../../services/deepseek-ai-service.js');
      
      // 模拟用户数据
      const mockUserProfile = {
        characterType: 'explorer',
        preferences: { activeTime: 'morning' }
      };
      
      const mockEmotionalState = {
        metrics: {
          happiness: 60,
          motivation: 45,
          confidence: 70,
          stress: 30
        }
      };
      
      const mockCharacterGrowth = {
        growthMetrics: {
          strength: 50,
          wisdom: 65,
          creativity: 80,
          social: 40,
          discipline: 55
        }
      };
      
      const mockUserStats = {
        level: 3,
        tasksCompleted: 15,
        maxHabitStreak: 7,
        friendsCount: 2
      };

      this.addTestResult('正在生成AI推荐...', 'info');
      
      const recommendations = await deepSeekAI.generateTaskRecommendations(
        mockUserProfile,
        mockEmotionalState,
        mockCharacterGrowth,
        mockUserStats
      );
      
      if (recommendations && recommendations.length > 0) {
        this.addTestResult(`✅ 生成成功: 获得${recommendations.length}个推荐`, 'success');
        recommendations.forEach((task, index) => {
          this.addTestResult(`${index + 1}. ${task.title} (${task.difficulty})`, 'task');
        });
      } else {
        this.addTestResult('❌ 未获得推荐', 'error');
      }
    } catch (error) {
      this.addTestResult(`❌ 推荐生成失败: ${error.message}`, 'error');
    }

    this.setData({ testing: false });
  },

  /**
   * 添加测试结果
   */
  addTestResult(message, type) {
    const testResults = this.data.testResults;
    testResults.push({
      id: Date.now(),
      message: message,
      type: type,
      timestamp: new Date().toLocaleTimeString()
    });
    
    this.setData({ testResults });
    
    // 滚动到底部
    setTimeout(() => {
      wx.pageScrollTo({
        scrollTop: 99999,
        duration: 300
      });
    }, 100);
  },

  /**
   * 清空测试结果
   */
  clearResults() {
    this.setData({ testResults: [] });
  },

  /**
   * 复制测试结果
   */
  copyResults() {
    const results = this.data.testResults.map(item => 
      `[${item.timestamp}] ${item.message}`
    ).join('\n');
    
    wx.setClipboardData({
      data: results,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  }
});
