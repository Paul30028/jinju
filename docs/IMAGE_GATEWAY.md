# 图片网关设计（阶段 2）

> 目标：让 Pixabay、Pexels、Unsplash 成为摄影背景的主体验，同时把密钥、
> 内容筛选、版权元数据、速率控制和 Canvas 导出可靠性收敛到一个可审计的服务边界。

## 1. 设计边界

图片网关**不是**一个通用图片搜索产品，也不暴露供应商原始搜索能力。它只为
Serein/Jinju 的固定主题返回经过约束的竖版摄影背景：

- 主题必须来自受控枚举：`dawn`、`night`、`wilderness`、`mist`、
  `parchment`、`sanctuary`、`olive`、`river`；
- 排除人物、脸部、手、拥挤场景、明显文字、水印与不匹配的宗教意象；
- 每个结果都必须带供应商、作者/署名、源页面、许可快照与导出可用性；
- 只有已确认能以 CORS 方式读为 Blob、再写入 Canvas 的图片才可返回给出图流程。

服务端保存 API 密钥；浏览器只取得标准化素材对象，不直接查询供应商 API。

## 2. 客户端 API

### `GET /v1/backgrounds`

参数：

| 参数 | 必填 | 说明 |
|---|---:|---|
| `theme` | 是 | 受控主题 ID |
| `page` | 否 | 从 0 开始的候选页；用于“换一张” |
| `limit` | 否 | 1–30，默认 18 |
| `orientation` | 否 | 当前固定为 `portrait` |

成功响应：

```json
{
  "version": "2026-07-29",
  "items": [
    {
      "id": "unsplash:abc123",
      "imageUrl": "https://images.example-cdn.com/...",
      "provider": "unsplash",
      "attribution": "Photo by Jane Doe on Unsplash",
      "sourceUrl": "https://unsplash.com/photos/abc123",
      "license": "provider-license-snapshot-id",
      "exportAllowed": true,
      "expiresAt": "2026-07-30T00:00:00Z"
    }
  ],
  "nextPage": 1
}
```

- `imageUrl` 必须是可被 WebView/浏览器用 CORS 拉取的 URL。
- 空结果返回 `200 + { items: [] }`；客户端继续下一个供应商或内置摄影目录。
- 网关故障返回 `503`，并附 `Retry-After`；客户端立即走现有兼容降级，不等待重试。

### `POST /v1/backgrounds/selection`

在用户把候选图实际用于出图时调用：

```json
{ "assetId": "unsplash:abc123", "date": "2026-07-29", "theme": "dawn" }
```

用途：

- 记录每日已选 `assetId`，让“今日”稳定可复现；
- 触发供应商要求的下载/使用追踪；
- 只采集匿名安装 ID 哈希和素材 ID，不采集经文内容或分享文本。

## 3. 供应商适配层

网关内部只暴露统一的 `BackgroundAsset`，每家图库由独立 adapter 负责搜索、
许可校验、署名和使用追踪。

| 供应商 | 交付策略 | 缓存与合规要求 |
|---|---|---|
| Unsplash | 保留 API 返回的 hotlink URL；不把原图当作自有素材重新分发 | 选用时调用其 download tracking URL，并显示作者与 Unsplash 归属 |
| Pexels | 返回供应商允许的图片 URL 与作者 | 查询结果缓存 24 小时，保留作者归属 |
| Pixabay | 按其使用规则下载到受控短期缓存/CDN 后交付，避免永久 hotlink | 搜索结果至少缓存 24 小时，并保留来源说明 |

Unsplash 的 hotlink、下载追踪、署名与密钥保密要求见其
[官方 API 指南](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines)。
Pexels 建议缓存 API 结果 24 小时，并公布了默认配额要求，见
[官方速率限制说明](https://help.pexels.com/hc/en-us/articles/900006470063-What-steps-can-I-take-to-avoid-hitting-the-rate-limit)。
Pixabay 要求缓存请求，且对永久 hotlink 有明确限制，见
[官方 API 文档](https://pixabay.com/api/docs/)。

> 上线前仍需逐家复核最新条款。adapter 不应假设不同图库的图片代理、
> 长期缓存或商业使用规则相同。

## 4. 选图和降级

```text
主题请求
  → 网关缓存命中（主题 + 页码）
  → 按供应商健康度并发取候选
  → 许可/导出/CORS/内容规则过滤
  → 去重并按主题相关性排序
  → 返回 18 张候选
  → 选中后记录 dailyAssetId 与供应商使用事件

网关超时/无候选
  → 客户端兼容提供方
  → 内置审核摄影目录
  → Canvas 渐变/纹理
```

每个主题保留一组人工审核的检索词、负面词和黑名单；不接受用户自由文本搜索。
供应商结果还需经过：

1. 元数据规则过滤（people、portrait、hand、crowd、text 等）；
2. URL/素材 ID 黑名单；
3. 图像审核服务或人工抽检；
4. 同一主题与跨供应商 URL 哈希去重；
5. 竖版优先、可裁切安全区和最低分辨率检查。

## 5. 缓存、频控和可观测性

- **搜索缓存**：`provider + normalizedQuery + page + orientation`，TTL 24 小时；
- **素材元数据**：保存许可快照和首次/最后校验时间；
- **图片缓存**：由供应商策略决定，网关响应必须写明过期时间；
- **频控**：按匿名安装 ID、IP 和供应商三层限速；出现 429/5xx 时对该 adapter
  熔断 5 分钟；
- **指标**：供应商命中率、候选淘汰原因、Canvas 导出失败率、网关 p95、429 数量、
  内置摄影图/渐变降级比例；
- **告警**：某供应商连续失败、导出失败率升高、无可用候选或许可校验失败。

日志中不得保存 API key、完整 IP、用户自定义经文或分享文案。

## 6. 数据模型

```ts
interface BackgroundAsset {
  id: string;                 // provider:providerImageId
  provider: "unsplash" | "pexels" | "pixabay";
  providerImageId: string;
  themeIds: string[];
  imageUrl: string;
  sourceUrl: string;
  attribution: string;
  licenseSnapshotId: string;
  exportAllowed: boolean;
  delivery: "hotlink" | "managed-cache";
  width: number;
  height: number;
  expiresAt?: string;
  reviewedAt: string;
  blockedAt?: string;
}

interface DailyBackgroundSelection {
  date: string;
  themeId: string;
  assetId: string;
  catalogVersion: string;
  selectedAt: string;
}
```

## 7. 实施顺序

1. 建立网关项目与三家 adapter；先只开放固定主题和只读接口。
2. 接入 24 小时缓存、限速、许可/署名字段与使用追踪。
3. 将客户端的 `dailyAssetId` 从 sessionStorage 迁移到 IndexedDB，保证当日稳定。
4. 加入审核队列、素材黑名单和运营后台。
5. 再评估账号同步、主题包和付费素材目录。

## 8. 验收标准

- 网关配置后，90% 以上正常网络请求在 1.5 秒内返回候选；
- 所有返回素材均带可展示署名和可追溯源页面；
- 图片 CORS 失败时，同主题切换候选后仍能成功导出，最终才降级渐变；
- 无 API key 出现在 Web 构建产物；
- 每日首次生成和历史回看指向同一 `assetId`；
- 任一图库 429/不可用不阻断 APK 或 Web 出图。
