// 数据库索引管理工具
import { DATABASE_SCHEMA } from './db-schema.js';

// 延迟初始化数据库连接
let db = null;

function getDatabase() {
  if (!db) {
    try {
      db = wx.cloud.database();
    } catch (error) {
      console.error('数据库初始化失败:', error);
      throw new Error('请先初始化云开发环境');
    }
  }
  return db;
}

/**
 * 数据库索引管理器
 */
class DatabaseIndexManager {
  constructor() {
    // 延迟初始化，在实际使用时才获取数据库实例
  }

  get db() {
    return getDatabase();
  }

  /**
   * 为所有集合创建索引
   */
  async createAllIndexes() {
    console.log('开始创建数据库索引...');
    const results = [];

    for (const [collectionName, schema] of Object.entries(DATABASE_SCHEMA)) {
      if (schema.indexes && schema.indexes.length > 0) {
        try {
          const result = await this.createCollectionIndexes(collectionName, schema.indexes);
          results.push({
            collection: collectionName,
            success: true,
            indexes: result
          });
        } catch (error) {
          console.error(`创建 ${collectionName} 索引失败:`, error);
          results.push({
            collection: collectionName,
            success: false,
            error: error.message
          });
        }
      }
    }

    console.log('数据库索引创建完成');
    return results;
  }

  /**
   * 为指定集合创建索引
   */
  async createCollectionIndexes(collectionName, indexFields) {
    console.log(`为集合 ${collectionName} 创建索引...`);
    const collection = this.db.collection(collectionName);
    const createdIndexes = [];

    for (const indexField of indexFields) {
      try {
        // 注意：微信云数据库的索引创建需要在控制台手动操作
        // 这里我们记录需要创建的索引信息
        const indexInfo = this.parseIndexField(indexField);
        createdIndexes.push(indexInfo);
        console.log(`索引配置: ${collectionName}.${indexField}`);
      } catch (error) {
        console.error(`配置索引失败 ${collectionName}.${indexField}:`, error);
      }
    }

    return createdIndexes;
  }

  /**
   * 解析索引字段
   */
  parseIndexField(indexField) {
    if (typeof indexField === 'string') {
      return {
        field: indexField,
        type: 'single',
        order: 'asc'
      };
    } else if (typeof indexField === 'object') {
      return {
        field: indexField.field || '',
        type: indexField.type || 'single',
        order: indexField.order || 'asc',
        unique: indexField.unique || false
      };
    }
    return null;
  }

  /**
   * 获取推荐的索引配置
   */
  getRecommendedIndexes() {
    const recommendations = {};

    for (const [collectionName, schema] of Object.entries(DATABASE_SCHEMA)) {
      const indexes = [];
      
      // 基于字段类型和用途推荐索引
      for (const [fieldName, fieldConfig] of Object.entries(schema.fields)) {
        if (this.shouldCreateIndex(fieldName, fieldConfig)) {
          indexes.push({
            field: fieldName,
            reason: this.getIndexReason(fieldName, fieldConfig),
            priority: this.getIndexPriority(fieldName, fieldConfig)
          });
        }
      }

      // 添加复合索引推荐
      const compositeIndexes = this.getCompositeIndexRecommendations(collectionName, schema);
      indexes.push(...compositeIndexes);

      recommendations[collectionName] = indexes.sort((a, b) => b.priority - a.priority);
    }

    return recommendations;
  }

  /**
   * 判断是否应该为字段创建索引
   */
  shouldCreateIndex(fieldName, fieldConfig) {
    // 主键字段
    if (fieldName === '_id') return false;
    
    // 外键字段
    if (fieldName.endsWith('Id') || fieldName.endsWith('Ids')) return true;
    
    // 唯一字段
    if (fieldConfig.unique) return true;
    
    // 时间字段
    if (fieldConfig.type === 'date') return true;
    
    // 状态字段
    if (fieldName === 'status' || fieldName === 'type' || fieldName === 'category') return true;
    
    // 数值字段（用于排序和范围查询）
    if (fieldConfig.type === 'number' && (fieldName.includes('level') || fieldName.includes('score') || fieldName.includes('count'))) return true;
    
    return false;
  }

  /**
   * 获取创建索引的原因
   */
  getIndexReason(fieldName, fieldConfig) {
    if (fieldName.endsWith('Id') || fieldName.endsWith('Ids')) return '外键查询优化';
    if (fieldConfig.unique) return '唯一性约束';
    if (fieldConfig.type === 'date') return '时间范围查询优化';
    if (fieldName === 'status') return '状态筛选优化';
    if (fieldName === 'type' || fieldName === 'category') return '分类查询优化';
    if (fieldConfig.type === 'number') return '数值排序和范围查询优化';
    return '查询性能优化';
  }

  /**
   * 获取索引优先级
   */
  getIndexPriority(fieldName, fieldConfig) {
    if (fieldConfig.unique) return 10;
    if (fieldName.endsWith('Id')) return 9;
    if (fieldName === 'status') return 8;
    if (fieldConfig.type === 'date') return 7;
    if (fieldName === 'type' || fieldName === 'category') return 6;
    if (fieldName.endsWith('Ids')) return 5;
    if (fieldConfig.type === 'number') return 4;
    return 3;
  }

  /**
   * 获取复合索引推荐
   */
  getCompositeIndexRecommendations(collectionName, schema) {
    const compositeIndexes = [];

    switch (collectionName) {
      case 'tasks':
        compositeIndexes.push({
          field: 'assigneeIds,status',
          type: 'composite',
          reason: '用户任务状态查询优化',
          priority: 9
        });
        compositeIndexes.push({
          field: 'category,createdAt',
          type: 'composite',
          reason: '分类时间排序优化',
          priority: 7
        });
        break;
        
      case 'habits':
        compositeIndexes.push({
          field: 'userId,category',
          type: 'composite',
          reason: '用户习惯分类查询优化',
          priority: 8
        });
        break;
        
      case 'moodLogs':
        compositeIndexes.push({
          field: 'userId,timestamp',
          type: 'composite',
          reason: '用户情绪时间序列查询优化',
          priority: 9
        });
        break;
        
      case 'socialRelations':
        compositeIndexes.push({
          field: 'userId,relationshipType',
          type: 'composite',
          reason: '用户关系类型查询优化',
          priority: 8
        });
        break;
    }

    return compositeIndexes;
  }

  /**
   * 生成索引创建脚本（用于手动在控制台执行）
   */
  generateIndexScript() {
    const recommendations = this.getRecommendedIndexes();
    let script = '// 数据库索引创建脚本\n';
    script += '// 请在微信云开发控制台的数据库管理中手动创建以下索引\n\n';

    for (const [collectionName, indexes] of Object.entries(recommendations)) {
      script += `// 集合: ${collectionName}\n`;
      
      for (const index of indexes) {
        script += `// ${index.reason} (优先级: ${index.priority})\n`;
        
        if (index.type === 'composite') {
          script += `// 复合索引: ${index.field}\n`;
        } else {
          script += `// 单字段索引: ${index.field}\n`;
        }
        
        script += `// 在控制台中为 ${collectionName} 集合创建索引: ${index.field}\n\n`;
      }
      
      script += '\n';
    }

    return script;
  }

  /**
   * 分析查询性能
   */
  async analyzeQueryPerformance(collectionName, query) {
    try {
      const startTime = Date.now();
      const result = await this.db.collection(collectionName).where(query).get();
      const endTime = Date.now();
      
      return {
        collection: collectionName,
        query: query,
        resultCount: result.data.length,
        executionTime: endTime - startTime,
        performance: this.evaluatePerformance(endTime - startTime, result.data.length)
      };
    } catch (error) {
      return {
        collection: collectionName,
        query: query,
        error: error.message
      };
    }
  }

  /**
   * 评估查询性能
   */
  evaluatePerformance(executionTime, resultCount) {
    if (executionTime < 100) return 'excellent';
    if (executionTime < 300) return 'good';
    if (executionTime < 1000) return 'fair';
    return 'poor';
  }

  /**
   * 获取索引使用统计
   */
  getIndexUsageStats() {
    // 注意：微信云数据库不提供索引使用统计
    // 这里返回理论上的索引效果评估
    const stats = {};
    
    for (const [collectionName, schema] of Object.entries(DATABASE_SCHEMA)) {
      stats[collectionName] = {
        totalIndexes: schema.indexes ? schema.indexes.length : 0,
        estimatedImprovement: this.estimatePerformanceImprovement(collectionName, schema)
      };
    }
    
    return stats;
  }

  /**
   * 估算性能提升
   */
  estimatePerformanceImprovement(collectionName, schema) {
    const indexCount = schema.indexes ? schema.indexes.length : 0;
    const fieldCount = Object.keys(schema.fields).length;
    
    // 简单的性能提升估算
    const improvement = Math.min(indexCount / fieldCount * 100, 80);
    return Math.round(improvement);
  }
}

// 导出单例实例
const dbIndexManager = new DatabaseIndexManager();
module.exports = dbIndexManager;
