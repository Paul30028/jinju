# Serein 双版本品牌手册

全球主品牌：**Serein**  
两套商店 / 安装包：

| | 中国区 | 国际区 |
|--|--------|--------|
| **代号** | `cn` | `intl` |
| **显示名** | Serein 静澄 | Serein |
| **短名 / 水印** | 静澄 | Serein |
| **applicationId** | `app.serein.cn` | `app.serein.day` |
| **默认语言** | 中文 | English |
| **图标** | `public/brand/favicon-cn.svg` | `public/brand/favicon-intl.svg` |
| **主色** | 玉石青绿 + 暖金 | 午夜青 + 薄荷 / 淡紫 |
| **副标题** | 每日一句 · 安静留白 | One quiet line a day |

## 品牌原则（两版共用）

- 主品牌 **Serein** 全球一致，不绑国别 / 宗教 / 民族符号
- 图标无文字、无人物、无旗帜、无宗教图形
- 现代、简洁、高级；小尺寸可识别
- 中国区用 **静澄** 作本地化中文名；国际区仅用拉丁 **Serein**

## 开发命令

```bash
# 中国区（默认）
npm run dev:cn          # 或 npm run dev
npm run build:cn
npm run build:android:cn
npm run android         # 构建 CN 并打开 Android Studio

# 国际区
npm run dev:intl
npm run build:intl
npm run build:android:intl
npm run android:intl
```

环境文件：

- `.env.cn` → `VITE_APP_REGION=cn`
- `.env.intl` → `VITE_APP_REGION=intl`
- `vite --mode cn|intl` 会自动加载对应 env

> 注意：`applicationId` 中国区 `app.serein.cn`、国际区 `app.serein.day`，可并存安装。  
> Android `namespace` 仍为 `app.jinju.day`（Java 包路径），仅改 `applicationId` 与显示名。

## 商店文案建议

### 中国区（应用宝 / 华为 / iOS 国区）

- **名称**：Serein 静澄  
- **副标题**：每日一句 · 安静成图  
- **关键词**：每日、句子、卡片、分享、安静、默想  

### 国际区（App Store / Google Play）

- **Name**：Serein  
- **Subtitle**：One quiet line a day  
- **Keywords**：daily, quiet, quote, card, calm, focus  

## 图标资产在哪里？

### 1）Grok 会话目录（高清 JPG 原图）

完整路径：

```
C:\Users\holyx\.grok\sessions\C%3A%5CUsers%5Cholyx%5C.grok%5Cbin\019f6465-756a-7411-b758-139423547cba\images\
```

| 文件 | 区域 | 内容 |
|------|------|------|
| **`3.jpg`** | **中国区 CN** | 抽象几何光球，**无人物** |
| **`4.jpg`** | **国际区 Intl** | 青绿+紫双圆叠光，**无人物** |

在资源管理器地址栏粘贴上述路径即可。

### 2）工程内（日常用这些）

| 文件 | 用途 |
|------|------|
| `public/brand/favicon-cn.svg` | 中国区 PWA / favicon |
| `public/brand/favicon-intl.svg` | 国际区 PWA / favicon |
| `public/brand/serein-icon-cn.jpg` | 从 `3.jpg` 复制后供商店/Android |
| `public/brand/serein-icon-intl.jpg` | 从 `4.jpg` 复制后供商店/Android |
| `public/brand/README.md` | 说明与复制命令 |

复制命令：双击 `scripts\copy-store-icons.cmd`，或见 `public/brand/README.md`。

Android 启动图标：Android Studio → Image Asset → 导入对应 SVG/JPG 生成 mipmap。

### 3）网络背景图策略

`background-catalog.json` v7+：**禁止可辨认人物正面肖像**（已替换含手/人像的书卷图）。  
加载时 `remote-background.ts` 会过滤 `portrait/face/person/hands…` 等标签。

## 实现位置

- 品牌配置：`src/core/brand/region.ts`
- 顶栏名称：`src/App.tsx` → `getBrand().displayName`
- 成图水印：`src/core/image/watermark.ts` → `shortName`
- 构建 / PWA：`vite.config.ts` 读 `VITE_APP_REGION`
- 壳同步：`scripts/apply-capacitor-region.mjs`
