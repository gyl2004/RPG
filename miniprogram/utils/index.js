// 现实世界RPG工具函数

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @param {string} format 格式字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @param {string} format 格式字符串
 * @returns {string} 格式化后的时间字符串
 */
function formatTime(date, format = 'HH:mm:ss') {
  return formatDate(date, format);
}

/**
 * 格式化相对时间
 * @param {Date} date 日期对象
 * @returns {string} 相对时间字符串
 */
function formatRelativeTime(date) {
  if (!date) return '';

  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}

/**
 * 获取今天的开始时间
 * @returns {Date} 今天的开始时间
 */
function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * 获取今天的结束时间
 * @returns {Date} 今天的结束时间
 */
function getTodayEnd() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

/**
 * 计算等级所需经验值
 * @param {number} level 等级
 * @returns {number} 所需经验值
 */
function getExpForLevel(level) {
  return level * 100 + Math.pow(level, 2) * 50;
}

/**
 * 根据经验值计算等级
 * @param {number} experience 当前经验值
 * @returns {object} 包含等级、当前等级经验、下一等级所需经验的对象
 */
function calculateLevel(experience) {
  let level = 1;
  let totalExp = 0;

  while (totalExp + getExpForLevel(level) <= experience) {
    totalExp += getExpForLevel(level);
    level++;
  }

  const currentLevelExp = experience - totalExp;
  const nextLevelExp = getExpForLevel(level);
  const expPercent = Math.floor((currentLevelExp / nextLevelExp) * 100);

  return {
    level,
    currentLevelExp,
    nextLevelExp,
    expPercent,
    totalExp
  };
}

/**
 * 计算任务奖励
 * @param {object} task 任务对象
 * @returns {object} 奖励对象
 */
function calculateTaskRewards(task) {
  const baseExperience = 10;
  const baseCurrency = 5;
  const difficultyMultiplier = task.difficulty || 1;

  return {
    experience: Math.floor(baseExperience * difficultyMultiplier),
    currency: Math.floor(baseCurrency * difficultyMultiplier)
  };
}

/**
 * 计算习惯奖励
 * @param {object} habit 习惯对象
 * @param {number} streak 连续天数
 * @returns {object} 奖励对象
 */
function calculateHabitRewards(habit, streak = 1) {
  const baseExperience = 5;
  const baseCurrency = 2;
  const streakBonus = Math.min(streak / 7, 2); // 最多2倍奖励

  return {
    experience: Math.floor(baseExperience * (1 + streakBonus)),
    currency: Math.floor(baseCurrency * (1 + streakBonus))
  };
}

/**
 * 生成随机ID
 * @param {number} length ID长度
 * @returns {string} 随机ID
 */
function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 验证邮箱格式
 * @param {string} email 邮箱地址
 * @returns {boolean} 是否有效
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * 验证手机号格式
 * @param {string} phone 手机号
 * @returns {boolean} 是否有效
 */
function validatePhone(phone) {
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} limit 时间限制
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 深拷贝对象
 * @param {any} obj 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 检查对象是否为空
 * @param {object} obj 要检查的对象
 * @returns {boolean} 是否为空
 */
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * 获取数组中的随机元素
 * @param {Array} array 数组
 * @returns {any} 随机元素
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 打乱数组
 * @param {Array} array 要打乱的数组
 * @returns {Array} 打乱后的数组
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 显示提示信息
 * @param {string} title 提示标题
 * @param {string} icon 图标类型
 */
function showToast(title, icon = 'none') {
  wx.showToast({ title, icon });
}

/**
 * 显示加载中
 * @param {string} title 加载文本
 */
function showLoading(title = '加载中...') {
  wx.showLoading({ title });
}

/**
 * 隐藏加载中
 */
function hideLoading() {
  wx.hideLoading();
}

// 导出所有函数
module.exports = {
  formatDate,
  formatTime,
  formatRelativeTime,
  getTodayStart,
  getTodayEnd,
  getExpForLevel,
  calculateLevel,
  calculateTaskRewards,
  calculateHabitRewards,
  generateId,
  validateEmail,
  validatePhone,
  debounce,
  throttle,
  deepClone,
  isEmptyObject,
  getRandomElement,
  shuffleArray,
  showToast,
  showLoading,
  hideLoading
};
