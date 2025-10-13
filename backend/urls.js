import cloud from '@lafjs/cloud'

export default async function (ctx) {
  const { method, body, headers, query } = ctx
  
  try {
    const userNickname = headers['x-user-nickname'] ? decodeURIComponent(headers['x-user-nickname']) : null
    
    switch (method) {
      case 'POST':
        return await handleCreate(body, query, userNickname)
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
    console.error('网址接口错误:', error)
    return {
      success: false,
      data: null,
      message: '服务器错误',
      error: error.message
    }
  }
}

// 创建网址
async function handleCreate(body, query, userNickname) {
  const { name, url } = body
  const categoryId = query.categoryId
  
  // 验证参数
  if (!categoryId) {
    return {
      success: false,
      data: null,
      message: '分类ID不能为空',
      error: 'Category ID is required'
    }
  }
  
  if (!name || name.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '网址名称不能为空',
      error: 'URL name is required'
    }
  }
  
  if (!url || url.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '网址链接不能为空',
      error: 'URL is required'
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

  // 验证和格式化URL - 更宽松的验证
  let validUrl = url.trim()
  
  // 更宽松的验证：只要不是明显的纯文本就允许
  const hasProtocol = validUrl.startsWith('http://') || validUrl.startsWith('https://')
  const hasSpace = validUrl.includes(' ') // 包含空格的通常是纯文本
  const isChinese = /[\u4e00-\u9fa5]/.test(validUrl) // 包含中文的通常是纯文本
  const hasBasicFormat = validUrl.includes('.') || validUrl.includes(':') || validUrl.includes('/') || hasProtocol
  
  // 如果包含空格或中文，且没有协议，认为是纯文本
  if ((hasSpace || isChinese) && !hasProtocol) {
    return {
      success: false,
      data: null,
      message: '请输入有效的网址',
      error: 'Invalid URL format'
    }
  }
  
  // 如果没有任何网址格式特征，认为是纯文本
  if (!hasBasicFormat && !validUrl.includes('localhost') && !validUrl.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return {
      success: false,
      data: null,
      message: '请输入有效的网址',
      error: 'Invalid URL format'
    }
  }
  
  // 自动添加协议前缀
  if (!hasProtocol) {
    validUrl = 'https://' + validUrl
  }

  const db = cloud.database()
  const collection = db.collection('url_categories')
  
  // 生成新的URL ID - 使用简单的字符串ID或让数据库自动生成
  const urlId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  
  const newUrl = {
    _id: urlId,
    name: name.trim(),
    url: validUrl,
    sort_order: 0,
    created_by: userNickname,
    created_at: new Date()
  }
  
  // 向分类中添加网址
  const result = await collection.doc(categoryId).update({
    urls: db.command.push(newUrl)
  })
  
  if (result.updated === 0) {
    return {
      success: false,
      data: null,
      message: '分类不存在',
      error: 'Category not found'
    }
  }
  
  return {
    success: true,
    data: newUrl,
    message: '网址添加成功'
  }
}

// 更新网址
async function handleUpdate(body, query, userNickname) {
  const { name, url } = body
  const categoryId = query.categoryId
  const urlId = query.urlId
  
  // 验证参数
  if (!categoryId) {
    return {
      success: false,
      data: null,
      message: '分类ID不能为空',
      error: 'Category ID is required'
    }
  }
  
  if (!urlId) {
    return {
      success: false,
      data: null,
      message: '网址ID不能为空',
      error: 'URL ID is required'
    }
  }
  
  if (!name || name.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '网址名称不能为空',
      error: 'URL name is required'
    }
  }
  
  if (!url || url.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '网址链接不能为空',
      error: 'URL is required'
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

  // 验证和格式化URL - 更宽松的验证
  let validUrl = url.trim()
  
  // 更宽松的验证：只要不是明显的纯文本就允许
  const hasProtocol = validUrl.startsWith('http://') || validUrl.startsWith('https://')
  const hasSpace = validUrl.includes(' ') // 包含空格的通常是纯文本
  const isChinese = /[\u4e00-\u9fa5]/.test(validUrl) // 包含中文的通常是纯文本
  const hasBasicFormat = validUrl.includes('.') || validUrl.includes(':') || validUrl.includes('/') || hasProtocol
  
  // 如果包含空格或中文，且没有协议，认为是纯文本
  if ((hasSpace || isChinese) && !hasProtocol) {
    return {
      success: false,
      data: null,
      message: '请输入有效的网址',
      error: 'Invalid URL format'
    }
  }
  
  // 如果没有任何网址格式特征，认为是纯文本
  if (!hasBasicFormat && !validUrl.includes('localhost') && !validUrl.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return {
      success: false,
      data: null,
      message: '请输入有效的网址',
      error: 'Invalid URL format'
    }
  }
  
  // 自动添加协议前缀
  if (!hasProtocol) {
    validUrl = 'https://' + validUrl
  }

  const db = cloud.database()
  const collection = db.collection('url_categories')
  
  // 先获取分类数据
  const categoryResult = await collection.doc(categoryId).get()
  
  if (!categoryResult.data) {
    return {
      success: false,
      data: null,
      message: '分类不存在',
      error: 'Category not found'
    }
  }
  
  // 查找并更新网址
  const urls = categoryResult.data.urls || []
  const urlIndex = urls.findIndex(u => u._id === urlId)
  
  if (urlIndex === -1) {
    return {
      success: false,
      data: null,
      message: '网址不存在',
      error: 'URL not found'
    }
  }
  
  // 更新网址信息
  urls[urlIndex].name = name.trim()
  urls[urlIndex].url = validUrl
  
  // 保存更新
  const result = await collection.doc(categoryId).update({
    urls: urls
  })
  
  if (result.updated === 0) {
    return {
      success: false,
      data: null,
      message: '更新失败',
      error: 'Update failed'
    }
  }
  
  return {
    success: true,
    data: null,
    message: '网址更新成功'
  }
}

// 删除网址
async function handleDelete(query, userNickname) {
  const categoryId = query.categoryId
  const urlId = query.urlId
  
  // 验证参数
  if (!categoryId) {
    return {
      success: false,
      data: null,
      message: '分类ID不能为空',
      error: 'Category ID is required'
    }
  }
  
  if (!urlId) {
    return {
      success: false,
      data: null,
      message: '网址ID不能为空',
      error: 'URL ID is required'
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
  const collection = db.collection('url_categories')
  
  // 先获取分类数据
  const categoryResult = await collection.doc(categoryId).get()
  
  if (!categoryResult.data) {
    return {
      success: false,
      data: null,
      message: '分类不存在',
      error: 'Category not found'
    }
  }
  
  // 过滤掉要删除的网址
  const urls = categoryResult.data.urls || []
  const filteredUrls = urls.filter(u => u._id !== urlId)
  
  if (filteredUrls.length === urls.length) {
    return {
      success: false,
      data: null,
      message: '网址不存在',
      error: 'URL not found'
    }
  }
  
  // 保存更新
  const result = await collection.doc(categoryId).update({
    urls: filteredUrls
  })
  
  if (result.updated === 0) {
    return {
      success: false,
      data: null,
      message: '删除失败',
      error: 'Delete failed'
    }
  }
  
  return {
    success: true,
    data: null,
    message: '网址删除成功'
  }
}
