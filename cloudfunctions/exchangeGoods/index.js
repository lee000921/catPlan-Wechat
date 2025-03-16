// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const userCollection = db.collection('users')
const goodCollection = db.collection('goods')
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
  
  // 开启事务
  const transaction = await db.startTransaction()
  
  try {
    // 检查参数
    if (!event.goodId) {
      return {
        success: false,
        message: '商品ID不能为空'
      }
    }
    
    // 查询商品信息
    const goodResult = await transaction.collection('goods').doc(event.goodId).get()
    
    if (!goodResult.data) {
      await transaction.rollback()
      return {
        success: false,
        message: '商品不存在'
      }
    }
    
    const good = goodResult.data
    
    // 检查库存
    if (good.stock <= 0) {
      await transaction.rollback()
      return {
        success: false,
        message: '商品库存不足'
      }
    }
    
    // 查询用户信息
    const userResult = await transaction.collection('users').where({
      openId: openid
    }).get()
    
    if (userResult.data.length === 0) {
      await transaction.rollback()
      return {
        success: false,
        message: '用户不存在'
      }
    }
    
    const user = userResult.data[0]
    
    // 检查碎片是否足够
    if (user.points < good.points) {
      await transaction.rollback()
      return {
        success: false,
        message: '碎片不足'
      }
    }
    
    // 减少商品库存，增加销量
    await transaction.collection('goods').doc(event.goodId).update({
      data: {
        stock: _.inc(-1),
        sold: _.inc(1)
      }
    })
    
    // 扣除用户碎片
    await transaction.collection('users').doc(user._id).update({
      data: {
        points: _.inc(-good.points)
      }
    })
    
    // 创建兑换记录
    const now = new Date()
    const recordData = {
      openId: openid,
      userId: user._id,
      goodId: event.goodId,
      goodTitle: good.title,
      goodImage: good.image,
      points: good.points,
      exchangeTime: now
    }
    
    const recordResult = await transaction.collection('exchangeRecords').add({
      data: recordData
    })
    
    // 提交事务
    await transaction.commit()
    
    // 获取更新后的用户信息
    const updatedUser = await userCollection.doc(user._id).get()
    
    return {
      success: true,
      message: '兑换成功',
      data: {
        recordId: recordResult._id,
        userInfo: updatedUser.data
      }
    }
  } catch (error) {
    // 回滚事务
    await transaction.rollback()
    
    console.error('兑换失败', error)
    return {
      success: false,
      message: '兑换失败: ' + error.message,
      error
    }
  }
}