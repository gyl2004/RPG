// 升级动画模态框组件
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    levelUpData: {
      type: Object,
      value: {}
    }
  },

  data: {
    animationStep: 0, // 0: 隐藏, 1: 升级动画, 2: 奖励展示, 3: 完成
    showRewards: false,
    animationClass: ''
  },

  observers: {
    'show': function(show) {
      if (show) {
        this.startLevelUpAnimation();
      } else {
        this.resetAnimation();
      }
    }
  },

  methods: {
    /**
     * 开始升级动画
     */
    startLevelUpAnimation() {
      this.setData({ 
        animationStep: 1,
        animationClass: 'level-up-enter'
      });

      // 升级文字动画
      setTimeout(() => {
        this.setData({ animationClass: 'level-up-bounce' });
      }, 500);

      // 显示奖励
      setTimeout(() => {
        this.setData({ 
          animationStep: 2,
          showRewards: true,
          animationClass: 'rewards-enter'
        });
      }, 2000);

      // 播放升级音效（如果开启）
      this.playLevelUpSound();
    },

    /**
     * 重置动画状态
     */
    resetAnimation() {
      this.setData({
        animationStep: 0,
        showRewards: false,
        animationClass: ''
      });
    },

    /**
     * 播放升级音效
     */
    playLevelUpSound() {
      try {
        // 检查用户设置是否开启音效
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo && userInfo.settings && userInfo.settings.soundEffects) {
          // 这里可以播放音效文件
          wx.vibrateShort(); // 震动反馈
        }
      } catch (error) {
        console.log('播放音效失败:', error);
      }
    },

    /**
     * 关闭模态框
     */
    closeModal() {
      this.setData({ animationStep: 3 });
      
      setTimeout(() => {
        this.triggerEvent('close');
      }, 300);
    },

    /**
     * 查看奖励详情
     */
    viewRewardDetail(e) {
      const reward = e.currentTarget.dataset.reward;
      
      wx.showModal({
        title: reward.name,
        content: reward.description || '恭喜获得新奖励！',
        showCancel: false
      });
    },

    /**
     * 分享升级成果
     */
    shareAchievement() {
      const { levelUpData } = this.data;
      
      this.triggerEvent('share', {
        title: `我在现实世界RPG中升级到了${levelUpData.newLevel}级！`,
        desc: `从${levelUpData.oldLevel}级升级到${levelUpData.newLevel}级，获得了${levelUpData.attributePoints}个属性点！`,
        path: '/pages/character/character'
      });
    },

    /**
     * 继续冒险
     */
    continueAdventure() {
      this.closeModal();
    }
  }
});
