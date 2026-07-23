# Serein 商店图标（高清）

## 会话里的原始文件在哪？

本机 Grok 会话目录（绝对路径）：

```
C:\Users\holyx\.grok\sessions\C%3A%5CUsers%5Cholyx%5C.grok%5Cbin\019f6465-756a-7411-b758-139423547cba\images\
```

| 文件 | 用途 | 说明 |
|------|------|------|
| `3.jpg` | **中国区** 商店图标候选 | 抽象几何，**无人脸** |
| `4.jpg` | **国际区** 商店图标候选 | 抽象光球，**无人脸** |
| `1.jpg` / `2.jpg` | 更早一版探索稿 | 同样抽象，无人脸 |

在资源管理器地址栏粘贴上面路径即可打开。  
也可在当前会话 UI 里点开历史消息中的图片查看。

## 项目内正式资产（推荐用这些）

| 文件 | 区域 | 说明 |
|------|------|------|
| `favicon-cn.svg` | 中国区 | 矢量图标（已在工程内） |
| `favicon-intl.svg` | 国际区 | 矢量图标（已在工程内） |
| `serein-icon-cn.jpg` | 中国区 | 从会话 `3.jpg` 复制（运行下方脚本后生成） |
| `serein-icon-intl.jpg` | 国际区 | 从会话 `4.jpg` 复制（运行下方脚本后生成） |

## 一键复制到工程（请在本机 PowerShell 执行）

```powershell
$src = "C:\Users\holyx\.grok\sessions\C%3A%5CUsers%5Cholyx%5C.grok%5Cbin\019f6465-756a-7411-b758-139423547cba\images"
$dst = "C:\Users\holyx\jinju-ri\public\brand"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item "$src\3.jpg" "$dst\serein-icon-cn.jpg" -Force
Copy-Item "$src\4.jpg" "$dst\serein-icon-intl.jpg" -Force
Copy-Item "$src\3.jpg" "$dst\store-cn-1024.jpg" -Force
Copy-Item "$src\4.jpg" "$dst\store-intl-1024.jpg" -Force
dir $dst
```

或双击运行：`scripts\copy-store-icons.cmd`

## 商店使用

Android Studio → Image Asset → 导入  
`serein-icon-cn.jpg` / `serein-icon-intl.jpg` 生成 mipmap。

## 内容安全

图标与在线背景图库均禁止 **可辨认的人物正面肖像**。  
图库策略见 `background-catalog.json` 的 `sourceNote` 与 `remote-background.ts` 标签过滤。
