#!/usr/bin/env node
const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');

const PROJECT_PATH = path.resolve(__dirname, 'miniprogram');  // 修复：指向 miniprogram 目录
const PRIVATE_KEY_PATH = path.join(__dirname, 'private.key');
const projectConfig = require('./project.config.json');
const APPID = projectConfig.appid;

function generateVersion() {
  const now = new Date();
  return now.toISOString().slice(0, 10).replace(/-/g, '') + '.' + now.toTimeString().slice(0, 8).replace(/:/g, '');
}

async function main() {
  console.log('🚀 catPlan 小程序自动部署\n');
  
  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    console.error('❌ 错误：未找到私钥文件');
    process.exit(1);
  }
  
  const version = generateVersion();
  const desc = '自动部署 ' + new Date().toLocaleString('zh-CN');
  
  console.log('📦 版本号：' + version);
  console.log('📝 描述：' + desc);
  console.log('🔑 私钥：' + PRIVATE_KEY_PATH);
  console.log('📱 AppID: ' + APPID);
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
    
  } catch (error) {
    console.error('\n❌ 部署失败！');
    console.error('   错误信息：' + error.message);
    process.exit(1);
  }
}

main();
