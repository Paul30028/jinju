# 金句日 · Android 试玩指南

基于 **Capacitor 7** 把现有 Vite + React 站点打成 APK 壳，便于真机/模拟器试用。

## 你需要准备

| 工具 | 说明 |
|------|------|
| Node.js 18+ | 已用于 `npm run dev` |
| **Android Studio** | [下载](https://developer.android.com/studio)（含 SDK + 模拟器） |
| JDK 17 | Android Studio 一般自带 |
| 可选：安卓手机 | 打开「开发者选项 → USB 调试」 |

## GitHub Actions 云端 APK（推荐用于测试）

仓库的 **Android APK** 工作流会在 `main` 或 `codex/**` 分支的相关改动后自动执行；
也可在 GitHub 的 **Actions → Android APK → Run workflow** 手动触发。

- 每次同时构建 **CN（Serein 静澄）** 与 **国际版（Serein）**。
- 工作流先执行 TypeScript 检查，再生成 Capacitor Android 工程与 debug APK。
- 在运行详情的 **Artifacts** 下载 `serein-cn-debug-apk` 或
  `serein-intl-debug-apk`，保留 14 天；下载并解压后即可安装测试。

> 这是 debug 包，仅供内部测试；商店发布需要另行配置签名密钥和 release 工作流。

## 一键生成 APK（推荐）

### 若双击 `build-apk.bat` 会「闪退」

旧版 bat 含中文 UTF-8，在部分 Windows CMD 下会**解析失败后立刻关闭**。现已加固：

1. **优先双击**：`打开并打包APK.bat`（窗口一定保留）  
2. 或双击：`build-apk.bat`（内部用 `cmd /k` 保持打开）  
3. 或右键 PowerShell：`scripts\build-apk.ps1`  
   ```powershell
   cd C:\Users\holyx\jinju-ri
   powershell -ExecutionPolicy Bypass -File .\scripts\build-apk.ps1
   ```
4. **一定看日志**：`C:\Users\holyx\jinju-ri\build-apk.log`

### 正常打包

```powershell
cd C:\Users\holyx\jinju-ri
.\打开并打包APK.bat
```

成功后 APK 路径：

- `C:\Users\holyx\jinju-ri\jinju-ri-debug.apk`
- `C:\Users\holyx\jinju-ri\release\jinju-ri-debug.apk`
- （若系统支持）`金句日-debug.apk`

传到手机安装即可（允许「未知来源」）。

---

## 一键打开 Android Studio（调试用）

```powershell
cd C:\Users\holyx\jinju-ri
powershell -ExecutionPolicy Bypass -File .\scripts\setup-android.ps1
```

脚本会：`npm install` → `vite build` → `cap add android` → `cap sync` → 打开 Android Studio。

## 手动命令

```powershell
cd C:\Users\holyx\jinju-ri

# 1. 安装依赖（含 Capacitor）
npm install

# 2. 构建前端（输出 dist/，base 已设为 ./）
npm run build

# 3. 首次生成 Android 工程
npx cap add android

# 4. 同步 Web 资源到 Android
npx cap sync android

# 5. 用 Android Studio 打开
npx cap open android
```

或：

```powershell
npm run android
```

## 在 Android Studio 里运行

1. 等待右下角 **Gradle Sync** 完成（首次可能 5–20 分钟）  
2. 顶部设备列表选 **模拟器** 或 **已连接手机**  
3. 点绿色 **Run ▶**  
4. 装好后打开「金句日」App  

### 改代码后如何更新 App

```powershell
npm run build
npx cap sync android
```

再在 Android Studio 点 Run。  
（不必每次 `cap add`。）

## 功能在安卓上的表现

| 功能 | 说明 |
|------|------|
| 今日金句 / 自动出图 | WebView 内与浏览器一致 |
| 摄影背景 | 需手机能访问 Unsplash；失败则渐变 |
| 保存图片 | 下载到设备下载目录（视 WebView 权限） |
| 分享 | 优先系统分享面板（文案 + 尝试保存图片） |
| 离线 | 已打开过的页面可缓存；图库需过网 |

## 生成可安装 APK（可选）

Android Studio：

1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**  
2. 产物约在：  
   `android\app\build\outputs\apk\debug\app-debug.apk`  
3. 拷到手机安装（需允许未知来源）

命令行（需已配置 SDK）：

```powershell
cd android
.\gradlew assembleDebug
```

## 常见问题

### Gradle 很慢 / 失败

- 配置国内镜像（阿里云等）到 `android/build.gradle` 的 repositories  
- 或开代理后重试 Sync  

### 白屏

- 确认执行过 `npm run build` 且 `dist/` 有内容  
- 再 `npx cap sync android`  
- `vite.config.ts` 里 `base: './'` 必须存在  

### 摄影图不显示

- 检查手机网络  
- 设置里可关掉「使用免费在线摄影图」改用渐变  

### 分享只有文字没有图

- 当前壳版先保证文案分享 + 保存图片  
- 完整「带图分享到微信」需 FileProvider（可后续加）  

## 项目标识

| 项 | 值 |
|----|-----|
| appId | `app.jinju.day` |
| appName | 金句日 |
| webDir | `dist` |

## 目录

```
jinju-ri/
  android/          ← cap add 后生成（勿手改太多）
  dist/             ← vite build 产物
  capacitor.config.ts
  scripts/setup-android.ps1
```
