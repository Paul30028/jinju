# 项目初始化与目录说明

## 初始化命令

```bash
# 进入项目（已创建于用户目录）
cd %USERPROFILE%\jinju-ri
# macOS/Linux: cd ~/jinju-ri

# 安装依赖（推荐 npm，无需 pnpm）
npm install

# 开发
npm run dev

# 类型检查
npm run check

# 生产构建
npm run build
npm run preview
```


## 完整目录树（M1）

```
jinju-ri/
├── docs/
│   ├── PRD.md                 # 产品需求
│   ├── ARCHITECTURE.md        # 技术架构
│   ├── IMAGE_PIPELINE.md      # 图像生成管道
│   └── FOLDER_STRUCTURE.md    # 本文件
├── public/
│   └── favicon.svg
├── src/
│   ├── core/                  # 领域核心（无 React）
│   │   ├── types.ts           # 数据模型
│   │   ├── verse/             # VerseProvider
│   │   ├── image/             # ImageGenerator / Composer
│   │   ├── theme/             # ThemeEngine
│   │   ├── scheduler/         # 日期键 / 日更
│   │   └── storage/           # LocalStore
│   ├── pages/
│   │   ├── TodayPage.tsx
│   │   ├── HistoryPage.tsx
│   │   └── SettingsPage.tsx
│   ├── styles/
│   │   └── global.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 后期将增加（不破坏现有边界）

```
src/core/verse/providers/bible-api-cuv.ts
src/core/verse/providers/local-fallback.ts
src/core/verse/selector.ts
src/core/image/composer.ts
src/core/image/generator.ts
src/core/image/background.ts
src/core/theme/registry.ts
src/core/storage/preferences.ts
src/core/storage/history.ts
src/data/verses-cuv-seed.json
supabase/functions/generate-daily/
```
