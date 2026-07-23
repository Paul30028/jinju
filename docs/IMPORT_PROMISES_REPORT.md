# 圣经应许导入报告

生成时间：2026-07-16（Grok Build subagent）

## 来源

| 源文件 | 处理方式 |
|--------|----------|
| `C:\Users\holyx\Downloads\《珍贵的圣经应许》撒母耳·克拉克Precious-Bible-Promises-Samuel-Clarke-1.docx` | Agent 无法读二进制 docx；使用公开领域镜像 **eliranwong/Precious-Bible-Promises** `PBP_verses_CUVs.txt`（Samuel Clarke 应许汇编 · 和合本简体）对齐同一著作 |
| `C:\Users\holyx\Downloads\圣经应许合本.doc` | OLE `.doc`；shell 不可用，Word COM 未执行。占位：`scripts/promises-cuv-utf8.txt` |

### 编码 / 环境说明

- `run_terminal_command` / `monitor` 因缺少 `%USERPROFILE%\.grok\bin\powershell.exe` 硬链接全部失败（`IO Error: program not found`）。
- 已写好可重跑脚本：`scripts/import-promises.mjs`（可自动 `https.get` 拉取完整 PBP CUVs）。
- 修复 shell：

```bat
mklink /H "%USERPROFILE%\.grok\bin\powershell.exe" "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
cd /d C:\Users\holyx\jinju-ri
node scripts\import-promises.mjs
```

## 金句池 `src/data/verses-cuv-seed.json`

| 指标 | 数量 |
|------|------|
| 导入前 | **354** |
| Clarke/PBP 精选新增（按 `reference` 去重） | **313** |
| 圣经应许合本 `.doc` 直接抽取 | **0**（shell 不可用） |
| **导入后** | **667** |

### 新增样本（10）

| reference | text（节选） |
|-----------|----------------|
| 诗篇 84:11 | 因为耶和华神是日头，是盾牌，要赐下恩惠和荣耀… |
| 以赛亚书 43:2 | 你从水中经过，我必与你同在… |
| 约翰福音 10:28 | 我又赐给他们永生；他们永不灭亡… |
| 诗篇 46:1 | 神是我们的避难所，是我们的力量… |
| 约翰一书 4:4 | 那在你们里面的，比那在世界上的更大。 |
| 希伯来书 7:25 | 凡靠着他进到神面前的人，他都能拯救到底… |
| 出埃及记 33:14 | 我必亲自和你同去，使你得安息。 |
| 以赛亚书 49:16 | 看哪，我将你铭刻在我掌上… |
| 罗马书 8:26 | 我们的软弱有圣灵帮助… |
| 启示录 21:3 | 看哪，神的帐幕在人间… |

### 规范

- 优先和合本（CUV）用语；PBP 源「上帝」规范为「神」以贴合既有 seed。
- 清理〔注〕、细拉、过长 multi-verse（>3 节倾向首节或 1–3 节卡片）。
- **未删除**任何既有金句；按 `reference` 去重。
- 质量：短中篇应许，适合金句图片（约 1–3 节、≤180 字）。
- 完整 PBP 约 2400+ 行；本批 cap 精选 **313** 条新 unique，避免池膨胀。

## 主题标签 `src/core/verse/topics.ts`

- 为本次新增 reference 批量补了 `TOPIC_BY_REFERENCE`（应许主题：安慰 / 同在 / 救恩 / 平安 / 信实 / 刚强等）。
- 未映射条目仍可走 `KEYWORD_TOPICS` 启发式。

## 失败 / 限制

1. **本地 .docx / .doc 未直接解析**（无 shell + 二进制）。
2. **圣经应许合本.doc 贡献 0 条**——请 shell 修复后 Word COM 写入 `scripts/promises-cuv-utf8.txt` 再跑 import。
3. PBP 全量若需再扩：`MAX_NEW=0 node scripts/import-promises.mjs`（会从 GitHub 拉全量后 merge）。

## 相关脚本与中间文件

| 路径 | 说明 |
|------|------|
| `scripts/import-promises.mjs` | 可重复导入（merge 不 wipe；支持本地 UTF-8 + GitHub PBP） |
| `scripts/promises-additions.json` | 本批精选应许 JSON（完整候选） |
| `scripts/promises-clarke-utf8.txt` | Clarke/PBP UTF-8 占位 + 说明（重跑脚本可覆写为全量） |
| `scripts/promises-cuv-utf8.txt` | 应许合本 UTF-8 占位（待 Word 抽取） |
| `docs/IMPORT_PROMISES_REPORT.md` | 本报告 |

## 最终计数

| | |
|--|--|
| **before** | 354 |
| **added (Clarke/PBP 精选)** | **313** |
| **added (应许合本.doc)** | **0** |
| **after** | **667** |

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-16 | 应许池 +313；topics 补标签；import-promises.mjs 就绪 |
