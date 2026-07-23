# 每日金句图片自动生成系统

## 1. 完整工作流

```
[1] 选题 VerseSelector
      date + translation + poolVersion
        → Verse { text, reference, translation }
        ↓
[2] 解析主题 ThemeEngine.resolve(themeId)
        → colors, fonts, backgroundStyle, overlay
        ↓
[3] 背景 BackgroundProvider
      MVP: gradient / 本地纹理
      生产: AI prompt 参数化 → 图 URL / base64
        → BackgroundLayer
        ↓
[4] 选版式 LayoutTemplate
      center | top-bottom | left-right | vertical-rl
        ↓
[5] ImageComposer (Canvas)
      画背景 → 可选 scrim → 排版经文 → 元信息
        → 对比度/安全区检查（基础）
        ↓
[6] 导出
      PNG Blob → 展示 / 下载 / 分享 / IndexedDB
```

### 输出尺寸

| 名称 | 尺寸 | 用途 |
|------|------|------|
| story | 1080×1920 | 手机故事/壁纸 |
| square | 1080×1080 | 朋友圈/Instagram |
| landscape | 1920×1080 | 桌面/横屏（可选） |

---

## 2. AI 背景 Prompt 模板（参数化）

### 2.1 主模板

```
A serene spiritual abstract landscape background for a quiet meditation card,
style: {style}, mood: {mood}, season: {season}, time of day: {timeOfDay},
palette: muted {palette}, soft natural light, gentle atmospheric depth,
classical oil painting texture mixed with modern minimal composition,
ample negative space in the {textSafeZone} for overlaying Chinese typography,
no people, no faces, no hands, no portraits,
no crosses, no churches, no religious icons, no halos, no angels,
no text, no letters, no logos, no watermark, no brand,
no commercial advertising look, no glossy stock-photo feel,
high detail, calm, reverent, contemplative, 8k quality
```

### 2.2 参数枚举建议

| 参数 | 示例值 |
|------|--------|
| style | soft watercolor, classical oil, abstract light rays, misty minimal |
| mood | peace, hope, comfort, awe, stillness |
| season | spring blossom haze, dry summer light, autumn mist, winter quiet snow |
| timeOfDay | dawn, morning, golden hour, dusk, deep night star glow |
| palette | sand and sage, mist blue and ivory, warm parchment, deep teal dusk |
| textSafeZone | center, lower third, left half, right half |

### 2.3 负面提示（Negative）

```
people, human face, portrait, hands, fingers, crowd,
cross, crucifix, church building, rosary, angel, halo,
text, letters, Chinese characters, English words, logo, watermark,
neon, cyberpunk, cartoon, anime, meme, sticker,
busy pattern, clutter, low contrast noise, blur, distortion,
product shot, advertisement, coupon, sale banner
```

### 2.4 主题示例映射

| 主题 | style | mood | palette |
|------|-------|------|---------|
| 黎明 | soft watercolor | hope | sand and sage |
| 静夜 | abstract light rays | stillness | mist blue and ivory |
| 旷野 | classical oil | awe | warm parchment |

---

## 3. 文字叠加规则（永远清晰）

1. **先遮罩后写字**：`scrim` 半透明层（黑 20–40% 或白 15–30%）  
2. **双描边策略**：浅色字 + 深色 shadow；或深色字 + 浅色 soft glow  
3. **动态字号**：按字数在 `verseFontSizeRange` 内二分搜索最大字号  
4. **安全边距**：≥ 6% 画布宽  
5. **行距**：1.45–1.65  
6. **元信息**：底部 2–3% 高度，字号约正文 28–35%，opacity 0.75  
7. **禁止**用 AI 直接「写出」经文（不可控）——经文只走 Canvas/Pillow  

### 元信息格式

```
约翰福音 3:16  ·  和合本  ·  2026-07-15
```

---

## 4. 代码示例

### 4.1 前端 Canvas（核心思路）

见实现：`src/core/image/composer.ts`

要点：

- `devicePixelRatio` 导出时用 1（按目标像素离屏 Canvas）  
- `ctx.font` 使用已加载的 WebFont  
- `wrapText` 按中文逐字测量  

### 4.2 后端 Sharp + SVG 文字（可选后期）

适合 Edge 预渲染；中文需嵌入字体文件。

### 4.3 Python Pillow（可选工具脚本）

适合批处理；需注册思源字体路径。

---

## 5. 质量门禁 Checklist

- [ ] 在亮/暗背景下抽检可读  
- [ ] 长经文（40+ 字）不溢出  
- [ ] 短经文不显空旷失控（字号上限）  
- [ ] 元信息不与正文重叠  
- [ ] 无随机裁切经文  
- [ ] 导出体积合理（PNG < 3MB 目标）  
