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
      default:
        return {
          success: false,
          data: null,
          message: '不支持的请求方法',
          error: 'Method not allowed'
        }
    }
    
  } catch (error) {
    console.error('抽奖历史接口错误:', error)
    return {
      success: false,
      data: null,
      message: '服务器错误',
      error: error.message
    }
  }
}

// 获取抽奖历史
async function handleList(query) {
  const limit = parseInt(query.limit) || 50
  const wheelConfigId = query.wheel_config_id
  
  const db = cloud.database()
  const collection = db.collection('lottery_history')
  
  // 构建查询条件
  let queryBuilder = collection
  
  if (wheelConfigId) {
    queryBuilder = queryBuilder.where({
      wheel_config_id: wheelConfigId
    })
  }
  
  const result = await queryBuilder
    .orderBy('created_at', 'desc')
    .limit(limit)
    .get()
  
  return {
    success: true,
    data: result.data || [],
    message: '获取成功'
  }
}

// 创建抽奖记录
async function handleCreate(body, userNickname) {
  const { wheel_config_id, wheel_name, result } = body
  
  // 验证参数
  if (!wheel_config_id) {
    return {
      success: false,
      data: null,
      message: '轮盘配置ID不能为空',
      error: 'Wheel config ID is required'
    }
  }
  
  if (!result || result.trim().length === 0) {
    return {
      success: false,
      data: null,
      message: '抽奖结果不能为空',
      error: 'Lottery result is required'
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
  
  // 验证轮盘配置是否存在
  const wheelCollection = db.collection('wheel_configs')
  const wheelResult = await wheelCollection.doc(wheel_config_id).get()
  
  if (!wheelResult.data) {
    return {
      success: false,
      data: null,
      message: '轮盘配置不存在',
      error: 'Wheel config not found'
    }
  }
  
  // 创建抽奖记录
  const historyCollection = db.collection('lottery_history')
  const newRecord = {
    wheel_config_id: wheel_config_id,
    wheel_name: wheel_name || wheelResult.data.name,
    result: result.trim(),
    operated_by: userNickname,
    created_at: new Date()
  }
  
  const insertResult = await historyCollection.add(newRecord)
  
  return {
    success: true,
    data: {
      _id: insertResult.id,
      ...newRecord
    },
    message: '抽奖记录保存成功'
  }
}
