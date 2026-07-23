# 配额修复 · 主题 · 三代经课

## 1. localStorage 配额错误（已修）

**原因**：历史/收藏把整张 PNG 的 `data:image/...` base64 写入 localStorage，很快超过约 5MB 配额。

**处理**：
- 启动时 `migrateStripHeavyPreviews()` 清掉旧预览字段
- 历史/收藏只存经文元数据
- 回看时重新 Canvas 生成，不依赖缩略图
- 写入使用 `safeSetJson`，配额满时自动瘦身

**若仍报错**（极少）：在浏览器控制台执行：

```js
localStorage.removeItem('jinju-ri:history:v1')
localStorage.removeItem('jinju-ri:collection:v1')
location.reload()
```

## 2. 没有 API Key

不需要。背景为本地大气渲染；设置里的 AI Prompt 只是预留。

## 3. 属灵主题 `/topics`

标签：平安、盼望、安慰、信心、仁爱、刚强、智慧、感恩、同在、救恩。

## 4. 三代经课 `/lectionary`

- 自动计算经课年 A/B/C（将临期起算）
- 本地精简读经表 + 季节回退
- 点选经文即可生成金句图
