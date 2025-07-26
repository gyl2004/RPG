// 技能树页面
import { checkLoginAndRedirect, getCurrentCharacter } from '../../utils/auth-helper.js';

Page({
  data: {
    character: null,
    skillTrees: {},
    currentTree: 'strength',
    availableSkillPoints: 0,
    loading: false,
    showSkillModal: false,
    selectedSkill: null,
    skillEffects: {}
  },

  onLoad: function() {
    this.loadSkillData();
  },

  onShow: function() {
    // 检查登录状态
    if (!checkLoginAndRedirect('/pages/skills/skills')) {
      return;
    }
    
    this.loadSkillData();
  },

  /**
   * 加载技能数据
   */
  async loadSkillData() {
    try {
      this.setData({ loading: true });

      // 获取技能服务
      const skillService = await this.getSkillService();
      if (!skillService) {
        throw new Error('技能服务不可用');
      }

      const character = getCurrentCharacter();
      if (character) {
        const skillTrees = skillService.getAllSkillTrees();
        const availableSkillPoints = skillService.getAvailableSkillPoints();
        const skillEffects = skillService.calculateSkillEffects(character);

        this.setData({
          character,
          skillTrees,
          availableSkillPoints,
          skillEffects
        });
      }

      this.setData({ loading: false });
    } catch (error) {
      console.error('加载技能数据失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  /**
   * 获取技能服务
   */
  async getSkillService() {
    try {
      const skillServiceModule = require('../../services/skill-service.js');
      return skillServiceModule.default;
    } catch (error) {
      console.error('获取技能服务失败:', error);
      return null;
    }
  },

  /**
   * 切换技能树
   */
  switchSkillTree(e) {
    const treeType = e.currentTarget.dataset.tree;
    this.setData({ currentTree: treeType });
  },

  /**
   * 显示技能详情
   */
  showSkillDetail(e) {
    const skillId = e.currentTarget.dataset.skill;
    const treeType = e.currentTarget.dataset.tree;
    
    const skillTree = this.data.skillTrees[treeType];
    const skill = skillTree.skills[skillId];
    
    if (skill) {
      // 检查解锁条件
      this.checkSkillRequirements(skill).then(requirementCheck => {
        const currentSkills = this.data.character.skills || {};
        const currentLevel = currentSkills[skillId]?.level || 0;

        // 转换属性要求为数组格式
        const attributeRequirements = [];
        if (skill.requirements.attributes) {
          for (const [attrName, attrValue] of Object.entries(skill.requirements.attributes)) {
            attributeRequirements.push({
              name: this.getAttributeDisplayName(attrName),
              value: attrValue
            });
          }
        }

        // 转换技能要求为数组格式
        const skillRequirements = [];
        if (skill.requirements.skills) {
          for (const [skillId, skillLevel] of Object.entries(skill.requirements.skills)) {
            const skillInfo = this.findSkillById(skillId);
            skillRequirements.push({
              name: skillInfo?.name || skillId,
              level: skillLevel
            });
          }
        }

        // 转换技能效果为数组格式
        const effectsList = [];
        if (skill.effects) {
          for (const [effectName, effectValue] of Object.entries(skill.effects)) {
            effectsList.push({
              name: this.getEffectDisplayName(effectName),
              value: this.formatEffectValue(effectName, effectValue)
            });
          }
        }

        this.setData({
          selectedSkill: {
            ...skill,
            treeType,
            currentLevel,
            canLearn: requirementCheck.canUnlock && currentLevel < skill.maxLevel,
            requirementReason: requirementCheck.reason || '',
            isMaxLevel: currentLevel >= skill.maxLevel,
            attributeRequirements,
            skillRequirements,
            effectsList
          },
          showSkillModal: true
        });
      });
    }
  },

  /**
   * 检查技能解锁条件
   */
  async checkSkillRequirements(skill) {
    try {
      const skillService = await this.getSkillService();
      if (!skillService) {
        return { canUnlock: false, reason: '技能服务不可用' };
      }

      return skillService.checkSkillRequirements(skill.id, this.data.character);
    } catch (error) {
      console.error('检查技能条件失败:', error);
      return { canUnlock: false, reason: '检查失败' };
    }
  },

  /**
   * 关闭技能模态框
   */
  closeSkillModal() {
    this.setData({
      showSkillModal: false,
      selectedSkill: null
    });
  },

  /**
   * 学习技能
   */
  async learnSkill() {
    try {
      const skillService = await this.getSkillService();
      if (!skillService) {
        throw new Error('技能服务不可用');
      }

      const result = skillService.learnSkill(this.data.selectedSkill.id);
      
      if (result.success) {
        wx.showToast({
          title: `学会了${result.skillName}！`,
          icon: 'success'
        });
        
        // 重新加载数据
        this.loadSkillData();
        this.closeSkillModal();
      } else {
        wx.showToast({
          title: result.error,
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('学习技能失败:', error);
      wx.showToast({
        title: '学习失败',
        icon: 'error'
      });
    }
  },

  /**
   * 获取技能点（测试功能）
   */
  async gainSkillPoints() {
    try {
      const character = getCurrentCharacter();
      if (!character) return;

      const updatedCharacter = {
        ...character,
        availableSkillPoints: (character.availableSkillPoints || 0) + 3
      };

      wx.setStorageSync('characterInfo', updatedCharacter);

      // 更新全局状态
      const app = getApp();
      if (app) {
        app.globalData.character = updatedCharacter;
      }

      wx.showToast({
        title: '获得3个技能点',
        icon: 'success'
      });

      this.loadSkillData();
    } catch (error) {
      console.error('获得技能点失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 查看技能效果
   */
  viewSkillEffects() {
    const effects = this.data.skillEffects;
    let content = '当前技能效果：\n\n';
    
    // 属性加成
    if (Object.keys(effects.attributeBonuses).length > 0) {
      content += '属性加成：\n';
      for (const [attr, bonus] of Object.entries(effects.attributeBonuses)) {
        content += `${attr}: +${(bonus * 100).toFixed(1)}%\n`;
      }
      content += '\n';
    }
    
    // 任务经验加成
    if (Object.keys(effects.taskExpBonuses).length > 0) {
      content += '任务经验加成：\n';
      for (const [taskType, bonus] of Object.entries(effects.taskExpBonuses)) {
        content += `${taskType}: +${(bonus * 100).toFixed(1)}%\n`;
      }
      content += '\n';
    }
    
    // 特殊效果
    if (Object.keys(effects.specialEffects).length > 0) {
      content += '特殊效果：\n';
      for (const [effect, value] of Object.entries(effects.specialEffects)) {
        content += `${effect}: +${(value * 100).toFixed(1)}%\n`;
      }
    }
    
    if (content === '当前技能效果：\n\n') {
      content = '暂无已学习的技能效果';
    }
    
    wx.showModal({
      title: '技能效果总览',
      content: content,
      showCancel: false
    });
  },

  /**
   * 获取技能状态样式类
   */
  getSkillStatusClass(skill, treeType) {
    const currentSkills = this.data.character?.skills || {};
    const currentLevel = currentSkills[skill.id]?.level || 0;
    
    if (currentLevel > 0) {
      return 'skill-learned';
    }
    
    // 这里可以添加更复杂的逻辑来检查是否可学习
    return 'skill-locked';
  },

  /**
   * 获取技能当前等级
   */
  getSkillCurrentLevel(skillId) {
    const currentSkills = this.data.character?.skills || {};
    return currentSkills[skillId]?.level || 0;
  },

  /**
   * 获取属性显示名称
   */
  getAttributeDisplayName(attrName) {
    const displayNames = {
      'strength': '力量',
      'intelligence': '智力',
      'charisma': '魅力',
      'creativity': '创造力',
      'discipline': '纪律性',
      'vitality': '活力'
    };
    return displayNames[attrName] || attrName;
  },

  /**
   * 获取效果显示名称
   */
  getEffectDisplayName(effectName) {
    const displayNames = {
      'strength_bonus': '力量加成',
      'intelligence_bonus': '智力加成',
      'charisma_bonus': '魅力加成',
      'creativity_bonus': '创造力加成',
      'discipline_bonus': '纪律性加成',
      'vitality_bonus': '活力加成',
      'task_exp_bonus': '任务经验加成',
      'fatigue_reduction': '疲劳减少',
      'stamina_bonus': '耐力加成',
      'power_level_bonus': '战斗力加成',
      'task_success_rate': '任务成功率',
      'long_task_bonus': '长期任务加成',
      'unlock_tasks': '解锁任务',
      'all_exp_bonus': '全体验加成',
      'problem_solving_bonus': '解决问题加成',
      'inspiration_bonus': '灵感加成',
      'meditation_bonus': '冥想加成',
      'daily_energy': '日常活力',
      'happiness_bonus': '幸福感加成',
      'life_satisfaction': '生活满意度',
      'social_bonus': '社交加成'
    };
    return displayNames[effectName] || effectName;
  },

  /**
   * 格式化效果值
   */
  formatEffectValue(effectName, effectValue) {
    if (effectName === 'unlock_tasks') {
      return Array.isArray(effectValue) ? effectValue.join(', ') : effectValue;
    }
    if (effectName === 'power_level_bonus') {
      return `+${effectValue}`;
    }
    if (typeof effectValue === 'object') {
      return JSON.stringify(effectValue);
    }
    return `+${(effectValue * 100).toFixed(1)}%`;
  },

  /**
   * 根据ID查找技能信息
   */
  async findSkillById(skillId) {
    try {
      const skillService = await this.getSkillService();
      if (!skillService) return null;

      return skillService.findSkillById(skillId);
    } catch (error) {
      console.error('查找技能失败:', error);
      return null;
    }
  }
});
