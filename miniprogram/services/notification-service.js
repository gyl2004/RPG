// 通知服务
// 处理应用内的通知和提醒功能

const notificationService = {
  /**
   * 检查通知权限
   */
  checkNotificationPermission() {
    return new Promise((resolve) => {
      // 在微信小程序中，通知功能主要通过Toast和Modal实现
      // 不需要特殊权限，直接返回成功
      resolve({ hasPermission: true });
    });
  },

  /**
   * 显示本地通知（模拟推送通知）
   */
  showLocalNotification(options) {
    const { title, content, data } = options;
    
    try {
      // 在微信小程序中，我们使用Toast和Modal来模拟通知
      wx.showToast({
        title: title,
        icon: 'none',
        duration: 3000
      });

      // 如果需要更详细的通知，可以使用Modal
      if (content && content.length > 10) {
        setTimeout(() => {
          wx.showModal({
            title: title,
            content: content,
            showCancel: false,
            confirmText: '知道了'
          });
        }, 500);
      }

      return { success: true };
    } catch (error) {
      console.error('显示通知失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 检查并显示待办任务提醒
   */
  async checkTaskReminders() {
    try {
      const taskService = require('./task-service.js');
      const tasks = taskService.getUserTasks();
      
      // 筛选今日未完成的任务
      const today = new Date().toISOString().split('T')[0];
      const pendingTasks = tasks.filter(task => 
        task.status === 'pending' && 
        (!task.dueDate || task.dueDate.startsWith(today))
      );

      if (pendingTasks.length > 0) {
        this.showLocalNotification({
          title: '任务提醒',
          content: `您有 ${pendingTasks.length} 个任务待完成`,
          data: { type: 'task_reminder', count: pendingTasks.length }
        });
      }

      return { success: true, count: pendingTasks.length };
    } catch (error) {
      console.error('检查任务提醒失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 检查并显示习惯提醒
   */
  async checkHabitReminders() {
    try {
      const habitService = require('./habit-service.js');
      const habits = habitService.getUserHabits({ status: 'active' });
      
      // 检查今日未打卡的习惯
      const today = new Date().toISOString().split('T')[0];
      const pendingHabits = habits.filter(habit => {
        const todayChecked = habit.checkIns.some(checkIn => checkIn.date === today);
        return !todayChecked;
      });

      if (pendingHabits.length > 0) {
        this.showLocalNotification({
          title: '习惯提醒',
          content: `还有 ${pendingHabits.length} 个习惯未打卡`,
          data: { type: 'habit_reminder', count: pendingHabits.length }
        });
      }

      return { success: true, count: pendingHabits.length };
    } catch (error) {
      console.error('检查习惯提醒失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 发送每日激励消息
   */
  sendDailyMotivation() {
    const motivationMessages = [
      '新的一天，新的开始！加油！',
      '每一个小进步都值得庆祝！',
      '坚持就是胜利，继续前进！',
      '今天也要做最好的自己！',
      '相信自己，你可以做到的！',
      '成功源于每日的积累！',
      '今天的努力是明天的收获！'
    ];

    const randomMessage = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
    
    this.showLocalNotification({
      title: '每日激励',
      content: randomMessage,
      data: { type: 'daily_motivation' }
    });
  },

  /**
   * 获取通知历史（从本地存储）
   */
  getNotificationHistory() {
    try {
      return wx.getStorageSync('notificationHistory') || [];
    } catch (error) {
      console.error('获取通知历史失败:', error);
      return [];
    }
  },

  /**
   * 保存通知到历史记录
   */
  saveNotificationToHistory(notification) {
    try {
      const history = this.getNotificationHistory();
      const newNotification = {
        ...notification,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false
      };

      history.unshift(newNotification);
      
      // 只保留最近50条通知
      if (history.length > 50) {
        history.splice(50);
      }

      wx.setStorageSync('notificationHistory', history);
      return { success: true };
    } catch (error) {
      console.error('保存通知历史失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 标记通知为已读
   */
  markNotificationAsRead(notificationId) {
    try {
      const history = this.getNotificationHistory();
      const notification = history.find(n => n.id === notificationId);
      
      if (notification) {
        notification.read = true;
        wx.setStorageSync('notificationHistory', history);
      }

      return { success: true };
    } catch (error) {
      console.error('标记通知已读失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 清除所有通知历史
   */
  clearNotificationHistory() {
    try {
      wx.removeStorageSync('notificationHistory');
      return { success: true };
    } catch (error) {
      console.error('清除通知历史失败:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = notificationService;