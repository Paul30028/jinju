/**
 * 运行环境与社交平台检测
 */

export type RuntimeEnv =
  | "wechat"
  | "weibo"
  | "qq"
  | "capacitor"
  | "mobile-browser"
  | "desktop";

export function detectRuntime(): RuntimeEnv {
  const ua = navigator.userAgent || "";

  // 微信内置浏览器（无法直接 JS 调起「发图片到聊天/朋友圈」）
  if (/MicroMessenger/i.test(ua)) return "wechat";
  if (/Weibo/i.test(ua)) return "weibo";
  if (/\sQQ\//i.test(ua) || /MQQBrowser/i.test(ua) && /QQ\//i.test(ua)) {
    // 粗略：QQ 内置
    if (/QQ\//i.test(ua) && !/MQQBrowser/i.test(ua)) return "qq";
  }

  try {
    // 动态判断会在 native share 里再做
    if ((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()) {
      return "capacitor";
    }
  } catch {
    // ignore
  }

  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  return mobile ? "mobile-browser" : "desktop";
}

export async function isCapacitorNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function canWebShareFiles(): boolean {
  try {
    const file = new File(["x"], "t.png", { type: "image/png" });
    return Boolean(navigator.canShare?.({ files: [file] }));
  } catch {
    return false;
  }
}

export type SocialTarget =
  | "system"
  | "save"
  | "copy"
  | "wechat"
  | "moments"
  | "xiaohongshu"
  | "instagram"
  | "x"
  | "facebook"
  | "whatsapp";

export interface SocialTargetInfo {
  id: SocialTarget;
  name: string;
  hint: string;
  /** 建议尺寸 */
  sizeHint: string;
}

export const SOCIAL_TARGETS: SocialTargetInfo[] = [
  {
    id: "system",
    name: "系统分享",
    hint: "打开系统面板，可选微信、QQ、信息等（推荐安卓 Chrome）",
    sizeHint: "当前尺寸",
  },
  {
    id: "save",
    name: "保存图片",
    hint: "下载到相册/下载目录，再到 App 里从相册发送",
    sizeHint: "当前尺寸",
  },
  {
    id: "copy",
    name: "复制经文",
    hint: "复制中英经文到剪贴板，可粘贴到任意聊天",
    sizeHint: "—",
  },
  {
    id: "wechat",
    name: "微信",
    hint: "先保存图片 → 打开微信聊天 → 相册选择发送（网页无法直发图片）",
    sizeHint: "方形 1080×1080 更佳",
  },
  {
    id: "moments",
    name: "朋友圈",
    hint: "先保存图片 → 朋友圈 → 从相册选择；文案已复制可粘贴",
    sizeHint: "方形 1080×1080",
  },
  {
    id: "xiaohongshu",
    name: "小红书",
    hint: "保存图片后在小红书发笔记上传；文案已复制",
    sizeHint: "方形 1080×1080",
  },
  {
    id: "instagram",
    name: "Instagram",
    hint: "保存图片后打开 IG 发帖/快拍；Stories 请用竖版",
    sizeHint: "竖版 Stories / 方形 Feed",
  },
  {
    id: "x",
    name: "X (Twitter)",
    hint: "保存图片后发帖上传；或用系统分享",
    sizeHint: "横版或方形",
  },
  {
    id: "facebook",
    name: "Facebook",
    hint: "保存图片后发帖；手机可用系统分享选 Facebook",
    sizeHint: "方形或横版",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    hint: "系统分享选 WhatsApp 最稳；或保存后从相册发送",
    sizeHint: "当前尺寸",
  },
];
