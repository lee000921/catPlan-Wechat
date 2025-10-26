const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Good = require('../models/Good');
const ExchangeRecord = require('../models/ExchangeRecord');
const authMiddleware = require('../middleware/auth');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

router.use(authMiddleware);

/**
 * 兑换商品
 * POST /api/exchange
 */
router.post('/', async (req, res) => {
  try {
    const { goodId, address } = req.body;

    if (!goodId) {
      return res.json(error('缺少商品ID'));
    }

    // 查询用户和商品
    const user = await User.findOne({ openId: req.user.openId });
    const good = await Good.findById(goodId);

    if (!user) {
      return res.json(error('用户不存在'));
    }

    if (!good) {
      return res.json(error('商品不存在'));
    }

    if (!good.isActive) {
      return res.json(error('商品已下架'));
    }

    if (good.stock <= 0) {
      return res.json(error('商品库存不足'));
    }

    if (user.points < good.points) {
      return res.json(error('碎片不足'));
    }

    // 检查兑换次数限制
    if (good.exchangeLimit > 0) {
      const exchangeCount = await ExchangeRecord.countDocuments({
        openId: user.openId,
        goodId: goodId
      });

      if (exchangeCount >= good.exchangeLimit) {
        return res.json(error(`该商品每人限兑 ${good.exchangeLimit} 次`));
      }
    }

    // 扣除碎片
    user.points -= good.points;

    // 减少库存，增加销量
    good.stock -= 1;
    good.sold += 1;

    // 创建兑换记录
    const record = new ExchangeRecord({
      userId: user._id,
      openId: user.openId,
      goodId: good._id,
      goodTitle: good.title,
      goodImage: good.image,
      points: good.points,
      status: 'pending',
      address: address || {}
    });

    await record.save();

    // 添加到用户的兑换记录
    user.exchanges.push(record._id);

    await user.save();
    await good.save();

    logger.info(`用户 ${user.openId} 兑换商品 ${good.title}，消耗 ${good.points} 碎片`);

    res.json(success({
      record,
      userInfo: user
    }, '兑换成功'));

  } catch (err) {
    logger.error('兑换失败:', err);
    res.json(error('兑换失败'));
  }
});

/**
 * 获取兑换记录
 * GET /api/exchange/records
 */
router.get('/records', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const records = await ExchangeRecord.find({ openId: req.user.openId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ExchangeRecord.countDocuments({ openId: req.user.openId });

    res.json(success({
      records,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }, '获取兑换记录成功'));

  } catch (err) {
    logger.error('获取兑换记录失败:', err);
    res.json(error('获取兑换记录失败'));
  }
});

/**
 * 获取单个兑换记录详情
 * GET /api/exchange/records/:id
 */
router.get('/records/:id', async (req, res) => {
  try {
    const record = await ExchangeRecord.findOne({
      _id: req.params.id,
      openId: req.user.openId
    });

    if (!record) {
      return res.json(error('兑换记录不存在'));
    }

    res.json(success(record, '获取兑换记录详情成功'));

  } catch (err) {
    logger.error('获取兑换记录详情失败:', err);
    res.json(error('获取兑换记录详情失败'));
  }
});

/**
 * 更新兑换记录地址
 * PUT /api/exchange/records/:id/address
 */
router.put('/records/:id/address', async (req, res) => {
  try {
    const { address } = req.body;

    const record = await ExchangeRecord.findOne({
      _id: req.params.id,
      openId: req.user.openId
    });

    if (!record) {
      return res.json(error('兑换记录不存在'));
    }

    if (record.status !== 'pending') {
      return res.json(error('该订单已处理，无法修改地址'));
    }

    record.address = address;
    await record.save();

    res.json(success(record, '地址更新成功'));

  } catch (err) {
    logger.error('更新地址失败:', err);
    res.json(error('更新地址失败'));
  }
});

module.exports = router;
