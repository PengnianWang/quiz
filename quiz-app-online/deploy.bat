@echo off
chcp 65001 >nul
title 刷题本一键部署工具
echo ============================================
echo    随身刷题本 - 一键部署到 Vercel
echo ============================================
echo.
echo  本工具将自动完成以下操作：
echo  1. 检查 Node.js 环境
echo  2. 安装 Vercel CLI
echo  3. 登录 Vercel
echo  4. 部署项目
echo.
pause

REM 检查 Node.js
echo.
echo [1/4] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js 未安装，正在为你下载...
    echo 请访问 https://nodejs.org 下载 LTS 版本安装
    echo 安装完成后重新运行此脚本
    start https://nodejs.org/dist/v20.15.1/node-v20.15.1-x64.msi
    pause
    exit /b 1
)
echo Node.js 已安装：
node --version

REM 安装 Vercel CLI
echo.
echo [2/4] 安装 Vercel CLI...
npm install -g vercel
if errorlevel 1 (
    echo 安装失败，请检查网络连接
    pause
    exit /b 1
)

REM 登录 Vercel
echo.
echo [3/4] 登录 Vercel...
echo 即将打开浏览器，请使用邮箱注册/登录 Vercel
echo 如果已有账号，直接登录即可
echo.
pause
vercel login

REM 部署
echo.
echo [4/4] 开始部署...
echo 请按提示操作，全部回车选默认即可
echo.
vercel --prod

echo.
echo ============================================
echo  部署完成！
echo  请访问上方显示的链接查看你的应用
echo ============================================
pause
