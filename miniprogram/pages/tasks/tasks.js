// 任务页面
import { checkLoginAndRedirect } from '../../utils/auth-helper.js';

Page({
  data: {
    tasks: [],
    statistics: {},
    currentFilter: 'all',
    loading: false
  },

  onLoad: function() {
    this.loadTasks();
  },

  onShow: function() {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/tasks/tasks')) {
      return;
    }

    this.loadTasks();
  },

  /**
   * 加载任务数据
   */
  loadTasks() {
    try {
      this.setData({ loading: true });

      const taskService = this.getTaskService();
      if (!taskService) {
        throw new Error('任务服务不可用');
      }

      const tasks = taskService.getUserTasks();
      const statistics = taskService.getTaskStatistics();
      const categories = taskService.getTaskCategories();
      const difficulties = taskService.getTaskDifficulties();

      this.setData({
        tasks,
        statistics,
        categories,
        difficulties
      });
    } catch (error) {
      console.error('加载任务失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
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
   * 跳转到创建任务页面
   */
  goToCreateTask() {
    wx.navigateTo({
      url: '/pages/create-task/create-task'
    });
  },

  /**
   * 跳转到AI任务推荐页面
   */
  goToAITasks() {
    wx.navigateTo({
      url: '/pages/ai-tasks/ai-tasks'
    });
  },

  /**
   * 查看任务详情
   */
  viewTaskDetail(e) {
    const taskId = e.currentTarget.dataset.taskId;
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?id=${taskId}`
    });
  },

  /**
   * 切换任务状态过滤
   */
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
    this.filterTasks(filter);
  },

  /**
   * 过滤任务
   */
  filterTasks(filter) {
    try {
      const taskService = this.getTaskService();
      if (!taskService) return;

      let tasks;
      if (filter === 'all') {
        tasks = taskService.getUserTasks();
      } else {
        tasks = taskService.getUserTasks({ status: filter });
      }

      this.setData({ tasks });
    } catch (error) {
      console.error('过滤任务失败:', error);
    }
  }
});
