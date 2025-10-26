const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { code2Session } = require('../utils/wechat');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { code, userInfo } = req.body;

    if (!code) {
      return res.json(error('缺少code参数'));
    }

    // 通过code获取openid
    const wxData = await code2Session(code);
    const openId = wxData.openid;

    logger.info(`用户登录: ${openId}`);

    // 查找或创建用户
    let user = await User.findOne({ openId });
    const now = new Date();

    if (!user) {
      // 新用户，创建账号
      user = new User({
        openId,
        nickName: userInfo?.nickName || '小猫咪',
        avatarUrl: userInfo?.avatarUrl || '',
        gender: userInfo?.gender,
        country: userInfo?.country,
        province: userInfo?.province,
        city: userInfo?.city,
        language: userInfo?.language,
        points: 520, // 新用户奖励520碎片
        level: 1,
        checkinDays: 0,
        registerTime: now,
        lastLoginTime: now
      });

      await user.save();
      logger.info(`新用户注册: ${openId}, 奖励520碎片`);
    } else {
      // 老用户，更新登录时间和基本信息
      if (userInfo) {
        user.nickName = userInfo.nickName || user.nickName;
        user.avatarUrl = userInfo.avatarUrl || user.avatarUrl;
        user.gender = userInfo.gender ?? user.gender;
      }
      user.lastLoginTime = now;
      await user.save();
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        openId: user.openId,
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d' // 30天有效期
      }
    );

    // 返回用户信息和token
    const userData = user.toObject();
    delete userData.__v;

    res.json(success({
      token,
      userInfo: userData,
      isNewUser: !user.lastLoginTime || user.registerTime === user.lastLoginTime
    }, '登录成功'));

  } catch (err) {
    logger.error('登录失败:', err);
    res.json(error(err.message || '登录失败'));
  }
});

module.exports = router;
