const axios = require('axios');
const logger = require('./logger');

/**
 * 通过code获取微信用户的openid和session_key
 */
async function code2Session(code) {
  try {
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WECHAT_APPID,
        secret: process.env.WECHAT_APPSECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const data = response.data;

    if (data.errcode) {
      logger.error('微信登录失败:', data);
      throw new Error(data.errmsg || '微信登录失败');
    }

    return {
      openid: data.openid,
      session_key: data.session_key,
      unionid: data.unionid
    };
  } catch (error) {
    logger.error('code2Session错误:', error);
    throw error;
  }
}

/**
 * 获取微信access_token
 */
async function getAccessToken() {
  try {
    const response = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: {
        grant_type: 'client_credential',
        appid: process.env.WECHAT_APPID,
        secret: process.env.WECHAT_APPSECRET
      }
    });

    const data = response.data;

    if (data.errcode) {
      throw new Error(data.errmsg || '获取access_token失败');
    }

    return data.access_token;
  } catch (error) {
    logger.error('getAccessToken错误:', error);
    throw error;
  }
}

module.exports = {
  code2Session,
  getAccessToken
};
