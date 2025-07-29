// 现实世界RPG云函数 - 清理版本
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
      case 'createUser':
        return await createUser(data);
      case 'upgradeUser':
        return await upgradeUser(wxContext.OPENID, data);
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
  try {
    console.log('获取openid，输入数据:', data);
    
    // 方法1：直接从云函数上下文获取openid（最可靠）
    const wxContext = cloud.getWXContext();
    console.log('云函数上下文:', wxContext);
    
    if (wxContext.OPENID && wxContext.OPENID !== '') {
      console.log('从上下文获取到openid:', wxContext.OPENID);
      return {
        success: true,
        data: {
          openid: wxContext.OPENID,
          appid: wxContext.APPID,
          unionid: wxContext.UNIONID
        }
      };
    }
    
    // 方法2：如果上下文中没有openid，返回错误信息
    console.log('云函数上下文中没有openid');
    return {
      success: false,
      error: '云函数上下文中没有openid，请确保小程序已正确配置并且用户已授权登录'
    };
    
  } catch (error) {
    console.error('获取openid错误:', error);
    return {
      success: false,
      error: `获取openid失败: ${error.message}`
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

// 创建用户
async function createUser(userData) {
  try {
    console.log('创建用户:', userData);

    const { openid } = userData;
    if (!openid) {
      return {
        success: false,
        error: '缺少openid'
      };
    }

    // 检查用户是否已存在
    const existingUser = await db.collection('users').where({
      openid: openid
    }).get();

    if (existingUser.data.length > 0) {
      return {
        success: false,
        error: '用户已存在'
      };
    }

    // 创建用户记录
    const result = await db.collection('users').add({
      data: {
        ...userData,
        createdAt: new Date(),
        lastModified: new Date()
      }
    });

    return {
      success: true,
      data: {
        _id: result._id,
        ...userData
      }
    };
  } catch (error) {
    console.error('创建用户错误:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 升级用户账户
async function upgradeUser(openid, userData) {
  try {
    console.log('升级用户账户:', openid, userData);

    // 检查用户是否已存在
    const existingUser = await db.collection('users').where({
      openid: openid
    }).get();

    if (existingUser.data.length > 0) {
      // 用户已存在，更新数据
      const result = await db.collection('users').doc(existingUser.data[0]._id).update({
        data: {
          ...userData,
          openid: openid,
          upgradeDate: new Date(),
          lastModified: new Date()
        }
      });

      return {
        success: true,
        data: {
          action: 'updated',
          userId: existingUser.data[0]._id
        }
      };
    } else {
      // 创建新用户
      const result = await db.collection('users').add({
        data: {
          ...userData,
          openid: openid,
          upgradeDate: new Date(),
          createdAt: new Date()
        }
      });

      return {
        success: true,
        data: {
          action: 'created',
          userId: result._id
        }
      };
    }
  } catch (error) {
    console.error('升级用户账户错误:', error);
    return {
      success: false,
      error: error.message
    };
  }
}