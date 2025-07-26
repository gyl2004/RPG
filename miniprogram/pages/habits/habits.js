// 习惯中心页面
import { checkLoginAndRedirect } from '../../utils/auth-helper.js';

Page({
  data: {
    habits: [],
    statistics: {},
    categories: {},
    statuses: {},
    loading: false,
    currentFilter: 'all',
    todayDate: '',
    filters: [
      { id: 'all', name: '全部', icon: '📋' },
      { id: 'active', name: '进行中', icon: '🔥' },
      { id: 'paused', name: '已暂停', icon: '⏸️' },
      { id: 'completed', name: '已完成', icon: '✅' }
    ]
  },

  onLoad: function() {
    // 设置今天的日期
    const today = new Date();
    this.setData({
      todayDate: today.toISOString().split('T')[0]
    });
  },

  onShow: function() {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/habits/habits')) {
      return;
    }

    this.loadHabits();
    this.loadHabitOptions();
  },

  /**
   * 加载习惯数据
   */
  loadHabits() {
    try {
      this.setData({ loading: true });

      const habitService = this.getHabitService();
      if (!habitService) {
        throw new Error('习惯服务不可用');
      }

      let habits = habitService.getUserHabits();
      const statistics = habitService.getHabitStatistics();

      // 为每个习惯添加今日打卡状态和本周进度
      const today = this.data.todayDate;
      habits = habits.map(habit => {
        const todayChecked = habit.checkIns.some(checkIn => checkIn.date === today);

        // 计算本周进度
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];

        const weeklyProgress = habit.checkIns.filter(checkIn =>
          checkIn.date >= weekStartStr
        ).length;

        return {
          ...habit,
          todayChecked,
          weeklyProgress
        };
      });

      this.setData({
        habits,
        statistics
      });
    } catch (error) {
      console.error('加载习惯失败:', error);
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
   * 过滤习惯
   */
  filterHabits(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });

    try {
      const habitService = this.getHabitService();
      if (!habitService) return;

      let habits;
      if (filter === 'all') {
        habits = habitService.getUserHabits();
      } else {
        habits = habitService.getUserHabits({ status: filter });
      }

      this.setData({ habits });
    } catch (error) {
      console.error('过滤习惯失败:', error);
    }
  },

  /**
   * 习惯打卡
   */
  checkInHabit(e) {
    const habitId = e.currentTarget.dataset.habitId;

    try {
      const habitService = this.getHabitService();
      if (!habitService) {
        throw new Error('习惯服务不可用');
      }

      const result = habitService.checkInHabit(habitId);

      if (result.success) {
        wx.showToast({
          title: '打卡成功！',
          icon: 'success'
        });

        // 重新加载数据
        this.loadHabits();
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
   * 查看习惯详情
   */
  viewHabitDetail(e) {
    const habitId = e.currentTarget.dataset.habitId;
    wx.navigateTo({
      url: `/pages/habit-detail/habit-detail?id=${habitId}`
    });
  },

  /**
   * 创建新习惯
   */
  createHabit() {
    wx.navigateTo({
      url: '/pages/create-habit/create-habit'
    });
  },

  /**
   * 检查今天是否已打卡
   */
  isTodayCheckedIn(habit) {
    const today = this.data.todayDate;
    return habit.checkIns.some(checkIn => checkIn.date === today);
  },

  /**
   * 删除习惯
   */
  deleteHabit(e) {
    const habitId = e.currentTarget.dataset.habitId;
    const habitName = e.currentTarget.dataset.habitName;

    wx.showModal({
      title: '删除习惯',
      content: `确定要删除习惯"${habitName}"吗？\n\n删除后将无法恢复所有打卡记录。`,
      confirmText: '删除',
      confirmColor: '#ef4444',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.confirmDeleteHabit(habitId);
        }
      }
    });
  },

  /**
   * 确认删除习惯
   */
  confirmDeleteHabit(habitId) {
    try {
      const habitService = this.getHabitService();
      if (!habitService) {
        throw new Error('习惯服务不可用');
      }

      const result = habitService.deleteHabit(habitId);

      if (result.success) {
        wx.showToast({
          title: '习惯已删除',
          icon: 'success'
        });

        // 重新加载数据
        this.loadHabits();
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
    }
  },

  /**
   * 暂停/恢复习惯
   */
  toggleHabitStatus(e) {
    const habitId = e.currentTarget.dataset.habitId;
    const currentStatus = e.currentTarget.dataset.status;
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    try {
      const habitService = this.getHabitService();
      if (!habitService) {
        throw new Error('习惯服务不可用');
      }

      const result = habitService.updateHabitStatus(habitId, newStatus);

      if (result.success) {
        wx.showToast({
          title: newStatus === 'active' ? '习惯已恢复' : '习惯已暂停',
          icon: 'success'
        });

        // 重新加载数据
        this.loadHabits();
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
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadHabits();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});
