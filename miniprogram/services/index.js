// 现实世界RPG服务层

import { showLoading, hideLoading, showError } from '../utils/index.js';

/**
 * 云函数调用服务
 */
class CloudService {
  /**
   * 调用云函数
   * @param {string} name 云函数名称
   * @param {object} data 传递的数据
   * @returns {Promise} 调用结果
   */
  async callFunction(name, data = {}) {
    try {
      showLoading('处理中...');
      const result = await wx.cloud.callFunction({
        name,
        data
      });
      hideLoading();
      return result.result;
    } catch (error) {
      hideLoading();
      console.error(`云函数 ${name} 调用失败:`, error);
      showError('网络请求失败');
      throw error;
    }
  }

  /**
   * 调用RPG云函数
   * @param {string} type 函数类型
   * @param {object} data 传递的数据
   * @returns {Promise} 调用结果
   */
  async callRPGFunction(type, data = {}) {
    return this.callFunction('rpgFunctions', { type, data });
  }
}

/**
 * 用户服务
 */
class UserService {
  constructor() {
    this.cloudService = new CloudService();
  }

  /**
   * 获取用户信息
   * @returns {Promise} 用户信息
   */
  async getUserInfo() {
    return this.cloudService.callRPGFunction('getUserInfo');
  }

  /**
   * 用户登录
   * @param {object} userInfo 用户信息
   * @returns {Promise} 登录结果
   */
  async login(userInfo) {
    const app = getApp();
    app.login(userInfo);
    return { success: true };
  }

  /**
   * 用户登出
   * @returns {Promise} 登出结果
   */
  async logout() {
    const app = getApp();
    app.logout();
    return { success: true };
  }
}

/**
 * 角色服务
 */
class CharacterService {
  constructor() {
    this.cloudService = new CloudService();
  }

  /**
   * 创建角色
   * @param {object} characterData 角色数据
   * @returns {Promise} 创建结果
   */
  async createCharacter(characterData) {
    return this.cloudService.callRPGFunction('createCharacter', characterData);
  }

  /**
   * 更新角色
   * @param {object} updateData 更新数据
   * @returns {Promise} 更新结果
   */
  async updateCharacter(updateData) {
    return this.cloudService.callRPGFunction('updateCharacter', updateData);
  }

  /**
   * 获取角色信息
   * @returns {Promise} 角色信息
   */
  async getCharacter() {
    const result = await this.getUserInfo();
    return result.data?.character || null;
  }
}

/**
 * 任务服务
 */
class TaskService {
  constructor() {
    this.cloudService = new CloudService();
  }

  /**
   * 创建任务
   * @param {object} taskData 任务数据
   * @returns {Promise} 创建结果
   */
  async createTask(taskData) {
    return this.cloudService.callRPGFunction('createTask', taskData);
  }

  /**
   * 完成任务
   * @param {string} taskId 任务ID
   * @returns {Promise} 完成结果
   */
  async completeTask(taskId) {
    return this.cloudService.callRPGFunction('completeTask', { taskId });
  }

  /**
   * 获取用户任务列表
   * @param {object} filters 过滤条件
   * @returns {Promise} 任务列表
   */
  async getUserTasks(filters = {}) {
    return this.cloudService.callRPGFunction('getUserTasks', filters);
  }

  /**
   * 更新任务状态
   * @param {string} taskId 任务ID
   * @param {string} status 新状态
   * @returns {Promise} 更新结果
   */
  async updateTaskStatus(taskId, status) {
    return this.cloudService.callRPGFunction('updateTaskStatus', { taskId, status });
  }
}

/**
 * 习惯服务
 */
class HabitService {
  constructor() {
    this.cloudService = new CloudService();
  }

  /**
   * 创建习惯
   * @param {object} habitData 习惯数据
   * @returns {Promise} 创建结果
   */
  async createHabit(habitData) {
    return this.cloudService.callRPGFunction('createHabit', habitData);
  }

  /**
   * 记录习惯完成
   * @param {string} habitId 习惯ID
   * @param {boolean} completed 是否完成
   * @returns {Promise} 记录结果
   */
  async logHabit(habitId, completed) {
    return this.cloudService.callRPGFunction('logHabit', { habitId, completed });
  }

  /**
   * 获取用户习惯列表
   * @returns {Promise} 习惯列表
   */
  async getUserHabits() {
    return this.cloudService.callRPGFunction('getUserHabits');
  }

  /**
   * 获取习惯统计
   * @param {string} habitId 习惯ID
   * @returns {Promise} 统计数据
   */
  async getHabitStatistics(habitId) {
    return this.cloudService.callRPGFunction('getHabitStatistics', { habitId });
  }
}

/**
 * 奖励服务
 */
class RewardService {
  constructor() {
    this.cloudService = new CloudService();
  }

  /**
   * 计算奖励
   * @param {object} data 计算数据
   * @returns {Promise} 奖励结果
   */
  async calculateRewards(data) {
    return this.cloudService.callRPGFunction('calculateRewards', data);
  }

  /**
   * 发放奖励
   * @param {object} rewards 奖励数据
   * @returns {Promise} 发放结果
   */
  async grantRewards(rewards) {
    return this.cloudService.callRPGFunction('grantRewards', rewards);
  }
}



// 导出服务实例
export const cloudService = new CloudService();
export const userService = new UserService();
export const characterService = new CharacterService();
export const taskService = new TaskService();
export const habitService = new HabitService();
export const rewardService = new RewardService();
