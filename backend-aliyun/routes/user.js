const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

// 所有路由都需要认证
router.use(authMiddleware);

/**
 * 获取用户信息
 * GET /api/user/info
 */
router.get('/info', async (req, res) => {
  try {
    const user = await User.findOne({ openId: req.user.openId });

    if (!user) {
      return res.json(error('用户不存在'));
    }

    const userData = user.toObject();
    delete userData.__v;

    res.json(success(userData, '获取用户信息成功'));
  } catch (err) {
    logger.error('获取用户信息失败:', err);
    res.json(error('获取用户信息失败'));
  }
});

/**
 * 更新用户信息
 * POST /api/user/update
 */
router.post('/update', async (req, res) => {
  try {
    const { taskId, point } = req.body;
    const user = await User.findOne({ openId: req.user.openId });

    if (!user) {
      return res.json(error('用户不存在'));
    }

    // 如果有任务ID，记录任务完成
    if (taskId) {
      user.tasks.push({
        taskId,
        finishTime: new Date(),
        points: point || 0
      });
    }

    // 如果有碎片奖励，增加碎片
    if (point) {
      user.points += point;
    }

    await user.save();

    res.json(success({
      points: user.points,
      tasks: user.tasks
    }, '更新成功'));

  } catch (err) {
    logger.error('更新用户信息失败:', err);
    res.json(error('更新失败'));
  }
});

module.exports = router;
