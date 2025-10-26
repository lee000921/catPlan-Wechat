const { get, post } = require('../utils/request-aliyun.js');
const API = require('../config/api-aliyun.js');

/**
 * 用户登录
 * @param {String} code 微信登录code
 * @param {Object} userInfo 用户信息
 */
function login(code, userInfo) {
  return post(API.LOGIN, { code, userInfo });
}

/**
 * 获取用户信息
 */
function getUserInfo() {
  return get(API.GET_USER_INFO);
}

/**
 * 更新用户信息
 * @param {Object} data 更新数据
 */
function updateUserInfo(data) {
  return post(API.UPDATE_USER_INFO, data);
}

/**
 * 每日签到
 */
function checkin() {
  return post(API.CHECKIN);
}

/**
 * 幸运抽奖
 */
function lottery() {
  return post(API.LOTTERY);
}

/**
 * 获取任务列表
 */
function getTasks() {
  return get(API.GET_TASKS);
}

/**
 * 获取商品列表
 */
function getGoods() {
  return get(API.GET_GOODS);
}

/**
 * 兑换商品
 * @param {String} goodId 商品ID
 * @param {Object} address 收货地址
 */
function exchangeGoods(goodId, address) {
  return post(API.EXCHANGE_GOODS, { goodId, address });
}

/**
 * 获取兑换记录
 * @param {Number} page 页码
 * @param {Number} limit 每页数量
 */
function getExchangeRecords(page = 1, limit = 10) {
  return get(API.GET_EXCHANGE_RECORDS, { page, limit });
}

module.exports = {
  login,
  getUserInfo,
  updateUserInfo,
  checkin,
  lottery,
  getTasks,
  getGoods,
  exchangeGoods,
  getExchangeRecords
};
