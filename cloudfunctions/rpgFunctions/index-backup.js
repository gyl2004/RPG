// 现实世界RPG云函数 - 简化版本用于测试
const cloud = require('wx-server-sdk');

cloud.init({
  env: 'cloud1-1gf83xgo315db82d'
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const { type, data } = event;
  const wxContext = cloud.getWXContext();
  
  console.log('RPG云函数调用:', type, data);

  try {
    switch (type) {
      case 'getOpenId':
        return await getOpenId(data);
      case 'test':
        return await testFunction(data);
      default:
        return {
          success: false,
          error: '未知的函数类型: ' + type
        };
    }
  } catch (error) {
    console.error('云函数执行错误:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 获取用户openid
async function getOpenId(data) {
  const { code } = data;

  if (!code) {
    return {
      success: false,
      error: '缺少登录code'
    };
  }

  try {
    console.log('调用微信接口获取openid，code:', code);
    
    // 调用微信接口获取openid
    const result = await cloud.openapi.auth.code2Session({
      jsCode: code
    });

    console.log('微信接口返回:', result);

    if (result.openid) {
      return {
        success: true,
        data: {
          openid: result.openid,
          sessionKey: result.session_key
        }
      };
    } else {
      return {
        success: false,
        error: '获取openid失败，微信接口未返回openid'
      };
    }
  } catch (error) {
    console.error('获取openid错误:', error);
    return {
      success: false,
      error: error.message || '获取openid失败'
    };
  }
}

// 测试函数
async function testFunction(data) {
  return {
    success: true,
    data: {
      message: '云函数连接正常',
      timestamp: new Date(),
      input: data,
      wxContext: cloud.getWXContext()
    }
  };
}