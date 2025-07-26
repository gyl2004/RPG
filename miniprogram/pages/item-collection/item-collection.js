// 物品收藏记录页面
const characterService = require('../../services/character-service.js');

Page({
  data: {
    collectedItems: [],
    showAddModal: false,
    showDetailModal: false,
    selectedItem: null,
    generatingAI: false,
    saving: false, // 添加保存状态标志
    newItem: {
      name: '',
      category: '',
      categoryIndex: 0,
      icon: '📦',
      price: '',
      description: ''
    },
    categories: [
      '装备道具', '生活用品', '收藏品', '书籍文具', 
      '电子产品', '服装配饰', '食物饮品', '其他'
    ],
    iconOptions: [
      '📦', '⚔️', '🛡️', '💎', '📚', '🎮', '👕', '🍎',
      '💻', '📱', '⌚', '🎧', '🎨', '🏆', '💰', '🔮',
      '🌟', '⭐', '💫', '✨', '🎯', '🎪', '🎭', '🎨'
    ]
  },

  onLoad() {
    this.loadCollectedItems();
  },

  onShow() {
    this.loadCollectedItems();
  },

  /**
   * 加载收藏的物品
   */
  loadCollectedItems() {
    try {
      const character = characterService.getCurrentCharacter();
      if (character && character.collectedItems) {
        // 按购买时间倒序排列
        const sortedItems = character.collectedItems.sort((a, b) =>
          new Date(b.purchaseDate) - new Date(a.purchaseDate)
        );

        this.setData({
          collectedItems: sortedItems
        });
      }
    } catch (error) {
      console.error('加载收藏物品失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  /**
   * 显示添加物品模态框
   */
  showAddItemModal() {
    this.setData({
      showAddModal: true,
      newItem: {
        name: '',
        category: '',
        categoryIndex: 0,
        icon: '📦',
        price: '',
        description: ''
      }
    });
  },

  /**
   * 关闭添加物品模态框
   */
  closeAddModal() {
    this.setData({
      showAddModal: false,
      saving: false // 重置保存状态
    });
  },

  /**
   * 显示物品详情
   */
  showItemDetail(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      selectedItem: item,
      showDetailModal: true
    });
  },

  /**
   * 关闭物品详情模态框
   */
  closeDetailModal() {
    this.setData({
      showDetailModal: false,
      selectedItem: null
    });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation() {
    // 阻止点击模态框内容时关闭模态框
  },

  /**
   * 输入物品名称
   */
  onNameInput(e) {
    this.setData({
      'newItem.name': e.detail.value
    });
  },

  /**
   * 选择分类
   */
  onCategoryChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      'newItem.categoryIndex': index,
      'newItem.category': this.data.categories[index]
    });
  },

  /**
   * 选择图标
   */
  selectIcon(e) {
    const icon = e.currentTarget.dataset.icon;
    this.setData({
      'newItem.icon': icon
    });
  },

  /**
   * 输入价格
   */
  onPriceInput(e) {
    this.setData({
      'newItem.price': e.detail.value
    });
  },

  /**
   * 输入描述
   */
  onDescriptionInput(e) {
    this.setData({
      'newItem.description': e.detail.value
    });
  },

  /**
   * 保存新物品
   */
  async saveNewItem() {
    // 防重复提交
    if (this.data.saving) {
      console.log('正在保存中，忽略重复请求');
      return;
    }

    try {
      this.setData({ saving: true });

      const { newItem } = this.data;

      if (!newItem.name.trim()) {
        wx.showToast({
          title: '请输入物品名称',
          icon: 'error'
        });
        return;
      }

      // 创建物品对象，使用更精确的ID生成
      const item = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newItem.name.trim(),
        category: newItem.category || this.data.categories[0],
        icon: newItem.icon,
        price: newItem.price ? parseFloat(newItem.price) : null,
        description: newItem.description.trim(),
        purchaseDate: new Date().toLocaleDateString('zh-CN'),
        aiDescription: null,
        createdAt: new Date().toISOString()
      };

      // 保存到角色数据
      const character = characterService.getCurrentCharacter();
      if (!character.collectedItems) {
        character.collectedItems = [];
      }

      // 检查是否已存在相同名称的物品（防止重复）
      const existingItem = character.collectedItems.find(
        existingItem => existingItem.name === item.name &&
        Math.abs(new Date(existingItem.createdAt) - new Date(item.createdAt)) < 5000 // 5秒内
      );

      if (existingItem) {
        console.log('检测到重复物品，跳过添加');
        wx.showToast({
          title: '物品已存在',
          icon: 'error'
        });
        return;
      }

      character.collectedItems.push(item);
      await characterService.updateCharacter(character);

      // 同步单个物品到云端
      await characterService.syncCollectedItemToCloud(item);

      wx.showToast({
        title: '物品记录成功！',
        icon: 'success'
      });

      this.closeAddModal();
      this.loadCollectedItems();

    } catch (error) {
      console.error('保存物品失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    } finally {
      // 重置保存状态
      this.setData({ saving: false });
    }
  },

  /**
   * 生成AI魔幻描述
   */
  async generateAIDescription() {
    if (this.data.generatingAI) return;

    try {
      this.setData({ generatingAI: true });

      const item = this.data.selectedItem;

      // 首先检查AI服务是否可用
      const app = getApp();
      const aiService = app.globalData.aiService;

      if (!aiService) {
        console.error('AI服务未初始化');
        // 使用本地生成的描述作为备选
        const fallbackDescription = this.generateFallbackDescription(item);
        this.updateItemDescription(item, fallbackDescription);
        return;
      }

      // 构建AI提示词
      const prompt = `请为以下物品创造一个富有想象力的魔幻背景故事：

物品名称：${item.name}
物品分类：${item.category}
物品描述：${item.description || '无特殊描述'}
购买价格：${item.price ? `${item.price}元` : '未知'}

要求：
1. 创造一个充满魔幻色彩的背景故事
2. 赋予这个物品神秘的力量或特殊的来历
3. 故事要有趣且富有想象力
4. 长度控制在100-200字之间
5. 语言风格要生动有趣，适合游戏化的场景

请直接返回故事内容，不需要其他说明。`;

      console.log('🤖 开始调用AI服务生成描述...');

      // 调用AI服务
      const response = await aiService.generateText(prompt, {
        max_tokens: 300,
        temperature: 0.8
      });

      if (response.success && response.content) {
        console.log('✅ AI描述生成成功');
        this.updateItemDescription(item, response.content);
      } else {
        console.warn('⚠️ AI生成失败，使用备选方案:', response.error);
        const fallbackDescription = this.generateFallbackDescription(item);
        this.updateItemDescription(item, fallbackDescription);
      }

    } catch (error) {
      console.error('生成AI描述失败:', error);
      // 使用备选描述
      const fallbackDescription = this.generateFallbackDescription(this.data.selectedItem);
      this.updateItemDescription(this.data.selectedItem, fallbackDescription);
    } finally {
      this.setData({ generatingAI: false });
    }
  },

  /**
   * 更新物品描述
   */
  updateItemDescription(item, description) {
    try {
      const character = characterService.getCurrentCharacter();
      const itemIndex = character.collectedItems.findIndex(i => i.id === item.id);

      if (itemIndex !== -1) {
        character.collectedItems[itemIndex].aiDescription = description;
        characterService.updateCharacter(character);

        // 更新当前显示的物品
        this.setData({
          'selectedItem.aiDescription': description
        });

        // 重新加载列表
        this.loadCollectedItems();

        wx.showToast({
          title: '魔幻描述生成成功！',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('更新物品描述失败:', error);
      wx.showToast({
        title: '保存描述失败',
        icon: 'error'
      });
    }
  },

  /**
   * 生成备选描述（当AI服务不可用时）
   */
  generateFallbackDescription(item) {
    const templates = [
      `这件${item.name}并非凡物，它散发着神秘的光芒，仿佛蕴含着古老的魔法力量。传说中，只有真正的冒险者才能发现它的真正价值。`,
      `${item.name}的来历充满了神秘色彩。据说它曾属于一位传奇的魔法师，承载着无数冒险故事和神奇的回忆。`,
      `这个${item.name}看似普通，实则暗藏玄机。在月圆之夜，它会散发出微弱的蓝光，指引着持有者走向未知的冒险之路。`,
      `${item.name}是一件充满魔力的神奇物品。它能够感应到主人的情绪变化，在关键时刻为冒险者提供神秘的力量加持。`,
      `传说这件${item.name}来自遥远的魔法王国，它承载着古老的祝福，能够为持有者带来好运和智慧。`
    ];

    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  },

  /**
   * 删除物品
   */
  deleteItem() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个物品记录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            const character = characterService.getCurrentCharacter();
            const itemIndex = character.collectedItems.findIndex(
              item => item.id === this.data.selectedItem.id
            );

            if (itemIndex !== -1) {
              character.collectedItems.splice(itemIndex, 1);
              characterService.updateCharacter(character);
              
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              
              this.closeDetailModal();
              this.loadCollectedItems();
            }
          } catch (error) {
            console.error('删除物品失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            });
          }
        }
      }
    });
  }
});
