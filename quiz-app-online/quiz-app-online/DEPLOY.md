# 随身刷题本 - 部署指南

## 配置信息（已内置）
- Supabase URL: https://xxrzrnpkrnhjiqcrpi.supabase.co
- Supabase Key: 已内置
- DeepSeek API Key: 已内置

## 部署方式（二选一）

### 方式 A：双击运行脚本（推荐，最简单）
1. 确保电脑已安装 Node.js（https://nodejs.org 下载 LTS 版本）
2. 双击运行项目文件夹中的 `deploy.bat`
3. 按提示操作，全部回车选默认
4. 部署完成后会显示访问链接

### 方式 B：手动命令行部署
```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 进入项目目录
cd quiz-app-online

# 4. 部署
vercel --prod
```

## 部署后
- 访问链接（如 https://quiz-app-online.vercel.app）
- 手机访问时添加到主屏幕即可像 APP 一样使用

## 数据库状态
✅ Supabase 数据库已初始化（SQL 脚本已执行成功）
