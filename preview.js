#!/usr/bin/env node
const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');

const PROJECT_PATH = path.resolve(__dirname, 'miniprogram');
const PRIVATE_KEY_PATH = path.join(__dirname, 'private.key');
const projectConfig = require('./project.config.json');
const APPID = projectConfig.appid;

async function main() {
  console.log('📱 生成预览二维码...\n');
  
  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    console.error('❌ 错误：未找到私钥文件');
    process.exit(1);
  }
  
  try {
    const project = new ci.Project({
      appid: APPID,
      type: 'miniProgram',
      projectPath: PROJECT_PATH,
      privateKeyPath: PRIVATE_KEY_PATH,
      ignores: ['node_modules/**/*'],
    });
    
    const previewResult = await ci.preview({
      project,
      desc: '预览版本 ' + new Date().toLocaleString('zh-CN'),
      setting: {
        useProjectConfig: true,
      },
      qrcodeFormat: 'terminal',
      onProgressUpdate: console.log,
    });
    
    console.log('\n✅ 预览二维码生成成功！');
    console.log('📝 请使用微信扫描上方二维码体验\n');
    
  } catch (error) {
    console.error('\n❌ 生成预览失败！');
    console.error('   错误信息：' + error.message);
    process.exit(1);
  }
}

main();
