const sharp = require('sharp');
const fs = require('fs');

const inputPath = '/home/admin/.openclaw/workspace/stardew_farm_layout.svg';
const outputPath = '/home/admin/.openclaw/workspace/stardew_farm_layout.png';

sharp(inputPath)
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log('✅ SVG 转 PNG 成功！');
    console.log('输出文件:', outputPath);
    const stats = fs.statSync(outputPath);
    console.log('文件大小:', (stats.size / 1024).toFixed(2), 'KB');
  })
  .catch(err => {
    console.error('❌ 转换失败:', err.message);
    process.exit(1);
  });
