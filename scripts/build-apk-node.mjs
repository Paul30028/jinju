/**
 * Reliable APK build runner (Node). Logs everything to build-apk.log
 * Invoked by START-APK-BUILD.cmd
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logPath = path.join(root, "build-apk-run.log");
const logPathAlt = path.join(root, "build-apk.log");
const lines = [];

function log(msg) {
  const line = typeof msg === "string" ? msg : String(msg);
  console.log(line);
  lines.push(line);
  for (const p of [logPath, logPathAlt]) {
    try {
      fs.appendFileSync(p, line + "\n", "utf8");
    } catch {
      /* ignore */
    }
  }
}

function resetLog() {
  const header = `Jinju Day APK build (Node)\n${new Date().toISOString()}\nDir: ${root}\n\n`;
  for (const p of [logPath, logPathAlt]) {
    try {
      fs.writeFileSync(p, header, "utf8");
    } catch {
      /* ignore */
    }
  }
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    log(`\n$ ${cmd} ${args.join(" ")}`);
    const child = spawn(cmd, args, {
      cwd: root,
      shell: true,
      env: { ...process.env, ...opts.env },
      windowsHide: true,
    });
    child.stdout?.on("data", (d) => {
      const t = d.toString();
      process.stdout.write(t);
      try {
        fs.appendFileSync(logPath, t, "utf8");
      } catch {
        /* ignore */
      }
    });
    child.stderr?.on("data", (d) => {
      const t = d.toString();
      process.stderr.write(t);
      try {
        fs.appendFileSync(logPath, t, "utf8");
      } catch {
        /* ignore */
      }
    });
    child.on("error", (err) => {
      log(`[spawn error] ${err.message}`);
      resolve(1);
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

function detectEnv() {
  const candidatesJava = [
    process.env.JAVA_HOME,
    "D:\\软件\\Android Studio\\jbr",
    path.join(process.env["ProgramFiles"] || "", "Android", "Android Studio", "jbr"),
    path.join(process.env.LOCALAPPDATA || "", "Programs", "Android Studio", "jbr"),
  ].filter(Boolean);

  let JAVA_HOME = "";
  for (const j of candidatesJava) {
    if (fs.existsSync(path.join(j, "bin", "java.exe"))) {
      JAVA_HOME = j;
      break;
    }
  }
  // Scan D:\*\Android Studio\jbr (handles Chinese folder names without hardcoding)
  if (!JAVA_HOME) {
    try {
      const dRoot = "D:\\";
      if (fs.existsSync(dRoot)) {
        for (const name of fs.readdirSync(dRoot)) {
          const jbr = path.join(dRoot, name, "Android Studio", "jbr");
          if (fs.existsSync(path.join(jbr, "bin", "java.exe"))) {
            JAVA_HOME = jbr;
            break;
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  const candidatesSdk = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    path.join(process.env.LOCALAPPDATA || "", "Android", "Sdk"),
  ].filter(Boolean);

  let ANDROID_HOME = "";
  for (const s of candidatesSdk) {
    if (fs.existsSync(s)) {
      ANDROID_HOME = s;
      break;
    }
  }

  return { JAVA_HOME, ANDROID_HOME };
}

/** Ensure Capacitor-generated gradle files exist (cap sync may be skipped/partial) */
function ensureCapacitorGradleFiles(rootDir) {
  const settingsPath = path.join(rootDir, "android", "capacitor.settings.gradle");
  const buildPath = path.join(rootDir, "android", "app", "capacitor.build.gradle");
  const cordovaDir = path.join(rootDir, "android", "capacitor-cordova-android-plugins");
  const cordovaVars = path.join(cordovaDir, "cordova.variables.gradle");
  const cordovaBuild = path.join(cordovaDir, "build.gradle");
  const cordovaManifest = path.join(
    cordovaDir,
    "src",
    "main",
    "AndroidManifest.xml",
  );

  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(
      settingsPath,
      `// Generated fallback — prefer: npx cap sync android
include ':capacitor-android'
project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor')

include ':capacitor-app'
project(':capacitor-app').projectDir = new File('../node_modules/@capacitor/app/android')

include ':capacitor-filesystem'
project(':capacitor-filesystem').projectDir = new File('../node_modules/@capacitor/filesystem/android')

include ':capacitor-share'
project(':capacitor-share').projectDir = new File('../node_modules/@capacitor/share/android')

include ':capacitor-splash-screen'
project(':capacitor-splash-screen').projectDir = new File('../node_modules/@capacitor/splash-screen/android')

include ':capacitor-status-bar'
project(':capacitor-status-bar').projectDir = new File('../node_modules/@capacitor/status-bar/android')
`,
      "utf8",
    );
    log(`Created ${settingsPath}`);
  }

  if (!fs.existsSync(buildPath)) {
    fs.writeFileSync(
      buildPath,
      `// Generated fallback — prefer: npx cap sync android
android {
  compileOptions {
      sourceCompatibility JavaVersion.VERSION_21
      targetCompatibility JavaVersion.VERSION_21
  }
}
apply from: "../capacitor-cordova-android-plugins/cordova.variables.gradle"
dependencies {
    implementation project(':capacitor-app')
    implementation project(':capacitor-filesystem')
    implementation project(':capacitor-share')
    implementation project(':capacitor-splash-screen')
    implementation project(':capacitor-status-bar')
}
if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
`,
      "utf8",
    );
    log(`Created ${buildPath}`);
  }

  fs.mkdirSync(path.join(cordovaDir, "src", "main", "java"), { recursive: true });
  if (!fs.existsSync(cordovaVars)) {
    fs.writeFileSync(
      cordovaVars,
      `ext {
  cdvMinSdkVersion = project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 23
  cdvPluginPostBuildExtras = []
  cordovaConfig = [:]
}
`,
      "utf8",
    );
  }
  if (!fs.existsSync(cordovaBuild)) {
    fs.writeFileSync(
      cordovaBuild,
      `ext {
    androidxAppCompatVersion = project.hasProperty('androidxAppCompatVersion') ? rootProject.ext.androidxAppCompatVersion : '1.7.0'
}
apply plugin: 'com.android.library'
android {
    namespace "capacitor.cordova.android.plugins"
    compileSdk project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : 36
    defaultConfig {
        minSdkVersion project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : 23
        targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : 36
    }
    lintOptions { abortOnError false }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_21
        targetCompatibility JavaVersion.VERSION_21
    }
}
dependencies {
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
}
apply from: "cordova.variables.gradle"
`,
      "utf8",
    );
  }
  if (!fs.existsSync(cordovaManifest)) {
    fs.writeFileSync(
      cordovaManifest,
      `<?xml version='1.0' encoding='utf-8'?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
</manifest>
`,
      "utf8",
    );
  }

  // local.properties
  const sdk =
    process.env.ANDROID_HOME ||
    path.join(process.env.LOCALAPPDATA || "", "Android", "Sdk");
  if (fs.existsSync(sdk)) {
    fs.writeFileSync(
      path.join(rootDir, "android", "local.properties"),
      `sdk.dir=${sdk.replace(/\\/g, "/")}\n`,
      "utf8",
    );
  }
}

async function main() {
  process.chdir(root);
  resetLog();
  log("=== Jinju Day APK (Node runner) ===");
  log(`cwd: ${root}`);

  const { JAVA_HOME, ANDROID_HOME } = detectEnv();
  log(`JAVA_HOME=${JAVA_HOME || "(missing)"}`);
  log(`ANDROID_HOME=${ANDROID_HOME || "(missing)"}`);

  if (!JAVA_HOME) {
    log("[ERROR] JAVA_HOME not found. Install Android Studio / set JDK.");
    process.exitCode = 1;
    return;
  }
  if (!ANDROID_HOME) {
    log("[ERROR] Android SDK not found under %LOCALAPPDATA%\\Android\\Sdk");
    process.exitCode = 1;
    return;
  }

  // Fix incomplete android/ before Gradle (missing capacitor.settings.gradle etc.)
  ensureCapacitorGradleFiles(root);

  // local.properties (Gradle needs sdk.dir) — use forward slashes on Windows
  const sdkDirProp = ANDROID_HOME.replace(/\\/g, "/");
  const lp = path.join(root, "android", "local.properties");
  fs.writeFileSync(lp, `sdk.dir=${sdkDirProp}\n`, "utf8");
  log(`Wrote ${lp} -> ${sdkDirProp}`);

  const env = {
    JAVA_HOME,
    ANDROID_HOME,
    ANDROID_SDK_ROOT: ANDROID_HOME,
    PATH: `${path.join(JAVA_HOME, "bin")};${path.join(ANDROID_HOME, "platform-tools")};${process.env.PATH || ""}`,
  };

  let code = await run("node", ["-v"], { env });
  if (code !== 0) {
    log("[ERROR] node not runnable");
    process.exitCode = 1;
    return;
  }

  log("\n[1/5] npm install");
  code = await run("npm", ["install"], { env });
  if (code !== 0) {
    log("[ERROR] npm install failed");
    process.exitCode = 1;
    return;
  }

  log("\n[2/5] npm run build");
  code = await run("npm", ["run", "build"], { env });
  if (code !== 0) {
    log("[ERROR] npm run build failed");
    process.exitCode = 1;
    return;
  }
  if (!fs.existsSync(path.join(root, "dist", "index.html"))) {
    log("[ERROR] dist/index.html missing");
    process.exitCode = 1;
    return;
  }

  const gradlew = path.join(root, "android", "gradlew.bat");
  if (!fs.existsSync(gradlew)) {
    log("\n[3/5] npx cap add android");
    code = await run("npx", ["cap", "add", "android"], { env });
    if (code !== 0) {
      log("[ERROR] cap add android failed");
      process.exitCode = 1;
      return;
    }
  } else {
    log("\n[3/5] android project exists");
  }

  log("\n[4/5] npx cap sync android");
  code = await run("npx", ["cap", "sync", "android"], { env });
  if (code !== 0) {
    log("[WARN] cap sync returned non-zero — ensuring gradle stubs exist");
    ensureCapacitorGradleFiles(root);
  } else {
    log("cap sync OK");
  }

  // Always ensure critical generated files exist (incomplete android/ is common)
  ensureCapacitorGradleFiles(root);

  // re-write local.properties after cap sync (may overwrite)
  fs.writeFileSync(lp, `sdk.dir=${sdkDirProp}\n`, "utf8");

  log("\n[5/5] Gradle assembleDebug (may take 10-20 min first time)");
  code = await new Promise((resolve) => {
    const child = spawn(
      "cmd.exe",
      ["/d", "/c", "gradlew.bat assembleDebug --no-daemon"],
      {
        cwd: path.join(root, "android"),
        env: { ...process.env, ...env },
        shell: false,
        windowsHide: true,
      },
    );
    child.stdout?.on("data", (d) => {
      const t = d.toString();
      process.stdout.write(t);
      fs.appendFileSync(logPath, t, "utf8");
    });
    child.stderr?.on("data", (d) => {
      const t = d.toString();
      process.stderr.write(t);
      fs.appendFileSync(logPath, t, "utf8");
    });
    child.on("close", (c) => resolve(c ?? 1));
    child.on("error", (e) => {
      log(String(e));
      resolve(1);
    });
  });

  if (code !== 0) {
    log("[ERROR] Gradle failed");
    log("Open Android Studio -> Open folder android -> wait Sync -> Build APK");
    process.exitCode = 1;
    return;
  }

  const src = path.join(
    root,
    "android",
    "app",
    "build",
    "outputs",
    "apk",
    "debug",
    "app-debug.apk",
  );
  if (!fs.existsSync(src)) {
    log(`[ERROR] APK missing: ${src}`);
    process.exitCode = 1;
    return;
  }

  const dst = path.join(root, "jinju-ri-debug.apk");
  const releaseDir = path.join(root, "release");
  fs.mkdirSync(releaseDir, { recursive: true });
  fs.copyFileSync(src, dst);
  fs.copyFileSync(src, path.join(releaseDir, "jinju-ri-debug.apk"));

  log("\n========================================");
  log("  SUCCESS");
  log(`  ${dst}`);
  log(`  ${path.join(releaseDir, "jinju-ri-debug.apk")}`);
  log("========================================");
  log("Copy APK to phone and install (allow unknown sources).");
  process.exitCode = 0;
}

main().catch((e) => {
  log(`[FATAL] ${e?.stack || e}`);
  process.exitCode = 1;
});
