const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

router.use(authMiddleware);

/**
 * 幸运抽奖
 * POST /api/lottery
 */
router.post('/', async (req, res) => {
  try {
    const user = await User.findOne({ openId: req.user.openId });

    if (!user) {
      return res.json(error('用户不存在'));
    }

    // 检查今天是否已经抽奖
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 使用lastLotteryDate字段记录最后抽奖时间
    if (user.lastLotteryDate) {
      const lastLottery = new Date(user.lastLotteryDate);
      const lastLotteryDate = new Date(
        lastLottery.getFullYear(),
        lastLottery.getMonth(),
        lastLottery.getDate()
      );

      if (lastLotteryDate.getTime() === today.getTime()) {
        return res.json(error('今日已抽奖'));
      }
    }

    // 抽奖奖池：1, 2, 5, 10, 20, 50碎片
    const prizes = [1, 2, 5, 10, 20, 50];
    const weights = [30, 25, 20, 15, 7, 3]; // 权重
    
    // 加权随机
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    let prizePoints = prizes[0];

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        prizePoints = prizes[i];
        break;
      }
    }

    // 增加碎片
    user.points += prizePoints;
    user.lastLotteryDate = now;
    await user.save();

    logger.info(`用户 ${user.openId} 抽奖获得 ${prizePoints} 碎片`);

    res.json(success({
      points: prizePoints,
      totalPoints: user.points
    }, '抽奖成功'));

  } catch (err) {
    logger.error('抽奖失败:', err);
    res.json(error('抽奖失败'));
  }
});

module.exports = router;
