const express = require('express');
const router = express.Router();
const Good = require('../models/Good');
const authMiddleware = require('../middleware/auth');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

router.use(authMiddleware);

/**
 * 获取商品列表
 * GET /api/goods
 */
router.get('/', async (req, res) => {
  try {
    const goods = await Good.find({ isActive: true, stock: { $gt: 0 } })
      .sort({ points: 1 });

    res.json(success(goods, '获取商品列表成功'));

  } catch (err) {
    logger.error('获取商品列表失败:', err);
    res.json(error('获取商品列表失败'));
  }
});

/**
 * 获取单个商品详情
 * GET /api/goods/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const good = await Good.findById(req.params.id);

    if (!good) {
      return res.json(error('商品不存在'));
    }

    res.json(success(good, '获取商品详情成功'));

  } catch (err) {
    logger.error('获取商品详情失败:', err);
    res.json(error('获取商品详情失败'));
  }
});

module.exports = router;
