// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const goodCollection = db.collection('goods')
const _ = db.command

// 云函数入口函数
// 兑换商品
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const res = await goodCollection.where({
    _id: event.goodId
  }).update({
    data: {
      remain: _.inc(-1)
    }
  })
  return {
    success: true,
    message: '兑换成功',
    data: res.data
  }
}