# 图片源 · 防脱源策略

## 三级/四级回退

### A. 单张背景图加载

| 顺序 | 层级 | 默认实现 | 说明 |
|------|------|----------|------|
| 1 | **主源 primary** | Unsplash CDN (`item.url`) | 高质量摄影 |
| 2 | **备源1 backup1** | `images.weserv.nl` 代理主图 | 主 CDN 被墙/故障时 |
| 3 | **备源2 backup2** | `picsum.photos/seed/...` | 完全独立免费源 |
| 4 | **本地 local** | 程序多色渐变 | 无网也能出图 |

任一成功即停止；状态栏会显示「主源 / 备源1 / 备源2 / 本地」。

### B. 目录 JSON 加载

| 顺序 | 来源 |
|------|------|
| 1 | `VITE_BG_CATALOG_URL` |
| 2 | `VITE_BG_CATALOG_URL_BACKUP` |
| 3 | localStorage 缓存 |
| 4 | 打包内 `src/data/background-catalog.json` |

## 条目字段

```json
{
  "id": "dawn-sky-1",
  "themes": ["dawn"],
  "url": "https://images.unsplash.com/photo-xxx?...",
  "urlBackup": "https://可选-手写备源1",
  "urlBackup2": "https://可选-手写备源2",
  "credit": "Unsplash"
}
```

- 不写 `urlBackup`：自动生成 Weserv 代理  
- 不写 `urlBackup2`：自动生成 Picsum 种子图  

## 环境变量

```env
VITE_BG_CATALOG_URL=https://你的主CDN/background-catalog.json
VITE_BG_CATALOG_URL_BACKUP=https://你的备CDN/background-catalog.json
```

设置里点「刷新图库目录」可强制更新。

## 文字

始终本地 Canvas 叠加，不依赖图源是否成功。
