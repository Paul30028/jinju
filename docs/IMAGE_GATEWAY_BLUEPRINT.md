# 图片网关编码蓝图（阶段 3）

本文把 [图片网关设计](./IMAGE_GATEWAY.md) 细化为可直接实现的服务边界。
原则是：**业务核心与部署平台解耦，供应商逻辑与 HTTP 路由解耦**。

## 1. 推荐目录

在仓库根目录新增独立服务，不把供应商密钥或网关逻辑混入 Vite 前端：

```text
services/image-gateway/
  src/
    http/
      app.ts                 # 路由、CORS、错误映射
      backgrounds-route.ts
      selection-route.ts
    domain/
      background-asset.ts
      theme.ts
      selection.ts
    providers/
      provider.ts            # 统一 Provider 接口
      unsplash.ts
      pexels.ts
      pixabay.ts
      mock-provider.ts
    policy/
      theme-queries.ts
      content-filter.ts
      attribution.ts
      delivery-policy.ts
    services/
      background-service.ts
      selection-service.ts
      provider-health.ts
    storage/
      cache-store.ts
      asset-repository.ts
      selection-repository.ts
      object-store.ts
    observability/
      metrics.ts
      logger.ts
    index.ts
  test/
  package.json
  README.md
```

前端继续只依赖 `src/core/image/image-gateway.ts`，不引入服务端 SDK。

## 2. 可替换基础设施接口

服务层不直接依赖 Redis、KV、Postgres 或某个云平台：

```ts
interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
}

interface AssetRepository {
  get(id: string): Promise<BackgroundAsset | null>;
  upsert(asset: BackgroundAsset): Promise<void>;
  block(id: string, reason: string): Promise<void>;
}

interface SelectionRepository {
  get(input: { date: string; themeId: string; installationId: string }): Promise<DailySelection | null>;
  create(selection: DailySelection): Promise<void>;
}

interface ObjectStore {
  put(key: string, body: Blob, metadata: AssetMetadata, ttlSeconds: number): Promise<string>;
}
```

首版可选择任意一个具备 KV、数据库和对象存储的 serverless 平台；更换部署平台时只替换
`storage/` 的实现。

## 3. 供应商统一接口

```ts
type ProviderId = "unsplash" | "pexels" | "pixabay";

interface ProviderSearchInput {
  themeId: ThemeId;
  query: string;
  page: number;
  limit: number;
  orientation: "portrait";
}

interface ProviderCandidate {
  provider: ProviderId;
  providerImageId: string;
  imageUrl: string;
  sourceUrl: string;
  authorName?: string;
  authorUrl?: string;
  width?: number;
  height?: number;
  tags: string[];
  downloadTrackingUrl?: string;
  delivery: "hotlink" | "managed-cache";
}

interface BackgroundProvider {
  readonly id: ProviderId;
  search(input: ProviderSearchInput): Promise<ProviderCandidate[]>;
  recordSelection?(candidate: ProviderCandidate): Promise<void>;
}
```

adapter 不返回前端 DTO。它只返回供应商原始候选，后续必须经过内容策略、许可策略、
去重和素材持久化，才会成为可交付的 `BackgroundAsset`。

## 4. 请求处理时序

```text
GET /v1/backgrounds
  → 验证 theme/page/limit
  → 读取主题检索策略与搜索缓存
  → 缓存未命中：并发调用健康 provider
  → 标准化、去重、元数据过滤
  → 写入候选缓存和素材库
  → 生成可交付 imageUrl + attribution
  → 返回候选列表

POST /v1/backgrounds/selection
  → 校验 assetId 与 theme
  → 读取或创建当日 daily selection
  → 调用供应商使用追踪（如适用）
  → 写入匿名、最小化的事件指标
  → 返回固定 assetId
```

同一 `installationId + date + themeId` 已有选择时，服务必须返回已有素材，而不是重新抽取。
客户端离线时保存本地选择；联网后再调用 selection 接口对齐。

## 5. 数据表

| 表 | 主键 | 关键字段 |
|---|---|---|
| `background_assets` | `id` | provider、providerImageId、sourceUrl、delivery、attribution、licenseSnapshotId、审核状态、过期时间 |
| `daily_background_selections` | `installationId + date + themeId` | assetId、catalogVersion、selectedAt |
| `provider_health` | `provider` | 连续失败数、熔断到期、最近 429、最近成功时间 |
| `blocked_assets` | `provider + providerImageId` | 原因、证据 URL、创建者、创建时间 |
| `license_snapshots` | `id` | provider、条款 URL、抓取时间、许可文本摘要 |
| `audit_events` | `id` | 类型、assetId、匿名安装哈希、最小化元数据 |

`installationId` 必须是前端生成的随机 UUID 经单向加盐哈希后的值，绝不保存设备 ID、手机号、
经文正文或分享文案。

## 6. 策略状态机

```text
provider candidate
  → normalized
  → rejected (缺少作者/URL/尺寸/许可)
  → filtered (命中人物、文字、黑名单或主题不符)
  → pending_review
  → approved
  → delivered
  → blocked (投诉、条款变化、人工下架)
```

首版可采用“自动通过 + 抽样复核”；`sanctuary`、`parchment` 等较容易偏题的主题应优先
进入人工审核候选池。

## 7. 缓存与熔断

| 层 | Key | TTL / 策略 |
|---|---|---|
| 供应商搜索 | `search:{provider}:{queryHash}:{page}` | 24 小时 |
| 正常化候选 | `theme:{theme}:{page}` | 15 分钟 |
| 每日选择 | 数据库记录 | 至少保留 90 天 |
| provider 熔断 | `health:{provider}` | 429/5xx 连续阈值后 5 分钟 |
| 托管图片 | `asset/{provider}/{id}` | 严格按供应商交付策略和许可决定 |

不要把供应商搜索失败缓存为长期空结果；空结果最多缓存 60 秒，便于供应商恢复后重试。

## 8. 安全与配置

服务端环境变量：

```text
UNSPLASH_ACCESS_KEY=
UNSPLASH_SECRET_KEY=
PEXELS_API_KEY=
PIXABAY_API_KEY=
GATEWAY_INSTALLATION_HASH_SALT=
GATEWAY_ADMIN_TOKEN=
CACHE_URL=                # 按部署适配
DATABASE_URL=
OBJECT_STORE_BUCKET=
```

- 前端只能配置 `VITE_IMAGE_GATEWAY_URL`，不得配置任何供应商 key；
- 对 `GET /v1/backgrounds` 做安装哈希与 IP 双限速；
- 管理端下架接口需要独立管理员认证；
- 日志默认脱敏 URL 查询参数，禁止记录 Authorization 头；
- 网关只允许固定主题枚举，不接受自由搜索词。

## 9. 测试分层

| 层 | 覆盖重点 |
|---|---|
| 单元测试 | 主题查询、内容过滤、去重、许可策略、熔断 |
| adapter 合约测试 | 每家供应商 fixture 到 `ProviderCandidate` 的映射 |
| 服务集成测试 | 缓存命中、空结果、429、过期素材、稳定 daily selection |
| 前端契约测试 | `GET /backgrounds` 响应能被 `image-gateway.ts` 消费 |
| APK 冒烟测试 | 真机生成、换图、离线回退、导出 PNG |

测试默认使用 `mock-provider`，CI 不注入真实图库密钥；每日或每周的受控 smoke job 才读取
部署环境的 secret。

## 10. 两个开发里程碑

### M1：可安全联调

- `mock-provider`、网关 HTTP 路由、内存缓存和固定主题；
- 返回标准化候选，接通现有前端；
- 单元/契约测试与本地 Docker 或 serverless dev 命令；
- 不连接真实图库。

### M2：受控生产试点

- 接入三家真实 adapter、KV/数据库、限速和 provider health；
- 先只对白名单主题开放，并保留人工下架；
- 配置生产 `VITE_IMAGE_GATEWAY_URL`；
- 用 Android CI 产物做真机回归，观察导出成功率和降级比例。

M2 验收后，才将浏览器中现有的供应商 API key 兼容路径标记为废弃并移除。
