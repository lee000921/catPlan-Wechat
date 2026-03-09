#!/usr/bin/env node
const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const PROJECT_PATH = path.resolve(__dirname, 'miniprogram');
const PRIVATE_KEY_PATH = path.join(__dirname, 'private.key');
const projectConfig = require('./project.config.json');
const APPID = projectConfig.appid;

function generateVersion() {
  const now = new Date();
  return now.toISOString().slice(0, 10).replace(/-/g, '') + '.' + now.toTimeString().slice(0, 8).replace(/:/g, '');
}

// 计算文件 hash
function getFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

// 清除缓存
function clearCache() {
  console.log('🧹 正在清除缓存...\n');
  const cacheDirs = [
    path.join(__dirname, 'miniprogram', '.wechat'),
    path.join(__dirname, '.wechat'),
    path.join(__dirname, 'miniprogram', '.cache'),
    path.join(__dirname, '.cache'),
  ];
  cacheDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
  console.log('✅ 缓存已清除\n');
}

async function main() {
  console.log('🚀 catPlan 小程序自动部署\n');
  
  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    console.error('❌ 错误：未找到私钥文件');
    process.exit(1);
  }
  
  // 清除缓存
  clearCache();
  
  // 验证关键文件
  console.log('📋 验证关键文件:\n');
  const keyFiles = [
    'pages/tasks/tasks.wxss',
    'pages/task-submit/task-submit.wxss',
  ];
  
  keyFiles.forEach(file => {
    const fullPath = path.join(PROJECT_PATH, file);
    if (fs.existsSync(fullPath)) {
      const hash = getFileHash(fullPath);
      const size = fs.statSync(fullPath).size;
      console.log(`  ✅ ${file}`);
      console.log(`     大小：${size} bytes`);
      console.log(`     MD5: ${hash}`);
    } else {
      console.log(`  ❌ ${file} - 不存在!`);
    }
  });
  
  const version = generateVersion();
  const desc = '自动部署 ' + new Date().toLocaleString('zh-CN');
  
  console.log('\n📦 版本号：' + version);
  console.log('📝 描述：' + desc);
  console.log('🔑 私钥：' + PRIVATE_KEY_PATH);
  console.log('📱 AppID: ' + APPID);
  console.log('📂 项目路径：' + PROJECT_PATH);
  console.log('\n⏳ 正在上传代码...\n');
  
  try {
    const project = new ci.Project({
      appid: APPID,
      type: 'miniProgram',
      projectPath: PROJECT_PATH,
      privateKeyPath: PRIVATE_KEY_PATH,
      ignores: ['node_modules/**/*'],
    });
    
    const uploadResult = await ci.upload({
      project,
      version,
      desc,
      setting: {
        useProjectConfig: true,
      },
      onProgressUpdate: console.log,
    });
    
    console.log('\n✅ 上传成功！\n');
    console.log('📱 下一步：登录微信公众平台 → 版本管理 → 开发版本\n');
    console.log('⚠️  重要：请在手机上删除旧版本小程序，重新扫码！\n');
    
  } catch (error) {
    console.error('\n❌ 部署失败！');
    console.error('   错误信息：' + error.message);
    process.exit(1);
  }
}

main();
