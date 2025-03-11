// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const goodCollection = db.collection('goods')
const _ = db.command

// 云函数入口函数
// 取出所有剩余量大于0的商品
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const res = await goodCollection.where({
    stock: _.gt(0)
  }).get()
  return {
    success: true,
    message: '获取商品列表成功',
    data: res.data
  }
}