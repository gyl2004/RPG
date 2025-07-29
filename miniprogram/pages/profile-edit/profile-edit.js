// 编辑个人资料页面
const { checkLoginAndRedirect, getCurrentUser, getAuthService } = require('../../utils/auth-helper.js');
const { updateUserSettings } = require('../../utils/user-helper.js');

Page({
  data: {
    userInfo: null,
    originalUserInfo: null,
    editForm: {
      nickname: '',
      bio: '',
      location: '',
      occupation: '',
      interests: [],
      privacy: {
        showLevel: true,
        showStats: true,
        showActivities: true
      }
    },
    availableInterests: [
      '🏃‍♂️ 运动健身', '📚 学习成长', '🎨 艺术创作', '💼 职业发展',
      '🍳 烹饪美食', '🎵 音乐娱乐', '🌱 健康生活', '💻 科技数码',
      '📖 阅读写作', '🧘‍♀️ 冥想放松', '🎮 游戏娱乐', '🌍 旅行探索'
    ],
    loading: false,
    hasChanges: false
  },

  onLoad: function() {
    this.checkLoginAndLoadData();
  },

  onShow: function() {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/profile-edit/profile-edit')) {
      return;
    }
  },

  /**
   * 检查登录状态并加载数据
   */
  checkLoginAndLoadData: function() {
    if (!checkLoginAndRedirect('/pages/profile-edit/profile-edit')) {
      return;
    }
    this.loadUserData();
  },

  /**
   * 加载用户数据
   */
  async loadUserData() {
    try {
      this.setData({ loading: true });

      const user = getCurrentUser();
      if (user) {
        // 深拷贝用户信息
        const originalUserInfo = JSON.parse(JSON.stringify(user));
        
        // 初始化编辑表单
        const editForm = {
          nickname: user.nickname || '',
          bio: user.bio || '',
          location: user.location || '',
          occupation: user.occupation || '',
          interests: user.interests || [],
          privacy: {
            showLevel: user.privacy?.showLevel !== false,
            showStats: user.privacy?.showStats !== false,
            showActivities: user.privacy?.showActivities !== false
          }
        };

        this.setData({
          userInfo: user,
          originalUserInfo: originalUserInfo,
          editForm: editForm
        });
      }

      this.setData({ loading: false });
    } catch (error) {
      console.error('加载用户数据失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  /**
   * 输入框变化处理（最终优化版本）
   */
  onInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    // 直接更新，但避免不必要的对象创建
    const updateKey = `editForm.${field}`;
    const updateData = {
      [updateKey]: value
    };
    
    // 只在第一次输入时设置hasChanges
    if (!this.data.hasChanges) {
      updateData.hasChanges = true;
    }
    
    this.setData(updateData);
  },

  /**
   * 输入框失焦处理
   */
  onInputBlur: function(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    // 清除定时器，立即更新
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    
    // 确保最终值被正确保存
    const editForm = { ...this.data.editForm };
    editForm[field] = value;
    
    this.setData({
      editForm: editForm,
      hasChanges: true
    });
  },

  /**
   * 隐私设置开关变化
   */
  onPrivacyChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`editForm.privacy.${field}`]: value,
      hasChanges: true
    });
  },

  /**
   * 选择兴趣爱好（增强版本）
   */
  onInterestTap: function(e) {
    const interest = e.currentTarget.dataset.interest;
    const currentInterests = [...this.data.editForm.interests];
    const index = currentInterests.indexOf(interest);
    
    // 添加触觉反馈
    wx.vibrateShort({
      type: 'light'
    });
    
    if (index > -1) {
      // 已选择，移除
      currentInterests.splice(index, 1);
      
      // 显示取消选择的提示
      wx.showToast({
        title: `已取消选择 ${interest}`,
        icon: 'none',
        duration: 1000
      });
    } else {
      // 未选择，检查是否可以添加
      if (currentInterests.length >= 6) {
        // 达到最大选择数量，显示提示并震动
        wx.vibrateShort({
          type: 'heavy'
        });
        
        wx.showModal({
          title: '选择上限',
          content: '最多只能选择6个兴趣爱好，请先取消其他选择。',
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#3b82f6'
        });
        return;
      }
      
      // 添加新选择
      currentInterests.push(interest);
      
      // 显示选择成功的提示
      wx.showToast({
        title: `已选择 ${interest}`,
        icon: 'success',
        duration: 1000
      });
    }
    
    // 更新数据
    this.setData({
      'editForm.interests': currentInterests,
      hasChanges: true
    });
    
    // 添加计数器动画效果
    this.animateCounter();
  },

  /**
   * 计数器动画效果
   */
  animateCounter: function() {
    // 添加动画类
    const query = wx.createSelectorQuery();
    query.select('.selected-count').boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        // 触发动画
        setTimeout(() => {
          const query2 = wx.createSelectorQuery();
          query2.select('.selected-count').boundingClientRect();
          query2.exec();
        }, 100);
      }
    });
  },

  /**
   * 选择头像
   */
  chooseAvatar: function() {
    console.log('开始选择头像');
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('头像选择成功:', res);
        const tempFilePath = res.tempFilePaths[0];
        console.log('临时文件路径:', tempFilePath);
        this.uploadAvatar(tempFilePath);
      },
      fail: (error) => {
        console.error('选择头像失败:', error);
        wx.showModal({
          title: '选择头像失败',
          content: `错误信息: ${error.errMsg || error.message || '未知错误'}`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });
  },

  /**
   * 上传头像
   */
  async uploadAvatar(filePath) {
    try {
      console.log('开始上传头像，文件路径:', filePath);
      wx.showLoading({ title: '处理中...' });

      // 检查云开发是否可用
      const app = getApp();
      console.log('云开发状态:', app ? app.isCloudInitialized() : '应用未初始化');
      
      if (!app || !app.isCloudInitialized()) {
        console.log('云开发不可用，使用本地存储');
        // 云开发不可用，直接使用本地文件路径
        this.setData({
          'editForm.avatarUrl': filePath,
          hasChanges: true
        });
        
        console.log('头像已更新到本地:', filePath);
        wx.hideLoading();
        wx.showModal({
          title: '头像已更新',
          content: '头像已更新（本地存储）。云服务不可用时，头像将保存在本地。',
          showCancel: false,
          confirmText: '知道了'
        });
        return;
      }

      // 尝试上传到云存储
      console.log('尝试上传到云存储');
      const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      console.log('云存储路径:', cloudPath);
      
      const result = await wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath
      });

      console.log('云存储上传结果:', result);

      if (result.fileID) {
        console.log('云存储上传成功，fileID:', result.fileID);
        this.setData({
          'editForm.avatarUrl': result.fileID,
          hasChanges: true
        });
        
        wx.hideLoading();
        wx.showModal({
          title: '头像上传成功',
          content: '头像已成功上传到云端！',
          showCancel: false,
          confirmText: '太好了'
        });
      } else {
        throw new Error('云存储返回结果无效');
      }
    } catch (error) {
      console.error('上传头像失败:', error);
      
      // 云存储失败，降级到本地存储
      console.log('云存储失败，降级到本地存储');
      try {
        this.setData({
          'editForm.avatarUrl': filePath,
          hasChanges: true
        });
        
        wx.hideLoading();
        wx.showModal({
          title: '头像已更新',
          content: `头像已更新（本地存储）。\n\n云存储失败原因: ${error.message}\n\n头像将保存在本地，功能正常使用。`,
          showCancel: false,
          confirmText: '知道了'
        });
      } catch (localError) {
        console.error('本地存储也失败:', localError);
        wx.hideLoading();
        wx.showModal({
          title: '头像更新失败',
          content: `头像更新失败: ${error.message}`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    }
  },

  /**
   * 头像加载成功
   */
  onAvatarLoad: function(e) {
    console.log('头像加载成功:', e);
  },

  /**
   * 头像加载失败
   */
  onAvatarError: function(e) {
    console.error('头像加载失败:', e);
    wx.showToast({
      title: '头像加载失败',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 重置头像
   */
  resetAvatar: function() {
    this.setData({
      'editForm.avatarUrl': '',
      hasChanges: true
    });
    wx.showToast({
      title: '头像已重置',
      icon: 'success'
    });
  },

  /**
   * 测试头像
   */
  testAvatar: function() {
    const avatarUrl = this.data.editForm.avatarUrl || this.data.userInfo.avatarUrl;
    wx.showModal({
      title: '头像信息',
      content: `当前头像路径:\n${avatarUrl || '无'}\n\n类型: ${avatarUrl ? (avatarUrl.startsWith('cloud://') ? '云存储' : '本地文件') : '默认头像'}`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  /**
   * 保存资料
   */
  async saveProfile() {
    try {
      // 验证输入
      const validation = this.validateForm();
      if (!validation.valid) {
        wx.showToast({
          title: validation.message,
          icon: 'none'
        });
        return;
      }

      this.setData({ loading: true });

      // 构建更新数据
      const updateData = {
        nickname: this.data.editForm.nickname.trim(),
        bio: this.data.editForm.bio.trim(),
        location: this.data.editForm.location.trim(),
        occupation: this.data.editForm.occupation.trim(),
        interests: this.data.editForm.interests,
        privacy: this.data.editForm.privacy,
        lastModified: new Date().toISOString()
      };

      // 如果有新头像，添加到更新数据
      if (this.data.editForm.avatarUrl && this.data.editForm.avatarUrl !== this.data.userInfo.avatarUrl) {
        updateData.avatarUrl = this.data.editForm.avatarUrl;
        console.log('保存新头像:', updateData.avatarUrl);
      }

      // 尝试云端更新
      const app = getApp();
      let updateResult = { success: false };

      if (app && app.isCloudInitialized()) {
        try {
          const result = await wx.cloud.callFunction({
            name: 'rpgFunctions',
            data: {
              type: 'updateUserProfile',
              data: updateData
            }
          });

          if (result.result && result.result.success) {
            updateResult = { success: true, data: result.result.data };
          }
        } catch (cloudError) {
          console.log('云端更新失败，使用本地更新:', cloudError);
        }
      }

      // 如果云端更新失败，使用本地更新
      if (!updateResult.success) {
        updateResult = await this.updateLocalProfile(updateData);
      }

      if (updateResult.success) {
        // 更新成功
        const updatedUser = { ...this.data.userInfo, ...updateData };
        
        // 更新本地存储
        wx.setStorageSync('userInfo', updatedUser);
        
        // 更新全局状态
        if (app && app.globalData.userInfo) {
          app.globalData.userInfo = updatedUser;
        }

        this.setData({
          userInfo: updatedUser,
          originalUserInfo: JSON.parse(JSON.stringify(updatedUser)),
          hasChanges: false
        });

        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });

        // 延迟返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error('更新失败');
      }

      this.setData({ loading: false });
    } catch (error) {
      console.error('保存资料失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  /**
   * 本地更新用户资料
   */
  async updateLocalProfile(updateData) {
    try {
      const currentUser = wx.getStorageSync('userInfo');
      if (!currentUser) {
        return { success: false, error: '用户信息不存在' };
      }

      const updatedUser = { ...currentUser, ...updateData };
      wx.setStorageSync('userInfo', updatedUser);

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error('本地更新失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 验证表单
   */
  validateForm() {
    const form = this.data.editForm;

    // 昵称验证
    if (!form.nickname.trim()) {
      return { valid: false, message: '请输入昵称' };
    }
    if (form.nickname.trim().length > 20) {
      return { valid: false, message: '昵称不能超过20个字符' };
    }

    // 个人简介验证
    if (form.bio.length > 200) {
      return { valid: false, message: '个人简介不能超过200个字符' };
    }

    // 地区验证
    if (form.location.length > 50) {
      return { valid: false, message: '地区不能超过50个字符' };
    }

    // 职业验证
    if (form.occupation.length > 50) {
      return { valid: false, message: '职业不能超过50个字符' };
    }

    return { valid: true };
  },

  /**
   * 重置表单
   */
  resetForm() {
    wx.showModal({
      title: '重置确认',
      content: '确定要重置所有修改吗？',
      success: (res) => {
        if (res.confirm) {
          // 重置为原始数据
          const editForm = {
            nickname: this.data.originalUserInfo.nickname || '',
            bio: this.data.originalUserInfo.bio || '',
            location: this.data.originalUserInfo.location || '',
            occupation: this.data.originalUserInfo.occupation || '',
            interests: this.data.originalUserInfo.interests || [],
            privacy: {
              showLevel: this.data.originalUserInfo.privacy?.showLevel !== false,
              showStats: this.data.originalUserInfo.privacy?.showStats !== false,
              showActivities: this.data.originalUserInfo.privacy?.showActivities !== false
            }
          };

          this.setData({
            editForm: editForm,
            hasChanges: false
          });

          wx.showToast({
            title: '已重置',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 返回上一页
   */
  goBack() {
    if (this.data.hasChanges) {
      wx.showModal({
        title: '未保存的更改',
        content: '您有未保存的更改，确定要离开吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  /**
   * 页面卸载时检查未保存的更改
   */
  onUnload() {
    // 清理定时器
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
      this.updateTimer = null;
    }
    
    // 清理临时数据
    this.tempFormData = null;
    
    if (this.data.hasChanges) {
      // 可以在这里保存草稿或提醒用户
      console.log('页面关闭时有未保存的更改');
    }
  }
});