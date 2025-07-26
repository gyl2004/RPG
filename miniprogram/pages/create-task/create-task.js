// 创建任务页面

// 全局创建锁，防止重复创建
let isCreatingTask = false;

Page({
  data: {
    // 表单数据
    formData: {
      title: '',
      description: '',
      category: '',
      difficulty: '',
      verification: 'none',
      estimatedTime: 30,
      deadline: '',
      tags: [],
      notes: ''
    },
    
    // 选项数据
    categories: {},
    difficulties: {},
    verificationTypes: {},
    
    // UI状态
    loading: false,
    creating: false, // 添加创建状态标记
    showCategoryPicker: false,
    showDifficultyPicker: false,
    showVerificationPicker: false,
    showTimePicker: false,
    showDatePicker: false,
    
    // 预览奖励
    previewRewards: {
      experience: 0,
      coins: 0
    },
    
    // 验证
    errors: {}
  },

  onLoad: function() {
    this.loadTaskOptions();
  },

  onShow: function() {
    // 检查登录状态
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
  },

  onUnload: function() {
    // 页面卸载时重置全局锁
    isCreatingTask = false;
  },

  /**
   * 加载任务选项数据
   */
  loadTaskOptions() {
    try {
      console.log('开始加载任务选项数据');

      const taskService = this.getTaskService();
      if (!taskService) {
        throw new Error('任务服务不可用');
      }

      const categories = taskService.getTaskCategories();
      const difficulties = taskService.getTaskDifficulties();
      const verificationTypes = taskService.getVerificationTypes();

      console.log('原始数据:', { categories, difficulties, verificationTypes });

      // 转换对象为数组，供WXML使用
      const categoriesArray = Object.values(categories);
      const difficultiesArray = Object.values(difficulties);
      const verificationTypesArray = Object.values(verificationTypes);

      console.log('转换后的数组:', { categoriesArray, difficultiesArray, verificationTypesArray });

      this.setData({
        categories,
        difficulties,
        verificationTypes,
        categoriesArray,
        difficultiesArray,
        verificationTypesArray
      });

      console.log('数据设置完成');
    } catch (error) {
      console.error('加载任务选项失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  /**
   * 获取任务服务
   */
  getTaskService() {
    try {
      return require('../../services/task-service.js');
    } catch (error) {
      console.error('获取任务服务失败:', error);
      return null;
    }
  },

  /**
   * 输入框变化处理
   */
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
    
    // 清除对应字段的错误
    if (this.data.errors[field]) {
      this.setData({
        [`errors.${field}`]: ''
      });
    }
    
    // 实时更新奖励预览
    this.updateRewardPreview();
  },

  /**
   * 显示分类选择器
   */
  showCategoryPicker() {
    console.log('显示分类选择器');
    console.log('分类数据:', this.data.categoriesArray);
    this.setData({ showCategoryPicker: true });
  },

  /**
   * 选择分类
   */
  selectCategory(e) {
    console.log('selectCategory 被调用', e);
    const category = e.currentTarget.dataset.category;
    console.log('选择的分类:', category);

    this.setData({
      'formData.category': category,
      showCategoryPicker: false
    });
    this.updateRewardPreview();
  },

  /**
   * 显示难度选择器
   */
  showDifficultyPicker() {
    this.setData({ showDifficultyPicker: true });
  },

  /**
   * 选择难度
   */
  selectDifficulty(e) {
    console.log('selectDifficulty 被调用', e);
    const difficulty = e.currentTarget.dataset.difficulty;
    console.log('选择的难度:', difficulty);

    this.setData({
      'formData.difficulty': difficulty,
      showDifficultyPicker: false
    });
    this.updateRewardPreview();
  },

  /**
   * 显示记录方式选择器
   */
  showVerificationPicker() {
    console.log('显示记录方式选择器');
    console.log('验证类型数据:', this.data.verificationTypesArray);
    this.setData({ showVerificationPicker: true });
  },

  /**
   * 选择验证方式
   */
  selectVerification(e) {
    console.log('selectVerification 被调用', e);
    const verification = e.currentTarget.dataset.verification;
    console.log('选择的验证方式:', verification);

    this.setData({
      'formData.verification': verification,
      showVerificationPicker: false
    });
  },

  /**
   * 时间滑块变化
   */
  onTimeSliderChange(e) {
    const estimatedTime = e.detail.value;
    this.setData({
      'formData.estimatedTime': estimatedTime
    });
    this.updateRewardPreview();
  },

  /**
   * 日期选择
   */
  onDateChange(e) {
    const deadline = e.detail.value;
    this.setData({
      'formData.deadline': deadline
    });
  },

  /**
   * 更新奖励预览
   */
  updateRewardPreview() {
    try {
      const taskService = this.getTaskService();
      if (!taskService) return;

      const { category, difficulty, estimatedTime } = this.data.formData;

      if (category && difficulty) {
        const rewards = taskService.calculateTaskRewards({
          category,
          difficulty,
          estimatedTime
        });

        this.setData({
          previewRewards: rewards
        });
      }
    } catch (error) {
      console.error('更新奖励预览失败:', error);
    }
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { formData } = this.data;
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = '请输入任务标题';
    }

    if (!formData.category) {
      errors.category = '请选择任务分类';
    }

    if (!formData.difficulty) {
      errors.difficulty = '请选择任务难度';
    }

    if (formData.estimatedTime < 5) {
      errors.estimatedTime = '预估时间不能少于5分钟';
    }

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  /**
   * 创建任务
   */
  createTask() {
    // 全局创建锁检查
    if (isCreatingTask) {
      console.log('全局创建锁生效，忽略重复调用');
      return;
    }

    // 双重防重复提交检查
    if (this.data.loading || this.data.creating) {
      console.log('任务创建中，忽略重复点击');
      return;
    }

    // 立即设置全局锁和本地状态
    isCreatingTask = true;
    this.data.creating = true;
    this.data.loading = true;

    if (!this.validateForm()) {
      // 重置状态
      isCreatingTask = false;
      this.data.creating = false;
      this.data.loading = false;
      this.setData({ 
        loading: false,
        creating: false 
      });
      wx.showToast({
        title: '请检查表单信息',
        icon: 'error'
      });
      return;
    }

    try {
      console.log('开始创建任务:', this.data.formData);
      this.setData({ 
        loading: true,
        creating: true 
      });

      const taskService = this.getTaskService();
      if (!taskService) {
        throw new Error('任务服务不可用');
      }

      const result = taskService.createTask(this.data.formData);
      console.log('任务创建结果:', result);

      if (result.success) {
        wx.showToast({
          title: '任务创建成功',
          icon: 'success'
        });

        // 返回任务列表页面
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('创建任务失败:', error);
      wx.showToast({
        title: '创建失败',
        icon: 'error'
      });
    } finally {
      // 重置所有状态
      isCreatingTask = false;
      this.data.creating = false;
      this.data.loading = false;
      this.setData({ 
        loading: false,
        creating: false 
      });
    }
  },

  /**
   * 重置表单
   */
  resetForm() {
    this.setData({
      formData: {
        title: '',
        description: '',
        category: '',
        difficulty: '',
        verification: 'none',
        estimatedTime: 30,
        deadline: '',
        tags: [],
        notes: ''
      },
      errors: {},
      previewRewards: {
        experience: 0,
        coins: 0
      }
    });
  },

  /**
   * 关闭选择器
   */
  closePicker() {
    this.setData({
      showCategoryPicker: false,
      showDifficultyPicker: false,
      showVerificationPicker: false
    });
  },

  /**
   * 获取分类显示名称
   */
  getCategoryName(categoryId) {
    return this.data.categories[categoryId]?.name || '请选择';
  },

  /**
   * 获取难度显示名称
   */
  getDifficultyName(difficultyId) {
    return this.data.difficulties[difficultyId]?.name || '请选择';
  },

  /**
   * 获取验证方式显示名称
   */
  getVerificationName(verificationId) {
    return this.data.verificationTypes[verificationId]?.name || '无需验证';
  },

  /**
   * 格式化时间显示
   */
  formatTime(minutes) {
    if (minutes < 60) {
      return `${minutes}分钟`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
    }
  },

  /**
   * 预览任务
   */
  previewTask() {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善任务信息',
        icon: 'error'
      });
      return;
    }

    const { formData, previewRewards } = this.data;
    const category = this.data.categories[formData.category];
    const difficulty = this.data.difficulties[formData.difficulty];

    const content = `任务：${formData.title}\n分类：${category.name}\n难度：${difficulty.name}\n时间：${this.formatTime(formData.estimatedTime)}\n奖励：${previewRewards.experience}经验 + ${previewRewards.coins}金币`;

    wx.showModal({
      title: '任务预览',
      content: content,
      showCancel: false
    });
  }
});
