import cloud from '@lafjs/cloud'

export default async function (ctx) {
  const { method, body, headers, query } = ctx
  
  try {
    const userNickname = headers['x-user-nickname'] ? decodeURIComponent(headers['x-user-nickname']) : null
    
    switch (method) {
      case 'GET':
        return await handleList(query)
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
    console.error('公告接口错误:', error)
    return {
      success: false,
      data: null,
      message: '服务器错误',
      error: error.message
    }
  }
}

// 获取公告列表
async function handleList(query) {
  const limit = parseInt(query.limit) || 50
  
  const db = cloud.database()
  const collection = db.collection('announcements')
  
  const result = await collection
    .orderBy('created_at', 'desc')
    .limit(limit)
    .get()
  
  return {
    success: true,
    data: result.data || [],
    message: '获取成功'
  }
}

// 创建公告
async function handleCreate(body, userNickname) {
  const { title, content } = body
  
  // 验证参数
  if (!title || title.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '公告标题不能为空',
      error: 'Title is required'
    }
  }
  
  if (!content || content.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '公告内容不能为空',
      error: 'Content is required'
    }
  }
  
  if (title.trim().length > 100) {
    return {
      success: false,
      data: null,
      message: '标题不能超过100个字符',
      error: 'Title too long'
    }
  }
  
  if (content.trim().length > 1000) {
    return {
      success: false,
      data: null,
      message: '内容不能超过1000个字符',
      error: 'Content too long'
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
  const collection = db.collection('announcements')
  
  const now = new Date()
  const newAnnouncement = {
    title: title.trim(),
    content: content.trim(),
    created_by: userNickname,
    created_at: now,
    updated_at: now
  }
  
  const result = await collection.add(newAnnouncement)
  
  return {
    success: true,
    data: {
      _id: result.id,
      ...newAnnouncement
    },
    message: '公告发布成功'
  }
}

// 更新公告
async function handleUpdate(body, query, userNickname) {
  const { title, content } = body
  const announcementId = query.id
  
  // 验证参数
  if (!announcementId) {
    return {
      success: false,
      data: null,
      message: '公告ID不能为空',
      error: 'Announcement ID is required'
    }
  }
  
  if (!title || title.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '公告标题不能为空',
      error: 'Title is required'
    }
  }
  
  if (!content || content.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '公告内容不能为空',
      error: 'Content is required'
    }
  }
  
  if (title.trim().length > 100) {
    return {
      success: false,
      data: null,
      message: '标题不能超过100个字符',
      error: 'Title too long'
    }
  }
  
  if (content.trim().length > 1000) {
    return {
      success: false,
      data: null,
      message: '内容不能超过1000个字符',
      error: 'Content too long'
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
  const collection = db.collection('announcements')
  
  const result = await collection.doc(announcementId).update({
    title: title.trim(),
    content: content.trim(),
    updated_at: new Date()
  })
  
  if (result.updated === 0) {
    return {
      success: false,
      data: null,
      message: '公告不存在',
      error: 'Announcement not found'
    }
  }
  
  return {
    success: true,
    data: null,
    message: '公告更新成功'
  }
}

// 删除公告
async function handleDelete(query, userNickname) {
  const announcementId = query.id
  
  // 验证参数
  if (!announcementId) {
    return {
      success: false,
      data: null,
      message: '公告ID不能为空',
      error: 'Announcement ID is required'
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
  const collection = db.collection('announcements')
  
  const result = await collection.doc(announcementId).remove()
  
  if (result.deleted === 0) {
    return {
      success: false,
      data: null,
      message: '公告不存在',
      error: 'Announcement not found'
    }
  }
  
  return {
    success: true,
    data: null,
    message: '公告删除成功'
  }
}
