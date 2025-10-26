const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

router.use(authMiddleware);

/**
 * 每日签到
 * POST /api/checkin
 */
router.post('/', async (req, res) => {
  try {
    const user = await User.findOne({ openId: req.user.openId });

    if (!user) {
      return res.json(error('用户不存在'));
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 检查今天是否已经签到
    if (user.lastCheckinDate) {
      const lastCheckin = new Date(user.lastCheckinDate);
      const lastCheckinDate = new Date(
        lastCheckin.getFullYear(),
        lastCheckin.getMonth(),
        lastCheckin.getDate()
      );

      if (lastCheckinDate.getTime() === today.getTime()) {
        return res.json(error('今日已签到'));
      }
    }

    // 签到奖励
    const basePoints = 5;
    user.points += basePoints;
    user.checkinDays += 1;
    user.lastCheckinDate = now;

    // 记录签到历史
    if (!user.checkinHistory) {
      user.checkinHistory = [];
    }
    user.checkinHistory.push({
      date: now,
      points: basePoints
    });

    // 只保留最近100条签到记录
    if (user.checkinHistory.length > 100) {
      user.checkinHistory = user.checkinHistory.slice(-100);
    }

    await user.save();

    logger.info(`用户 ${user.openId} 签到成功，获得 ${basePoints} 碎片`);

    res.json(success({
      checkinDays: user.checkinDays,
      points: user.points,
      basePoints,
      userInfo: user
    }, '签到成功'));

  } catch (err) {
    logger.error('签到失败:', err);
    res.json(error('签到失败'));
  }
});

module.exports = router;
