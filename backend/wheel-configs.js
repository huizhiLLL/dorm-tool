import cloud from '@lafjs/cloud'

export default async function (ctx) {
  const { method, body, headers, query } = ctx
  
  try {
    const userNickname = headers['x-user-nickname'] ? decodeURIComponent(headers['x-user-nickname']) : null
    
    switch (method) {
      case 'GET':
        return await handleList()
      case 'POST':
        return await handleCreate(body, userNickname)
      case 'PUT':
        return await handleUpdate(body, query, userNickname)
      case 'DELETE':
        return await handleDelete(query, userNickname)
      default:
        return {
          success: false,
          data: null,
          message: '不支持的请求方法',
          error: 'Method not allowed'
        }
    }
    
  } catch (error) {
    console.error('轮盘配置接口错误:', error)
    return {
      success: false,
      data: null,
      message: '服务器错误',
      error: error.message
    }
  }
}

// 获取轮盘配置列表
async function handleList() {
  const db = cloud.database()
  const collection = db.collection('wheel_configs')
  
  const result = await collection
    .orderBy('created_at', 'desc')
    .get()
  
  return {
    success: true,
    data: result.data || [],
    message: '获取成功'
  }
}

// 创建轮盘配置
async function handleCreate(body, userNickname) {
  const { name, options } = body
  
  // 验证参数
  if (!name || name.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '轮盘名称不能为空',
      error: 'Wheel name is required'
    }
  }
  
  if (!options || !Array.isArray(options) || options.length < 2) {
    return {
      success: false,
      data: null,
      message: '至少需要2个选项',
      error: 'At least 2 options required'
    }
  }
  
  if (options.length > 12) {
    return {
      success: false,
      data: null,
      message: '选项不能超过12个',
      error: 'Too many options'
    }
  }
  
  if (!userNickname) {
    return {
      success: false,
      data: null,
      message: '用户信息缺失',
      error: 'User nickname is required'
    }
  }

  // 验证选项内容
  const validOptions = options.filter(option => 
    option && typeof option === 'string' && option.trim().length > 0
  ).map(option => option.trim())
  
  if (validOptions.length < 2) {
    return {
      success: false,
      data: null,
      message: '至少需要2个有效选项',
      error: 'At least 2 valid options required'
    }
  }
  
  // 检查重复选项
  const uniqueOptions = [...new Set(validOptions)]
  if (uniqueOptions.length !== validOptions.length) {
    return {
      success: false,
      data: null,
      message: '选项不能重复',
      error: 'Duplicate options not allowed'
    }
  }

  const db = cloud.database()
  const collection = db.collection('wheel_configs')
  
  const now = new Date()
  const newWheel = {
    name: name.trim(),
    options: uniqueOptions,
    created_by: userNickname,
    created_at: now,
    updated_at: now
  }
  
  const result = await collection.add(newWheel)
  
  return {
    success: true,
    data: {
      _id: result.id,
      ...newWheel
    },
    message: '轮盘创建成功'
  }
}

// 更新轮盘配置
async function handleUpdate(body, query, userNickname) {
  const { name, options } = body
  const wheelId = query.id
  
  // 验证参数
  if (!wheelId) {
    return {
      success: false,
      data: null,
      message: '轮盘ID不能为空',
      error: 'Wheel ID is required'
    }
  }
  
  if (!name || name.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '轮盘名称不能为空',
      error: 'Wheel name is required'
    }
  }
  
  if (!options || !Array.isArray(options) || options.length < 2) {
    return {
      success: false,
      data: null,
      message: '至少需要2个选项',
      error: 'At least 2 options required'
    }
  }
  
  if (options.length > 12) {
    return {
      success: false,
      data: null,
      message: '选项不能超过12个',
      error: 'Too many options'
    }
  }
  
  if (!userNickname) {
    return {
      success: false,
      data: null,
      message: '用户信息缺失',
      error: 'User nickname is required'
    }
  }

  // 验证选项内容
  const validOptions = options.filter(option => 
    option && typeof option === 'string' && option.trim().length > 0
  ).map(option => option.trim())
  
  if (validOptions.length < 2) {
    return {
      success: false,
      data: null,
      message: '至少需要2个有效选项',
      error: 'At least 2 valid options required'
    }
  }
  
  // 检查重复选项
  const uniqueOptions = [...new Set(validOptions)]
  if (uniqueOptions.length !== validOptions.length) {
    return {
      success: false,
      data: null,
      message: '选项不能重复',
      error: 'Duplicate options not allowed'
    }
  }

  const db = cloud.database()
  const collection = db.collection('wheel_configs')
  
  const result = await collection.doc(wheelId).update({
    name: name.trim(),
    options: uniqueOptions,
    updated_at: new Date()
  })
  
  if (result.updated === 0) {
    return {
      success: false,
      data: null,
      message: '轮盘配置不存在',
      error: 'Wheel config not found'
    }
  }
  
  return {
    success: true,
    data: null,
    message: '轮盘更新成功'
  }
}

// 删除轮盘配置
async function handleDelete(query, userNickname) {
  const wheelId = query.id
  
  // 验证参数
  if (!wheelId) {
    return {
      success: false,
      data: null,
      message: '轮盘ID不能为空',
      error: 'Wheel ID is required'
    }
  }
  
  if (!userNickname) {
    return {
      success: false,
      data: null,
      message: '用户信息缺失',
      error: 'User nickname is required'
    }
  }

  const db = cloud.database()
  const collection = db.collection('wheel_configs')
  
  const result = await collection.doc(wheelId).remove()
  
  if (result.deleted === 0) {
    return {
      success: false,
      data: null,
      message: '轮盘配置不存在',
      error: 'Wheel config not found'
    }
  }
  
  return {
    success: true,
    data: null,
    message: '轮盘删除成功'
  }
}
