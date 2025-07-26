// 习惯详情页面
import { checkLoginAndRedirect } from '../../utils/auth-helper.js';

Page({
  data: {
    habitId: '',
    habit: null,
    categories: {},
    statuses: {},
    loading: false,
    showDeleteModal: false
  },

  onLoad: function(options) {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/habit-detail/habit-detail')) {
      return;
    }
    
    if (options.id) {
      this.setData({ habitId: options.id });
      this.loadHabitDetail();
      this.loadHabitOptions();
    } else {
      wx.showToast({
        title: '习惯不存在',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  onShow: function() {
    // 每次显示时刷新数据
    if (this.data.habitId) {
      this.loadHabitDetail();
    }
  },

  /**
   * 加载习惯详情
   */
  loadHabitDetail() {
    try {
      this.setData({ loading: true });

      const habitService = this.getHabitService();
      if (!habitService) {
        throw new Error('习惯服务不可用');
      }

      const habit = habitService.getHabitById(this.data.habitId);
      if (!habit) {
        wx.showToast({
          title: '习惯不存在',
          icon: 'error'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        return;
      }

      // 计算今日打卡状态和本周打卡次数
      const today = new Date().toISOString().split('T')[0];
      const todayChecked = habit.checkIns.some(checkIn => checkIn.date === today);

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weeklyCheckIns = habit.checkIns.filter(checkIn => checkIn.date >= weekStartStr).length;

      this.setData({
        habit: {
          ...habit,
          todayChecked,
          weeklyCheckIns
        }
      });
    } catch (error) {
      console.error('加载习惯详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 加载习惯选项数据
   */
  loadHabitOptions() {
    try {
      const habitService = this.getHabitService();
      if (!habitService) return;

      const categories = habitService.getHabitCategories();
      const statuses = habitService.getHabitStatuses();

      this.setData({
        categories,
        statuses
      });
    } catch (error) {
      console.error('加载习惯选项失败:', error);
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
   * 习惯打卡
   */
  checkInHabit() {
    try {
      const habitService = this.getHabitService();
      if (!habitService) {
        throw new Error('习惯服务不可用');
      }

      const result = habitService.checkInHabit(this.data.habitId);
      
      if (result.success) {
        wx.showToast({
          title: '打卡成功！',
          icon: 'success'
        });
        
        // 重新加载数据
        this.loadHabitDetail();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('习惯打卡失败:', error);
      wx.showToast({
        title: '打卡失败',
        icon: 'error'
      });
    }
  },

  /**
   * 暂停/恢复习惯
   */
  toggleHabitStatus() {
    const habit = this.data.habit;
    const newStatus = habit.status === 'active' ? 'paused' : 'active';
    
    try {
      const habitService = this.getHabitService();
      if (!habitService) {
        throw new Error('习惯服务不可用');
      }

      const result = habitService.updateHabitStatus(this.data.habitId, newStatus);
      
      if (result.success) {
        wx.showToast({
          title: newStatus === 'active' ? '习惯已恢复' : '习惯已暂停',
          icon: 'success'
        });
        
        // 重新加载数据
        this.loadHabitDetail();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('更新习惯状态失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 显示删除确认
   */
  showDeleteConfirm() {
    this.setData({ showDeleteModal: true });
  },

  /**
   * 隐藏删除确认
   */
  hideDeleteConfirm() {
    this.setData({ showDeleteModal: false });
  },

  /**
   * 删除习惯
   */
  deleteHabit() {
    try {
      const habitService = this.getHabitService();
      if (!habitService) {
        throw new Error('习惯服务不可用');
      }

      const result = habitService.deleteHabit(this.data.habitId);
      
      if (result.success) {
        wx.showToast({
          title: '习惯已删除',
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
      }
    } catch (error) {
      console.error('删除习惯失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      });
    } finally {
      this.hideDeleteConfirm();
    }
  },

  /**
   * 格式化日期
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
});
