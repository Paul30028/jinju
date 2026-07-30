# Serein 图片网关（M1 Mock）

这是图片网关的无密钥联调服务。它直接读取仓库中已审核的
`src/data/background-catalog.json`，模拟生产网关的主题查询、分页、CORS 与每日选图
接口；不调用 Pixabay、Pexels 或 Unsplash API。

## 启动

需要 Node.js 20 或更高版本，无第三方依赖：

```powershell
npm --prefix services/image-gateway run dev
```

默认监听 `http://127.0.0.1:8787`。开发前端时，在根目录 `.env.local` 设置：

```text
VITE_IMAGE_GATEWAY_URL=http://127.0.0.1:8787
```

然后启动 Vite。前端会优先使用 mock 网关返回的摄影图；关闭服务即可验证既有的
供应商/内置图库/Canvas 降级链。

## 接口

- `GET /health`
- `GET /v1/backgrounds?theme=dawn&page=0&limit=18&orientation=portrait`
- `POST /v1/backgrounds/selection`

selection 请求示例：

```json
{
  "assetId": "mock:dawn-1",
  "date": "2026-07-30",
  "theme": "dawn",
  "installationId": "development-device-id"
}
```

同一 `installationId + date + theme` 的首次选择会在服务内存中固定；重启 mock 服务后
会重置。生产服务将替换为数据库实现。

## 配置

| 环境变量 | 默认值 | 说明 |
|---|---|---|
| `PORT` | `8787` | HTTP 端口 |
| `HOST` | `127.0.0.1` | 监听地址 |
| `GATEWAY_ALLOWED_ORIGINS` | 本地 Vite 地址 | 逗号分隔的 CORS allowlist |

## 测试

```powershell
npm --prefix services/image-gateway test
```

M1 只用于前后端与 APK 联调。真实供应商 adapter、持久化、频控和运营审核在
[编码蓝图](../../docs/IMAGE_GATEWAY_BLUEPRINT.md) 的 M2 阶段实现。
