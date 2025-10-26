const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

router.use(authMiddleware);

/**
 * 获取任务列表
 * GET /api/tasks
 */
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ isActive: true }).sort({ category: 1, _id: 1 });

    // 分组
    const dailyTasks = tasks.filter(t => t.category === 'daily');
    const growthTasks = tasks.filter(t => t.category === 'growth');

    res.json(success({
      dailyTasks,
      growthTasks
    }, '获取任务列表成功'));

  } catch (err) {
    logger.error('获取任务列表失败:', err);
    res.json(error('获取任务列表失败'));
  }
});

/**
 * 获取单个任务详情
 * GET /api/tasks/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.json(error('任务不存在'));
    }

    res.json(success(task, '获取任务详情成功'));

  } catch (err) {
    logger.error('获取任务详情失败:', err);
    res.json(error('获取任务详情失败'));
  }
});

module.exports = router;
