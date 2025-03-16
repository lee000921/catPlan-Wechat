// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const exchangeRecordCollection = db.collection('exchangeRecords')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  if (!openid) {
    return {
      success: false,
      message: '获取用户openid失败'
    }
  }
  
  try {
    // 查询用户的兑换记录
    const recordsResult = await exchangeRecordCollection
      .where({
        openId: openid
      })
      .orderBy('exchangeTime', 'desc')
      .get()
    
    return {
      success: true,
      message: '获取兑换记录成功',
      data: recordsResult.data
    }
  } catch (error) {
    console.error('获取兑换记录失败', error)
    return {
      success: false,
      message: '获取兑换记录失败: ' + error.message,
      error
    }
  }
}