#!/usr/bin/env node

/**
 * 微信小程序自动化部署脚本
 * 使用 miniprogram-ci 实现一键上传
 */

const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// 项目配置
const PROJECT_PATH = path.resolve(__dirname);
const MINIPROGRAM_ROOT = path.join(PROJECT_PATH, 'miniprogram');
const PRIVATE_KEY_PATH = path.join(PROJECT_PATH, 'private.key');
const VERSION_FILE = path.join(PROJECT_PATH, 'deploy-version.json');

// 从 project.config.json 读取 appid
const projectConfig = require('./project.config.json');
const APPID = projectConfig.appid;

/**
 * 生成版本号
 * 格式：YYYYMMDD.HHMMSS
 */
function generateVersion() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}.${hours}${minutes}${seconds}`;
}

/**
 * 获取 Git 提交信息
 */
function getGitInfo() {
  try {
    const commitHash = execSync('git rev-parse --short HEAD', { 
      cwd: PROJECT_PATH, 
      encoding: 'utf8' 
    }).trim();
    const commitMsg = execSync('git log -1 --format=%s', { 
      cwd: PROJECT_PATH, 
      encoding: 'utf8' 
    }).trim();
    return { commitHash, commitMsg };
  } catch (e) {
    return { commitHash: 'unknown', commitMsg: 'No git repo' };
  }
}

/**
 * 保存版本信息
 */
function saveVersionInfo(version, gitInfo, uploadResult) {
  let versionHistory = [];
  
  if (fs.existsSync(VERSION_FILE)) {
    try {
      versionHistory = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
    } catch (e) {
      versionHistory = [];
    }
  }
  
  versionHistory.unshift({
    version,
    timestamp: new Date().toISOString(),
    gitInfo,
    uploadResult: {
      success: uploadResult.success,
      message: uploadResult.message
    }
  });
  
  // 保留最近 50 条记录
  if (versionHistory.length > 50) {
    versionHistory = versionHistory.slice(0, 50);
  }
  
  fs.writeFileSync(VERSION_FILE, JSON.stringify(versionHistory, null, 2));
}

/**
 * 主部署函数
 */
async function deploy(options = {}) {
  const {
    version = generateVersion(),
    desc = '自动部署',
    upload = true,
    preview = false
  } = options;

  console.log('🚀 开始部署微信小程序');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 版本号：${version}`);
  console.log(`🔑 AppID: ${APPID}`);
  console.log(`📁 项目路径：${PROJECT_PATH}`);
  console.log(`📂 小程序目录：${MINIPROGRAM_ROOT}`);
  
  // 检查私钥文件
  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    console.error('❌ 错误：未找到私钥文件');
    console.error(`   请将私钥文件放置在：${PRIVATE_KEY_PATH}`);
    console.error('');
    console.error('📋 获取私钥文件步骤：');
    console.error('   1. 登录微信公众平台：https://mp.weixin.qq.com');
    console.error('   2. 进入「版本管理」->「版本管理」');
    console.error('   3. 下载「代码上传密钥」');
    console.error('   4. 将下载的 .key 文件重命名为 private.key');
    console.error('   5. 放置到项目根目录：/home/admin/catPlan-Wechat/private.key');
    console.error('');
    return { success: false, message: '私钥文件缺失' };
  }

  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
  
  // 获取 Git 信息
  const gitInfo = getGitInfo();
  console.log(`📝 Git 提交：${gitInfo.commitHash} - ${gitInfo.commitMsg}`);
  
  try {
    const project = await ci.Project({
      projectPath: MINIPROGRAM_ROOT,
      privateKey,
      appid: APPID,
      ignores: ['node_modules/**/*', 'dist/**/*', '.git/**/*'],
    });

    let result;
    
    if (preview) {
      // 预览模式
      console.log('🔍 正在上传预览版...');
      result = await ci.preview({
        project,
        desc,
        setting: {
          es6: true,
          es7: true,
          minify: true,
          minifyWXML: true,
          minifyWXSS: true,
          autoPrefixWXSS: true,
        },
      });
      console.log('✅ 预览版上传成功');
      console.log(`   QR Code: ${result.qrCodeCycLink || '可通过微信开发者工具查看'}`);
    } else if (upload) {
      // 上传模式
      console.log('☁️ 正在上传代码...');
      result = await ci.upload({
        project,
        version,
        desc,
        setting: {
          es6: true,
          es7: true,
          minify: true,
          minifyWXML: true,
          minifyWXSS: true,
          autoPrefixWXSS: true,
        },
      });
      console.log('✅ 代码上传成功');
    }

    // 保存版本信息
    saveVersionInfo(version, gitInfo, { success: true, message: '上传成功' });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ 部署完成！');
    console.log(`📊 版本历史已保存到：${VERSION_FILE}`);
    
    return { 
      success: true, 
      message: '上传成功',
      version,
      result
    };
    
  } catch (error) {
    console.error('❌ 部署失败');
    console.error(`   错误信息：${error.message}`);
    
    // 保存失败记录
    saveVersionInfo(version, gitInfo, { 
      success: false, 
      message: error.message 
    });
    
    return { 
      success: false, 
      message: error.message 
    };
  }
}

// CLI 参数解析
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    version: generateVersion(),
    desc: '自动部署',
    upload: true,
    preview: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '-v' || arg === '--version') {
      options.version = args[++i];
    } else if (arg === '-d' || arg === '--desc') {
      options.desc = args[++i];
    } else if (arg === '-p' || arg === '--preview') {
      options.preview = true;
      options.upload = false;
    } else if (arg === '-h' || arg === '--help') {
      console.log(`
微信小程序自动化部署脚本

用法：node deploy.js [选项]

选项:
  -v, --version <version>  指定版本号 (默认：自动生成)
  -d, --desc <description> 上传说明 (默认：自动部署)
  -p, --preview            预览模式 (不正式上传，仅生成预览)
  -h, --help               显示帮助信息

示例:
  node deploy.js                           # 使用默认配置部署
  node deploy.js -v 1.0.0 -d "新版本发布"   # 指定版本号和说明
  node deploy.js --preview                 # 生成预览版

私钥文件配置:
  将 private.key 文件放置在项目根目录：
  /home/admin/catPlan-Wechat/private.key

  获取步骤:
  1. 登录 https://mp.weixin.qq.com
  2. 版本管理 -> 下载代码上传密钥
  3. 重命名为 private.key 并放到项目根目录
`);
      process.exit(0);
    }
  }
  
  return options;
}

// 主程序
if (require.main === module) {
  const options = parseArgs();
  deploy(options).then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { deploy, generateVersion };
