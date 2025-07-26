// 任务详情页面
import { checkLoginAndRedirect } from '../../utils/auth-helper.js';

Page({
  data: {
    task: null,
    taskId: '',
    loading: false,
    showActionModal: false,
    showRecordModal: false,
    actionType: '',
    progress: 0,
    recordType: '',
    categories: {},
    difficulties: {},
    verificationTypes: {},
    taskStatuses: {}
  },

  onLoad: function(options) {
    const taskId = options.id;
    if (taskId) {
      this.setData({ taskId });
      this.loadTaskDetail();
      this.loadTaskOptions();
    } else {
      wx.showToast({
        title: '任务不存在',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  onShow: function() {
    // 检查登录状态
    if (!checkLoginAndRedirect(`/pages/task-detail/task-detail?id=${this.data.taskId}`)) {
      return;
    }
    
    // 重新加载任务详情，以获取最新状态
    if (this.data.taskId) {
      this.loadTaskDetail();
    }
  },

  /**
   * 加载任务详情
   */
  loadTaskDetail() {
    try {
      this.setData({ loading: true });

      const taskService = this.getTaskService();
      if (!taskService) {
        throw new Error('任务服务不可用');
      }

      const task = taskService.getTaskById(this.data.taskId);
      if (!task) {
        wx.showToast({
          title: '任务不存在',
          icon: 'error'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
        return;
      }

      this.setData({
        task,
        progress: task.progress || 0
      });
    } catch (error) {
      console.error('加载任务详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 加载任务选项数据
   */
  loadTaskOptions() {
    try {
      const taskService = this.getTaskService();
      if (!taskService) return;

      const categories = taskService.getTaskCategories();
      const difficulties = taskService.getTaskDifficulties();
      const verificationTypes = taskService.getVerificationTypes();
      const taskStatuses = taskService.getTaskStatuses();

      this.setData({
        categories,
        difficulties,
        verificationTypes,
        taskStatuses
      });
    } catch (error) {
      console.error('加载任务选项失败:', error);
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
   * 开始任务
   */
  async startTask() {
    try {
      const taskService = await this.getTaskService();
      if (!taskService) {
        throw new Error('任务服务不可用');
      }

      const result = taskService.updateTaskStatus(this.data.taskId, 'in_progress');
      
      if (result.success) {
        wx.showToast({
          title: '任务已开始',
          icon: 'success'
        });
        
        this.loadTaskDetail();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('开始任务失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 完成任务
   */
  async completeTask() {
    try {
      const task = this.data.task;
      
      // 如果需要记录，显示记录界面
      if (task.verification !== 'none') {
        this.showRecordModal();
        return;
      }

      // 直接完成任务
      await this.finishTask();
    } catch (error) {
      console.error('完成任务失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 显示记录模态框
   */
  showRecordModal() {
    const task = this.data.task;
    const verificationTypes = this.data.verificationTypes;

    // 检查验证类型是否存在
    if (!verificationTypes || !verificationTypes[task.verification]) {
      console.error('验证类型不存在:', task.verification);
      // 直接完成任务
      this.finishTask();
      return;
    }

    const verificationType = verificationTypes[task.verification];

    wx.showModal({
      title: '完成记录',
      content: `是否要${verificationType.name}？\n${verificationType.description}`,
      confirmText: '记录一下',
      cancelText: '直接完成',
      success: (res) => {
        if (res.confirm) {
          this.startRecord();
        } else {
          // 直接完成任务，不留记录
          this.finishTask();
        }
      }
    });
  },

  /**
   * 开始记录
   */
  async startRecord() {
    const task = this.data.task;

    switch (task.verification) {
      case 'photo':
        this.takePhoto();
        break;
      case 'note':
        this.writeNote();
        break;
      default:
        await this.finishTask();
    }
  },

  /**
   * 拍照记录
   */
  takePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0];

        wx.showToast({
          title: '照片已保存',
          icon: 'success'
        });

        // 完成任务并保存照片记录
        await this.finishTask({
          type: 'photo',
          data: {
            imagePath: tempFilePath,
            recordTime: new Date().toISOString(),
            description: '任务完成照片'
          }
        });
      },
      fail: (error) => {
        console.error('拍照失败:', error);
        wx.showToast({
          title: '拍照失败',
          icon: 'error'
        });
        // 拍照失败也可以直接完成任务
        this.finishTask();
      }
    });
  },

  /**
   * 文字记录
   */
  writeNote() {
    wx.showModal({
      title: '写下你的感想',
      placeholderText: '记录一下完成这个任务的感受...',
      editable: true,
      success: async (res) => {
        if (res.confirm) {
          const noteText = res.content || '任务完成！';

          wx.showToast({
            title: '记录已保存',
            icon: 'success'
          });

          // 完成任务并保存文字记录
          await this.finishTask({
            type: 'note',
            data: {
              noteText: noteText,
              recordTime: new Date().toISOString(),
              description: '任务完成感想'
            }
          });
        } else {
          // 取消输入也直接完成任务
          this.finishTask();
        }
      }
    });
  },

  /**
   * 完成任务
   */
  async finishTask(verificationData = null) {
    try {
      const taskService = await this.getTaskService();
      if (!taskService) {
        throw new Error('任务服务不可用');
      }

      const additionalData = verificationData ? { verificationData } : {};
      const result = taskService.updateTaskStatus(this.data.taskId, 'completed', additionalData);
      
      if (result.success) {
        // 发放奖励
        await this.giveRewards(result.task);
        
        wx.showToast({
          title: '任务完成！',
          icon: 'success'
        });
        
        this.loadTaskDetail();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('完成任务失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 发放奖励
   */
  async giveRewards(task) {
    try {
      if (!task.rewards) return;

      // 获取角色服务
      const characterServiceModule = require('../../services/character-service.js');
      const characterService = characterServiceModule.default;

      // 发放经验值
      if (task.rewards.experience > 0) {
        const expResult = characterService.addExperience(task.rewards.experience);
        
        if (expResult.leveledUp) {
          // 如果升级了，显示升级动画
          wx.showModal({
            title: '恭喜升级！',
            content: `获得 ${task.rewards.experience} 经验值\n从 ${expResult.oldLevel} 级升级到 ${expResult.newLevel} 级！`,
            showCancel: false
          });
        }
      }

      // 发放金币
      if (task.rewards.coins > 0) {
        const character = wx.getStorageSync('characterInfo');
        if (character) {
          character.coins = (character.coins || 0) + task.rewards.coins;
          wx.setStorageSync('characterInfo', character);
          
          // 更新全局状态
          const app = getApp();
          if (app) {
            app.globalData.character = character;
          }
        }
      }

      // 显示奖励信息
      const rewardText = `获得奖励：\n经验值 +${task.rewards.experience}\n金币 +${task.rewards.coins}`;
      
      setTimeout(() => {
        wx.showModal({
          title: '🎉 任务奖励',
          content: rewardText,
          showCancel: false
        });
      }, 1000);

    } catch (error) {
      console.error('发放奖励失败:', error);
    }
  },

  /**
   * 取消任务
   */
  async cancelTask() {
    try {
      const result = await wx.showModal({
        title: '取消任务',
        content: '确定要取消这个任务吗？',
        confirmText: '确定取消',
        confirmColor: '#ef4444'
      });

      if (!result.confirm) return;

      const taskService = await this.getTaskService();
      if (!taskService) {
        throw new Error('任务服务不可用');
      }

      const updateResult = taskService.updateTaskStatus(this.data.taskId, 'cancelled');
      
      if (updateResult.success) {
        wx.showToast({
          title: '任务已取消',
          icon: 'success'
        });
        
        this.loadTaskDetail();
      } else {
        wx.showToast({
          title: updateResult.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('取消任务失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 删除任务
   */
  async deleteTask() {
    try {
      const result = await wx.showModal({
        title: '删除任务',
        content: '确定要删除这个任务吗？删除后无法恢复。',
        confirmText: '确定删除',
        confirmColor: '#ef4444'
      });

      if (!result.confirm) return;

      const taskService = await this.getTaskService();
      if (!taskService) {
        throw new Error('任务服务不可用');
      }

      const deleteResult = taskService.deleteTask(this.data.taskId);
      
      if (deleteResult.success) {
        wx.showToast({
          title: '任务已删除',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: deleteResult.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 更新进度
   */
  onProgressChange(e) {
    const progress = e.detail.value;
    this.setData({ progress });
  },

  /**
   * 保存进度
   */
  async saveProgress() {
    try {
      const taskService = await this.getTaskService();
      if (!taskService) {
        throw new Error('任务服务不可用');
      }

      const result = taskService.updateTaskStatus(
        this.data.taskId,
        'in_progress',
        { progress: this.data.progress }
      );

      if (result.success) {
        wx.showToast({
          title: '进度已保存',
          icon: 'success'
        });

        this.loadTaskDetail();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('保存进度失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: [src]
    });
  },

  /**
   * 显示添加记录模态框
   */
  showAddRecordModal() {
    console.log('显示添加记录模态框');
    this.setData({ showRecordModal: true });
  },

  /**
   * 关闭添加记录模态框
   */
  closeRecordModal() {
    console.log('关闭添加记录模态框');
    this.setData({
      showRecordModal: false,
      recordType: ''
    });
  },

  /**
   * 选择记录类型
   */
  selectRecordType(e) {
    const recordType = e.currentTarget.dataset.type;
    console.log('选择记录类型:', recordType);

    this.setData({ recordType });

    // 先关闭模态框，然后执行相应操作
    this.closeRecordModal();

    // 稍微延迟执行，让模态框关闭动画完成
    setTimeout(() => {
      switch (recordType) {
        case 'photo':
          this.addPhotoRecord();
          break;
        case 'note':
          this.addNoteRecord();
          break;
        case 'progress':
          this.addProgressRecord();
          break;
      }
    }, 200);
  },

  /**
   * 添加照片记录
   */
  addPhotoRecord() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];

        // 让用户输入照片描述
        wx.showModal({
          title: '添加照片记录',
          content: '为这张照片添加描述',
          placeholderText: '记录当前的进展情况...',
          editable: true,
          confirmText: '保存记录',
          success: (modalRes) => {
            if (modalRes.confirm) {
              const description = modalRes.content || '阶段性进展照片';

              this.saveProgressRecord({
                type: 'photo',
                data: {
                  imagePath: tempFilePath,
                  description: description,
                  title: '📷 进展照片'
                }
              });
            }
          }
        });
      },
      fail: (error) => {
        console.error('选择照片失败:', error);
        wx.showToast({
          title: '选择照片失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 添加文字记录
   */
  addNoteRecord() {
    wx.showModal({
      title: '添加文字记录',
      content: '写下当前的进展和感想',
      placeholderText: '记录当前的进展和感想...',
      editable: true,
      confirmText: '保存记录',
      success: (res) => {
        if (res.confirm && res.content) {
          this.saveProgressRecord({
            type: 'note',
            data: {
              noteText: res.content,
              title: '📝 进展感想'
            }
          });
        } else if (res.confirm && !res.content) {
          wx.showToast({
            title: '请输入记录内容',
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 添加进度记录
   */
  addProgressRecord() {
    const currentProgress = this.data.progress;

    wx.showModal({
      title: '记录进度节点',
      content: `当前进度：${currentProgress}%\n\n记录这个重要的进度里程碑？`,
      confirmText: '记录节点',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.saveProgressRecord({
            type: 'progress',
            data: {
              progressValue: currentProgress,
              title: `📈 进度里程碑 ${currentProgress}%`
            }
          });
        }
      }
    });
  },

  /**
   * 保存阶段性记录
   */
  saveProgressRecord(recordData) {
    try {
      // 显示加载提示
      wx.showLoading({
        title: '保存中...',
        mask: true
      });

      const taskService = this.getTaskService();
      if (!taskService) {
        throw new Error('任务服务不可用');
      }

      const result = taskService.addProgressRecord(this.data.taskId, {
        ...recordData,
        progress: this.data.progress
      });

      wx.hideLoading();

      if (result.success) {
        wx.showToast({
          title: '记录保存成功',
          icon: 'success',
          duration: 2000
        });

        // 重新加载任务详情
        this.loadTaskDetail();
      } else {
        wx.showToast({
          title: result.error || '保存失败',
          icon: 'error'
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('保存记录失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  /**
   * 删除阶段性记录
   */
  async deleteProgressRecord(e) {
    const recordId = e.currentTarget.dataset.recordId;

    try {
      const result = await wx.showModal({
        title: '删除记录',
        content: '确定要删除这条记录吗？',
        confirmText: '删除',
        confirmColor: '#ef4444'
      });

      if (!result.confirm) return;

      const taskService = await this.getTaskService();
      if (!taskService) {
        throw new Error('任务服务不可用');
      }

      const deleteResult = taskService.deleteProgressRecord(this.data.taskId, recordId);

      if (deleteResult.success) {
        wx.showToast({
          title: '记录已删除',
          icon: 'success'
        });

        this.loadTaskDetail();
      } else {
        wx.showToast({
          title: deleteResult.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('删除记录失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      });
    }
  },

  /**
   * 格式化时间显示
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // 小于1分钟
    if (diff < 60000) {
      return '刚刚';
    }

    // 小于1小时
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    }

    // 小于1天
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    }

    // 大于1天，显示具体日期
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
});
