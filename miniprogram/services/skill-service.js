// 技能系统服务
/**
 * 技能系统管理服务
 */
class SkillService {
  constructor() {
    // 技能树定义
    this.skillTrees = {
      // 力量技能树
      strength: {
        name: '力量专精',
        icon: '💪',
        color: '#ef4444',
        description: '提升体能和运动相关能力',
        skills: {
          'basic_fitness': {
            id: 'basic_fitness',
            name: '基础体能',
            icon: '🏃',
            description: '提升基础体能，增加力量属性效果',
            maxLevel: 5,
            requirements: { level: 1, attributes: { strength: 10 } },
            effects: { strength_bonus: 0.1, task_exp_bonus: { fitness: 0.2 } },
            skillPoints: 1
          },
          'endurance_training': {
            id: 'endurance_training',
            name: '耐力训练',
            icon: '⏱️',
            description: '提升耐力，减少疲劳度消耗',
            maxLevel: 3,
            requirements: { level: 5, attributes: { strength: 20 }, skills: { basic_fitness: 3 } },
            effects: { fatigue_reduction: 0.15, stamina_bonus: 0.25 },
            skillPoints: 2
          },
          'power_lifting': {
            id: 'power_lifting',
            name: '力量举重',
            icon: '🏋️',
            description: '专业力量训练，大幅提升力量属性',
            maxLevel: 5,
            requirements: { level: 15, attributes: { strength: 40 }, skills: { endurance_training: 2 } },
            effects: { strength_bonus: 0.3, power_level_bonus: 50 },
            skillPoints: 3
          }
        }
      },

      // 智力技能树
      intelligence: {
        name: '智慧学者',
        icon: '🧠',
        color: '#3b82f6',
        description: '提升学习和思考能力',
        skills: {
          'quick_learning': {
            id: 'quick_learning',
            name: '快速学习',
            icon: '📚',
            description: '提升学习效率，增加学习任务经验',
            maxLevel: 5,
            requirements: { level: 1, attributes: { intelligence: 10 } },
            effects: { intelligence_bonus: 0.1, task_exp_bonus: { study: 0.25 } },
            skillPoints: 1
          },
          'critical_thinking': {
            id: 'critical_thinking',
            name: '批判思维',
            icon: '🤔',
            description: '提升分析能力，解锁高难度任务',
            maxLevel: 3,
            requirements: { level: 8, attributes: { intelligence: 25 }, skills: { quick_learning: 3 } },
            effects: { intelligence_bonus: 0.2, unlock_tasks: ['expert_analysis'] },
            skillPoints: 2
          },
          'knowledge_master': {
            id: 'knowledge_master',
            name: '知识大师',
            icon: '🎓',
            description: '博学多才，全面提升智力相关能力',
            maxLevel: 5,
            requirements: { level: 20, attributes: { intelligence: 50 }, skills: { critical_thinking: 2 } },
            effects: { intelligence_bonus: 0.4, all_exp_bonus: 0.1 },
            skillPoints: 4
          }
        }
      },

      // 魅力技能树
      charisma: {
        name: '社交达人',
        icon: '✨',
        color: '#f59e0b',
        description: '提升社交和沟通能力',
        skills: {
          'communication': {
            id: 'communication',
            name: '沟通技巧',
            icon: '💬',
            description: '提升沟通能力，增加社交任务奖励',
            maxLevel: 5,
            requirements: { level: 1, attributes: { charisma: 10 } },
            effects: { charisma_bonus: 0.1, task_exp_bonus: { social: 0.2 } },
            skillPoints: 1
          },
          'leadership': {
            id: 'leadership',
            name: '领导力',
            icon: '👑',
            description: '提升领导能力，解锁团队任务',
            maxLevel: 3,
            requirements: { level: 10, attributes: { charisma: 30 }, skills: { communication: 4 } },
            effects: { charisma_bonus: 0.25, unlock_tasks: ['team_leadership'] },
            skillPoints: 3
          },
          'influence_master': {
            id: 'influence_master',
            name: '影响力大师',
            icon: '🌟',
            description: '强大的个人魅力，影响他人的能力',
            maxLevel: 5,
            requirements: { level: 25, attributes: { charisma: 60 }, skills: { leadership: 2 } },
            effects: { charisma_bonus: 0.5, social_bonus: 0.3 },
            skillPoints: 4
          }
        }
      },

      // 创造力技能树
      creativity: {
        name: '艺术创作',
        icon: '🎨',
        color: '#8b5cf6',
        description: '提升创造和艺术能力',
        skills: {
          'artistic_sense': {
            id: 'artistic_sense',
            name: '艺术感知',
            icon: '🖼️',
            description: '提升艺术感知力，增加创作任务奖励',
            maxLevel: 5,
            requirements: { level: 1, attributes: { creativity: 10 } },
            effects: { creativity_bonus: 0.1, task_exp_bonus: { creative: 0.25 } },
            skillPoints: 1
          },
          'innovation': {
            id: 'innovation',
            name: '创新思维',
            icon: '💡',
            description: '突破常规思维，创造独特解决方案',
            maxLevel: 3,
            requirements: { level: 12, attributes: { creativity: 35 }, skills: { artistic_sense: 3 } },
            effects: { creativity_bonus: 0.3, problem_solving_bonus: 0.2 },
            skillPoints: 2
          },
          'master_creator': {
            id: 'master_creator',
            name: '创作大师',
            icon: '🏆',
            description: '顶级创作能力，作品具有深远影响',
            maxLevel: 5,
            requirements: { level: 30, attributes: { creativity: 70 }, skills: { innovation: 2 } },
            effects: { creativity_bonus: 0.6, inspiration_bonus: 0.4 },
            skillPoints: 5
          }
        }
      },

      // 纪律性技能树
      discipline: {
        name: '自律修行',
        icon: '⚖️',
        color: '#059669',
        description: '提升自控和坚持能力',
        skills: {
          'self_control': {
            id: 'self_control',
            name: '自我控制',
            icon: '🎯',
            description: '提升自控能力，减少任务失败率',
            maxLevel: 5,
            requirements: { level: 1, attributes: { discipline: 10 } },
            effects: { discipline_bonus: 0.1, task_success_rate: 0.1 },
            skillPoints: 1
          },
          'persistence': {
            id: 'persistence',
            name: '坚持不懈',
            icon: '🔥',
            description: '强化意志力，提升长期任务完成率',
            maxLevel: 3,
            requirements: { level: 7, attributes: { discipline: 25 }, skills: { self_control: 3 } },
            effects: { discipline_bonus: 0.2, long_task_bonus: 0.3 },
            skillPoints: 2
          },
          'zen_master': {
            id: 'zen_master',
            name: '禅修大师',
            icon: '🧘',
            description: '达到内心平静，全面提升自律能力',
            maxLevel: 5,
            requirements: { level: 22, attributes: { discipline: 55 }, skills: { persistence: 2 } },
            effects: { discipline_bonus: 0.4, meditation_bonus: 0.5 },
            skillPoints: 3
          }
        }
      },

      // 活力技能树
      vitality: {
        name: '生命活力',
        icon: '🌟',
        color: '#ec4899',
        description: '提升精神状态和生活热情',
        skills: {
          'energy_boost': {
            id: 'energy_boost',
            name: '活力提升',
            icon: '⚡',
            description: '提升日常活力，增加任务完成奖励',
            maxLevel: 5,
            requirements: { level: 1, attributes: { vitality: 10 } },
            effects: { vitality_bonus: 0.1, daily_energy: 0.2 },
            skillPoints: 1
          },
          'positive_mindset': {
            id: 'positive_mindset',
            name: '积极心态',
            icon: '😊',
            description: '保持积极心态，提升整体幸福感',
            maxLevel: 3,
            requirements: { level: 6, attributes: { vitality: 20 }, skills: { energy_boost: 3 } },
            effects: { vitality_bonus: 0.25, happiness_bonus: 0.3 },
            skillPoints: 2
          },
          'life_master': {
            id: 'life_master',
            name: '生活大师',
            icon: '🌈',
            description: '掌握生活的艺术，享受每一天',
            maxLevel: 5,
            requirements: { level: 18, attributes: { vitality: 45 }, skills: { positive_mindset: 2 } },
            effects: { vitality_bonus: 0.4, life_satisfaction: 0.5 },
            skillPoints: 3
          }
        }
      }
    };
  }

  /**
   * 获取角色当前技能
   * @returns {object} 角色技能数据
   */
  getCurrentSkills() {
    const character = wx.getStorageSync('characterInfo');
    return character?.skills || {};
  }

  /**
   * 获取可用技能点
   * @returns {number} 可用技能点数量
   */
  getAvailableSkillPoints() {
    const character = wx.getStorageSync('characterInfo');
    return character?.availableSkillPoints || 0;
  }

  /**
   * 获取技能树信息
   * @param {string} treeType 技能树类型
   * @returns {object} 技能树信息
   */
  getSkillTree(treeType) {
    return this.skillTrees[treeType] || null;
  }

  /**
   * 获取所有技能树
   * @returns {object} 所有技能树
   */
  getAllSkillTrees() {
    return this.skillTrees;
  }

  /**
   * 检查技能解锁条件
   * @param {string} skillId 技能ID
   * @param {object} character 角色对象
   * @returns {object} 检查结果
   */
  checkSkillRequirements(skillId, character) {
    const skill = this.findSkillById(skillId);
    if (!skill) {
      return { canUnlock: false, reason: '技能不存在' };
    }

    const requirements = skill.requirements;
    const currentSkills = character.skills || {};

    // 检查等级要求
    if (character.level < requirements.level) {
      return { 
        canUnlock: false, 
        reason: `需要等级 ${requirements.level}（当前 ${character.level}）` 
      };
    }

    // 检查属性要求
    if (requirements.attributes) {
      for (const [attr, required] of Object.entries(requirements.attributes)) {
        const current = character.attributes[attr] || 0;
        if (current < required) {
          return { 
            canUnlock: false, 
            reason: `需要${attr} ${required}（当前 ${current}）` 
          };
        }
      }
    }

    // 检查前置技能要求
    if (requirements.skills) {
      for (const [skillId, requiredLevel] of Object.entries(requirements.skills)) {
        const currentLevel = currentSkills[skillId]?.level || 0;
        if (currentLevel < requiredLevel) {
          const skillInfo = this.findSkillById(skillId);
          return { 
            canUnlock: false, 
            reason: `需要技能"${skillInfo?.name}"达到 ${requiredLevel} 级` 
          };
        }
      }
    }

    return { canUnlock: true };
  }

  /**
   * 根据ID查找技能
   * @param {string} skillId 技能ID
   * @returns {object} 技能信息
   */
  findSkillById(skillId) {
    for (const tree of Object.values(this.skillTrees)) {
      if (tree.skills[skillId]) {
        return tree.skills[skillId];
      }
    }
    return null;
  }

  /**
   * 学习技能
   * @param {string} skillId 技能ID
   * @returns {object} 学习结果
   */
  learnSkill(skillId) {
    const character = wx.getStorageSync('characterInfo');
    if (!character) {
      return { success: false, error: '角色不存在' };
    }

    const skill = this.findSkillById(skillId);
    if (!skill) {
      return { success: false, error: '技能不存在' };
    }

    // 检查解锁条件
    const requirementCheck = this.checkSkillRequirements(skillId, character);
    if (!requirementCheck.canUnlock) {
      return { success: false, error: requirementCheck.reason };
    }

    // 检查技能点
    const availablePoints = character.availableSkillPoints || 0;
    if (availablePoints < skill.skillPoints) {
      return { success: false, error: `需要 ${skill.skillPoints} 技能点（当前 ${availablePoints}）` };
    }

    // 检查技能等级上限
    const currentSkills = character.skills || {};
    const currentLevel = currentSkills[skillId]?.level || 0;
    if (currentLevel >= skill.maxLevel) {
      return { success: false, error: '技能已达最高等级' };
    }

    // 学习技能
    const newLevel = currentLevel + 1;
    const updatedSkills = {
      ...currentSkills,
      [skillId]: {
        id: skillId,
        level: newLevel,
        learnedAt: new Date().toISOString()
      }
    };

    // 更新角色数据
    const updatedCharacter = {
      ...character,
      skills: updatedSkills,
      availableSkillPoints: availablePoints - skill.skillPoints
    };

    wx.setStorageSync('characterInfo', updatedCharacter);

    // 更新全局状态
    const app = getApp();
    if (app) {
      app.globalData.character = updatedCharacter;
    }

    return {
      success: true,
      skillName: skill.name,
      newLevel,
      pointsUsed: skill.skillPoints,
      remainingPoints: availablePoints - skill.skillPoints
    };
  }

  /**
   * 计算技能效果
   * @param {object} character 角色对象
   * @returns {object} 技能效果汇总
   */
  calculateSkillEffects(character) {
    const skills = character.skills || {};
    const effects = {
      attributeBonuses: {},
      taskExpBonuses: {},
      specialEffects: {}
    };

    for (const [skillId, skillData] of Object.entries(skills)) {
      const skill = this.findSkillById(skillId);
      if (!skill || !skillData.level) continue;

      const level = skillData.level;
      const skillEffects = skill.effects;

      // 计算属性加成
      for (const [effect, value] of Object.entries(skillEffects)) {
        if (effect.endsWith('_bonus') && !effect.includes('task_exp')) {
          const attr = effect.replace('_bonus', '');
          effects.attributeBonuses[attr] = (effects.attributeBonuses[attr] || 0) + (value * level);
        }
      }

      // 计算任务经验加成
      if (skillEffects.task_exp_bonus) {
        for (const [taskType, bonus] of Object.entries(skillEffects.task_exp_bonus)) {
          effects.taskExpBonuses[taskType] = (effects.taskExpBonuses[taskType] || 0) + (bonus * level);
        }
      }

      // 其他特殊效果
      for (const [effect, value] of Object.entries(skillEffects)) {
        if (!effect.endsWith('_bonus') || effect.includes('task_exp')) continue;
        effects.specialEffects[effect] = (effects.specialEffects[effect] || 0) + (value * level);
      }
    }

    return effects;
  }
}

// 导出单例实例
const skillService = new SkillService();
export default skillService;
