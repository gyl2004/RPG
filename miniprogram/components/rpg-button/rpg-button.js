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
      if (this.data.disabled || this.data.loading) {
        return;
      }
      this.triggerEvent('tap', e.detail);
    }
  }
});
