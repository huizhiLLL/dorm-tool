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
    console.error('网址分类接口错误:', error)
    return {
      success: false,
      data: null,
      message: '服务器错误',
      error: error.message
    }
  }
}

// 获取所有分类
async function handleList() {
  const db = cloud.database()
  const collection = db.collection('url_categories')
  
  const result = await collection
    .orderBy('sort_order', 'asc')
    .orderBy('created_at', 'asc')
    .get()
  
  return {
    success: true,
    data: result.data || [],
    message: '获取成功'
  }
}

// 创建分类
async function handleCreate(body, userNickname) {
  const { name } = body
  
  if (!name || name.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '分类名称不能为空',
      error: 'Category name is required'
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
  
  const newCategory = {
    name: name.trim(),
    sort_order: 0,
    created_by: userNickname,
    created_at: new Date(),
    urls: []
  }
  
  const result = await collection.add(newCategory)
  
  return {
    success: true,
    data: {
      _id: result.id,
      ...newCategory
    },
    message: '分类创建成功'
  }
}

// 更新分类
async function handleUpdate(body, query, userNickname) {
  const { name, sort_order } = body
  const categoryId = query.id
  
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
      message: '分类名称不能为空',
      error: 'Category name is required'
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
  
  const updateData = { 
    name: name.trim()
  }
  
  if (sort_order !== undefined) {
    updateData.sort_order = parseInt(sort_order) || 0
  }
  
  const result = await collection.doc(categoryId).update(updateData)
  
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
    data: null,
    message: '分类更新成功'
  }
}

// 删除分类
async function handleDelete(query, userNickname) {
  const categoryId = query.id
  
  if (!categoryId) {
    return {
      success: false,
      data: null,
      message: '分类ID不能为空',
      error: 'Category ID is required'
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
  
  const result = await collection.doc(categoryId).remove()
  
  if (result.deleted === 0) {
    return {
      success: false,
      data: null,
      message: '分类不存在',
      error: 'Category not found'
    }
  }
  
  return {
    success: true,
    data: null,
    message: '分类删除成功'
  }
}
