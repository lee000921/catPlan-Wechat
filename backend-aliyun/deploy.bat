@echo off
REM CatPlan 后端快速部署脚本 (Windows)

echo ================================
echo   CatPlan 后端快速部署脚本
echo ================================
echo.

REM 检查Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
node -v

REM 检查npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未检测到 npm
    pause
    exit /b 1
)

echo ✅ npm 已安装
npm -v
echo.

echo 📦 安装依赖...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装成功
echo.

REM 检查 .env 文件
if not exist .env (
    echo ⚠️  未找到 .env 文件，从 .env.example 复制...
    copy .env.example .env
    echo ✅ 已创建 .env 文件，请编辑配置后重新运行
    echo.
    echo 需要配置的项:
    echo   - MONGODB_URI (MongoDB连接地址^)
    echo   - JWT_SECRET (JWT密钥^)
    echo   - WECHAT_APPID (微信小程序AppID^)
    echo   - WECHAT_APPSECRET (微信小程序AppSecret^)
    pause
    exit /b 0
)

echo ✅ 找到 .env 配置文件
echo.

REM 创建日志目录
if not exist logs (
    mkdir logs
    echo ✅ 创建日志目录
)

REM 导入初始数据
echo 📋 导入初始数据...
node scripts\importData.js

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  数据导入失败，请检查 MongoDB 连接
    echo    继续部署...
)

echo.
echo ================================
echo   部署完成！
echo ================================
echo.
echo 启动方式:
echo   开发环境: npm run dev
echo   生产环境: npm start
echo   PM2启动:  npm run pm2:start
echo.
echo 健康检查: http://localhost:3000/health
echo.
pause
