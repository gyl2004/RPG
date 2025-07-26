// 数据库安全规则配置
// 基于微信云数据库的安全规则设计

/**
 * 数据库安全规则管理器
 */
class DatabaseSecurityManager {
  constructor() {
    this.securityRules = this.generateSecurityRules();
  }

  /**
   * 生成数据库安全规则
   */
  generateSecurityRules() {
    return {
      // 用户集合安全规则
      users: {
        description: '用户只能读写自己的数据',
        read: {
          condition: 'auth.openid == resource.openid',
          description: '用户只能读取自己的信息'
        },
        write: {
          condition: 'auth.openid == resource.openid',
          description: '用户只能修改自己的信息'
        },
        create: {
          condition: 'auth.openid == request.data.openid',
          description: '用户只能创建自己的记录'
        },
        delete: {
          condition: 'false',
          description: '禁止删除用户记录'
        }
      },

      // 角色集合安全规则
      characters: {
        description: '用户只能操作自己的角色',
        read: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能读取自己的角色'
        },
        write: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能修改自己的角色'
        },
        create: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(request.data.userId)).data.openid',
          description: '用户只能创建自己的角色'
        },
        delete: {
          condition: 'false',
          description: '禁止删除角色记录'
        }
      },

      // 任务集合安全规则
      tasks: {
        description: '用户只能操作自己创建或被分配的任务',
        read: {
          condition: `
            auth.openid == get(/databases/$(database)/documents/users/$(resource.creatorId)).data.openid ||
            auth.openid in resource.assigneeIds.map(id => get(/databases/$(database)/documents/users/$(id)).data.openid)
          `,
          description: '用户只能读取自己创建或被分配的任务'
        },
        write: {
          condition: `
            auth.openid == get(/databases/$(database)/documents/users/$(resource.creatorId)).data.openid ||
            auth.openid in resource.assigneeIds.map(id => get(/databases/$(database)/documents/users/$(id)).data.openid)
          `,
          description: '用户只能修改自己创建或被分配的任务'
        },
        create: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(request.data.creatorId)).data.openid',
          description: '用户只能创建自己的任务'
        },
        delete: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.creatorId)).data.openid',
          description: '用户只能删除自己创建的任务'
        }
      },

      // 习惯集合安全规则
      habits: {
        description: '用户只能操作自己的习惯',
        read: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能读取自己的习惯'
        },
        write: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能修改自己的习惯'
        },
        create: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(request.data.userId)).data.openid',
          description: '用户只能创建自己的习惯'
        },
        delete: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能删除自己的习惯'
        }
      },

      // 物品集合安全规则
      items: {
        description: '物品信息只读，由系统管理',
        read: {
          condition: 'true',
          description: '所有用户都可以读取物品信息'
        },
        write: {
          condition: 'false',
          description: '禁止用户修改物品信息'
        },
        create: {
          condition: 'false',
          description: '禁止用户创建物品'
        },
        delete: {
          condition: 'false',
          description: '禁止用户删除物品'
        }
      },

      // 库存集合安全规则
      inventory: {
        description: '用户只能操作自己的库存',
        read: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能读取自己的库存'
        },
        write: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能修改自己的库存'
        },
        create: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(request.data.userId)).data.openid',
          description: '用户只能创建自己的库存'
        },
        delete: {
          condition: 'false',
          description: '禁止删除库存记录'
        }
      },

      // 社交关系集合安全规则
      socialRelations: {
        description: '用户只能操作自己的社交关系',
        read: {
          condition: `
            auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid ||
            auth.openid == get(/databases/$(database)/documents/users/$(resource.friendId)).data.openid
          `,
          description: '用户只能读取与自己相关的社交关系'
        },
        write: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能修改自己发起的社交关系'
        },
        create: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(request.data.userId)).data.openid',
          description: '用户只能创建自己的社交关系'
        },
        delete: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能删除自己发起的社交关系'
        }
      },

      // 团队集合安全规则
      teams: {
        description: '团队成员可以读取，创建者可以管理',
        read: {
          condition: `
            auth.openid == get(/databases/$(database)/documents/users/$(resource.creatorId)).data.openid ||
            auth.openid in resource.members.map(member => get(/databases/$(database)/documents/users/$(member.userId)).data.openid)
          `,
          description: '团队创建者和成员可以读取团队信息'
        },
        write: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.creatorId)).data.openid',
          description: '只有团队创建者可以修改团队信息'
        },
        create: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(request.data.creatorId)).data.openid',
          description: '用户只能创建自己的团队'
        },
        delete: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.creatorId)).data.openid',
          description: '只有团队创建者可以删除团队'
        }
      },

      // 情绪记录集合安全规则
      moodLogs: {
        description: '用户只能操作自己的情绪记录',
        read: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能读取自己的情绪记录'
        },
        write: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能修改自己的情绪记录'
        },
        create: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(request.data.userId)).data.openid',
          description: '用户只能创建自己的情绪记录'
        },
        delete: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能删除自己的情绪记录'
        }
      },

      // 故事线集合安全规则
      storylines: {
        description: '用户只能操作自己的故事线',
        read: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能读取自己的故事线'
        },
        write: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能修改自己的故事线'
        },
        create: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(request.data.userId)).data.openid',
          description: '用户只能创建自己的故事线'
        },
        delete: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能删除自己的故事线'
        }
      },

      // 成就集合安全规则
      achievements: {
        description: '成就信息只读，由系统管理',
        read: {
          condition: 'true',
          description: '所有用户都可以读取成就信息'
        },
        write: {
          condition: 'false',
          description: '禁止用户修改成就信息'
        },
        create: {
          condition: 'false',
          description: '禁止用户创建成就'
        },
        delete: {
          condition: 'false',
          description: '禁止用户删除成就'
        }
      },

      // 技能集合安全规则
      skills: {
        description: '技能信息只读，由系统管理',
        read: {
          condition: 'true',
          description: '所有用户都可以读取技能信息'
        },
        write: {
          condition: 'false',
          description: '禁止用户修改技能信息'
        },
        create: {
          condition: 'false',
          description: '禁止用户创建技能'
        },
        delete: {
          condition: 'false',
          description: '禁止用户删除技能'
        }
      },

      // 通知集合安全规则
      notifications: {
        description: '用户只能读取自己的通知',
        read: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能读取自己的通知'
        },
        write: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户只能修改自己的通知（如标记已读）'
        },
        create: {
          condition: 'false',
          description: '禁止用户创建通知（由系统创建）'
        },
        delete: {
          condition: 'auth.openid == get(/databases/$(database)/documents/users/$(resource.userId)).data.openid',
          description: '用户可以删除自己的通知'
        }
      }
    };
  }

  /**
   * 获取指定集合的安全规则
   */
  getCollectionSecurityRules(collectionName) {
    return this.securityRules[collectionName] || null;
  }

  /**
   * 生成安全规则配置脚本
   */
  generateSecurityScript() {
    let script = '// 微信云数据库安全规则配置\n';
    script += '// 请在微信云开发控制台的数据库安全规则中配置以下规则\n\n';

    for (const [collectionName, rules] of Object.entries(this.securityRules)) {
      script += `// 集合: ${collectionName}\n`;
      script += `// 描述: ${rules.description}\n`;
      script += '{\n';
      
      if (rules.read) {
        script += `  "read": "${rules.read.condition}",\n`;
      }
      if (rules.write) {
        script += `  "write": "${rules.write.condition}",\n`;
      }
      if (rules.create) {
        script += `  "create": "${rules.create.condition}",\n`;
      }
      if (rules.delete) {
        script += `  "delete": "${rules.delete.condition}"\n`;
      }
      
      script += '}\n\n';
    }

    return script;
  }

  /**
   * 验证安全规则配置
   */
  validateSecurityRules() {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    for (const [collectionName, rules] of Object.entries(this.securityRules)) {
      // 检查是否有基本的安全规则
      if (!rules.read && !rules.write) {
        validation.errors.push(`集合 ${collectionName} 缺少基本的读写规则`);
        validation.valid = false;
      }

      // 检查是否有过于宽松的规则
      if (rules.read && rules.read.condition === 'true' && 
          (rules.write && rules.write.condition === 'true')) {
        validation.warnings.push(`集合 ${collectionName} 的安全规则过于宽松`);
      }

      // 检查是否有删除保护
      if (!rules.delete || rules.delete.condition !== 'false') {
        if (['users', 'characters', 'inventory'].includes(collectionName)) {
          validation.warnings.push(`建议为集合 ${collectionName} 添加删除保护`);
        }
      }
    }

    return validation;
  }

  /**
   * 获取安全规则摘要
   */
  getSecuritySummary() {
    const summary = {
      totalCollections: Object.keys(this.securityRules).length,
      readOnlyCollections: 0,
      userDataCollections: 0,
      systemDataCollections: 0
    };

    for (const [collectionName, rules] of Object.entries(this.securityRules)) {
      if (rules.write && rules.write.condition === 'false') {
        summary.readOnlyCollections++;
        summary.systemDataCollections++;
      } else if (rules.read && rules.read.condition.includes('auth.openid')) {
        summary.userDataCollections++;
      }
    }

    return summary;
  }
}

// 导出单例实例
const dbSecurityManager = new DatabaseSecurityManager();
module.exports = dbSecurityManager;
