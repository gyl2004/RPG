// RPG风格按钮组件
Component({
  properties: {
    type: {
      type: String,
      value: 'primary' // primary, secondary, success, warning, danger
    },
    size: {
      type: String,
      value: 'medium' // small, medium, large
    },
    disabled: {
      type: Boolean,
      value: false
    },
    loading: {
      type: Boolean,
      value: false
    },
    text: {
      type: String,
      value: ''
    }
  },

  methods: {
    onTap: function(e) {
      console.log('🔘 rpg-button onTap 被调用, text:', this.data.text);
      console.log('🔘 按钮状态 - disabled:', this.data.disabled, 'loading:', this.data.loading);
      
      if (this.data.disabled || this.data.loading) {
        console.log('🔘 按钮被禁用或加载中，忽略点击');
        return;
      }
      
      console.log('🔘 触发tap事件');
      this.triggerEvent('tap', e.detail);
    }
  }
});
