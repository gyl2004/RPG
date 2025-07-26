// 创建习惯页面
import { checkLoginAndRedirect } from '../../utils/auth-helper.js';

Page({
  data: {
    formData: {
      name: '',
      description: '',
      category: 'health',
      frequency: 'daily',
      targetCount: 1,
      reminderTime: '',
      notes: ''
    },
    categories: {},
    frequencies: {},
    categoriesArray: [],
    frequenciesArray: [],
    showCategoryPicker: false,
    showFrequencyPicker: false,
    loading: false,
    creating: false // 添加创建状态标记
  },

  onLoad: function() {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/create-habit/create-habit')) {
      return;
    }
    
    this.loadHabitOptions();
  },

  /**
   * 加载习惯选项数据
   */
  loadHabitOptions() {
    try {
      const habitService = this.getHabitService();
      if (!habitService) {
        throw new Error('习惯服务不可用');
      }

      const categories = habitService.getHabitCategories();
      const frequencies = habitService.getHabitFrequencies();

      // 转换对象为数组，供WXML使用
      const categoriesArray = Object.values(categories);
      const frequenciesArray = Object.values(frequencies);

      this.setData({
        categories,
        frequencies,
        categoriesArray,
        frequenciesArray
      });
    } catch (error) {
      console.error('加载习惯选项失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  /**
   * 获取习惯服务
   */
  getHabitService() {
    try {
      return require('../../services/habit-service.js');
    } catch (error) {
      console.error('获取习惯服务失败:', error);
      return null;
    }
  },

  /**
   * 输入习惯名称
   */
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  /**
   * 输入习惯描述
   */
  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value
    });
  },

  /**
   * 输入备注
   */
  onNotesInput(e) {
    this.setData({
      'formData.notes': e.detail.value
    });
  },

  /**
   * 显示分类选择器
   */
  showCategoryPicker() {
    this.setData({ showCategoryPicker: true });
  },

  /**
   * 显示频率选择器
   */
  showFrequencyPicker() {
    this.setData({ showFrequencyPicker: true });
  },

  /**
   * 关闭选择器
   */
  closePicker() {
    this.setData({
      showCategoryPicker: false,
      showFrequencyPicker: false
    });
  },

  /**
   * 选择分类
   */
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      'formData.category': category,
      showCategoryPicker: false
    });
  },

  /**
   * 选择频率
   */
  selectFrequency(e) {
    const frequency = e.currentTarget.dataset.frequency;
    this.setData({
      'formData.frequency': frequency,
      showFrequencyPicker: false
    });
  },

  /**
   * 目标次数变化
   */
  onTargetCountChange(e) {
    this.setData({
      'formData.targetCount': parseInt(e.detail.value) || 1
    });
  },

  /**
   * 提醒时间变化
   */
  onReminderTimeChange(e) {
    this.setData({
      'formData.reminderTime': e.detail.value
    });
  },

  /**
   * 验证表单
   */
  validateForm() {
    const { name, category, frequency } = this.data.formData;
    
    if (!name.trim()) {
      wx.showToast({
        title: '请输入习惯名称',
        icon: 'none'
      });
      return false;
    }
    
    if (name.trim().length > 20) {
      wx.showToast({
        title: '习惯名称不能超过20个字符',
        icon: 'none'
      });
      return false;
    }
    
    if (!category) {
      wx.showToast({
        title: '请选择习惯分类',
        icon: 'none'
      });
      return false;
    }
    
    if (!frequency) {
      wx.showToast({
        title: '请选择习惯频率',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  /**
   * 创建习惯
   */
  createHabit() {
    // 防止重复点击 - 使用双重检查
    if (this.data.loading || this.data.creating) {
      console.log('正在创建中，忽略重复点击');
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    try {
      // 设置创建状态，防止重复提交
      this.setData({
        loading: true,
        creating: true
      });

      const habitService = this.getHabitService();
      if (!habitService) {
        throw new Error('习惯服务不可用');
      }

      console.log('开始创建习惯:', this.data.formData);
      const result = habitService.createHabit(this.data.formData);
      console.log('创建结果:', result);

      if (result.success) {
        wx.showToast({
          title: '习惯创建成功',
          icon: 'success'
        });

        // 返回习惯列表页面
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
        // 创建失败时重置状态
        this.setData({ creating: false });
      }
    } catch (error) {
      console.error('创建习惯失败:', error);
      wx.showToast({
        title: '创建失败',
        icon: 'error'
      });
      // 出错时重置状态
      this.setData({ creating: false });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 重置表单
   */
  resetForm() {
    this.setData({
      formData: {
        name: '',
        description: '',
        category: 'health',
        frequency: 'daily',
        targetCount: 1,
        reminderTime: '',
        notes: ''
      }
    });
  }
});
