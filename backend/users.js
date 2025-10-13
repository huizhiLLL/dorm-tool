import cloud from '@lafjs/cloud'

export default async function (ctx) {
  const { method, body, headers } = ctx
  
  try {
    // 用户登录/注册
    if (method === 'POST') {
      return await handleLogin(body, headers)
    }
    
    return {
      success: false,
      data: null,
      message: '不支持的请求方法',
      error: 'Method not allowed'
    }
    
  } catch (error) {
    console.error('用户接口错误:', error)
    return {
      success: false,
      data: null,
      message: '服务器错误',
      error: error.message
    }
  }
}

// 处理用户登录/注册
async function handleLogin(body, headers) {
  const { nickname } = body
  
  // 验证昵称
  if (!nickname || nickname.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '昵称不能为空',
      error: 'Nickname is required'
    }
  }
  
  if (nickname.trim().length > 20) {
    return {
      success: false,
      data: null,
      message: '昵称不能超过20个字符',
      error: 'Nickname too long'
    }
  }

  // 获取数据库连接
  const db = cloud.database()
  const collection = db.collection('users')
  
  // 查找或创建用户
  const trimmedNickname = nickname.trim()
  const now = new Date()
  
  // 先尝试查找用户
  let user = await collection.where({ nickname: trimmedNickname }).get()
  
  if (user.data.length > 0) {
    // 用户存在，更新最后登录时间
    await collection.doc(user.data[0]._id).update({
      updated_at: now
    })
    
    return {
      success: true,
      data: {
        _id: user.data[0]._id,
        nickname: user.data[0].nickname,
        created_at: user.data[0].created_at,
        updated_at: now
      },
      message: '登录成功'
    }
  } else {
    // 用户不存在，创建新用户
    const newUser = {
      nickname: trimmedNickname,
      created_at: now,
      updated_at: now
    }
    
    const result = await collection.add(newUser)
    
    return {
      success: true,
      data: {
        _id: result.id,
        ...newUser
      },
      message: '注册并登录成功'
    }
  }
}
