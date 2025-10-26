const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Task = require('../models/Task');
const Good = require('../models/Good');

// 连接数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB 连接成功');
  importData();
})
.catch(err => {
  console.error('❌ MongoDB 连接失败:', err);
  process.exit(1);
});

async function importData() {
  try {
    // 读取任务数据
    const tasksFile = path.join(__dirname, '../../data/tasks.json');
    const tasksData = fs.readFileSync(tasksFile, 'utf8');
    
    // 解析JSONC格式（每行一个JSON对象）
    const tasksLines = tasksData.trim().split('\n');
    const tasks = tasksLines.map(line => JSON.parse(line));
    
    console.log(`📋 读取到 ${tasks.length} 条任务数据`);
    
    // 清空现有任务数据
    await Task.deleteMany({});
    console.log('🗑️  清空现有任务数据');
    
    // 批量插入任务
    await Task.insertMany(tasks);
    console.log(`✅ 成功导入 ${tasks.length} 条任务数据`);
    
    // 读取商品数据
    const goodsFile = path.join(__dirname, '../../data/goods.json');
    const goodsData = fs.readFileSync(goodsFile, 'utf8');
    
    // 解析JSONC格式
    const goodsLines = goodsData.trim().split('\n');
    const goods = goodsLines.map(line => JSON.parse(line));
    
    console.log(`🎁 读取到 ${goods.length} 条商品数据`);
    
    // 清空现有商品数据
    await Good.deleteMany({});
    console.log('🗑️  清空现有商品数据');
    
    // 批量插入商品
    await Good.insertMany(goods);
    console.log(`✅ 成功导入 ${goods.length} 条商品数据`);
    
    console.log('\n🎉 数据导入完成！');
    
    // 统计信息
    const dailyTaskCount = await Task.countDocuments({ category: 'daily' });
    const growthTaskCount = await Task.countDocuments({ category: 'growth' });
    const goodCount = await Good.countDocuments();
    
    console.log('\n📊 数据统计:');
    console.log(`   每日任务: ${dailyTaskCount} 条`);
    console.log(`   成长任务: ${growthTaskCount} 条`);
    console.log(`   商品数量: ${goodCount} 个`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 数据导入失败:', error);
    process.exit(1);
  }
}
