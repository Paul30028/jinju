# 金句日（Jinju Day）

每日自动生成一张安静、庄重、有属灵深度的圣经金句图片。Web PWA · Vite + React + TypeScript。

## 文档

| 文档 | 路径 |
|------|------|
| **阶段1 PRD（确认）** | [docs/PRD_V2_PHASE1.md](./docs/PRD_V2_PHASE1.md) |
| **阶段2 架构（待确认）** | [docs/ARCHITECTURE_V2_PHASE2.md](./docs/ARCHITECTURE_V2_PHASE2.md) |
| 早期 PRD / 架构 | [docs/PRD.md](./docs/PRD.md) · [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| 图像生成管道 | [docs/IMAGE_PIPELINE.md](./docs/IMAGE_PIPELINE.md) |
| 图片网关设计 | [docs/IMAGE_GATEWAY.md](./docs/IMAGE_GATEWAY.md) |

## 当前进度

- [x] **M0** PRD + 架构  
- [x] **M1** 项目脚手架  
- [x] **M2** VerseProvider + ImageGenerator + 每日选题  
- [x] **M3** 收藏 · 制作 · 历史回看 · 增强背景  
- [x] **M3.1** 修复 localStorage 配额 · 属灵主题 · 三代经课（无需 API）  
- [x] **M3.2** 圣灵九果主题 · 今日果子 · 果子经文扩充  
- [x] **M3.3** 每日自动成图（非 AI）· 主题/文字版式按日轮换  
- [x] **免费版 MVP** 6 版式 · 中英 ESV · 水印 · 分享 · 本地生成  
- [ ] 付费预留（去水印 / 高级版式）· 阶段 5  

## 本地运行（Web）

推荐使用 **npm**（Node 自带，无需再装 pnpm）：

```powershell
cd $HOME\jinju-ri
npm install
npm run dev
```

浏览器打开终端提示的地址（默认 http://localhost:5173 ）。

```powershell
npm run check   # TypeScript 严格检查
npm run build   # 生产构建
```

### 摄影图库（生产环境）

每日摄影背景以 Pixabay、Pexels、Unsplash 等图库为主。生产环境请配置
`VITE_IMAGE_GATEWAY_URL`，由图片网关统一完成供应商鉴权、内容筛选、版权元数据和
Canvas 导出校验；浏览器不会直接持有供应商密钥。网关不可用时，应用依次降级到兼容
图库、内置审核摄影图和本地 Canvas 渐变，因此网络故障不会阻断出图。

网关需要响应 `GET /v1/backgrounds?theme={theme}&page={page}&limit={limit}&orientation=portrait`，
并返回 `{ items: [{ id, imageUrl, provider, attribution, exportAllowed: true }] }`。

## Android 试玩（Capacitor）

需安装 [Android Studio](https://developer.android.com/studio)。

```powershell
cd C:\Users\holyx\jinju-ri
powershell -ExecutionPolicy Bypass -File .\scripts\setup-android.ps1
```

或手动：`npm install` → `npm run build` → `npx cap add android` → `npx cap sync android` → `npx cap open android`，再在 Android Studio 点 Run。

详见 [docs/ANDROID.md](./docs/ANDROID.md)。

## 文件夹结构

```
jinju-ri/
├── docs/                 # PRD、架构、图像管道
├── public/               # 静态资源
├── src/
│   ├── core/             # 与 UI 无关的领域核心（可测）
│   │   ├── verse/        # VerseProvider
│   │   ├── image/        # ImageComposer / Generator
│   │   ├── theme/        # ThemeEngine
│   │   ├── scheduler/    # 日级日期键
│   │   ├── storage/      # 本地存储
│   │   └── types.ts      # 领域模型
│   ├── pages/            # 路由页面
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 设计原则

- TypeScript `strict` + `noUncheckedIndexedAccess`
- 核心模块不依赖 React 组件
- 先可运行，再迭代 AI 背景与云端 Cron
